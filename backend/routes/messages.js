var express = require("express");
var router = express.Router();
const getUserByToken = require("../modules/getUserByToken");
const Message = require("../models/messages");

//route GET obtenir la liste des messages d'un event---------------------------------------------------------------
router.get("/:eventId", async (req, res) => {
    const { eventId } = req.params;

    const data = await Message.find({ eventId });

    if (data.length) {
        res.json({ result: true, messages: data });
    } else {
        res.json({ result: false, error: "no message for this event" });
    }
});

//route GET obtenir le dernier message d'un event (non utilisé dans le frontend)-------------------------------
router.get("/lastMessage/:eventId", async (req, res) => {
    const { eventId } = req.params;

    const chat = await Message.findOne({ eventId });
    if (chat.length) {
        const lastMessage = chat[chat.length - 1].message;
        res.json({ result: true, lastMessage });
    } else {
        res.json({ result: false, error: "no message for this event" });
    }
});

//route POST création message d'un user dans un event------------------------------------------------------
router.post("/:token", async (req, res) => {
    const token = req.params.token;

    const data = await getUserByToken(token);
    if (data) {
        const { message, eventId, date } = req.body;

        // create message
        const newMessage = new Message({
            _userId: data._id,
            message,
            eventId,
            date,
        });
        //MAJ bdd
        newMessage.save().then((message) => {
            res.json({ result: true, message });
        });
    }
});



module.exports = router;
