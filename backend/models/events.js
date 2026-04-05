const mongoose = require("mongoose");

//définition d'un schéma d'évènement
const eventSchema = mongoose.Schema({
  title: { type: String, required: true , trim: true},
  description : { type: String, default: "" },  // pour présenter l'évènement
  location: { type: String , trim: true},
  photoEventUrl: { type: String , trim: true},
  startDate: Date,
  endDate: Date,
  startHour: Date,
  endHour: Date,
  isPrivate: { type: Boolean, default: false },  // pour rendre l'évènement privé ou public
  adminId: { ref: "users", type: mongoose.Schema.Types.ObjectId },
  memberIds: [{ ref: "users", type: mongoose.Schema.Types.ObjectId }],
});

//création du modèle mongoose
const Event = mongoose.model("events", eventSchema);

module.exports = Event;
