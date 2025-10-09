import express from "express";
import { toggleLike, isLiked } from "../controllers/likeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// toggle like/unlike a video
router.post("/:id", protect, toggleLike);

// check if current user liked a video
router.get("/:id", protect, isLiked);

export default router;
