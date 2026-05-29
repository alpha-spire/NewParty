// Connexion à la base de données MongoDB — exécuté au démarrage du serveur
require("./models/connection");
 
// Express : le framework principal qui gère les requêtes et réponses HTTP
var express = require("express");
// Path : module Node.js natif pour construire des chemins de fichiers (compatible Windows/Linux)
var path = require("path");
// CookieParser : middleware qui lit et parse les cookies envoyés dans les requêtes
var cookieParser = require("cookie-parser");
// Morgan : middleware de logging — affiche dans le terminal chaque requête reçue
var logger = require("morgan");
 
// Import des fichiers de routes — chaque fichier gère un groupe de fonctionnalités
var indexRouter = require("./routes/index");           // route racine "/"
var usersRouter = require("./routes/users");           // inscription, connexion, profil, amis
var eventsRouter = require("./routes/events");         // création et gestion des événements
var uploadRouter = require('./routes/upload');         // upload de photos vers Cloudinary
var photosRouter = require('./routes/photos');         // récupération et suppression de photos
var messagesRouter = require('./routes/messages');     // chat par événement
var invitationsRouter = require('./routes/invitations'); // demandes d'amis
 
// Création de l'application Express — c'est l'objet central qui reçoit tous les middlewares et routes
var app = express();

// Vercel est derrière un reverse proxy — nécessaire pour express-rate-limit
app.set("trust proxy", 1);
 
// --- MIDDLEWARE : CORS (Cross-Origin Resource Sharing) ---
// Permet au frontend (sur un domaine différent) d'appeler l'API depuis un navigateur
// Sans CORS, le navigateur bloquerait toutes les requêtes venant d'un autre domaine
const cors = require('cors');
 
// Lecture de la variable d'environnement FRONTEND_URL
// En prod : contient les domaines autorisés séparés par des virgules ex: "https://newparty.fr,https://www.newparty.fr"
// En dev  : absente → allowedOrigins vaut null → tout est autorisé
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) // découpe la chaîne en tableau de domaines
  : null;
 
app.use(cors({
  origin: allowedOrigins
    // MODE PRODUCTION : une fonction est appelée à chaque requête pour vérifier l'origine
    ? (origin, callback) => {
        // !origin → pas d'en-tête Origin dans la requête
        // Cas des apps mobiles natives (React Native) qui n'envoient pas d'Origin → on laisse passer
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true); // origine autorisée → ajoute le header Access-Control-Allow-Origin
        } else {
          callback(new Error('CORS: origin non autorisée')); // origine inconnue → requête bloquée
        }
      }
    // MODE DÉVELOPPEMENT : '*' signifie que toutes les origines sont acceptées
    : '*',
}));
 
// Logging des requêtes dans le terminal (méthode, URL, statut, temps de réponse)
app.use(logger("dev"));
// Parse le body des requêtes au format JSON → remplit req.body avec un objet JavaScript
app.use(express.json({ limit: "10mb" }));
// Parse les données de formulaires HTML (format clé=valeur) → remplit aussi req.body
app.use(express.urlencoded({ extended: false }));
// Parse les cookies de la requête → les rend accessibles via req.cookies
app.use(cookieParser());
// Sert les fichiers statiques du dossier "public" (images, CSS, JS front) directement via HTTP
app.use(express.static(path.join(__dirname, "public")));
 
// --- BRANCHEMENT DES ROUTES ---
// Chaque app.use associe un préfixe d'URL au fichier de routes correspondant
// Ex: une requête POST /users/signup est traitée par usersRouter
app.use("/", indexRouter);               // route racine
app.use("/users", usersRouter);          // /users/signup, /users/signin, etc.
app.use("/events", eventsRouter);        // /events, /events/:id, etc.
app.use('/upload', uploadRouter);        // /upload → envoi de photo vers Cloudinary
app.use('/photos', photosRouter);        // /photos/:eventId, etc.
app.use('/messages', messagesRouter);    // /messages/:eventId
app.use('/invitations', invitationsRouter); // /invitations/send, /invitations/respond, etc.
 
// Export de l'app pour qu'elle soit utilisée par le fichier bin/www qui démarre le serveur HTTP
module.exports = app;
 