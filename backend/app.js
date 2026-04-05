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


var app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const cors = require('cors');
app.use(cors());


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

module.exports = app;
