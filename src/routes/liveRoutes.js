import express from "express";
import { startLive } from "../controllers/liveController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Go Live (protected route)
router.post("/start", protect, startLive);

export default router;
