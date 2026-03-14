const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: String,
  storyId: String,
  score: Number,
  completed: { type: Boolean, default: true }
});

module.exports = mongoose.model("Progress", progressSchema);
