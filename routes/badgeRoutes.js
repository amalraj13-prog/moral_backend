const express = require("express");
const Badge = require("../models/Badge");
const router = express.Router();

// Create badge (Admin)
router.post("/create", async (req, res) => {
  try {
    const badge = await Badge.create(req.body);
    res.json(badge);
  } catch (err) {
    res.status(500).json({ message: "Error creating badge" });
  }
});

// Get all badges
router.get("/", async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: "Error fetching badges" });
  }
});

/* ============================
   UPDATE BADGE (Admin)
   PUT /api/badges/:id
============================ */
router.put("/:id", async (req, res) => {
  try {
    const { name, description, minScore, icon } = req.body;
    const badge = await Badge.findByIdAndUpdate(
      req.params.id,
      { name, description, minScore, icon },
      { new: true }
    );
    if (!badge) return res.status(404).json({ message: "Badge not found" });
    res.json({ message: "Badge updated successfully", badge });
  } catch (err) {
    res.status(500).json({ message: "Error updating badge" });
  }
});

/* ============================
   DELETE BADGE (Admin)
   DELETE /api/badges/:id
============================ */
router.delete("/:id", async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return res.status(404).json({ message: "Badge not found" });
    res.json({ message: "Badge deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting badge" });
  }
});

module.exports = router;
