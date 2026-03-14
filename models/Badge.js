const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: String,
  description: String,
  minScore: Number,   // score needed to earn this badge
  icon: String        // emoji or image URL
});

module.exports = mongoose.model("Badge", badgeSchema);
