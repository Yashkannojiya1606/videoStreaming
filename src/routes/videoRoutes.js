// import express from "express";
// import multer from "multer";
// import Video from "../models/Video.js";
// import { protect } from "../middleware/authMiddleware.js";
// import s3 from "../config/aws.js";

// const router = express.Router();

// // 🧠 Multer setup - in-memory storage + 100MB limit
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
//   fileFilter: (req, file, cb) => {
//     if (file.fieldname === "video" && file.mimetype.startsWith("video/")) {
//       cb(null, true);
//     } else if (
//       file.fieldname === "thumbnail" &&
//       (file.mimetype.startsWith("image/") ||
//         file.mimetype === "image/jpeg" ||
//         file.mimetype === "image/png")
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type"), false);
//     }
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

//       if (!title || !category) {
//         return res.status(400).json({ error: "Title and category are required" });
//       }

//       const videoFile = req.files.video[0];
//       const thumbnailFile = req.files.thumbnail[0];

//       // 🪣 Upload video to S3
//       const videoParams = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `videos/${Date.now()}-${videoFile.originalname}`,
//         Body: videoFile.buffer,
//         ContentType: videoFile.mimetype,
//         ACL: "public-read",
//       };
//       const uploadedVideo = await s3.upload(videoParams).promise();

//       // 🖼️ Upload thumbnail to S3
//       const thumbParams = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `thumbnails/${Date.now()}-${thumbnailFile.originalname}`,
//         Body: thumbnailFile.buffer,
//         ContentType: thumbnailFile.mimetype,
//         ACL: "public-read",
//       };
//       const uploadedThumbnail = await s3.upload(thumbParams).promise();

//       // 🧾 Save video metadata in DB
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
//       res.status(500).json({
//         error: "Video upload failed",
//         details: err.message || "Unknown error",
//       });
//     }
//   }
// );

// // ✅ Get all videos
// router.get("/", async (req, res) => {
//   try {
//     const videos = await Video.find().sort({ createdAt: -1 });
//     res.json(videos);
//   } catch (err) {
//     console.error("Fetch videos error:", err);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// });

// // ✅ Get single video by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) return res.status(404).json({ error: "Video not found" });
//     res.json(video);
//   } catch (err) {
//     console.error("Fetch single video error:", err);
//     if (err.name === "CastError")
//       return res.status(400).json({ error: "Invalid video ID" });
//     res.status(500).json({ error: "Failed to fetch video" });
//   }
// });

// export default router;



// import express from "express";
// import multer from "multer";
// import Video from "../models/Video.js";
// import { protect } from "../middleware/authMiddleware.js";
// import s3 from "../config/aws.js";

// const router = express.Router();

// // 🧠 Multer setup - in-memory storage + 100MB limit
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
//   fileFilter: (req, file, cb) => {
//     if (file.fieldname === "video" && file.mimetype.startsWith("video/")) {
//       cb(null, true);
//     } else if (
//       file.fieldname === "thumbnail" &&
//       (file.mimetype.startsWith("image/") ||
//         file.mimetype === "image/jpeg" ||
//         file.mimetype === "image/png")
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type"), false);
//     }
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

//       if (!title || !category) {
//         return res.status(400).json({ error: "Title and category are required" });
//       }

//       const videoFile = req.files.video[0];
//       const thumbnailFile = req.files.thumbnail[0];

//       // 🪣 Upload video to S3 (🚫 No ACL field)
//       const videoParams = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `videos/${Date.now()}-${videoFile.originalname}`,
//         Body: videoFile.buffer,
//         ContentType: videoFile.mimetype,
//       };
//       const uploadedVideo = await s3.upload(videoParams).promise();

//       // 🖼️ Upload thumbnail to S3 (🚫 No ACL field)
//       const thumbParams = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `thumbnails/${Date.now()}-${thumbnailFile.originalname}`,
//         Body: thumbnailFile.buffer,
//         ContentType: thumbnailFile.mimetype,
//       };
//       const uploadedThumbnail = await s3.upload(thumbParams).promise();

//       // 🧾 Save video metadata in DB
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
//       res.status(500).json({
//         error: "Video upload failed",
//         details: err.message || "Unknown error",
//       });
//     }
//   }
// );

// // ✅ Get all videos
// router.get("/", async (req, res) => {
//   try {
//     const videos = await Video.find().sort({ createdAt: -1 });
//     res.json(videos);
//   } catch (err) {
//     console.error("Fetch videos error:", err);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// });

// // ✅ Get single video by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) return res.status(404).json({ error: "Video not found" });
//     res.json(video);
//   } catch (err) {
//     console.error("Fetch single video error:", err);
//     if (err.name === "CastError")
//       return res.status(400).json({ error: "Invalid video ID" });
//     res.status(500).json({ error: "Failed to fetch video" });
//   }
// });

// export default router;




import express from "express";
import multer from "multer";
import Video from "../models/Video.js";
import { protect } from "../middleware/authMiddleware.js";
import s3 from "../config/aws.js";

const router = express.Router();

// 🧠 Multer setup - in-memory storage + 100MB limit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video" && file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else if (
      file.fieldname === "thumbnail" &&
      (file.mimetype.startsWith("image/") ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
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
        return res
          .status(400)
          .json({ error: "Video and thumbnail are required" });
      }

      const { title, description, tags, category, authorName, authorAvatar } =
        req.body;

      if (!title || !category) {
        return res
          .status(400)
          .json({ error: "Title and category are required" });
      }

      const videoFile = req.files.video[0];
      const thumbnailFile = req.files.thumbnail[0];

      // 🪣 Upload video to S3
      const videoParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `videos/${Date.now()}-${videoFile.originalname}`,
        Body: videoFile.buffer,
        ContentType: videoFile.mimetype,
      };
      const uploadedVideo = await s3.upload(videoParams).promise();

      // 🖼️ Upload thumbnail to S3
      const thumbParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `thumbnails/${Date.now()}-${thumbnailFile.originalname}`,
        Body: thumbnailFile.buffer,
        ContentType: thumbnailFile.mimetype,
      };
      const uploadedThumbnail = await s3.upload(thumbParams).promise();

      // 🧾 Save video metadata in DB
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
      res.status(500).json({
        error: "Video upload failed",
        details: err.message || "Unknown error",
      });
    }
  }
);

// ⚠️ Keep cleanup route ABOVE “/:id” route
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
  } catch (error) {
    console.error("❌ Error cleaning videos:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get all videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("Fetch videos error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ✅ Get single video by ID (⚠️ keep this last)
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    console.error("Fetch single video error:", err);
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid video ID" });
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

export default router;
