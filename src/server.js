
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import connectDB from "./config/db.js";

// // Routes
// import authRoutes from "./routes/authRoutes.js";
// import videoRoutes from "./routes/videoRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import likeRoutes from "./routes/likeRoutes.js";
// import commentRoutes from "./routes/commentRoutes.js";

// dotenv.config();
// const app = express();

// // ✅ Parse JSON and form data
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // ✅ Allowed origins (for both local + production)
// // const allowedOrigins = [
// //   process.env.CLIENT_URL || "https://videostream.overair.in",
// //   "http://localhost:5173",
// //   "https://videostreaming-rns0.onrender.com",
// // ];

// // // ✅ CORS setup
// // app.use(
// //   cors({
// //     origin: function (origin, callback) {
// //       if (!origin || allowedOrigins.includes(origin)) {
// //         callback(null, true);
// //       } else {
// //         console.warn("❌ Blocked by CORS:", origin);
// //         callback(new Error("Not allowed by CORS"));
// //       }
// //     },
// //     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// //     credentials: true,
// //   })
// // );
// // ✅ Allowed origins (include both non-www and www)
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://videostream.overair.in",
//   "https://www.videostream.overair.in",
//   "https://videostreaming-rns0.onrender.com",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.warn("❌ Blocked by CORS:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   })
// );


// // ✅ Database connection
// connectDB();

// // ✅ Static files (videos, thumbnails, etc.)
// app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// // ✅ Main API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/videos", videoRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/comments", commentRoutes);

// // ✅ Health + root routes
// app.get("/", (req, res) => res.send("API is running..."));
// app.get("/health", (req, res) => res.json({ ok: true }));

// // ✅ Handle 404 routes
// // app.use("*", (req, res) => {
// //   res.status(404).json({ message: "Route not found" });
// // });
// // ✅ Add this instead:
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// // ✅ Global error handler (for debugging)
// app.use((err, req, res, next) => {
//   console.error("🔥 Global Error Handler:", err.stack);
//   res.status(500).json({
//     message: "Internal Server Error",
//     error: err.message,
//   });
// });

// // ✅ Create HTTP + Socket.IO server
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // ✅ Make socket accessible to controllers if needed
// app.set("io", io);

// // ✅ Socket.IO events
// io.on("connection", (socket) => {
//   console.log("🟢 Socket connected:", socket.id);

//   socket.on("joinVideo", (videoId) => {
//     socket.join(videoId);
//     console.log(`📺 Socket ${socket.id} joined room ${videoId}`);
//   });

//   socket.on("leaveVideo", (videoId) => {
//     socket.leave(videoId);
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 Socket disconnected:", socket.id);
//   });
// });

// // ✅ Start server (works locally + Render)
// const PORT = process.env.PORT || 5000;
// httpServer.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
// });



// new code as per today for subscription socket io update
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js"; // ✅ NEW
import historyRoutes from "./routes/historyRoutes.js";
import watchlaterRoutes from "./routes/watchlaterRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import trendingRoutes from "./routes/trendingRoutes.js";


dotenv.config();
const app = express();

// ✅ Parse JSON and form data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Allowed origins (include both www & non-www)
const allowedOrigins = [
  "http://localhost:5173",
  "https://bharatvids.com",
  "https://www.bharatvids.com",
  "https://videostreaming-rns0.onrender.com",
];

const normalize = (origin) => origin?.replace(/\/$/, "");

app.use(
  cors({
    origin: (origin, callback) => {
      const cleanOrigin = normalize(origin);

      console.log("🔍 Incoming Origin:", cleanOrigin);

      if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.warn("❌ Blocked by CORS:", cleanOrigin);
      return callback(new Error("Not allowed by CORS: " + cleanOrigin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ Database connection
connectDB();

// ✅ Serve static files (videos, thumbnails, etc.)
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ✅ Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/subscriptions", subscriptionRoutes); // ✅ MOUNTED HERE
app.use("/api/history", historyRoutes);
app.use("/api/watchlater", watchlaterRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/trending", trendingRoutes);

// ✅ Health check
app.get("/", (req, res) => res.send("API is running..."));
app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

// ✅ Create HTTP + Socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const cleanOrigin = normalize(origin);

      if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.warn("❌ Socket.IO CORS Blocked:", cleanOrigin);
      callback(new Error("Socket.IO CORS error: " + cleanOrigin));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// ✅ Make Socket.IO accessible inside controllers
app.set("io", io);

// ✅ Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // 🎬 Video Rooms (existing)
  socket.on("joinVideo", (videoId) => {
    socket.join(videoId);
    console.log(`📺 Socket ${socket.id} joined room VIDEO-${videoId}`);
  });

  socket.on("leaveVideo", (videoId) => {
    socket.leave(videoId);
  });

  // 🧑‍💼 Channel Rooms (for real-time subscriber updates)
  socket.on("joinChannelRoom", (channelId) => {
    socket.join(channelId.toString());
    console.log(`👥 Socket ${socket.id} joined CHANNEL-${channelId}`);
  });

  socket.on("leaveChannelRoom", (channelId) => {
    socket.leave(channelId.toString());
    console.log(`🚪 Socket ${socket.id} left CHANNEL-${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
