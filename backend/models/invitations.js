const mongoose = require("mongoose");

const invitationSchema = mongoose.Schema({
    // Celui qui envoie la demande
    senderId:   { ref: "users", type: mongoose.Schema.Types.ObjectId, required: true },
    // Celui qui reçoit la demande
    receiverId: { ref: "users", type: mongoose.Schema.Types.ObjectId, required: true },
    // Statut de l'invitation
    status: {
        type: String,
        enum: ["pending", "accepted", "refused"], // 3 états possibles
        default: "pending",
    },
}, { timestamps: true });

// Empêche d'envoyer 2 invitations au même user
invitationSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const Invitation = mongoose.model("invitations", invitationSchema);
module.exports = Invitation;