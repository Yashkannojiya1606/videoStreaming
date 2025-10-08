// import Video from "../models/Video.js";

// export const uploadVideo = async (req, res) => {
//   try {
//     const { title, description } = req.body;
//     const videoUrl = req.file.path;

//     const newVideo = await Video.create({
//       title,
//       description,
//       videoUrl,
//       user: req.user.id,
//     });

//     res.status(201).json({ message: "Video uploaded", video: newVideo });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getVideos = async (req, res) => {
//   try {
//     const videos = await Video.find().populate("user", "username email");
//     res.json(videos);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


import AWS from "aws-sdk";
import Video from "../models/Video.js";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    // S3 upload parameters (🚫 No ACL line here)
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `videos/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();

    // Save video info in MongoDB
    const newVideo = await Video.create({
      title,
      description,
      videoUrl: uploadResult.Location, // ✅ Public S3 URL
      user: req.user.id,
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ error: "Video upload failed" });
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("user", "username email");
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

