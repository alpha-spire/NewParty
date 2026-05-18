var express = require("express");
var router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const rateLimit = require("express-rate-limit");

// Bloque une IP après 10 tentatives échouées sur 15 minutes
// Protège /signin et /signup contre le brute force et la création de masse de faux comptes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
    max: 10,                   // max 10 requêtes par IP sur cette fenêtre
    message: { result: false, error: "Trop de tentatives, réessaie dans 15 minutes" },
    standardHeaders: true,     // envoie les headers RateLimit-* standard
    legacyHeaders: false,
});

//route SIGNUP inscription user---------------------------------------------------------------
router.post("/signup", authLimiter, async (req, res) => {
    const { username, password, email } = req.body;

    // Vérification des champs obligatoires
    if (!username || !password || !email) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }

    // Vérifier user et email uniques avant de faire le hash et la création, pour éviter les opérations inutiles en cas de doublon
    const existingUser = await User.findOne({ $or: [{ username }, { email }] }); // chainage de conditions pour vérifier à la fois le username et l'email
    if (existingUser) {
        return res
            .status(409)
            .json({ result: false, error: "Username or email already exists" }); // 409 Conflict est plus approprié pour les doublons que 400 Bad Request
    }

    //hachage passsword
    const hash = bcrypt.hashSync(password, 10);
    // creation new user
    const newUser = new User({
        username: username,
        email: email,
        password: hash,
        friendIds: [],
        eventIds: [],
    });
    //sauvegarde user dans bdd
    try {
        const savedUser = await newUser.save();
        // Génère un JWT signé avec l'id du nouvel user — expire dans 30 jours
        const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.status(201).json({ result: true, token });
    } catch (error) {
        res.status(500).json({ result: false, error: "Error saving user" });
    }
});

//route SIGNIN  connection user------------------------------------------------------
router.post("/signin", authLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({
            result: false,
            error: "Missing or empty fields",
        });
        return;
    }
    try {
        const existingUser = await User.findOne({ username }).select("+password");
        if (
            !existingUser ||
            !bcrypt.compareSync(password, existingUser.password)
        ) {
            return res.status(401).json({
                result: false,
                error: "Invalid credentials",
            });
        }
        // Génère un JWT signé avec l'id de l'user — expire dans 30 jours
        const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.status(200).json({
            result: true,
            token,
            username: existingUser.username,
            _id: existingUser._id,
            userPhoto: existingUser.userPhoto ?? null,
        });
    } catch (error) {
        res.status(500).json({
            result: false,
            error: "Server error",
        });
    }
});

//route GET PROFILE : obtenir un user par le token — protégé par auth------------------------------------------------------------------------
router.get("/profile", auth, async (req, res) => {
    res.json({ result: true, user: req.user });
});

//route GET recherche un user par son username — protégé par auth--------------------------------------------------------------------------
router.get("/search/:username", auth, async (req, res) => {
    try {
        // Cherche un user par username exact ,On exclut l'user connecté des résultats
        const foundUser = await User.findOne({
            username: req.params.username,
            _id: { $ne: req.user._id }, // $ne = "not equal" — exclut l'user connecté
        }).select("username userPhoto"); // on ne retourne que les champs utiles pour la liste des utilisateurs, pas besoin de retourner le password, le token, les amis, etc.
        if (!foundUser) {
            return res
                .status(404)
                .json({ result: false, error: "User not found" });
        }

        // Vérifie si déjà ami
        const isAlreadyFriend = req.user.friendIds.some(
            (id) => id.toString() === foundUser._id.toString()
        );

        res.json({ result: true, user: foundUser, isAlreadyFriend });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route GET liste des amis du user — protégé par auth--------------------------------------------------------------------------
router.get("/friends", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            "friendIds",
            "username userPhoto",
        );
        if (!user) {
            return res
                .status(404)
                .json({ result: false, error: "User not found" });
        }
        res.json({ result: true, friends: user.friendIds });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route POST UPDATE modifier les infos du user — protégé par auth-------------------------------------
router.post("/update", auth, async (req, res) => {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
    }

    const {
        username,
        oldPassword,
        newPassword,
        userPhoto,
        email,
        friendId,
        remove,
    } = req.body;

    //objet qui récupère les modifs
    const updateObj = {};

    if (email) {
        updateObj.email = email.toLowerCase().trim(); // on met l'email en minuscules et on retire les espaces pour éviter les doublons du type "
    }
    if (username) {
        updateObj.username = username;
    }

    if (userPhoto) {
        updateObj.userPhoto = userPhoto;
    }
    if (friendId && !remove) {
        if (!user.friendIds.includes(friendId)) {
            updateObj.friendIds = [...user.friendIds, friendId];
        }
    }

    if (friendId && remove) {
        updateObj.friendIds = user.friendIds.filter(
            (e) => e.toString() !== friendId,
        );
    }
    //si changement de mot de passe demandé, vérifier l'ancien mot de passe avant de faire le hash du nouveau et la MAJ dans la BDD
    if (oldPassword && newPassword) {
        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return res.json({
                result: false,
                error: "Wrong old password",
            });
        }
        if (newPassword.length < 8) {
            return res.json({
                result: false,
                error: "Password too short",
            });
        }

        updateObj.password = bcrypt.hashSync(newPassword, 10);
    }

    try {
        //si modifs présentes : MAJ BDD
        if (Object.keys(updateObj).length !== 0) {
            const updateUser = await User.findByIdAndUpdate(
                req.user._id,
                updateObj,
                {
                    new: true, //"new:true" remplace "returnDocument: after" dans les versions plus récentes de mongoose, pour retourner le document après la mise à jour, avec les modifications appliquées, au lieu du document avant la mise à jour
                    runValidators: true, // vérifie les règles du schéma (required, type...)
                },
            );
            res.json({ user: updateUser, result: true });
        } else {
            res.status(400).json({ result: false, error: "No modification" });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route DELETE user — protégé par auth ------------------------------------------------
router.delete("/delete", auth, async (req, res) => {
    try {
        //req.user est disponible grâce au middleware auth qui a vérifié le token et récupéré l'utilisateur correspondant,
        // on peut donc utiliser req.user.token pour identifier l'utilisateur à supprimer
        const result = await User.deleteOne({ _id: req.user._id });
        res.json({ result: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

module.exports = router;
