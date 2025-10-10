import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

// ✅ Add a comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const videoId = req.params.id;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });


      // 🔍 STEP 4: Debug log to verify user info from middleware
    console.log("req.user in addComment:", req.user);

    const newComment = await Comment.create({
      videoId,
      userId: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar || "",
      text,
    });

    // Emit to socket.io room for real-time updates
    const io = req.app.get("io");
    if (io) io.to(videoId).emit("commentAdded", newComment);

    res.status(201).json(newComment);
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get all comments for a video
export const getComments = async (req, res) => {
  try {
    const videoId = req.params.id;
    const comments = await Comment.find({ videoId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error("getComments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await Comment.deleteOne({ _id: commentId });

    const io = req.app.get("io");
    if (io) io.to(comment.videoId.toString()).emit("commentDeleted", commentId);

    res.json({ success: true, commentId });
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
