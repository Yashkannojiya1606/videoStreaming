


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

/* ================= ROUTES ================= */

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
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

/* ===================================================
   ✅ CORS
=================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://bharatvids.com",
  "https://www.bharatvids.com",
];

const normalize = (origin) => origin?.replace(/\/$/, "");

const corsOptions = {
  origin: (origin, callback) => {
    const cleanOrigin = normalize(origin);

    if (!cleanOrigin) return callback(null, true);
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* ===================================================
   ✅ BODY PARSER
=================================================== */

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ===================================================
   ✅ DATABASE
=================================================== */

connectDB();

/* ===================================================
   ✅ STATIC
=================================================== */

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

/* ===================================================
   ✅ API ROUTES
=================================================== */

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
app.use("/api/report", reportRoutes);

/* ===================================================
   ✅ HEALTH
=================================================== */

app.get("/", (req, res) => res.send("API is running..."));
app.get("/health", (req, res) => res.json({ ok: true }));

/* ===================================================
   ✅ ERROR HANDLING
=================================================== */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

/* ===================================================
   ✅ HTTP + SOCKET.IO
=================================================== */

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

app.set("io", io);

/* ===================================================
   🔴 LIVE ROOM VIEWER TRACKER
=================================================== */

const liveRoomViewers = {}; 
// structure:
// {
//   liveId: {
//     socketId: { username }
//   }
// }

/* ===================================================
   ✅ SOCKET EVENTS
=================================================== */

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  /* ==========================================
        🔴 JOIN LIVE ROOM
  ========================================== */

  socket.on("joinLiveRoom", ({ liveId, username }) => {
    socket.join(liveId);
    socket.liveRoomId = liveId;
    socket.username = username || "User";

    if (!liveRoomViewers[liveId]) {
      liveRoomViewers[liveId] = {};
    }

    liveRoomViewers[liveId][socket.id] = {
      username: socket.username,
    };

    const viewerCount = Object.keys(liveRoomViewers[liveId]).length;

    /* 🔥 Emit viewer count */
    io.to(liveId).emit("viewerCount", viewerCount);

    /* 🔥 Emit join notification */
    io.to(liveId).emit("userJoined", {
      username: socket.username,
      count: viewerCount,
    });

    console.log(`🔴 ${socket.username} joined LIVE-${liveId}`);
  });

  /* ==========================================
        🔴 LEAVE LIVE ROOM
  ========================================== */

  socket.on("leaveLiveRoom", (liveId) => {
    socket.leave(liveId);

    if (liveRoomViewers[liveId]) {
      const username = liveRoomViewers[liveId][socket.id]?.username;
      delete liveRoomViewers[liveId][socket.id];

      const viewerCount = Object.keys(liveRoomViewers[liveId]).length;

      io.to(liveId).emit("viewerCount", viewerCount);

      /* 🔥 Emit leave notification */
      io.to(liveId).emit("userLeft", {
        username,
        count: viewerCount,
      });
    }
  });

  /* ==========================================
        💬 CHAT
  ========================================== */

  socket.on("sendMessage", ({ liveId, message, username, avatar }) => {
    io.to(liveId).emit("newMessage", {
      id: Date.now(),
      message,
      username,
      avatar,
    });
  });

  /* ==========================================
        ❤️ REACTIONS
  ========================================== */

  socket.on("sendReaction", ({ liveId, emoji }) => {
    io.to(liveId).emit("newReaction", {
      id: Date.now(),
      emoji,
    });
  });

  /* ==========================================
        🎁 GIFTS
  ========================================== */

  socket.on("sendGift", ({ liveId, gift }) => {
    io.to(liveId).emit("newGift", {
      id: Date.now(),
      gift,
    });
  });

  /* ==========================================
        📌 PIN MESSAGE
  ========================================== */

  socket.on("pinMessage", ({ liveId, message }) => {
    io.to(liveId).emit("pinnedMessage", message);
  });

  /* ==========================================
        🛑 END LIVE
  ========================================== */

  socket.on("endLive", (liveId) => {
    io.to(liveId).emit("liveEnded");

    delete liveRoomViewers[liveId];

    console.log(`🛑 LIVE ENDED - ${liveId}`);
  });

  /* ==========================================
        🔌 DISCONNECT
  ========================================== */

  socket.on("disconnect", () => {
    const liveId = socket.liveRoomId;

    if (liveId && liveRoomViewers[liveId]) {
      const username = liveRoomViewers[liveId][socket.id]?.username;

      delete liveRoomViewers[liveId][socket.id];

      const viewerCount = Object.keys(liveRoomViewers[liveId]).length;

      io.to(liveId).emit("viewerCount", viewerCount);

      io.to(liveId).emit("userLeft", {
        username,
        count: viewerCount,
      });
    }

    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* ===================================================
   ✅ START SERVER
=================================================== */

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});