// controllers/subscriptionController.js
// import Subscription from "../models/Subscription.js";

// export const toggleSubscription = async (req, res) => {
//   try {
//     const channelId = req.params.channelId;
//     const subscriberId = req.user.id;

//     if (channelId === subscriberId) {
//       return res.status(400).json({ message: "You cannot subscribe to yourself." });
//     }

//     const existing = await Subscription.findOne({ channelId, subscriberId });

//     if (existing) {
//       await existing.deleteOne();
//       // emit update
//       const io = req.app.get("io");
//       if (io) {
//         const count = await Subscription.countDocuments({ channelId });
//         io.to(channelId.toString()).emit("subscriberUpdated", { channelId, count });
//       }
//       return res.json({ subscribed: false });
//     }

//     await Subscription.create({ channelId, subscriberId });

//     // emit update
//     const io = req.app.get("io");
//     if (io) {
//       const count = await Subscription.countDocuments({ channelId });
//       io.to(channelId.toString()).emit("subscriberUpdated", { channelId, count });
//     }

//     res.json({ subscribed: true });
//   } catch (err) {
//     console.error("toggleSubscription error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// export const getSubscriberCount = async (req, res) => {
//   try {
//     const channelId = req.params.channelId;
//     const count = await Subscription.countDocuments({ channelId });
//     res.json({ count });
//   } catch (err) {
//     console.error("getSubscriberCount error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// export const checkSubscribed = async (req, res) => {
//   try {
//     const channelId = req.params.channelId;
//     const subscriberId = req.user?.id;
//     if (!subscriberId) return res.json({ subscribed: false });
//     const subscribed = await Subscription.exists({ channelId, subscriberId });
//     res.json({ subscribed: !!subscribed });
//   } catch (err) {
//     console.error("checkSubscribed error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };



import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

/**
 * Toggle subscribe/unsubscribe
 */
export const toggleSubscription = async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const subscriberId = req.user.id;

    if (channelId === subscriberId) {
      return res.status(400).json({ message: "You cannot subscribe to yourself." });
    }

    const existing = await Subscription.findOne({ channelId, subscriberId });

    if (existing) {
      await existing.deleteOne();

      const count = await Subscription.countDocuments({ channelId });
      const io = req.app.get("io");
      if (io) io.to(channelId.toString()).emit("subscriberUpdated", { channelId, count });

      return res.json({ subscribed: false });
    }

    await Subscription.create({ channelId, subscriberId });

    const count = await Subscription.countDocuments({ channelId });
    const io = req.app.get("io");
    if (io) io.to(channelId.toString()).emit("subscriberUpdated", { channelId, count });

    res.json({ subscribed: true });
  } catch (err) {
    console.error("toggleSubscription error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Check if user is subscribed to channel
 */
export const checkSubscribed = async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const subscriberId = req.user?.id;

    const subscribed = await Subscription.exists({ channelId, subscriberId });
    res.json({ subscribed: !!subscribed });
  } catch (err) {
    console.error("checkSubscribed error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get subscriber count
 */
export const getSubscriberCount = async (req, res) => {
  try {
    const channelId = req.params.channelId;

    const count = await Subscription.countDocuments({ channelId });
    res.json({ count });
  } catch (err) {
    console.error("getSubscriberCount error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all subscribed channels + channel info + videos
 */
export const getMySubscriptions = async (req, res) => {
  try {
    const subscriberId = req.user.id;

    const subs = await Subscription.find({ subscriberId })
      .populate("channelId", "username avatar description")
      .lean();

    res.json(subs);
  } catch (err) {
    console.error("getMySubscriptions error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
