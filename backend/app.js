require("./models/connection");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var eventsRouter = require("./routes/events");
var uploadRouter = require('./routes/upload');
var photosRouter = require('./routes/photos');
var messagesRouter = require('./routes/messages');
var invitationsRouter = require('./routes/invitations');

var app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const cors = require('cors');
// En prod : restreint aux origines déclarées dans FRONTEND_URL (séparées par des virgules)
// En dev  : tout est autorisé (FRONTEND_URL absent → '*')
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : null;

app.use(cors({
    origin: allowedOrigins
        ? (origin, callback) => {
            // Les apps mobiles natives n'envoient pas d'Origin — on les laisse passer
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('CORS: origin non autorisée'));
            }
        }
        : '*',
}));


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/events", eventsRouter);
app.use('/upload', uploadRouter);
app.use('/photos', photosRouter);
app.use('/messages', messagesRouter);
app.use('/invitations', invitationsRouter);

module.exports = app;
