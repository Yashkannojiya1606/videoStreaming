


// // today code 22/12



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

// /* =====================================================
//    📤 Upload Video / Short (SAME API)
//    ===================================================== */
// export const uploadVideo = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       duration = 0,          // 👈 seconds (frontend / ffmpeg)
//       aspectRatio = "16:9",  // 👈 "9:16" for shorts
//     } = req.body;

//     const file = req.file;

//     if (!title) return res.status(400).json({ error: "Title is required" });
//     if (!file) return res.status(400).json({ error: "No video file uploaded" });

//     // 🔥 AUTO DETECT SHORT
//     const isShort =
//       Number(duration) > 0 &&
//       Number(duration) <= 60;
//       // aspectRatio === "9:16";

//     // 📁 Optional: keep shorts in separate folder
//     const folder = isShort ? "videos/shorts" : "videos/long";

//     const safeFileName = `${folder}/${Date.now()}-${file.originalname.replace(
//       /\s+/g,
//       "_"
//     )}`;

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
//       userId: req.user.id,

//       // 🔥 SHORT METADATA
//       isShort,
//       duration: Number(duration),
//       aspectRatio,

//       // counters safety
//       likeCount: 0,
//       commentCount: 0,
//       views: 0,
//     });

//     return res.status(201).json({
//       message: isShort
//         ? "✅ Short uploaded successfully"
//         : "✅ Video uploaded successfully",
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

// /* =====================================================
//    📥 Get All Videos (NO CHANGE)
//    ===================================================== */
// export const getVideos = async (req, res) => {
//   try {
//     const videos = await Video.find().sort({ createdAt: -1 });
//     res.json(videos);
//   } catch (err) {
//     console.error("❌ Error fetching videos:", err);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// };

// /* =====================================================
//    📥 Get Single Video by ID
//    ===================================================== */
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

// /* =====================================================
//    👤 Get Logged-in User Videos
//    ===================================================== */
// export const getMyVideos = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id)
//       return res.status(401).json({ error: "Unauthorized - user not found" });

//     let myVideos = await Video.find({ userId: req.user.id })
//       .sort({ createdAt: -1 })
//       .lean();

//     myVideos = myVideos.map(v => ({
//       ...v,
//       likeCount: v.likeCount ?? 0,
//       commentCount: v.commentCount ?? 0,
//       views: v.views ?? 0,
//       isShort: v.isShort ?? false,
//     }));

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
// /* =====================================================
//    📱 Get Shorts Feed
//    ===================================================== */
// export const getShorts = async (req, res) => {
//   try {
//     const shorts = await Video.find({ isShort: true })
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .lean();

//     const safeShorts = shorts.map(s => ({
//       ...s,
//       likeCount: s.likeCount ?? 0,
//       commentCount: s.commentCount ?? 0,
//       views: s.views ?? 0,
//     }));

//     res.status(200).json(safeShorts);
//   } catch (err) {
//     console.error("❌ Error fetching shorts:", err);
//     res.status(500).json({ error: "Failed to fetch shorts" });
//   }
// };







// latest code after the duration enable

import AWS from "aws-sdk";
import Video from "../models/Video.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

// 🧩 Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/* =====================================================
   🎥 Helper: get video duration from buffer
   ===================================================== */
const getVideoDurationFromBuffer = async (buffer) => {
  const tempPath = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);
  fs.writeFileSync(tempPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(tempPath, (err, metadata) => {
      fs.unlinkSync(tempPath); // cleanup temp file

      if (err) return reject(err);
      resolve(Math.floor(metadata.format.duration)); // seconds
    });
  });
};

/* =====================================================
   📤 Upload Video / Short (SAME API)
   ===================================================== */
export const uploadVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      aspectRatio = "16:9",
    } = req.body;

    const file = req.file;

    if (!title)
      return res.status(400).json({ error: "Title is required" });
    if (!file)
      return res.status(400).json({ error: "No video file uploaded" });

    // 🔥 BACKEND DURATION CALCULATION
    const duration = await getVideoDurationFromBuffer(file.buffer);

    // 🔥 AUTO DETECT SHORT
    const isShort = duration > 0 && duration <= 60;

    // 📁 Folder selection
    const folder = isShort ? "videos/shorts" : "videos/long";

    const safeFileName = `${folder}/${Date.now()}-${file.originalname.replace(
      /\s+/g,
      "_"
    )}`;

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
      return res
        .status(401)
        .json({ error: "Unauthorized - user info missing" });

    const newVideo = await Video.create({
      title,
      description: description || "",
      videoUrl,
      userId: req.user.id,

      // 🔥 FIXED METADATA
      isShort,
      duration,
      aspectRatio,

      likeCount: 0,
      commentCount: 0,
      views: 0,
    });

    return res.status(201).json({
      message: isShort
        ? "✅ Short uploaded successfully"
        : "✅ Video uploaded successfully",
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

/* =====================================================
   📥 Get All Videos
   ===================================================== */
export const getVideos = async (req, res) => {
  try {
    const { limit = 50, exclude, page = 1 } = req.query;

    const query = {};
    if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
      query._id = { $ne: exclude };
    }

    const skipAmount = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitAmount = parseInt(limit, 10);

    let videosQuery = Video.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limitAmount);

    const videos = await videosQuery.lean();
    res.json(videos);
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

/* =====================================================
   📥 Get Single Video by ID
   ===================================================== */
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid video ID format" });

    const video = await Video.findById(id);
    if (!video)
      return res.status(404).json({ error: "Video not found" });

    res.json(video);
  } catch (err) {
    console.error("❌ Error fetching video:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =====================================================
   👤 Get Logged-in User Videos
   ===================================================== */
export const getMyVideos = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized - user not found" });

    let myVideos = await Video.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    myVideos = myVideos.map((v) => ({
      ...v,
      likeCount: v.likeCount ?? 0,
      commentCount: v.commentCount ?? 0,
      views: v.views ?? 0,
      isShort: v.isShort ?? false,
    }));

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
   📱 Get Shorts Feed
   ===================================================== */
export const getShorts = async (req, res) => {
  try {
    const shorts = await Video.find({ isShort: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const safeShorts = shorts.map((s) => ({
      ...s,
      likeCount: s.likeCount ?? 0,
      commentCount: s.commentCount ?? 0,
      views: s.views ?? 0,
    }));

    res.status(200).json(safeShorts);
  } catch (err) {
    console.error("❌ Error fetching shorts:", err);
    res.status(500).json({ error: "Failed to fetch shorts" });
  }
};
