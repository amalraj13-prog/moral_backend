const express = require("express");
const User = require("../models/User");
const Story = require("../models/Story");
const Quiz = require("../models/Quiz");
const Progress = require("../models/Progress");
const router = express.Router();

/*
GET /api/analytics
*/
router.get("/", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStories = await Story.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await Progress.countDocuments();

    const avgScoreData = await Progress.aggregate([
      { $group: { _id: null, avg: { $avg: "$score" } } }
    ]);

    const averageScore = avgScoreData[0]?.avg || 0;

    const topUsers = await User.find()
      .sort({ totalScore: -1 })
      .limit(5)
      .select("username totalScore level");

    res.json({
      totalUsers,
      totalStories,
      totalQuizzes,
      totalAttempts,
      averageScore: Math.round(averageScore),
      topUsers,
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics fetch failed" });
  }
});

module.exports = router;
