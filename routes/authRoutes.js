const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashed,
    role: role || "user"   // default user, admin if passed
  });

  res.json(user);
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json("Wrong password");

    // Daily streak logic
    const today = new Date().setHours(0, 0, 0, 0);

    if (user.lastLoginDate) {
      const last = new Date(user.lastLoginDate).setHours(0, 0, 0, 0);
      const diffDays = (today - last) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) user.streak += 1;
      else if (diffDays > 1) user.streak = 1;
    } else {
      user.streak = 1;
    }

    user.lastLoginDate = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});
module.exports = router;
