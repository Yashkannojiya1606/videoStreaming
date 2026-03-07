import mongoose from "mongoose";
 
const reportSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
 
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
 
    reason: {
      type: String,
      required: true,
      enum: [
        "Spam or misleading",
        "Hate or abusive content",
        "Sexual content",
        "Violence",
        "Harassment or bullying",
        "Copyright issue",
        "Other",
      ],
    },
 
    status: {
      type: String,
      enum: ["pending", "reviewed", "removed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);
 
export default mongoose.model("Report", reportSchema);
 
 