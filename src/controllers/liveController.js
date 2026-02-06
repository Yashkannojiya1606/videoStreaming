import { CreateChannelCommand } from "@aws-sdk/client-ivs";
import ivsClient from "../config/ivs.js";
import LiveStream from "../models/LiveStream.js";

export const startLive = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Check if user is already live
    const alreadyLive = await LiveStream.findOne({
      userId,
      status: "LIVE"
    });

    if (alreadyLive) {
      return res.status(400).json({
        message: "User is already live"
      });
    }

    // 2️⃣ Create IVS Channel
    const command = new CreateChannelCommand({
      name: `live_${userId}`,
      latencyMode: "LOW",
      authorized: false
    });

    const response = await ivsClient.send(command);

    // 3️⃣ Save Live Session in DB
    const liveStream = await LiveStream.create({
      userId,
      channelArn: response.channel.arn,
      playbackUrl: response.channel.playbackUrl,
      streamKey: response.streamKey.value,
      status: "OFFLINE"
    });

    // 4️⃣ Send Stream Info to frontend
    res.status(201).json({
      liveId: liveStream._id,
      ingestUrl: response.channel.ingestEndpoint,
      streamKey: response.streamKey.value,
      playbackUrl: response.channel.playbackUrl
    });
  } catch (error) {
    console.error("Start Live Error:", error);
    res.status(500).json({
      message: "Failed to start live stream"
    });
  }
};
