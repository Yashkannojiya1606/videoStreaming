// routes/watchlater.js
import express from "express";
import WatchLater from "../models/WatchLater.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a video to watch later (body: { videoId })
router.post("/", protect, async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) return res.status(400).json({ error: "videoId is required" });

    const doc = await WatchLater.findOneAndUpdate(
      { userId: req.user.id, videoId },
      { $setOnInsert: { userId: req.user.id, videoId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If created now, createdAt present; if already existed, still returns doc
    return res.status(200).json({ message: "Added to Watch Later", item: doc });
  } catch (err) {
    console.error("WatchLater POST error:", err);
    return res.status(500).json({ error: "Failed to add to watch later" });
  }
});

// Remove a video from watch later (param: videoId)
router.delete("/:videoId", protect, async (req, res) => {
  try {
    const { videoId } = req.params;
    const result = await WatchLater.deleteOne({ userId: req.user.id, videoId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Not found in Watch Later" });
    }
    return res.status(200).json({ message: "Removed from Watch Later" });
  } catch (err) {
    console.error("WatchLater DELETE error:", err);
    return res.status(500).json({ error: "Failed to remove from watch later" });
  }
});

// Get current user's watch later list (populated)
router.get("/me", protect, async (req, res) => {
  try {
    const list = await WatchLater.find({ userId: req.user.id })
      .populate("videoId") // ensure your Video schema fields are what you need
      .sort({ createdAt: -1 });

    return res.status(200).json(list);
  } catch (err) {
    console.error("WatchLater GET /me error:", err);
    return res.status(500).json({ error: "Failed to fetch watch later list" });
  }
});

// Check whether a specific video is in current user's watch later
router.get("/check/:videoId", protect, async (req, res) => {
  try {
    const { videoId } = req.params;
    const exists = await WatchLater.exists({ userId: req.user.id, videoId });
    return res.status(200).json({ exists: !!exists });
  } catch (err) {
    console.error("WatchLater CHECK error:", err);
    return res.status(500).json({ error: "Failed to check watch later" });
  }
});

export default router;
