var express = require("express");
var router = express.Router();
const getUserByToken = require("../modules/getUserByToken");
const Event = require("../models/events");

//route GET obtenir la liste d'evenement d'un user---------------------------------------------------------------
router.get("/:token", async (req, res) => {
    const { token } = req.params;

    const data = await getUserByToken(token);
    if (data) {
        const user = data;

        const events = await Event.find()
            .populate("adminId")
            .populate("memberIds");

        //filtre les events liés à l'utilisateur en tant admin ou member
        if (events) {
            const eventListUser = events.filter(
                (event) =>
                    event.adminId._id.equals(user._id) ||
                    event.memberIds.find((data) => data._id.equals(user._id)),
            );
            //classified according to date
            eventListUser.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
            res.json({ result: true, events: eventListUser });
        }
    }
});

//route POST creation event d'un user------------------------------------------------------
router.post("/createEvent/:token", async (req, res) => {
    const token = req.params.token;

    const data = await getUserByToken(token);
    if (data) {
        const event = req.body;

        //user devient admin de l'event
        event.adminId = data._id;

        // create event
        const newEvent = new Event(event);

        //MAJ bdd
        const data2 = await newEvent.save();
        if (data2) {
            res.json({ result: true, event: data2 });
        }
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
