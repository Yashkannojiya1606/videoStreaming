

//  D:\video-streaming-overair\video-streaming-overair\backend\src\routes\videoRoutes.js

// import express from "express";
// import multer from "multer";
// import mongoose from "mongoose";
// import Video from "../models/Video.js";
// import { protect } from "../middleware/authMiddleware.js";
// import s3 from "../config/aws.js";
// import { toggleLike, isLiked } from "../controllers/likeController.js";
// import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
// import { getMyVideos } from "../controllers/videoController.js";

// const router = express.Router();

// // Multer setup
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 100 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.fieldname === "video" && file.mimetype.startsWith("video/")) cb(null, true);
//     else if (
//       file.fieldname === "thumbnail" &&
//       (file.mimetype.startsWith("image/") ||
//         file.mimetype === "image/jpeg" ||
//         file.mimetype === "image/png")
//     )
//       cb(null, true);
//     else cb(new Error("Invalid file type"), false);
//   },
// });

// // ✅ Upload video + thumbnail (protected)
// router.post(
//   "/upload",
//   protect,
//   upload.fields([
//     { name: "video", maxCount: 1 },
//     { name: "thumbnail", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       if (!req.files?.video || !req.files?.thumbnail) {
//         return res.status(400).json({ error: "Video and thumbnail are required" });
//       }

//       const { title, description, tags, category, authorName, authorAvatar } = req.body;

//       if (!title || !category)
//         return res.status(400).json({ error: "Title and category are required" });

//       const videoFile = req.files.video[0];
//       const thumbnailFile = req.files.thumbnail[0];

//       const safeVideoName = `videos/${Date.now()}-${videoFile.originalname.replace(/\s+/g, "_")}`;
//       const safeThumbName = `thumbnails/${Date.now()}-${thumbnailFile.originalname.replace(/\s+/g, "_")}`;

//       const uploadedVideo = await s3
//         .upload({
//           Bucket: process.env.S3_BUCKET_NAME,
//           Key: safeVideoName,
//           Body: videoFile.buffer,
//           ContentType: videoFile.mimetype,
//           // ACL: "public-read",   comment out for acl through the bucket policy
//         })
//         .promise();

//       const uploadedThumbnail = await s3
//         .upload({
//           Bucket: process.env.S3_BUCKET_NAME,
//           Key: safeThumbName,
//           Body: thumbnailFile.buffer,
//           ContentType: thumbnailFile.mimetype,
//           // ACL: "public-read",
//         })
//         .promise();

//       const newVideo = new Video({
//         title,
//         description: description || "",
//         videoUrl: uploadedVideo.Location,
//         thumbnailUrl: uploadedThumbnail.Location,
//         userId: req.user.id,
//         authorName: authorName || "Unknown",
//         authorAvatar: authorAvatar || "",
//         tags: tags ? tags.split(",").map((t) => t.trim()) : [],
//         category: category || "Other",
//       });

//       const savedVideo = await newVideo.save();
//       console.log("✅ Video uploaded successfully:", savedVideo._id);

//       res.status(201).json(savedVideo);
//     } catch (err) {
//       console.error("❌ Video upload error:", err);
//       res.status(500).json({ error: "Video upload failed", details: err.message });
//     }
//   }
// );

// // 🧹 Cleanup
// router.delete("/cleanup", async (req, res) => {
//   try {
//     const result = await Video.deleteMany({
//       videoUrl: {
//         $not: {
//           $regex: /^https:\/\/overairstream\.s3\.ap-south-1\.amazonaws\.com/,
//         },
//       },
//     });
//     res.json({
//       success: true,
//       deletedCount: result.deletedCount,
//       message: `${result.deletedCount} non-S3 videos deleted successfully`,
//     });
//   } catch (err) {
//     console.error("❌ Cleanup error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 📺 All videos
// router.get("/", async (req, res) => {
//   try {
//     const videos = await Video.find().sort({ createdAt: -1 });
//     res.json(videos);
//   } catch (err) {
//     console.error("Fetch videos error:", err);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// });

// router.post("/:id/like", protect, toggleLike);
// router.get("/:id/isLiked", protect, isLiked);
// router.post("/:id/comments", protect, addComment);
// router.get("/:id/comments", getComments);
// router.delete("/comments/:commentId", protect, deleteComment);

// //  Search
// router.get("/search/:query", async (req, res) => {
//   try {
//     const { query } = req.params;
//     if (!query || query.trim() === "") {
//       return res.status(400).json({ error: "Search query is required" });
//     }

//     const videos = await Video.find({
//       title: { $regex: query, $options: "i" },
//     }).limit(25);

//     res.json(videos);
//   } catch (err) {
//     console.error("Search error:", err);
//     res.status(500).json({ error: "Failed to search videos" });
//   }
// });

// // ✅ My videos (protected)
// router.get("/my-videos", protect, getMyVideos);

// // 🎥 Get single video by ID
// // router.get("/:id", async (req, res) => {
// //   const { id } = req.params;
// //   if (!mongoose.Types.ObjectId.isValid(id)) {
// //     return res.status(400).json({ error: "Invalid video ID format" });
// //   }

// //   try {
// //     const video = await Video.findById(id);
// //     if (!video) return res.status(404).json({ error: "Video not found" });
// //     res.json(video);
// //   } catch (err) {
// //     console.error("Fetch single video error:", err);
// //     res.status(500).json({ error: "Failed to fetch video" });
// //   }
// // });
// // // ✅ Delete video by ID (only if it belongs to logged-in user)
// // router.delete("/:id", protect, async (req, res) => {
// //   try {
// //     const video = await Video.findById(req.params.id);

// //     if (!video) {
// //       return res.status(404).json({ message: "Video not found" });
// //     }

// //     // Ensure only the owner can delete
// //     if (video.userId.toString() !== req.user.id) {
// //       return res.status(403).json({ message: "You are not authorized to delete this video" });
// //     }

// //     await Video.findByIdAndDelete(req.params.id);
// //     res.json({ message: "Video deleted successfully" });
// //   } catch (err) {
// //     console.error("Error deleting video:", err);
// //     res.status(500).json({ message: "Failed to delete video", error: err.message });
// //   }
// // });

// // 🎥 Get single video by ID
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ error: "Invalid video ID format" });
//   }

//   try {
//     const video = await Video.findById(id);
//     if (!video) return res.status(404).json({ error: "Video not found" });
//     res.json(video);
//   } catch (err) {
//     console.error("Fetch single video error:", err);
//     res.status(500).json({ error: "Failed to fetch video" });
//   }
// });

// // 🗑️ Delete video by ID (Protected + S3 cleanup)
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) {
//       return res.status(404).json({ message: "Video not found" });
//     }

//     // Ensure only owner can delete
//     if (video.userId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized to delete this video" });
//     }

//     // Extract S3 object keys
//     const videoKey = video.videoUrl.split(".amazonaws.com/")[1];
//     const thumbKey = video.thumbnailUrl.split(".amazonaws.com/")[1];

//     // Delete from S3 (optional but recommended)
//     try {
//       await s3
//         .deleteObjects({
//           Bucket: process.env.S3_BUCKET_NAME,
//           Delete: {
//             Objects: [
//               { Key: videoKey },
//               { Key: thumbKey },
//             ],
//           },
//         })
//         .promise();
//       console.log("✅ S3 files deleted successfully");
//     } catch (s3Err) {
//       console.warn("⚠️ Failed to delete from S3:", s3Err.message);
//     }

//     // Delete from MongoDB
//     await Video.findByIdAndDelete(req.params.id);

//     res.json({ message: "Video and files deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete video error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;


//new code as per 12-11-2025
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import Video from "../models/Video.js";
import { protect } from "../middleware/authMiddleware.js";
import s3 from "../config/aws.js";
import { toggleLike, isLiked } from "../controllers/likeController.js";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import { getMyVideos } from "../controllers/videoController.js";

const router = express.Router();

// 🧩 Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video" && file.mimetype.startsWith("video/")) cb(null, true);
    else if (
      file.fieldname === "thumbnail" &&
      (file.mimetype.startsWith("image/") ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png")
    )
      cb(null, true);
    else cb(new Error("Invalid file type"), false);
  },
});

// ✅ Upload video + thumbnail (protected)
router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.video || !req.files?.thumbnail) {
        return res.status(400).json({ error: "Video and thumbnail are required" });
      }

      const { title, description, tags, category, authorName, authorAvatar } = req.body;
      if (!title || !category)
        return res.status(400).json({ error: "Title and category are required" });

      const videoFile = req.files.video[0];
      const thumbnailFile = req.files.thumbnail[0];

      const safeVideoName = `videos/${Date.now()}-${videoFile.originalname.replace(/\s+/g, "_")}`;
      const safeThumbName = `thumbnails/${Date.now()}-${thumbnailFile.originalname.replace(/\s+/g, "_")}`;

      const uploadedVideo = await s3
        .upload({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: safeVideoName,
          Body: videoFile.buffer,
          ContentType: videoFile.mimetype,
        })
        .promise();

      const uploadedThumbnail = await s3
        .upload({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: safeThumbName,
          Body: thumbnailFile.buffer,
          ContentType: thumbnailFile.mimetype,
        })
        .promise();

      const newVideo = new Video({
        title,
        description: description || "",
        videoUrl: uploadedVideo.Location,
        thumbnailUrl: uploadedThumbnail.Location,
        userId: req.user.id,
        authorName: authorName || "Unknown",
        authorAvatar: authorAvatar || "",
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        category: category || "Other",
      });

      const savedVideo = await newVideo.save();
      console.log("✅ Video uploaded successfully:", savedVideo._id);

      res.status(201).json(savedVideo);
    } catch (err) {
      console.error("❌ Video upload error:", err);
      res.status(500).json({ error: "Video upload failed", details: err.message });
    }
  }
);

// 🧹 Cleanup
router.delete("/cleanup", async (req, res) => {
  try {
    const result = await Video.deleteMany({
      videoUrl: {
        $not: {
          $regex: /^https:\/\/overairstream\.s3\.ap-south-1\.amazonaws\.com/,
        },
      },
    });
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} non-S3 videos deleted successfully`,
    });
  } catch (err) {
    console.error("❌ Cleanup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📺 All videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("Fetch videos error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ✅ Like / Comment routes
router.post("/:id/like", protect, toggleLike);
router.get("/:id/isLiked", protect, isLiked);
router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", getComments);
router.delete("/comments/:commentId", protect, deleteComment);

// 🔍 Exact search (used when pressing Enter)
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const videos = await Video.find({
  $or: [
    { title: { $regex: query, $options: "i" } },
    { authorName: { $regex: query, $options: "i" } }
  ]
})
.sort({ createdAt: -1 })
.limit(25);


    res.json(videos);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search videos" });
  }
});

// 💡 NEW: Live Suggestions (for Navbar autocomplete)
// 💡 NEW: Live Suggestions (Search by title + author)
router.get("/suggest", async (req, res) => {
  try {
    const { q } = req.query; // e.g. ?q=ram
    if (!q || q.trim() === "") {
      return res.json([]); 
    }

    const normalized = q.toLowerCase().replace(/\s+/g, "");

    const suggestions = await Video.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { authorName: { $regex: q, $options: "i" } },
        { authorName: { $regex: new RegExp(normalized.split("").join(".*"), "i") } }
      ]
    })
      .select("title thumbnailUrl authorName authorAvatar")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(suggestions);
  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});


// ✅ My videos (protected)
router.get("/my-videos", protect, getMyVideos);

// 🎥 Single video by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid video ID format" });
  }

  try {
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    console.error("Fetch single video error:", err);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

// 🗑️ Delete video by ID (Protected + S3 cleanup)
router.delete("/:id", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    const videoKey = video.videoUrl.split(".amazonaws.com/")[1];
    const thumbKey = video.thumbnailUrl.split(".amazonaws.com/")[1];

    try {
      await s3
        .deleteObjects({
          Bucket: process.env.S3_BUCKET_NAME,
          Delete: {
            Objects: [
              { Key: videoKey },
              { Key: thumbKey },
            ],
          },
        })
        .promise();
      console.log("✅ S3 files deleted successfully");
    } catch (s3Err) {
      console.warn("⚠️ Failed to delete from S3:", s3Err.message);
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video and files deleted successfully" });
  } catch (err) {
    console.error("❌ Delete video error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

