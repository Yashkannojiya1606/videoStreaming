import express from "express";
import Video from "../models/Video.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/trending?limit=20
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "20", 10);

    const now = new Date();

    const pipeline = [
      {
        $project: {
          title: 1,
          thumbnailUrl: 1,
          userId: 1,
          views: { $ifNull: ["$views", 0] },
          likeCount: { $ifNull: ["$likeCount", 0] },
          commentsCount: {
            $cond: [
              { $isArray: "$comments" },
              { $size: "$comments" },
              0
            ]
          },
          createdAt: 1,

          // Convert age to number of days
          ageDays: {
            $divide: [
              { $subtract: [now, "$createdAt"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },

      // 🎯 Trending scoring
      {
        $addFields: {
          score: {
            $add: [
              // Views normalized by age
              { $divide: ["$views", { $add: ["$ageDays", 1] }] },

              // Likes weighted
              { $multiply: ["$likeCount", 2] },

              // Comments weighted
              { $multiply: ["$commentsCount", 1.5] },

              // Boost recent videos (less than 7 days old)
              {
                $cond: [
                  { $lte: ["$ageDays", 7] },
                  200, // Boost score
                  0
                ]
              },
            ],
          },
        },
      },

      { $sort: { score: -1 } },
      { $limit: limit },

      // Add author info
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          title: 1,
          thumbnailUrl: 1,
          views: 1,
          likeCount: 1,
          commentsCount: 1,
          createdAt: 1,
          score: 1,
          "author._id": 1,
          "author.username": 1,
          "author.avatar": 1,
        },
      },
    ];

    const trending = await Video.aggregate(pipeline);
    res.json(trending);

  } catch (err) {
    console.error("🔥 Trending error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
