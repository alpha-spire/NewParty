var express = require("express");
var router = express.Router();
const getUserByToken = require("../modules/getUserByToken");
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//route SIGNUP inscription user---------------------------------------------------------------
router.post("/signup", async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    // Vérifier si user avec ce username existe déjà dans la BDD
    const data = await User.findOne({ username: username });
    if (data) {
        res.json({ result: false, error: "User already exists" });
        return;
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
    });
    //sauvegarde user dans bdd
    newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
    });
});

//route SIGNIN  connection user------------------------------------------------------
router.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    const data = await User.findOne({ username: username }).select(
        "+password +token",
    );
    //Vérification mot de passe avec bcrypt
    if (data && bcrypt.compareSync(password, data.password)) {
        res.json({ result: true, token: data.token, user: data });
    } else {
        res.json({
            result: false,
            error: "User not found or wrong password",
        });
    }
});

//route GET obtenir la liste des users--------------------------------------------------------------------------
router.get("/", async (req, res) => {
    const data = await User.find();
    if (data) {
        res.json({ result: true, users: data });
    }
});

//route GET obtenir un user par le token--------------------------------------------------------------------------
router.get("/:token", async (req, res) => {
    const { token } = req.params;

    const data = await getUserByToken(token);
    if (data) {
        res.json({ result: true, user: data });
    } else {
        res.json({ result: false, error: "invalid token" });
    }
});

//route POST UPDATE modifier les infos du user--------------------------------------
router.post("/update/", async (req, res) => {
    const authHeader = req.headers.authorization;  //string `Bearer ${user.token}`

    if (!authHeader) {
        res.json({ error: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];   // string -> liste de mots ['bearer','${user.token}']

    const {
        username,
        oldPassword,
        newPassword,
        userPhoto,
        email,
        friendId,
        remove,
    } = req.body;
    const user = await User.findOne({ token }).select("+password +token");
    if (!user) {
        res.json({ error: "unauthorized" });
        return;
    }
    //objet qui récupère les modifs
    const updateObj = {};

    if (email) {
        updateObj.email = email;
    }
    if (username) {
        updateObj.username = username;
    }

    if (userPhoto) {
        updateObj.userPhoto = userPhoto;
    }
    if (friendId && !remove) {
        updateObj.friendIds = [...user.friendIds, friendId];
    }

    if (friendId && remove) {
        updateObj.friendIds = user.friendIds.filter(
            (e) => e.toString() !== friendId,
        );
    }

    if (oldPassword && newPassword) {
        if (bcrypt.compareSync(oldPassword, user.password)) {
            const hash = bcrypt.hashSync(newPassword, 10);
            updateObj.password = hash;
        } else {
            res.json({
                result: false,
                error: "Wrong old password",
            });
            return;
        }
    }
    //si modifs présentes : MAJ BDD
    if (Object.keys(updateObj).length !== 0) {
        const user = await User.findOneAndUpdate({ token }, updateObj, {
            returnDocument: "after",
        });
        res.json({ user, token });
    } else {
        res.json({ error: "no modification" });
    }
});

//route DELETE user------------------------------------------------
router.delete("/delete", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.json({ error: "Unauthorized" });
        return;
    }
    const token = authHeader.split(" ")[1];

    const id = req.body._id;

    //condition pour supprimer uniquement par admin
    const data = await getUserByToken(token);
    if (data) {
        User.deleteOne({ token }).then(() => {
            User.find().then((data) => {
                res.json({ user: data });
            });
        });
    }
});

module.exports = router;
