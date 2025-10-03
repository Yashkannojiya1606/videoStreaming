// PUT /api/users/profile
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";

const router = express.Router();

// Ensure avatars folder exists
const avatarDir = path.join(path.resolve(), "uploads/avatars");
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.put("/profile", upload.single("avatar"), async (req, res) => {
  try {
    const { userId, name, bio } = req.body;

    if (!userId) return res.status(400).json({ error: "User ID missing" });

    const updateData = { name, bio };
    if (req.file) updateData.avatar = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

export default router;
