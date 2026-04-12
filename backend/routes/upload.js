var express = require("express");
var router = express.Router();
const cloudinary = require("cloudinary").v2;
const auth = require("../middlewares/auth");

// route POST upload d'une photo vers cloudinary - protégé par auth
router.post("/", auth, async (req, res) => {
    //vérif que le fichier est présent
    if (!req.files || !req.files.photoFromFront) {
        return res.status(400).json({ result: false, error: "No file uploaded" });
    }

    try {
        // Fonction pour uploader la photo vers Cloudinary, qui retourne une promesse
        const uploadToCloudinary = () =>
            new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "newparty_photos" }, // organiser les photos dans un dossier spécifique sur Cloudinary
                    (error, result) => {
                        // Gérer la réponse de Cloudinary : si erreur → reject, sinon → resolve avec le résultat
                        if (error) {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    },
                );
                uploadStream.end(req.files.photoFromFront.data); // Envoie les données de la photo à Cloudinary
            });
        const result = await uploadToCloudinary(); // Attendre la fin de l'upload pour obtenir le résultat (url de la photo, etc.)
        
        // Retourner l'url de la photo uploadée à Cloudinary au frontend
        res.status(201).json({
            result: true,
            photo: {
                url: result.secure_url,
                date: result.created_at,
            },
        });
    } catch (error) {
        res.status(500).json({ result: false, error: "Internal Server Error" });
    }
});

module.exports = router;
