var express = require("express");
var router = express.Router();
const Photo = require("../models/photos");
const auth = require("../middlewares/auth");
const Event = require("../models/events");
const checkEventAccess = require("../middlewares/checkEventAccess");

//route POST ajouter une photo d'un user dans un event------------------------------------------------------
router.post("/:eventId", auth, checkEventAccess, async (req, res) => {
    const { uri } = req.body;
    if (!uri) {
        return res
            .status(400)
            .json({ result: false, error: "Photo uri is required" });
    }
    try {
        // create photo
        const newPhoto = new Photo({
            _userId: req.user._id,
            uri,
            eventId: req.params.eventId,
            date: new Date(),
        });
        //MAJ bdd
        const savedPhoto = await newPhoto.save();
        res.status(201).json({ result: true, photo: savedPhoto });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route GET obtenir la liste des photos d'un evenement---------------------------------------------------------------
router.get("/:eventId", auth, checkEventAccess, async (req, res) => {
    const { eventId } = req.params.eventId;

    try {
        // Récupérer les photos de l'événement, en peuplant les informations de l'utilisateur qui a posté la photo
        const listPhotos = await Photo.find({
            eventId: req.params.eventId,
        })
            .populate("_userId", "username userPhoto") //
            .sort({ date: -1 }); //afficher les photos les plus récentes en premier

        res.status(200).json({ result: true, listPhotos });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route DELETE photo uniquement par son user-----------------------------------------------
router.delete("/delete/:photoId", auth, async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.photoId);
        if (!photo) {
            res.status(404).json({ result: false, error: "photo not found" });
        }
        // Vérifier que l'utilisateur est bien l'auteur de la photo ou admin de l'event
        const event = await Event.findById(photo.eventId);
        const isPhotoAuthor = photo._userId.equals(req.user._id);
        const isEventAdmin = event.adminId.equals(req.user._id);
        if (!isPhotoAuthor && !isEventAdmin) {
            return res.status(403).json({ result: false, error: "Access denied" });
        }
        // Suppression de la photo
        await Photo.deleteOne({ _id: req.params.photoId });
        res.status(200).json({ result: true });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

module.exports = router;
