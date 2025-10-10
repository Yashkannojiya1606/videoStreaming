// import express from "express";
// import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Add comment to a video
// router.post("/:id", protect, addComment);

// // Get all comments for a video
// router.get("/:id", getComments);

// // Delete comment by ID
// router.delete("/:commentId", protect, deleteComment);

// export default router;


import express from "express";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Protect routes that need authentication
router.post("/:id", protect, addComment);
router.get("/:id", getComments);
router.delete("/:commentId", protect, deleteComment);

export default router;
