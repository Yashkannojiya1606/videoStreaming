import express from "express";
import { reportVideo } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.post("/", protect, reportVideo);
 
export default router;
 