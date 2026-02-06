import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    channelArn: {
      type: String,
      required: true
    },

    playbackUrl: {
      type: String,
      required: true
    },

    streamKey: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["LIVE", "OFFLINE"],
      default: "OFFLINE"
    }
  },
  { timestamps: true }
);

export default mongoose.model("LiveStream", liveStreamSchema);
