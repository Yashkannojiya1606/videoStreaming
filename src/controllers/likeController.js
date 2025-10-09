// controllers/likeController.js
import Like from "../models/Like.js";
import Video from "../models/Video.js";

// ✅ Toggle like/unlike
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.id;
    const io = req.app.get("io"); // socket.io instance

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const existing = await Like.findOne({ userId, videoId });

    if (existing) {
      // Unlike
      await Like.deleteOne({ _id: existing._id });
      const updated = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { likeCount: -1 } },
        { new: true }
      );

      // Emit updated like count to room
      if (io) io.to(videoId).emit("likeUpdated", { videoId, likeCount: updated.likeCount });

      return res.json({ liked: false, likeCount: updated.likeCount });
    } else {
      // Like
      try {
        await Like.create({ userId, videoId });
      } catch (err) {
        if (err.code !== 11000) throw err; // ignore duplicate key errors
      }

      const updated = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { likeCount: 1 } },
        { new: true }
      );

      if (io) io.to(videoId).emit("likeUpdated", { videoId, likeCount: updated.likeCount });

      return res.json({ liked: true, likeCount: updated.likeCount });
    }
  } catch (err) {
    console.error("toggleLike error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Check if current user has liked a video
export const isLiked = async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.id;

    const existing = await Like.findOne({ userId, videoId });
    res.json({ liked: !!existing }); // true or false
  } catch (err) {
    console.error("isLiked error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
