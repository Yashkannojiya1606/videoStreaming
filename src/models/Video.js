// import mongoose from "mongoose";

// const videoSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String },
//     videoUrl: { type: String, required: true },
//     thumbnailUrl: { type: String, required: true },
//     userId: { type: String },
//     tags: { type: [String], default: [] },
//     category: { type: String, required: true },
//     authorName: { type: String, default: "Unknown" },   // NEW
//     authorAvatar: { type: String, default: "" },        // NEW
//     views: { type: Number, default: 0 },
//     likeCount: { type: Number, default: 0 },
//     commentCount: { type: Number, default: 0 },

//   },
//   { timestamps: true }
// );

// export default mongoose.model("Video", videoSchema);


import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    title: { type: String, required: true },
    description: { type: String, default: "" },

    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: { type: String, required: true },
    tags: { type: [String], default: [] },

    // ================= AUTHOR INFO =================
    authorName: { type: String, default: "Unknown" },
    authorAvatar: { type: String, default: "" },

    // ================= STATS =================
    views: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    // ================= SHORTS SUPPORT =================
    isShort: {
      type: Boolean,
      default: false, // ⭐ true = Short, false = Normal Video
      index: true,
    },

    duration: {
      type: Number,
      default: 0, // seconds
    },

    aspectRatio: {
      type: String,
      enum: ["16:9", "9:16"],
      default: "16:9",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
