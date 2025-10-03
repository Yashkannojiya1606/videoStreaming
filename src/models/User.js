import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // ✅ Password optional — only for local signups
    password: { type: String },

    // ✅ Where the user signed up from
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // ✅ Save Google ID if provided
    googleId: { type: String },

    avatar: { type: String, default: "/default-avatar.png" },
    bio: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
