const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: "user" },
  totalScore: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: null },
  badges: [
    {
      badgeId: String,
      name: String,
      icon: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
