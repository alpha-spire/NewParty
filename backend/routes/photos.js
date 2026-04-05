var express = require("express");
var router = express.Router();
const getUserByToken = require("../modules/getUserByToken");
const Photo = require("../models/photos");

//route GET obtenir la liste des photos d'un evenement---------------------------------------------------------------
router.get("/:eventId", async (req, res) => {
    const { eventId } = req.params;

    const data = await Photo.find({ eventId });

    if (data.length) {
        res.json({ result: true, photos: data });
    } else {
        res.json({ result: false, error: "no photo for this event" });
    }
});

//route POST ajouter une photo d'un user dans un event------------------------------------------------------
router.post("/:token", async (req, res) => {
    const token = req.params.token;

    const user = await getUserByToken(token);
    if (user) {
        const { uri, eventId, date } = req.body;

        // create photo
        const newPhoto = new Photo({
            _userId: user._id,
            uri,
            eventId,
            date,
        });
        //MAJ bdd
        newPhoto.save().then((photo) => {
            res.json({ result: true, photo });
        });
    }
});

//route DELETE photo (non utilisé en frontend)------------------------------------------------
router.delete("/delete/:token", async (req, res) => {
    const token = req.params.token;
    const _id = req.body._id;

    //condition pour delete uniquement par admin
    const user = await getUserByToken(token);
    if (user && user._id === _id) {
        Photo.deleteOne({ _id }).then(() => {
            Photo.find().then((data) => {
                res.json({ photos: data });
            });
        });
    }
});

module.exports = router;
