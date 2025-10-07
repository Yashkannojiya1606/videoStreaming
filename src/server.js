// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

// ✅ CORS – allow local + production frontend
const allowedOrigins = [
  "http://localhost:5173", // local dev
  process.env.FRONTEND_URL || "https://videostream.overair.in", // production
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to database
connectDB();

// ✅ Serve uploaded files statically
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ✅ Streaming route for videos (supports partial content)
app.get("/uploads/videos/:filename", (req, res) => {
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "uploads/videos", req.params.filename);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(err);
      return res.status(404).end("File not found");
    }

    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        "Content-Length": stats.size,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      file.pipe(res);
    }
  });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Health check route (for Render)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ✅ Start server (Render requires binding to 0.0.0.0)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
