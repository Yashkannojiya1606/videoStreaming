import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Models
import Video from "../src/models/Video.js";
import User from "../src/models/User.js";

// Load .env relative to script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Define old and new bucket values
const OLD_BUCKET_URL_PREFIX = "https://overairstream.s3.ap-south-1.amazonaws.com/";

// Ensure environment variables are loaded
if (!process.env.S3_BUCKET_NAME || !process.env.AWS_REGION) {
  console.error("❌ Missing S3_BUCKET_NAME or AWS_REGION in .env");
  process.exit(1);
}

const NEW_BUCKET_URL_PREFIX = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log(`Starting migration...`);
    console.log(`Replacing strings staring with: ${OLD_BUCKET_URL_PREFIX}`);
    console.log(`With: ${NEW_BUCKET_URL_PREFIX}`);

    // Update Videos Collection
    console.log("\n▶️ Migrating Video files...");
    const videos = await Video.find({
      $or: [
        { videoUrl: { $regex: `^${OLD_BUCKET_URL_PREFIX}` } },
        { thumbnailUrl: { $regex: `^${OLD_BUCKET_URL_PREFIX}` } },
        { authorAvatar: { $regex: `^${OLD_BUCKET_URL_PREFIX}` } },
      ],
    });

    let videoUpdateCount = 0;
    for (const video of videos) {
      if (video.videoUrl?.startsWith(OLD_BUCKET_URL_PREFIX)) {
        video.videoUrl = video.videoUrl.replace(OLD_BUCKET_URL_PREFIX, NEW_BUCKET_URL_PREFIX);
      }
      if (video.thumbnailUrl?.startsWith(OLD_BUCKET_URL_PREFIX)) {
        video.thumbnailUrl = video.thumbnailUrl.replace(OLD_BUCKET_URL_PREFIX, NEW_BUCKET_URL_PREFIX);
      }
      if (video.authorAvatar?.startsWith(OLD_BUCKET_URL_PREFIX)) {
        video.authorAvatar = video.authorAvatar.replace(OLD_BUCKET_URL_PREFIX, NEW_BUCKET_URL_PREFIX);
      }
      await video.save();
      videoUpdateCount++;
    }
    console.log(`✅ Updated ${videoUpdateCount} Video documents.`);

    // Update Users Collection
    console.log("\n▶️ Migrating User avatars...");
    const users = await User.find({ avatar: { $regex: `^${OLD_BUCKET_URL_PREFIX}` } });
    
    let userUpdateCount = 0;
    for (const user of users) {
      if (user.avatar?.startsWith(OLD_BUCKET_URL_PREFIX)) {
        user.avatar = user.avatar.replace(OLD_BUCKET_URL_PREFIX, NEW_BUCKET_URL_PREFIX);
        await user.save();
        userUpdateCount++;
      }
    }
    console.log(`✅ Updated ${userUpdateCount} User documents.`);

    console.log("\n🎉 Migration completed securely!");

  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

migrate();
