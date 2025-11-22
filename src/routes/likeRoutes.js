// import express from "express";
// import { toggleLike, isLiked } from "../controllers/likeController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // toggle like/unlike a video
// router.post("/:id", protect, toggleLike);

// // check if current user liked a video
// router.get("/:id", protect, isLiked);
  
// export default router;  
  


// today changes 22-11-2025
import express from "express";
import { toggleLike, isLiked, getLikedVideos } from "../controllers/likeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ⭐ must come BEFORE "/:id"
router.get("/me/all", protect, getLikedVideos);

// toggle like
router.post("/:id", protect, toggleLike);

// check if liked
router.get("/:id", protect, isLiked);

export default router;

