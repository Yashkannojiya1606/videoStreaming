import express from "express";
import { startLive } from "../controllers/liveController.js";
import { protect } from "../middleware/authMiddleware.js";
import { IVSRealTimeClient, CreateParticipantTokenCommand } from "@aws-sdk/client-ivs-realtime";

const router = express.Router();

/* ---------------------------------------------------
   ✅ IVS Real-Time Client
--------------------------------------------------- */

const ivsClient = new IVSRealTimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* ---------------------------------------------------
   ✅ 1. Start Live (Existing)
--------------------------------------------------- */

router.post("/start", protect, startLive);

/* ---------------------------------------------------
   ✅ 2. Create IVS Participant Token (NEW)
--------------------------------------------------- */

router.post("/create-token", protect, async (req, res) => {
  try {
    const { stageArn } = req.body;

    if (!stageArn) {
      return res.status(400).json({ message: "Stage ARN required" });
    }

    const command = new CreateParticipantTokenCommand({
      stageArn,
      capabilities: ["PUBLISH", "SUBSCRIBE"], // host can publish + watch
    });

    const response = await ivsClient.send(command);

    res.json({
      token: response.participantToken?.token,
      participantId: response.participantToken?.participantId,
      expirationTime: response.participantToken?.expirationTime,
    });
  } catch (error) {
    console.error("IVS Token Error:", error);
    res.status(500).json({ message: "Failed to create participant token" });
  }
});

export default router;
