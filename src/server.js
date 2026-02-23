


// latest code after the cors failure on 20-11-2026 cause happen due to the downside of cors

// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
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
// import subscriptionRoutes from "./routes/subscriptionRoutes.js";
// import historyRoutes from "./routes/historyRoutes.js";
// import watchlaterRoutes from "./routes/watchlaterRoutes.js";
// import playlistRoutes from "./routes/playlistRoutes.js";
// import trendingRoutes from "./routes/trendingRoutes.js";
// import productRoutes from "./routes/productRoutes.js";
// import liveRoutes from "./routes/liveRoutes.js";


// const app = express();

// /* ---------------------------------------------------
//    ✅ CORS — MUST BE FIRST MIDDLEWARE
// ------------------------------------------------------ */

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://bharatvids.com",
//   "https://www.bharatvids.com",
// ];

// const normalize = (origin) => origin?.replace(/\/$/, "");

// const corsOptions = {
//   origin: (origin, callback) => {
//     const cleanOrigin = normalize(origin);
//     console.log("🔍 Incoming Origin:", cleanOrigin);

//     // ✅ Allow undefined origins (Render, Socket.IO, preflight)
//     if (!cleanOrigin) return callback(null, true);

//     if (allowedOrigins.includes(cleanOrigin)) {
//       return callback(null, true);
//     }

//     console.warn("❌ CORS Blocked:", cleanOrigin);
//     return callback(null, true); // 🚨 never throw
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// };

// // ✅ Apply CORS globally
// app.use(cors(corsOptions));

// // ✅ SAFE preflight handling (NO route patterns)
// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") {
//     return cors(corsOptions)(req, res, next);
//   }
//   next();
// });

// /* ---------------------------------------------------
//    ✅ Body Parsers
// --------------------------------------------------- */

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /* ---------------------------------------------------
//    ✅ Database
// --------------------------------------------------- */

// connectDB();

// /* -----------------------------------------------
//    ✅ Static Files
// -------------------------------------------------- */

// app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// /* ---------------------------------------------------
//    ✅ API Routes
// --------------------------------------------------- */

// app.use("/api/auth", authRoutes);
// app.use("/api/videos", videoRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/subscriptions", subscriptionRoutes);
// app.use("/api/history", historyRoutes);
// app.use("/api/watchlater", watchlaterRoutes);
// app.use("/api/playlists", playlistRoutes);
// app.use("/api/trending", trendingRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/live", liveRoutes);

// /* --------------------
//    ✅ Health Checks
// ---------------------- */

// app.get("/", (req, res) => res.send("API is running..."));
// app.get("/health", (req, res) => res.json({ ok: true }));

// /* ---------------------------------------------------
//    ✅ 404 Handler
// ------------------------------------------------------ */

// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// /* ---------------------------------------------------
//    ✅ Global Error Handler (WITH CORS HEADERS)
// --------------------------------------------------- */

// app.use((err, req, res, next) => {
//   console.error("🔥 Global Error:", err.message);

//   res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.header("Access-Control-Allow-Credentials", "true");

//   res.status(500).json({
//     message: "Internal Server Error",
//     error: err.message,
//   });
// });

// /* ---------------------------------------------------
//    ✅ HTTP + Socket.IO Server
// --------------------------------------------------- */

// const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   cors: {
//     origin: (origin, callback) => {
//       const cleanOrigin = normalize(origin);
//       console.log("🔌 Socket Origin:", cleanOrigin);

//       // ✅ Always allow socket connections
//       return callback(null, true);
//     },
//     credentials: true,
//     methods: ["GET", "POST"],
//   },
// });

// // Make socket available in controllers
// app.set("io", io);

// /* ---------------------------------------------------
//    ✅ Socket.IO Events
// --------------------------------------------------- */

// io.on("connection", (socket) => {
//   console.log("🟢 Socket connected:", socket.id);

//   socket.on("joinVideo", (videoId) => {
//     socket.join(videoId);
//     console.log(`📺 Joined VIDEO-${videoId}`);
//   });

//   socket.on("leaveVideo", (videoId) => {
//     socket.leave(videoId);
//   });

//   socket.on("joinChannelRoom", (channelId) => {
//     socket.join(channelId.toString());
//     console.log(`👥 Joined CHANNEL-${channelId}`);
//   });

//   socket.on("leaveChannelRoom", (channelId) => {
//     socket.leave(channelId.toString());
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 Socket disconnected:", socket.id);
//   });
// });

// /* ---------------------------------------------------
//    ✅ Start Server
// --------------------------------------------------- */

// const PORT = process.env.PORT || 5000;

// httpServer.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
// });



// latest code as per the live stream 

import dotenv from "dotenv";
dotenv.config();

import express from "express";
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
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import watchlaterRoutes from "./routes/watchlaterRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import trendingRoutes from "./routes/trendingRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import liveRoutes from "./routes/liveRoutes.js";

const app = express();

/* ---------------------------------------------------
   ✅ CORS
--------------------------------------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "https://bharatvids.com",
  "https://www.bharatvids.com",
];

const normalize = (origin) => origin?.replace(/\/$/, "");

const corsOptions = {
  origin: (origin, callback) => {
    const cleanOrigin = normalize(origin);
    console.log("🔍 Incoming Origin:", cleanOrigin);

    if (!cleanOrigin) return callback(null, true);
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    console.warn("❌ CORS Blocked:", cleanOrigin);
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

/* ---------------------------------------------------
   ✅ Body Parsers
--------------------------------------------------- */

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ---------------------------------------------------
   ✅ Database
--------------------------------------------------- */

connectDB();

/* ---------------------------------------------------
   ✅ Static
--------------------------------------------------- */

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

/* ---------------------------------------------------
   ✅ Routes
--------------------------------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/watchlater", watchlaterRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/live", liveRoutes);

/* ---------------------------------------------------
   ✅ Health
--------------------------------------------------- */

app.get("/", (req, res) => res.send("API is running..."));
app.get("/health", (req, res) => res.json({ ok: true }));

/* ---------------------------------------------------
   ✅ 404
--------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ---------------------------------------------------
   ✅ Global Error
--------------------------------------------------- */

app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);

  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

/* ---------------------------------------------------
   ✅ HTTP + Socket.IO
--------------------------------------------------- */

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const cleanOrigin = normalize(origin);
      console.log("🔌 Socket Origin:", cleanOrigin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

/* ---------------------------------------------------
   ✅ SOCKET EVENTS
--------------------------------------------------- */

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  /* --------------------------
     🎥 Existing Rooms
  -------------------------- */

  socket.on("joinVideo", (videoId) => {
    socket.join(videoId);
  });

  socket.on("leaveVideo", (videoId) => {
    socket.leave(videoId);
  });

  socket.on("joinChannelRoom", (channelId) => {
    socket.join(channelId.toString());
  });

  socket.on("leaveChannelRoom", (channelId) => {
    socket.leave(channelId.toString());
  });

  /* ===============================
        🔴 LIVE STREAM SOCKETS
  =============================== */

  socket.on("joinLiveRoom", (liveId) => {
    socket.join(liveId);
    socket.liveRoomId = liveId;

    const viewerCount =
      io.sockets.adapter.rooms.get(liveId)?.size || 1;

    io.to(liveId).emit("viewerCount", viewerCount);

    console.log(`🔴 Joined LIVE-${liveId}`);
  });

  socket.on("leaveLiveRoom", (liveId) => {
    socket.leave(liveId);

    const viewerCount =
      io.sockets.adapter.rooms.get(liveId)?.size || 0;

    io.to(liveId).emit("viewerCount", viewerCount);
  });

  socket.on("sendMessage", ({ liveId, message, username, avatar }) => {
  io.to(liveId).emit("newMessage", {
    id: Date.now(),
    message,
    username,
    avatar,
  });
});

  socket.on("sendReaction", ({ liveId, emoji }) => {
    io.to(liveId).emit("newReaction", {
      id: Date.now(),
      emoji,
    });
  });

  socket.on("sendGift", ({ liveId, gift }) => {
    io.to(liveId).emit("newGift", {
      id: Date.now(),
      gift,
    });
  });

  socket.on("pinMessage", ({ liveId, message }) => {
    io.to(liveId).emit("pinnedMessage", message);
  });

  socket.on("endLive", (liveId) => {
    io.to(liveId).emit("liveEnded");
    console.log(`🛑 LIVE ENDED - ${liveId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);

    if (socket.liveRoomId) {
      const liveId = socket.liveRoomId;

      const viewerCount =
        io.sockets.adapter.rooms.get(liveId)?.size || 0;

      io.to(liveId).emit("viewerCount", viewerCount);
    }
  });
});

/* ---------------------------------------------------
   ✅ Start Server
--------------------------------------------------- */

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});