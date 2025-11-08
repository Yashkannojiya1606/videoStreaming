
import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import User from "../models/User.js";
import Video from "../models/Video.js";

const router = express.Router();

// ✅ Multer setup (use memory storage for direct S3 uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ AWS S3 configuration (using your .env keys)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * ✅ PUT /api/users/profile
 * Updates user name, bio, and avatar — uploads avatar to AWS S3
 */
router.put("/profile", upload.single("avatar"), async (req, res) => {
  try {
    const { userId, name, bio } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // ✅ Upload avatar to AWS S3 if file is provided
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME, // overairstream
        Key: `avatars/${fileName}`, // auto-create avatars/ folder
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        // ACL: "public-read", // 
      };

      // Upload the file to S3
      const uploadResult = await s3.upload(params).promise();

      // Store the public S3 URL in MongoDB
      updateData.avatar = uploadResult.Location;
    }

    // ✅ Update the user document in MongoDB
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Also update all videos created by this user
    await Video.updateMany(
      { userId: updatedUser._id },
      {
        $set: {
          authorAvatar: updatedUser.avatar || "",
          authorName: updatedUser.name || "",
        },
      }
    );

    console.log("✅ Profile updated successfully:", updatedUser.name);

    // ✅ Return the updated user with the S3 avatar URL
    res.json({ user: updatedUser });
  } catch (err) {
    console.error("❌ Profile update failed:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

export default router;
