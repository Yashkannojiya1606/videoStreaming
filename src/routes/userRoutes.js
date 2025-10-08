
// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import User from "../models/User.js";
// import Video from "../models/Video.js"; // <--- added

// const router = express.Router();

// // Ensure avatars folder exists
// const avatarDir = path.join(path.resolve(), "uploads/avatars");
// if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, avatarDir),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// /**
//  * PUT /api/users/profile
//  * - accept multipart/form-data (avatar)
//  * - update user document
//  * - update all Video documents that belong to this user so their authorAvatar/authorName stay in sync
//  */
// router.put("/profile", upload.single("avatar"), async (req, res) => {
//   try {
//     const { userId, name, bio } = req.body;

//     if (!userId) return res.status(400).json({ error: "User ID missing" });

//     const updateData = {};
//     if (name) updateData.name = name;
//     if (bio !== undefined) updateData.bio = bio;
//     if (req.file) updateData.avatar = `/uploads/avatars/${req.file.filename}`;

//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//     }).select("-password");

//     if (!updatedUser) return res.status(404).json({ error: "User not found" });

//     // --- NEW: sync all the user's videos to the new avatar/name ---
//     try {
//       await Video.updateMany(
//         { userId: updatedUser._id },
//         {
//           $set: {
//             authorAvatar: updatedUser.avatar || "",
//             authorName: updatedUser.name || "",
//           },
//         }
//       );
//       console.log(`✅ Synced avatar/name to videos for user ${updatedUser._id}`);
//     } catch (syncErr) {
//       console.error("Failed to sync videos after profile update:", syncErr);
//       // do not fail the whole request — profile update succeeded, but synchronization failed
//     }

//     // Return the user under "user" to keep your frontend logic working
//     res.json({ user: updatedUser });
//   } catch (err) {
//     console.error("Profile update failed:", err);
//     res.status(500).json({ error: "Profile update failed" });
//   }
// });

// export default router;


// src/routes/userRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import Video from "../models/Video.js"; // ✅ make sure this import is added!

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

// ✅ PUT /api/users/profile
router.put("/profile", upload.single("avatar"), async (req, res) => {
  try {
    const { userId, name, bio } = req.body;

    console.log("🟢 Profile update request received:");
    console.log("Body:", req.body);
    console.log("File:", req.file?.filename);

    if (!userId) return res.status(400).json({ error: "User ID missing" });

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (req.file) updateData.avatar = `/uploads/avatars/${req.file.filename}`;

    console.log("🟢 Update data to save:", updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    console.log("✅ Updated user:", updatedUser);

    // ✅ Also update all videos by this user
    const result = await Video.updateMany(
      { userId: updatedUser._id },
      {
        $set: {
          authorAvatar: updatedUser.avatar || "",
          authorName: updatedUser.name || "",
        },
      }
    );

    console.log("✅ Video update result:", result);

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("❌ Profile update failed:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

export default router;
