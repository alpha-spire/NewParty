const mongoose = require("mongoose");

const photoSchema = mongoose.Schema({
    _userId: { ref: "users", type: mongoose.Schema.Types.ObjectId },
    eventId: { ref: "events", type: mongoose.Schema.Types.ObjectId },
    uri: { type: String, required: true },
    caption: { type: String, default: "" , maxLength: 200},  // pour ajouter une description à la photo, max 200 caractères
    likes: [{ ref: "users", type: mongoose.Schema.Types.ObjectId }], // liste des utilisateurs qui ont aimé la photo
    isDeleted: { type: Boolean, default: false }, // pour savoir si la photo a été supprimée (soft delete)
}, { timestamps: true })

const Photo = mongoose.model("photos", photoSchema);

module.exports = Photo;
