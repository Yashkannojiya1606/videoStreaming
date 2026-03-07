import Report from "../models/Reports.js";
 
export const reportVideo = async (req, res) => {
  try {
    const { videoId, reason } = req.body;
    const userId = req.user.id;
 
    if (!videoId || !reason) {
      return res.status(400).json({ message: "VideoId and reason are required" });
    }
 
    // ✅ prevent duplicate report by same user on same video
    const alreadyReported = await Report.findOne({
      videoId,
      reportedBy: userId,
    });
 
    if (alreadyReported) {
      return res.status(400).json({
        message: "You have already reported this video.",
      });
    }
 
    const report = await Report.create({
      videoId,
      reportedBy: userId,
      reason,
    });
 
    return res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.log("Report Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};