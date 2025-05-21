const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Successfully connected to the MongoDB database..."))
  .catch((err) => console.error("Failed to connect to the database:", err));

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use(bodyParser.urlencoded({ extended: false }));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  username: String,
  date: Date,
  duration: Number,
  description: String,
});

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Excersice", exerciseSchema);

// Create a New User
app.post("/api/users", function (req, res) {
  username = req.body.username;
  let user = new User({
    username: username,
  });
  user.save((err, data) => {
    if (err) return console.error(err);
    res.json({ username: data.username, _id: data._id });
  });
});

// Add exercises
app.post("/api/users/:_id/exercises", function (req, res) {
  user_id = req.params._id;
  User.findById(user_id, (err, userData) => {
    if (err) return console.error(err);
    username = userData.username;
    let exercise = new Exercise({
      username: username,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });
    exercise.save((err, data) => {
      if (err) return console.error(err);
      res.json({
        _id: userData._id,
        username: username,
        date: data.date ? new Date(data.date).toDateString() : new Date().toDateString(),
        duration: data.duration,
        description: data.description,
      });
    });
  });
});

app.get("/api/users/:_id/logs?", function (req, res) {
  user_id = req.params._id;
  User.findById(user_id, (err, userData) => {
    if (err) return console.error(err);
    username = userData.username;
    // /api/users/:_id/logs?[from][&to]
    if (req.query.from || req.query.to) {
      let dateObj = {};
      if (req.query.from) {
        dateObj["$gte"] = new Date(req.query.from);
      }
      if (req.query.to) {
        dateObj["$lte"] = new Date(req.query.to);
      }
      Exercise.find({ username: username, date: dateObj }, (err, data) => {
        if (err) return console.error(err);
        res.json({
          _id: data._id,
          username: username,
          count: data.length,
          log: data,
        });
      });
    }
    // /api/users/:_id/logs?[limit]
    else if (req.query.limit) {
      Exercise.find({ username: username })
        .limit(parseInt(req.query.limit))
        .exec((err, data) => {
          if (err) return console.error(err);
          res.json({
            _id: data._id,
            username: username,
            count: data.length,
            log: data,
          });
        });
    }
    // /api/users/:_id/logs
    else {
      Exercise.find({ username: username }, (err, data) => {
        if (err) return console.error(err);
        const log = data.map(exercise => ({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date ? new Date(exercise.date).toDateString() : "Invalid Date"
        }));
        res.json({
          _id: userData._id,
          username: username,
          count: data.length,
          log: log,
        });
      });
    }
  });
});

app.get("/api/users", function (req, res) {
  User.find({}, (err, data) => {
    if (err) return console.error(err);
    res.json(data);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
