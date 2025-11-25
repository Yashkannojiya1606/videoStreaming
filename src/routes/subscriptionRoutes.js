// // routes/subscriptionRoutes.js
// import express from "express";
// import { protect } from "../middleware/authMiddleware.js";
// import {
//   toggleSubscription,
//   getSubscriberCount,
//   checkSubscribed,
// } from "../controllers/subscriptionController.js";

// const router = express.Router();

// router.post("/:channelId", protect, toggleSubscription);
// router.get("/status/:channelId", protect, checkSubscribed);
// router.get("/count/:channelId", getSubscriberCount);

// export default router;


import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  toggleSubscription,
  getSubscriberCount,
  checkSubscribed,
  getMySubscriptions,
  getSubscribedVideos,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// ⭐ Feed: videos from subscribed channels
router.get("/me", protect, getSubscribedVideos);

// ⭐ Channel list (optional)
router.get("/channels", protect, getMySubscriptions);

// ⭐ Subscribe / Unsubscribe
router.post("/:channelId", protect, toggleSubscription);

// ⭐ Check subscription status
router.get("/status/:channelId", protect, checkSubscribed);

// ⭐ Subscriber count
router.get("/count/:channelId", getSubscriberCount);

export default router;
