const Event = require("../models/events");

// Middleware pour vérifier que l'utilisateur a accès à l'événement (membre ou admin)
module.exports = async function (req, res, next) {
    try {
        // fonctionne avec /:eventId et /:photoId (on cherche eventId dans params ou body)
        const eventId = req.params.eventId || req.body.eventId;

        const event = await Event.findById(eventId);
        if (!event) {
            return res
                .status(404)
                .json({ result: false, error: "Event not found" });
        }

        const isAdmin = event.adminId.equals(req.user._id);
        const isMember = event.memberIds.some((id) => id.equals(req.user._id));
        if (!isAdmin && !isMember) {
            return res
                .status(403)
                .json({ result: false, error: "Access denied" });
        }
        next(); // accès autorisé → passe à la route suivante
    } catch (error) {
        return res.status(500).json({ result: false, error: "Server error" });
    }
};
