



import express from "express";
import multer from "multer";
import Video from "../models/Video.js";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure uploads folders exist
const videoDir = path.join(path.resolve(), "uploads/videos");
const thumbDir = path.join(path.resolve(), "uploads/thumbnails");

if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") cb(null, videoDir);
    else if (file.fieldname === "thumbnail") cb(null, thumbDir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video" && file.mimetype.startsWith("video/"))
    cb(null, true);
  else if (
    file.fieldname === "thumbnail" &&
    (file.mimetype.startsWith("image/") ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png")
  )
    cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

const upload = multer({ storage, fileFilter });

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
      console.log("Body received:", req.body);
      console.log("Files received:", req.files);

      if (!req.files || !req.files["video"] || !req.files["thumbnail"]) {
        return res
          .status(400)
          .json({ error: "Video and thumbnail are required" });
      }

      const { title, description, tags, category } = req.body;

      if (!title || !category) {
        return res
          .status(400)
          .json({ error: "Title and category are required" });
      }

      const newVideo = new Video({
        title,
        description: description || "",
        videoUrl: `/uploads/videos/${req.files["video"][0].filename}`,
        thumbnailUrl: `/uploads/thumbnails/${
          req.files["thumbnail"][0].filename
        }`,
        userId: req.user.id,
        authorName: req.body.authorName || "Unknown",
        authorAvatar: req.body.authorAvatar || "",
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        category: category || "Other",
      });

      const savedVideo = await newVideo.save();
      console.log("Video saved:", savedVideo);

      res.status(201).json(savedVideo);
    } catch (err) {
      console.error("Video upload error:", err);
      res.status(500).json({ error: "Video upload failed" });
    }
  }
);

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

// ✅ GET SINGLE VIDEO BY ID - THIS WAS MISSING!
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json({
      _id: video._id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      userId: video.userId,
      authorName: video.authorName,
      authorAvatar: video.authorAvatar,
      tags: video.tags,
      category: video.category,
      views: video.views,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt
    });
  } catch (err) {
    console.error("Fetch single video error:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid video ID" });
    }
    
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

export default router;