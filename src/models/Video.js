import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    userId: { type: String },
    tags: { type: [String], default: [] },
    category: { type: String, required: true },
    authorName: { type: String, default: "Unknown" },   // NEW
    authorAvatar: { type: String, default: "" },        // NEW
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
