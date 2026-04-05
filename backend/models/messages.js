const mongoose = require("mongoose");

//définition d'un schéma de message
const messageSchema = mongoose.Schema({
  _userId: { ref: "users", type: mongoose.Schema.Types.ObjectId, required: true },
  eventId: { ref: "events", type: mongoose.Schema.Types.ObjectId },
  message: { type: String, required: true , trim: true, maxlength: 500},
  isEdited: { type: Boolean, default: false },   // pour savoir si le message a été modifié après sa création
  isDeleted: { type: Boolean, default: false },// pour savoir si le message a été supprimé (soft delete)
}, { timestamps: true }); // pour avoir createdAt et updatedAt automatiquement

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;
