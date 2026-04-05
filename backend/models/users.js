const mongoose = require("mongoose");

//définition d'un schéma d'utilisateur
const userSchema = mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true }, // evite les doublons et les espaces
        email: { type: String, required: true, unique: true },
        password: {
            type: String,
            required: true,
            select: false, // pour ne pas retourner le mot de passe dans les requêtes, même si on oublie de le retirer explicitement
        },
        userPhoto: { type: String, default: null }, // URL de la photo de profil, par défaut null
        token: {
            type: String,
            select: false,
        },
        friendIds: [{ ref: "users", type: mongoose.Schema.Types.ObjectId }], // liste d'amis de l'utilisateur
        eventIds: [{ ref: "events", type: mongoose.Schema.Types.ObjectId }], // liste events auxquels l'utilisateur participe
        role: { type: String, enum: ["user", "admin"], default: "user" }, // pour les droits admin,
    },
    { timestamps: true },
); // timestamps pour avoir createdAt et updatedAt automatiquement

//création du modèle mongoose
const User = mongoose.model("users", userSchema);

module.exports = User;
