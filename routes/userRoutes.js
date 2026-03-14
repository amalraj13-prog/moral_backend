const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  const users = await User.find()
    .sort({ totalScore: -1 })
    .select("username totalScore level");

  res.json(users);
});
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("username totalScore level badges");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* =========================
   DELETE USER (ADMIN)
   DELETE /api/users/:id
========================= */
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const users = await User.find().select("username totalScore level badges");
    global.io.emit("usersUpdated", users);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;
