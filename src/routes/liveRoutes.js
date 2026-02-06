import express from "express";
import { startLive } from "../controllers/liveController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Go Live (protected route)
router.post("/start", authMiddleware, startLive);

export default router;
