import Playlist from "../models/Playlist.js";
import Video from "../models/Video.js";

export const createPlaylist = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const pl = await Playlist.create({
      userId: req.user._id || req.user.id,
      title,
      description,
      isPublic: !!isPublic,
    });

    res.status(201).json(pl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create playlist" });
  }
};

export const getMyPlaylists = async (req, res) => {
  try {
    const list = await Playlist.find({ userId: req.user._id || req.user.id })
      .select("-__v")
      .sort({ updatedAt: -1 });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch playlists" });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const pl = await Playlist.findById(req.params.id)
      .populate("videos.videoId")
      .lean();

    if (!pl) return res.status(404).json({ message: "Playlist not found" });
    res.json(pl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get playlist" });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const pl = await Playlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id || req.user.id,
    });
    if (!pl) return res.status(404).json({ message: "Playlist not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete" });
  }
};

// Toggle add/remove video to playlist
export const toggleVideoInPlaylist = async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlistId = req.params.id;
    if (!videoId) return res.status(400).json({ message: "videoId required" });

    const pl = await Playlist.findById(playlistId);
    if (!pl) return res.status(404).json({ message: "Playlist not found" });

    const exists = pl.videos.find((v) => v.videoId?.toString() === videoId.toString());
    if (exists) {
      // remove
      pl.videos = pl.videos.filter((v) => v.videoId.toString() !== videoId.toString());
    } else {
      pl.videos.unshift({ videoId });
      // update cover if missing
      if (!pl.coverUrl) {
        const video = await Video.findById(videoId).select("thumbnailUrl");
        if (video) pl.coverUrl = video.thumbnailUrl || "";
      }
    }
    await pl.save();
    const populated = await Playlist.findById(playlistId).populate("videos.videoId");
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle video" });
  }
};

// remove single video (optional)
export const removeVideoFromPlaylist = async (req, res) => {
  try {
    const { id, videoId } = req.params;
    const pl = await Playlist.findOne({ _id: id, userId: req.user._id || req.user.id });
    if (!pl) return res.status(404).json({ message: "Playlist not found" });
    pl.videos = pl.videos.filter((v) => v.videoId.toString() !== videoId.toString());
    await pl.save();
    res.json({ message: "Removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove video" });
  }
};
