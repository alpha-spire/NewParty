var express = require("express");
var router = express.Router();
const Event = require("../models/events");
const auth = require("../middlewares/auth");
const Message = require("../models/messages");
const checkEventAccess = require("../middlewares/checkEventAccess");

//route POST création message d'un user dans un event — protégé par auth----------------------
router.post("/:eventId", auth, checkEventAccess, async (req, res) => {
    const { message } = req.body;
    if (!message || message.trim() === "") {
        return res
            .status(400)
            .json({ result: false, error: "Message is required" });
    }

    try {
        // create message
        const newMessage = new Message({
            _userId: req.user._id,
            message: message.trim(),
            eventId: req.params.eventId,
            // date gérée automatiquement par timestamps: true (createdAt / updatedAt)
        });
        //MAJ bdd
        const savedmessage = await newMessage.save();
        res.status(201).json({ result: true, message: savedmessage });
    } catch (error) {
        return res.status(500).json({ result: false, error: "Server error" });
    }
});

//route GET obtenir la liste des messages d'un event — protégé par auth---------------------------
router.get("/:eventId", auth, checkEventAccess, async (req, res) => {
    try {
        // Récupérer les messages (chat) de l'événement et les informations de l'auteur
        const chat = await Message.find({ eventId: req.params.eventId })
            .populate("_userId", "username userPhoto") // on populate pour récupérer les infos de l'auteur du message (username et photo), on n'a pas besoin de retourner le token, le password, etc.
            .sort({ date: 1 }); // tri par date croissante (du plus ancien au plus récent)
        res.status(200).json({ result: true, chat });
    } catch (error) {
        return res
            .status(500)
            .json({ result: false, error: "error while fetching event" }); // message d'erreur plus générique pour ne pas donner d'indication sur la nature de l'erreur, pour des raisons de sécurité
    }
});

//route GET obtenir le dernier message d'un event-------------------------------
router.get("/lastMessage/:eventId", auth, async (req, res) => {
    try {
        const lastMessage = await Message.findOne({
            eventId: req.params.eventId,
        })
            .populate("_userId", "username userPhoto")
            .sort({ date: -1 }); // tri par date décroissante pour obtenir le dernier message

        if (!lastMessage) {
            res.status(404).json({
                result: false,
                error: "no message for this event",
            });
        } else {
            res.status(200).json({ result: true, lastMessage });
        }
    } catch (error) {
        return res.status(500).json({
            result: false,
            error: "error while fetching last message",
        });
    }
});

// DELETE message — uniquement par l'auteur
router.delete("/:messageId", auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.json({ result: false, error: "message not found" });
        }
        // Seul l'auteur peut supprimer son message
        if (!message._userId.equals(req.user._id)) {
            return res.json({
                result: false,
                error: "you are not the author of this message",
            });
        }

        await Message.findByIdAndDelete({ _id: req.params.messageId });
        res.status(200).json({ result: true, message: "Message deleted" });
    } catch (error) {
        return res.status(500).json({
            result: false,
            error: "error while deleting message",
        });
    }
});

module.exports = router;
