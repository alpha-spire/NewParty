var express = require("express");
var router = express.Router();
const cloudinary = require("cloudinary").v2;
const auth = require("../middlewares/auth");

// Configuration explicite de Cloudinary à partir de CLOUDINARY_URL
// (Vercel peut stocker la valeur avec des guillemets parasites → on les retire)
const rawUrl = (process.env.CLOUDINARY_URL ?? "").replace(/^["']|["']$/g, "");
const match = rawUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
if (match) {
    cloudinary.config({
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3],
    });
} else {
    console.warn("[upload] CLOUDINARY_URL manquant ou mal formaté:", rawUrl);
}

// route POST upload d'une photo vers cloudinary - protégé par auth
router.post("/", auth, async (req, res) => {
    console.log("[upload] content-type:", req.headers["content-type"]);
    console.log("[upload] body defined:", !!req.body);
    console.log("[upload] photo defined:", !!req.body?.photo);
    console.log("[upload] photo length:", req.body?.photo?.length ?? 0);

    const { photo } = req.body ?? {};

    if (!photo) {
        return res.status(400).json({ result: false, error: "No file uploaded - body empty or photo missing" });
    }

    try {
        const result = await cloudinary.uploader.upload(photo, {
            folder: "newparty_photos",
        });

        res.status(201).json({
            result: true,
            photo: {
                url: result.secure_url,
                date: result.created_at,
            },
        });
    } catch (error) {
        console.error("[upload] Cloudinary error:", error?.message ?? error);
        res.status(500).json({ result: false, error: `Cloudinary: ${error?.message ?? "unknown error"}` });
    }
});

module.exports = router;
