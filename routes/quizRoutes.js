const express = require("express");
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Badge = require("../models/Badge");
const Story = require("../models/Story");
const router = express.Router();

/* ============================
   ADMIN → CREATE QUIZ
   POST /api/quiz/create
============================ */
router.post("/create", async (req, res) => {
  try {
    const { storyId, questions, points } = req.body;

    if (!storyId || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Invalid quiz data" });
    }

    const quiz = await Quiz.create({
      storyId,
      questions,
      points,
    });

    res.json({ message: "Quiz created successfully", quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating quiz" });
  }
});

/* ============================
   ADMIN → GET ALL QUIZZES
   GET /api/quiz
============================ */
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    // Attach story titles
    const stories = await Story.find();
    const storyMap = {};
    stories.forEach(s => { storyMap[s._id.toString()] = s.title; });

    const result = quizzes.map(q => ({
      ...q.toObject(),
      storyTitle: storyMap[q.storyId] || "Unknown Story",
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes" });
  }
});

/* ============================
   USER → GET QUIZ BY STORY
   GET /api/quiz/:storyId
============================ */
router.get("/:storyId", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ storyId: req.params.storyId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz" });
  }
});

/* ============================
   USER → SUBMIT QUIZ
   POST /api/quiz/submit/:storyId
============================ */
router.post("/submit/:storyId", async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const { storyId } = req.params;

    const quiz = await Quiz.findOne({ storyId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score += quiz.points / quiz.questions.length;
      }
    });

    score = Math.round(score);

    // Save progress
    await Progress.create({
      userId,
      storyId,
      score,
      completed: true,
    });

    // Update user score & level
    user.totalScore += score;
    user.level = Math.floor(user.totalScore / 50) + 1;

    /* ============================
       BADGE SYSTEM
    ============================ */
    let badge = "Beginner";
    if (score >= 80) badge = "Gold";
    else if (score >= 50) badge = "Silver";
    else if (score >= 30) badge = "Bronze";

    user.badges.push({
      storyId,
      badge,
      date: new Date(),
    });

    await user.save();

    /* ============================
       REAL-TIME LEADERBOARD
    ============================ */
    const users = await User.find()
      .sort({ totalScore: -1 })
      .select("username totalScore level");

    global.io.emit("leaderboardUpdated", users);
    // const users = await User.find().select("username totalScore level badges");
    // global.io.emit("usersUpdated", users);
    const analyticsData = {
      totalUsers: await User.countDocuments(),
      totalStories: await Story.countDocuments(),
      totalQuizzes: await Quiz.countDocuments(),
      totalAttempts: await Progress.countDocuments(),
    };

    global.io.emit("analyticsUpdated", analyticsData);

    /* ============================
       FINAL RESPONSE
    ============================ */
    res.json({
      message: "Quiz submitted successfully",
      score,
      badge,
      totalScore: user.totalScore,
      level: user.level,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Quiz submission failed" });
  }
});



/* ============================
   ADMIN → UPDATE QUIZ
   PUT /api/quiz/:id
============================ */
router.put("/:id", async (req, res) => {
  try {
    const { storyId, questions, points } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { storyId, questions, points },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ message: "Quiz updated successfully", quiz });
  } catch (err) {
    res.status(500).json({ message: "Error updating quiz" });
  }
});

/* ============================
   ADMIN → DELETE QUIZ
   DELETE /api/quiz/:id
============================ */
router.delete("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting quiz" });
  }
});

module.exports = router;
