import express from "express";
import {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  deletePlaylist,
  toggleVideoInPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPlaylist);
router.get("/me", protect, getMyPlaylists);
router.get("/:id", protect, getPlaylistById);
router.delete("/:id", protect, deletePlaylist);

// toggle add/remove (body: { videoId })
router.post("/:id/toggle", protect, toggleVideoInPlaylist);

// remove specific video
router.delete("/:id/video/:videoId", protect, removeVideoFromPlaylist);

export default router;
