var express = require("express");
var router = express.Router();
const Event = require("../models/events");
const User = require("../models/users");
const auth = require("../middlewares/auth");

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
 console.log("ID reçu :", req.params.id)
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
        const isAdmin = req.user._id.equals(event.adminId._id)
        const isMember = event.memberIds.some(e => req.user._id.equals(e._id)) 

        if(!isAdmin && !isMember) {
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
router.post("/update/:token", async (req, res) => {
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

    const event = await Event.findOneAndUpdate(
        { _id },
        {
            title,
            location,
            photoEventUrl,
            startDate,
            endDate,
            startHour,
            endHour,
            adminId,
            memberIds,
        },
        {
            returnDocument: "after",
        },
    );
    res.json({ event: event });
});

//route DELETE event------------------------------------------------
router.delete("/delete/:token", async (req, res) => {
    const token = req.params.token;
    const id = req.body._id;

    //condition pour supprimer uniquement par admin(non finalisé)
    const data = await getUserByToken(token);

    if (data) {
        Event.deleteOne({ _id: id }).then(() => {
            Event.find().then((data) => {
                res.json({ events: data });
            });
        });
    }
});

module.exports = router;
