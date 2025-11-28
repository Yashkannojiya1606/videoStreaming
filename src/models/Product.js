import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  images: [String],
  link: String,
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
