// import mongoose from "mongoose";

// const commentSchema = new mongoose.Schema(
//   {
//     videoId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Video",
//       required: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     username: {
//       type: String,
//       required: true,
//     },
//     avatar: {
//       type: String,
//       default: "",
//     },
//     text: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Comment", commentSchema);
  

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


export default mongoose.model("Comment", commentSchema);

