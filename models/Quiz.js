const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  storyId: String,
  questions: [],
  points: Number
});

module.exports = mongoose.model("Quiz", quizSchema);
