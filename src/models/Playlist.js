import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
    videos: [
      {
        videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    // optionally cache a cover from first video
    coverUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// one playlist title per user is allowed (optional)
// PlaylistSchema.index({ userId: 1, title: 1 }, { unique: true });

export default mongoose.model("Playlist", PlaylistSchema);
