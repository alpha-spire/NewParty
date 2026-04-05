const User = require("../models/users");

module.exports = async function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ result: false, error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ result: false, error: "Token missing" });
    }

    const user = await User.findOne({ token });
    if (!user) {
        return res.status(401).json({ result: false, error: "Invalid token" });
    }
    req.user = user; // user disponible dans toutes les routes protégées
    next();
};
