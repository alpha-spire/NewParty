var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");

//route SIGNUP inscription user---------------------------------------------------------------
router.post("/signup", async (req, res) => {
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
        token: uid2(32),
        friendIds: [],
        eventIds: [],
    });
    //sauvegarde user dans bdd
    try {
        const savedUser = await newUser.save();
        res.status(201).json({ result: true, token: savedUser.token });
    } catch (error) {
        res.status(500).json({ result: false, error: "Error saving user" });
    }
});

//route SIGNIN  connection user------------------------------------------------------
router.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({
            result: false,
            error: "Missing or empty fields",
        });
        return;
    }
    try {
        const existingUser = await User.findOne({ username }).select(
            "+password +token",
        ); // on doit explicitement demander à récupérer le password et le token, car on a mis select: false dans le schéma pour éviter de les retourner par défaut dans les requêtes
        if (
            !existingUser ||
            !bcrypt.compareSync(password, existingUser.password)
        ) {
            return res.status(401).json({
                result: false,
                error: "Invalid credentials", // message d'erreur plus générique pour ne pas indiquer si c'est le username ou le password qui est incorrect, pour des raisons de sécurité
            });
        }
        res.status(200).json({
            result: true,
            token: existingUser.token,
            username: existingUser.username,
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

//route GET liste users : obtenir la liste des users — protégé par auth--------------------------------------------------------------------------
router.get("/listUsers", auth, async (req, res) => {
    try {
        const users = await User.find().select("username userPhoto"); // on ne retourne que les champs utiles pour la liste des utilisateurs, pas besoin de retourner le password, le token, les amis, etc.
        res.json({ result: true, users });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route GET liste des amis du user — protégé par auth--------------------------------------------------------------------------
router.get("/friends", auth, async (req, res) => {
    try {
        const user = await User.find(req.user._id)
        .populate("friendIds","username userPhoto")
        res.json({ result: true, friends :user.friendIds });
    } catch (error) {
        res.status(500).json({ result: false, error: "Server error" });
    }
});

//route POST UPDATE modifier les infos du user — protégé par auth-------------------------------------
router.post("/update", auth, async (req, res) => {
    const user = await User.findOne({ token: req.user.token }).select(
        "+password",
    );

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
            const updateUser = await User.findOneAndUpdate(
                { token: req.user.token },
                updateObj,
                {
                    new: true, //"new:true" remplace "returnDocument: after" dans les versions plus récentes de mongoose, pour retourner le document après la mise à jour, avec les modifications appliquées, au lieu du document avant la mise à jour
                    runValidators: true, // vérifie les règles du schéma (required, type...)
                },
            );
            res.json({ user: updateUser, result: true });
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
