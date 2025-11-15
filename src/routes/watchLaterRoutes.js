import express from "express";
import WatchLater from "../models/WatchLater.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add video to watch later
router.post("/add/:videoId", protect, async (req, res) => {
  try {
    await WatchLater.findOneAndUpdate(
      { userId: req.user.id, videoId: req.params.videoId },
      {},
      { upsert: true, new: true }
    );
    res.json({ message: "Added to Watch Later" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add" });
  }
});

// Remove from watch later
router.delete("/remove/:videoId", protect, async (req, res) => {
  try {
    await WatchLater.deleteOne({
      userId: req.user.id,
      videoId: req.params.videoId,
    });
    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove" });
  }
});

// Get user's watch later list
router.get("/:userId", protect, async (req, res) => {
  try {
    const list = await WatchLater.find({ userId: req.params.userId })
      .populate("videoId")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watch later" });
  }
});

export default router;
