import Video from "../models/Video.js";

export const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const videoUrl = req.file.path;

    const newVideo = await Video.create({
      title,
      description,
      videoUrl,
      user: req.user.id,
    });

    res.status(201).json({ message: "Video uploaded", video: newVideo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("user", "username email");
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
