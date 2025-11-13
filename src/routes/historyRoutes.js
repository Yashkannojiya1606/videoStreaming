// import express from "express";
// import History from "../models/History.js";
// import { protect } from "../middleware/authMiddleware.js"; // ✅ uses your existing middleware

// const router = express.Router();

// /**
//  * ✅ 1. Add video to watch history
//  * Called when user plays a video
//  */
// router.post("/add/:videoId", protect, async (req, res) => {
//   try {
//     const { videoId } = req.params;
//     const userId = req.user.id || req.user._id; // handles both decoded & populated user

//     // Check if video already in history
//     const existing = await History.findOne({ userId, videoId });

//     if (existing) {
//       existing.watchedAt = new Date();
//       await existing.save();
//       return res.json({ message: "History updated" });
//     }

//     const newHistory = new History({ userId, videoId });
//     await newHistory.save();

//     res.status(201).json({ message: "Added to history" });
//   } catch (error) {
//     console.error("❌ Add history error:", error);
//     res.status(500).json({ error: "Failed to add video to history" });
//   }
// });

// /**
//  * ✅ 2. Get all watch history for a user
//  */
// router.get("/:userId", protect, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Verify requesting user matches the history owner
//     if (
//       req.user.id?.toString() !== userId &&
//       req.user._id?.toString() !== userId
//     ) {
//       return res.status(403).json({ error: "Unauthorized access" });
//     }

//     const history = await History.find({ userId })
//       .populate("videoId") // returns full video details
//       .sort({ watchedAt: -1 });

//     res.json(history);
//   } catch (error) {
//     console.error("❌ Fetch history error:", error);
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// /**
//  * ✅ 3. Clear entire watch history
//  */
// router.delete("/clear/:userId", protect, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (
//       req.user.id?.toString() !== userId &&
//       req.user._id?.toString() !== userId
//     ) {
//       return res.status(403).json({ error: "Unauthorized access" });
//     }

//     await History.deleteMany({ userId });
//     res.json({ message: "History cleared" });
//   } catch (error) {
//     console.error("❌ Clear history error:", error);
//     res.status(500).json({ error: "Failed to clear history" });
//   }
// });

// export default router;


import express from "express";
import History from "../models/History.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Add video to history
 */
router.post("/add/:videoId", protect, async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const existing = await History.findOne({ userId, videoId });
    if (existing) {
      existing.watchedAt = new Date();
      await existing.save();
      return res.json({ message: "History updated" });
    }

    const newHistory = new History({ userId, videoId });
    await newHistory.save();
    res.status(201).json({ message: "Added to history" });
  } catch (err) {
    console.error("❌ Add history error:", err);
    res.status(500).json({ error: "Failed to add video to history" });
  }
});

/**
 * ✅ Get all history for a user
 */
router.get("/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId)
      return res.status(403).json({ error: "Unauthorized access" });

    const history = await History.find({ userId })
      .populate("videoId")
      .sort({ watchedAt: -1 });

    res.json(history);
  } catch (err) {
    console.error("❌ Fetch history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/**
 * ✅ Clear all history
 */
router.delete("/clear/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId)
      return res.status(403).json({ error: "Unauthorized access" });

    await History.deleteMany({ userId });
    res.json({ message: "History cleared" });
  } catch (err) {
    console.error("❌ Clear history error:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
});

export default router;
