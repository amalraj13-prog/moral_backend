const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: String,
  content: String,
  moral: String,
  videoUrl: String,
  audioUrl: String,
  createdBy: String
});

module.exports = mongoose.model("Story", storySchema);
