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
} from "../controllers/subscriptionController.js";

const router = express.Router();

// ⭐ Fetch subscribed videos
router.get("/me", protect, getMySubscriptions);

// ⭐ Subscribe / Unsubscribe
router.post("/:channelId", protect, toggleSubscription);

// ⭐ Check subscription status
router.get("/status/:channelId", protect, checkSubscribed);

// ⭐ Subscriber count
router.get("/count/:channelId", getSubscriberCount);

export default router;
