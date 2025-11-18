import mongoose from "mongoose";

const guestViewSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

guestViewSchema.index({ ip: 1, videoId: 1 }, { unique: true });

export default mongoose.model("GuestView", guestViewSchema);
