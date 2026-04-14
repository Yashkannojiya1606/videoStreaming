// import Comment from "../models/Comment.js";
// import Video from "../models/Video.js";

// // ✅ Add a comment
// export const addComment = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const videoId = req.params.id;

//     const video = await Video.findById(videoId);
//     if (!video) return res.status(404).json({ error: "Video not found" });


//       // 🔍 STEP 4: Debug log to verify user info from middleware
//     console.log("req.user in addComment:", req.user);

//     const newComment = await Comment.create({
//       videoId,
//       userId: req.user.id,
//       username: req.user.username,
//       avatar: req.user.avatar || "",
//       text,
//     });

//     // Emit to socket.io room for real-time updates
//     const io = req.app.get("io");
//     if (io) io.to(videoId).emit("commentAdded", newComment);

//     res.status(201).json(newComment);
//   } catch (err) {
//     console.error("addComment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Get all comments for a video
// export const getComments = async (req, res) => {
//   try {
//     const videoId = req.params.id;
//     const comments = await Comment.find({ videoId }).sort({ createdAt: -1 });
//     res.json(comments);
//   } catch (err) {
//     console.error("getComments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Delete a comment
// export const deleteComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;

//     const comment = await Comment.findById(commentId);
//     if (!comment) return res.status(404).json({ error: "Comment not found" });

//     if (comment.userId.toString() !== req.user.id) {
//       return res.status(403).json({ error: "Not authorized to delete this comment" });
//     }

//     await Comment.deleteOne({ _id: commentId });

//     const io = req.app.get("io");
//     if (io) io.to(comment.videoId.toString()).emit("commentDeleted", commentId);

//     res.json({ success: true, commentId });
//   } catch (err) {
//     console.error("deleteComment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };




// new changes as per the 8 nov for render same name in comment as well as channel 


// import Comment from "../models/Comment.js";
// import Video from "../models/Video.js";
// import User from "../models/User.js"; // ✅ Import User model to fetch fresh data

// // ✅ Add a comment
// export const addComment = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const videoId = req.params.id;

//     const video = await Video.findById(videoId);
//     if (!video) return res.status(404).json({ error: "Video not found" });

//     // ✅ Fetch the latest user details from DB
//     const user = await User.findById(req.user.id).select("name username avatar");
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // ✅ Create comment with updated name & avatar
//     const newComment = await Comment.create({
//       videoId,
//       userId: user._id,
//       username: user.name || user.username, // use display name if available
//       userAvatar: user.avatar || "",
//       text,
//     });

//     // ✅ Emit real-time update
//     const io = req.app.get("io");
//     if (io) io.to(videoId).emit("commentAdded", newComment);

//     res.status(201).json(newComment);
//   } catch (err) {
//     console.error("addComment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Get all comments for a video older version
// // export const getComments = async (req, res) => {
// //   try {
// //     const videoId = req.params.id;
// //     const comments = await Comment.find({ videoId }).sort({ createdAt: -1 });
// //     res.json(comments);
// //   } catch (err) {
// //     console.error("getComments error:", err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };


// // ✅ Get all comments for a video (with sort filter)
// export const getComments = async (req, res) => {
//   try {
//     const videoId = req.params.id;
//     const { sort } = req.query; // can be 'newest' or 'oldest'

//     // Set sort order based on query
//     const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

//     const comments = await Comment.find({ videoId })
//       .sort(sortOption)
//       .populate("userId", "name username avatar"); // optional: populate user info

//     res.status(200).json(comments);
//   } catch (err) {
//     console.error("getComments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };






// // ✅ Delete a comment
// export const deleteComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;

//     const comment = await Comment.findById(commentId);
//     if (!comment) return res.status(404).json({ error: "Comment not found" });

//     if (comment.userId.toString() !== req.user.id) {
//       return res.status(403).json({ error: "Not authorized to delete this comment" });
//     }

//     await Comment.deleteOne({ _id: commentId });

//     const io = req.app.get("io");
//     if (io) io.to(comment.videoId.toString()).emit("commentDeleted", commentId);

//     res.json({ success: true, commentId });
//   } catch (err) {
//     console.error("deleteComment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };






//  change on 12-11-2025
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import User from "../models/User.js";

// ✅ Add a new comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const videoId = req.params.id;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const user = await User.findById(req.user.id).select("name username avatar");
    if (!user) return res.status(404).json({ error: "User not found" });

    const newComment = await Comment.create({
      videoId,
      userId: user._id,
      username: user.name || user.username,
      userAvatar: user.avatar || "",
      text,
    });
    // ⭐ Increase comment count on video
await Video.findByIdAndUpdate(videoId, {
  $inc: { commentCount: 1 }
});


    const io = req.app.get("io");
    if (io) io.to(videoId).emit("commentAdded", newComment);

    res.status(201).json(newComment);
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getComments = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { sort, limit = 50, page = 1 } = req.query;

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
    
    const skipAmount = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitAmount = parseInt(limit, 10);

    const comments = await Comment.find({ videoId })
      .sort(sortOption)
      .skip(skipAmount)
      .limit(limitAmount)
      .populate("userId", "name username avatar");

    res.status(200).json(comments);
  } catch (err) {
    console.error("getComments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Like a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.likes = comment.likes + 1;
    await comment.save();

    const io = req.app.get("io");
    if (io)
      io.to(comment.videoId.toString()).emit("commentLiked", {
        commentId,
        likes: comment.likes,
      });

    res.status(200).json({ success: true, likes: comment.likes });
  } catch (err) {
    console.error("likeComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Dislike a comment
export const dislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.dislikes = comment.dislikes + 1;
    await comment.save();

    const io = req.app.get("io");
    if (io)
      io.to(comment.videoId.toString()).emit("commentDisliked", {
        commentId,
        dislikes: comment.dislikes,
      });

    res.status(200).json({ success: true, dislikes: comment.dislikes });
  } catch (err) {
    console.error("dislikeComment error:", err);
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
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });  
    }

    await Comment.deleteOne({ _id: commentId });
    await Video.findByIdAndUpdate(comment.videoId, {
  $inc: { commentCount: -1 },
  $max: { commentCount: 0 }
});

    const io = req.app.get("io");
    if (io) io.to(comment.videoId.toString()).emit("commentDeleted", commentId);

    res.json({ success: true, commentId });
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
