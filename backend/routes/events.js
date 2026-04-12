var express = require("express");
var router = express.Router();
const Event = require("../models/events");
const User = require("../models/users");
const auth = require("../middlewares/auth");
const checkEventAccess = require("../middlewares/checkEventAccess");

//route POST creation event d'un user------------------------------------------------------
router.post("/createEvent", auth, async (req, res) => {
    const {
        title,
        location,
        photoEventUrl,
        startDate,
        endDate,
        startHour,
        endHour,
    } = req.body;

    if (!title || !startDate) {
        res.status(400).json({
            result: false,
            error: "Title and startDate are required",
        });
    }

    try {
        // create event
        const newEvent = new Event({
            title,
            location,
            photoEventUrl,
            startDate,
            endDate,
            startHour,
            endHour,
            adminId: req.user._id, //admin = user connecté, pas besoin de le passer depuis le front
            memberIds: [],
        });

        //MAJ bdd
        const savedEvent = await newEvent.save();
        // Ajout de l'event dans la liste des events du user
        await User.findByIdAndUpdate(req.user._id, {
            $push: { eventIds: savedEvent._id },
        });
        res.status(201).json({ result: true, event: savedEvent });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route GET obtenir la liste d'evenement d'un user connecté — protégé par auth---------------------------------------------------------------
router.get("/", auth, async (req, res) => {
    try {
        const listEvents = await Event.find({
            $or: [
                { adminId: req.user._id },
                { memberIds: req.user.id }, // identique à { memberIds: { $in: [req.user._id] } }
            ],
        })
            .populate("adminId", "username userPhoto") // selection de l'essentiel (champ à peupler,champs à garder (projection))
            .populate("memberIds", "username userPhoto")
            .sort({ startDate: 1 }); // tri directement en BDD

        res.status(200).json({ result: true, listEvents });
    } catch (error) {
        res.status(500).json({
            result: false,
            error: "Server error",
        });
    }
});

//route GET obtenir un event par son id — protégé par auth---------------------------------------------------------------
router.get("/:id", auth, async (req, res) => {
    console.log("ID reçu :", req.params.id);
    try {
        const event = await Event.findById(req.params.id)
            .populate("adminId", "username userPhoto")
            .populate("memberIds", "username userPhoto");

        if (!event) {
            return res
                .status(404)
                .json({ result: false, error: "event not found" });
        }

        // Vérifie que l'user est bien membre ou admin de l'event
        const isAdmin = req.user._id.equals(event.adminId._id);
        const isMember = event.memberIds.some((e) =>
            req.user._id.equals(e._id),
        );

        if (!isAdmin && !isMember) {
            return res
                .status(403)
                .json({ result: false, error: "access denied" });
        }

        res.status(200).json({ result: true, event });
    } catch (error) {
        res.status(500).json({
            result: false,
            error: "Server error",
        });
    }
});

//route POST UPDATE : modifie l'event-------------------------------------------
router.post("/update/:id", auth, async (req, res) => {
    try {
        const event = await Event.findById(re.params._id);
        if (!event) {
            return res
                .status(404)
                .json({ result: false, error: "event not found" });
        }
        // Seul l'admin de l'event peut le modifier
        if (!event.adminId.equals(req.user._id)) {
            return res.status(403).json({
                result: false,
                error: "Only admin can update this event",
            });
        }

        const {
            title,
            location,
            photoEventUrl,
            startDate,
            endDate,
            startHour,
            endHour,
            adminId,
            memberIds,
            _id,
        } = req.body;

        //objet qui récupère les modifs
        const updateObj = {};
        if (title) {
            updateObj.title = title;
        }
        if (location) {
            updateObj.location = location;
        }
        if (photoEventUrl) {
            updateObj.photoEventUrl = photoEventUrl;
        }
        if (startDate) {
            updateObj.startDate = startDate;
        }
        if (endDate) {
            updateObj.endDate = endDate;
        }
        if (startHour) {
            updateObj.startHour = startHour;
        }
        if (endHour) {
            updateObj.endHour = endHour;
        }
        if (memberIds) {
            updateObj.memberIds = memberIds;
        }
        //si modifs présentes : MAJ BDD
        if (Object.keys(updateObj).length === 0) {
            return res
                .status(400)
                .json({ result: false, error: "No update data provided" });
        }

        const updateEvent = await Event.findByIdAndUpdate(
            req.params.id, // id de l'event à modifier
            updateObj, // objet avec les champs à modifier
            {
                new: true, // pour retourner le document après modification
                runValidators: true, // vérifie les règles du schéma (required, type...)
            },
        );
        res.status(200).json({ result: true, event: updateEvent });
    } catch (error) {
        res.status(500).json({
            result: false,
            error: "Server error",
        });
    }
});

//route DELETE even uniquement par l'admin -----------------------------------------
router.delete("/delete/:id", auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res
                .status(404)
                .json({ result: false, error: "Event not found" });
        }

        // Seul l'admin peut supprimer l'event
        if (!event.adminId.equals(req.user._id)) {
            return res
                .status(403)
                .json({
                    result: false,
                    error: "Only admin can delete this event",
                });
        }
        // Suppression de l'event
        await Event.deleteOne({ _id: req.params.id });
        // Suppression de l'event dans la liste des events de tous les users (admin et membres)
        await User.updateMany(
            { eventIds: req.params.id },
            { $pull: { eventIds: req.params.id } }, // $pull pour retirer l'id de l'event du tableau eventIds de tous les users concernés
        );
        res.status(200).json({
            result: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            error: "Server error",
        });
    }
});

module.exports = router;
