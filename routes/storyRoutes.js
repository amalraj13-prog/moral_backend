const express = require("express");
const Story = require("../models/Story");
const upload = require("../middleware/upload");
const router = express.Router();

/* ============================
   CREATE STORY (Admin Upload)
============================ */
router.post(
  "/create",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, content, moral } = req.body;
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

      const videoUrl = req.files.video
        ? `${baseUrl}/uploads/${req.files.video[0].filename}`
        : "";

      const audioUrl = req.files.audio
        ? `${baseUrl}/uploads/${req.files.audio[0].filename}`
        : "";

      const story = await Story.create({
        title,
        content,
        moral,
        videoUrl,
        audioUrl,
      });

      res.json(story);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

/* ============================
   GET ALL STORIES (Dashboard)
============================ */
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

/* ============================
   GET SINGLE STORY (Story Page)
============================ */
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Story not found" });
  }
});

/* ============================
   UPDATE STORY (Admin)
   PUT /api/stories/:id
============================ */
router.put(
  "/:id",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, content, moral } = req.body;
      const updateData = { title, content, moral };
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

      if (req.files && req.files.video) {
        updateData.videoUrl = `${baseUrl}/uploads/${req.files.video[0].filename}`;
      }
      if (req.files && req.files.audio) {
        updateData.audioUrl = `${baseUrl}/uploads/${req.files.audio[0].filename}`;
      }

      const story = await Story.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!story) return res.status(404).json({ error: "Story not found" });

      res.json(story);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Update failed" });
    }
  }
);

/* ============================
   DELETE STORY (Admin)
   DELETE /api/stories/:id
============================ */
router.delete("/:id", async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found" });

    res.json({ message: "Story deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
