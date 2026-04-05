var express = require("express");
var router = express.Router();

const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid"); // pour générer un nom de fichier unique

// route POST upload d'une photo vers cloudinary
router.post("/", async (req, res) => {
//   //creation chemin temp pour stocker la photo sur le serveur
//   const photoPath = `./tmp/${uniqid()}.jpg`;
//   //deplacement fichier photofromfront du frontend vers dossier tmp
//   const resultMove = await req.files.photoFromFront.mv(photoPath);

//   if (!resultMove) {
//     const resultCloudinary = await cloudinary.uploader.upload(photoPath);
//     //suppression fichier temporaire
//     fs.unlinkSync(photoPath);

//     if (resultCloudinary) {
//       res.json({
//         result: true,
//         photo: {
//           url: resultCloudinary.secure_url,
//           date: resultCloudinary.created_at,
//         },
//       });
//     } else {
//       res.json({ result: false, error: "error" });
//     }
//   } else {
//     res.json({ result: false, error: resultMove });
//   }
  try {
    const resultCloudinary = await cloudinary.uploader
      .upload_stream(async (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          res
            .status(500)
            .json({ result: false, error: "Internal Server Error" });
        } else {
          res.json({
            result: true,
            photo: {
              url: result.secure_url,
              date: result.created_at,
            },
          });
        }
      })
      .end(req.files.photoFromFront.data);
  } catch (error) {
    console.error("Error processing picture:", error);
    res.status(500).json({ result: false, error: "Internal Server Error" });
  }
});

module.exports = router;
