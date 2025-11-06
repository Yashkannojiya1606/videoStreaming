



                   
// import AWS from "aws-sdk";
// import Video from "../models/Video.js";
// import dotenv from "dotenv";
// import mongoose from "mongoose"; // ✅ for ObjectId val idation




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

//     // ✅ Check input validation early
//     if (!title) {
//       return res.status(400).json({ error: "Title is required" });
//     }

//     if (!file) {
//       return res.status(400).json({ error: "No video file uploaded" });
//     }

//     // Sanitize filename
//     const safeFileName = `videos/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

//     // Upload params
//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: safeFileName,
//       Body: file.buffer,
//       ContentType: file.mimetype, // important for streaming
//       ACL: "public-read", // allows browser access
//     };

//     // ✅ Upload to S3 with promise
//     const uploadResult = await s3.upload(params).promise();

//     // Encode URL for safety
//     const videoUrl = encodeURI(uploadResult.Location);

//     // ✅ Defensive check for req.user (in case protect middleware fails)
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "Unauthorized - user info missing" });
//     }

//     // ✅ Save to MongoDB
//     const newVideo = await Video.create({
//       title,
//       description: description || "",
//       videoUrl,
//       user: req.user.id,
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
//     const videos = await Video.find()
//       .populate("user", "username email")
//       .sort({ createdAt: -1 }); // ✅ latest first

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

//     // ✅ Validate Mongo ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid video ID format" });
//     }

//     const video = await Video.findById(id).populate("user", "username email");
//     if (!video) return res.status(404).json({ error: "Video not found" });

//     res.json(video);
//   } catch (err) {
//     console.error("❌ Error fetching video:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // 🧹 Cleanup old non-S3 videos (MongoDB only)
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
//          // 👤 Get videos uploaded by the logged-in user
// export const getMyVideos = async (req, res) => {
//   try {
//     // Defensive: ensure user exists
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "Unauthorized - user not found" });
//     }

//     // Fetch videos by userId (latest first)
//     const myVideos = await Video.find({ user: req.user.id }).sort({ createdAt: -1 });

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
      userId: req.user.id, // ✅ fixed to match your model field (userId)
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
