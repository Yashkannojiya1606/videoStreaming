// // server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import videoRoutes from "./routes/videoRoutes.js";
// import userRoutes from "./routes/userRoutes.js";

// dotenv.config();

// const app = express();

// // ✅ Resolve current directory (ESM-compatible)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ CORS – allow local + production frontend
// const allowedOrigins = [
//   "http://localhost:5173", // local dev
//   process.env.FRONTEND_URL || "https://videostream.overair.in", // production
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin (Postman, curl, etc.)
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS: " + origin));
//       }
//     },
//     credentials: true,
//   })
// );

// // ✅ Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Connect to MongoDB
// connectDB();

// // ✅ Serve uploaded files (thumbnails, avatars, etc.)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ✅ Custom streaming route for large video files
// app.get("/uploads/videos/:filename", (req, res) => {
//   const filePath = path.join(__dirname, "uploads/videos", req.params.filename);

//   fs.stat(filePath, (err, stats) => {
//     if (err) {
//       console.error("❌ Video not found:", filePath);
//       return res.status(404).send("Video not found");
//     }

//     const range = req.headers.range;
//     if (!range) {
//       res.writeHead(200, {
//         "Content-Length": stats.size,
//         "Content-Type": "video/mp4",
//       });
//       fs.createReadStream(filePath).pipe(res);
//     } else {
//       const parts = range.replace(/bytes=/, "").split("-");
//       const start = parseInt(parts[0], 10);
//       const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

//       const chunkSize = end - start + 1;
//       const file = fs.createReadStream(filePath, { start, end });

//       res.writeHead(206, {
//         "Content-Range": `bytes ${start}-${end}/${stats.size}`,
//         "Accept-Ranges": "bytes",
//         "Content-Length": chunkSize,
//         "Content-Type": "video/mp4",
//       });

//       file.pipe(res);
//     }
//   });
// });

// // ✅ API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/videos", videoRoutes);
// app.use("/api/users", userRoutes);

// // ✅ Default route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // ✅ Health check for Render
// app.get("/health", (req, res) => {
//   res.json({ ok: true });
// });

// // ✅ Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });



// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import likeRoutes from "./routes/likeRoutes.js"; // 👈 added
import commentRoutes from "./routes/commentRoutes.js";


dotenv.config();
const app = express();

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || "https://videostream.overair.in",
  "http://localhost:5173",
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// static and routes as before
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes); // 👈 added here
app.use("/api/comments", commentRoutes);


app.get("/", (req, res) => res.send("API is running..."));
app.get("/health", (req, res) => res.json({ ok: true }));

// create HTTP server and Socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// attach io instance to express app so controllers can access it
app.set("io", io);

// Socket events: join room, leave, etc.
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinVideo", (videoId) => {
    socket.join(videoId);
    console.log(`Socket ${socket.id} joined room ${videoId}`);
  });

  socket.on("leaveVideo", (videoId) => {
    socket.leave(videoId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// listen
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server + Socket.IO listening on port ${PORT}`);
});


// code ends here 