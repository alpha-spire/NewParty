var express = require("express");
var router = express.Router();
const Invitation = require("../models/invitations");
const User = require("../models/users");
const auth = require("../middlewares/auth");

// POST — envoyer une demande d'ami
router.post("/send", auth, async (req, res) => {
    const { receiverId } = req.body;

    if (!receiverId) {
        return res.status(400).json({ result: false, error: "ReceiverId required" });
    }

    if (receiverId === req.user._id.toString()) {
        return res.status(400).json({ result: false, error: "Cannot invite yourself !" });
    }

    try {
        // Vérifie si une invitation existe déjà entre ces deux users
        const existing = await Invitation.findOne({
            $or: [
                { senderId: req.user._id, receiverId },
                { senderId: receiverId, receiverId: req.user._id },
            ],
        });
        if (existing) {
            return res.status(409).json({ result: false, error: "Invitation already exists" });
        }

        // Vérifie si déjà amis
        const sender = await User.findById(req.user._id);
        const isAlreadyFriend = sender.friendIds.some(
            (id) => id.toString() === receiverId
        );
        if (isAlreadyFriend) {
            return res.status(409).json({ result: false, error: "Already friends" });
        }

        // Crée et sauvegarde l'invitation
        const invitation = new Invitation({
            senderId: req.user._id,
            receiverId,
        });
        await invitation.save();

        res.status(201).json({ result: true, invitation });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

// GET — récupérer les invitations reçues (pending)
router.get("/received", auth, async (req, res) => {
    try {
        const invitations = await Invitation.find({
            receiverId: req.user._id,
            status: "pending",
        }).populate("senderId", "username userPhoto");

        return res.status(200).json({ result: true, invitations });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

// GET — récupérer les invitations envoyées (pending)
router.get("/sent", auth, async (req, res) => {
    try {
        const invitations = await Invitation.find({
            senderId: req.user._id,
            status: "pending",
        }).populate("receiverId", "username userPhoto");

        return res.status(200).json({ result: true, invitations });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

// POST — accepter ou refuser une invitation
router.post("/respond/:invitationId", auth, async (req, res) => {
    const { accept } = req.body;

    try {
        const invitation = await Invitation.findById(req.params.invitationId);

        if (!invitation) {
            return res.status(404).json({ result: false, error: "Invitation not found" });
        }

        // Seul le receiver peut répondre
        if (!invitation.receiverId.equals(req.user._id)) {
            return res.status(403).json({ result: false, error: "Access denied" });
        }

        // Invitation déjà traitée
        if (invitation.status !== "pending") {
            return res.status(409).json({ result: false, error: "Invitation already treated" });
        }

        if (accept) {
            // Ajoute chacun dans la liste d'amis de l'autre
            await User.findByIdAndUpdate(invitation.senderId, {
                $addToSet: { friendIds: invitation.receiverId },
            });
            await User.findByIdAndUpdate(invitation.receiverId, {
                $addToSet: { friendIds: invitation.senderId },
            });
            invitation.status = "accepted";
        } else {
            invitation.status = "refused";
        }

        await invitation.save();
        res.json({ result: true, status: invitation.status });

    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

// DELETE — annuler une invitation envoyée
router.delete("/cancel/:invitationId", auth, async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.invitationId);

        if (!invitation) {
            return res.status(404).json({ result: false, error: "Invitation not found" });
        }

        // Seul l'expéditeur peut annuler
        if (!invitation.senderId.equals(req.user._id)) {
            return res.status(403).json({ result: false, error: "Access denied" });
        }

        await Invitation.deleteOne({ _id: req.params.invitationId });
        res.status(200).json({ result: true, message: "Invitation canceled" });

    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

module.exports = router;
