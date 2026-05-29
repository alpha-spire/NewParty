const jwt = require("jsonwebtoken");
const User = require("../models/users");

//Verifie la presence et la validite du token dans l'en-tete Authorization
module.exports = async function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ result: false, error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ result: false, error: "Token missing" });
    }

    try {
        // Vérifie la signature et la date d'expiration du token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Récupère l'user à jour depuis la base (photo, amis, events...)
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ result: false, error: "User not found" });
        }

        req.user = user; // user disponible dans toutes les routes protégées
        next();
    } catch (error) {
        // jwt.verify lance une erreur si le token est invalide ou expiré
        return res.status(401).json({ result: false, error: "Invalid or expired token" });
    }
};
