

// import AWS from "aws-sdk";
// import Video from "../models/Video.js";
// import dotenv from "dotenv";
// import mongoose from "mongoose";

// dotenv.config();

// // 🧩 Configure AWS SDK
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // 📤 Upload Video to AWS S3 and save to MongoDB
// export const uploadVideo = async (req, res) => {
//   try {
//     const { title, description } = req.body;
//     const file = req.file;

//     if (!title) return res.status(400).json({ error: "Title is required" });
//     if (!file) return res.status(400).json({ error: "No video file uploaded" });

//     const safeFileName = `videos/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: safeFileName,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//       ACL: "public-read",
//     };

//     const uploadResult = await s3.upload(params).promise();
//     const videoUrl = encodeURI(uploadResult.Location);

//     if (!req.user || !req.user.id)
//       return res.status(401).json({ error: "Unauthorized - user info missing" });

//     const newVideo = await Video.create({
//       title,
//       description: description || "",
//       videoUrl,
//       userId: req.user.id, // ✅ fixed to match your model field (userId)
//     });

//     return res.status(201).json({
//       message: "✅ Video uploaded successfully",
//       video: newVideo,
//     });
//   } catch (err) {
//     console.error("❌ Video upload error:", err);
//     res.status(500).json({
//       error: "Video upload failed",
//       details: err.message || "Unexpected server error",
//     });
//   }
// };

// // 📥 Get All Videos
// export const getVideos = async (req, res) => {
//   try {
//     const videos = await Video.find().sort({ createdAt: -1 });
//     res.json(videos);
//   } catch (err) {
//     console.error("❌ Error fetching videos:", err);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// };

// // 📥 Get Single Video by ID
// export const getVideoById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(400).json({ error: "Invalid video ID format" });

//     const video = await Video.findById(id);
//     if (!video) return res.status(404).json({ error: "Video not found" });

//     res.json(video);
//   } catch (err) {
//     console.error("❌ Error fetching video:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // 🧹 Cleanup old non-S3 videos
// export const cleanupOldVideos = async (req, res) => {
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
//   } catch (error) {
//     console.error("❌ Error cleaning videos:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during cleanup",
//     });
//   }
// };

// // 👤 Get videos uploaded by the logged-in user
// export const getMyVideos = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id)
//       return res.status(401).json({ error: "Unauthorized - user not found" });

//     const myVideos = await Video.find({ userId: req.user.id }).sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: myVideos.length,
//       videos: myVideos,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching user's videos:", err);
//     return res.status(500).json({ error: "Failed to fetch your videos" });
//   }
// };


//  new code 12-11-2025

import AWS from "aws-sdk";
import Video from "../models/Video.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// 🧩 Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});


// 📤 Upload Video to AWS S3 and save to MongoDB
export const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!file) return res.status(400).json({ error: "No video file uploaded" });

    const safeFileName = `videos/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: safeFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    const uploadResult = await s3.upload(params).promise();
    const videoUrl = encodeURI(uploadResult.Location);

    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized - user info missing" });

    const newVideo = await Video.create({
      title,
      description: description || "",
      videoUrl,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "✅ Video uploaded successfully",
      video: newVideo,
    });
  } catch (err) {
    console.error("❌ Video upload error:", err);
    res.status(500).json({
      error: "Video upload failed",
      details: err.message || "Unexpected server error",
    });
  }
};


// 📥 Get All Videos
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};


// 📥 Get Single Video by ID
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid video ID format" });

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    res.json(video);
  } catch (err) {
    console.error("❌ Error fetching video:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// 🧹 Cleanup old non-S3 videos
export const cleanupOldVideos = async (req, res) => {
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
  } catch (error) {
    console.error("❌ Error cleaning videos:", error);
    res.status(500).json({
      success: false,
      message: "Server error during cleanup",
    });
  }
};


// 👤 Get videos uploaded by the logged-in user
export const getMyVideos = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized - user not found" });

    const myVideos = await Video.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: myVideos.length,
      videos: myVideos,
    });
  } catch (err) {
    console.error("❌ Error fetching user's videos:", err);
    return res.status(500).json({ error: "Failed to fetch your videos" });
  }
};



/* =====================================================
   🔍  NEW: Search & Suggestion Endpoints
   ===================================================== */

// 📦 Search videos by title (partial + case-insensitive)
export const searchVideos = async (req, res) => {
  try {
    const { query } = req.params;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const videos = await Video.find({
      title: { $regex: query, $options: "i" }, // ✅ partial + case-insensitive
    }).sort({ createdAt: -1 });

    if (!videos.length)
      return res.status(404).json({ message: "No matching videos found" });

    res.status(200).json(videos);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Failed to search videos" });
  }
};


// 💡 Suggest videos for live search (autocomplete)
export const suggestVideos = async (req, res) => {
  try {
    const { q } = req.query; // query param ?q=
    if (!q || q.trim().length === 0)
      return res.status(400).json({ error: "Query is required" });

    // Find videos that match partially by title
    const suggestions = await Video.find({
      title: { $regex: q, $options: "i" },
    })
      .select("title thumbnailUrl videoUrl") // optional fields
      .limit(8);

    res.status(200).json(suggestions);
  } catch (err) {
    console.error("❌ Suggestion error:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
};
