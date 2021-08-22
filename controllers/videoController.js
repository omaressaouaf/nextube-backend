const Video = require("../models/video");
const videoService = require("../services/videoService");
const createError = require("http-errors");
const videoSchema = require("../validation/videoSchema");
const { db } = require("../models/video");
const History = require("../models/history");
const WatchLater = require("../models/watchLater");
const Comment = require("../models/comment");
const fs = require("fs");

module.exports = {
  index: async (req, res, next) => {
    try {
      const videos = await Video.find().sort({ createdAt: "desc" });

      return res.json({ videos });
    } catch (err) {
      next(err);
    }
  },
  search: async (req, res, next) => {
    try {
      const { query } = req.query;
      if (!query) throw createError.BadRequest("No Query present");

      const videos = await Video.find({
        $text: { $search: query },
      });

      return res.json({ videos });
    } catch (err) {
      next(err);
    }
  },
  getTrending: async (req, res, next) => {
    try {
      console.log(req.query.category);
      const videos = await Video.find({ category: req.query.category }).sort({
        viewsCount: "desc",
        likes: "desc",
      });

      return res.json({ videos });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const video = req.video;

      video.viewsCount += 1;
      await video.save();

      await video.populate({ path: "user", populate: { path: "subscribersCount" } }).execPopulate();
      return res.json({ video });
    } catch (err) {
      next(err);
    }
  },

  getSuggestions: async (req, res, next) => {
    try {
      const video = req.video;

      const suggestions = await Video.find({
        $text: { $search: video.tags },
        _id: { $ne: video.id },
      });

      return res.json({ suggestions });
    } catch (err) {
      next(err);
    }
  },

  toggleLike: async (req, res, next) => {
    try {
      await videoService.toggleFeeling({
        videoId: req.video.id,
        authUser: req.user,
        feelings: "likes",
      });

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },

  toggleDislike: async (req, res, next) => {
    try {
      await videoService.toggleFeeling({
        videoId: req.video.id,
        authUser: req.user,
        feelings: "dislikes",
      });

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },

  upload: async (req, res, next) => {
    videoService.uploadVideo(req, res, async err => {
      try {
        if (err) {
          videoService.handleUploadVideoErrors(err);
        }

        const filename = req.file.filename;
        const { thumbnail, duration } = await videoService.generateAndSaveThumbnail(req.file.path);

        const { title, tags, description, category } = req.body;
        const video = await Video.create({
          title,
          tags,
          description,
          filename,
          thumbnail,
          duration,
          category,
          user: req.user.id,
        });

        return res.status(201).json({ video });
      } catch (err) {
        next(err);
      }
    });
  },
  getStudioVideos: async (req, res, next) => {
    try {
      const videos = await Video.find({ user: req.user.id }).sort({ createdAt: "desc" });

      return res.json({ videos });
    } catch (err) {
      next(err);
    }
  },
  updateVideo: async (req, res, next) => {
    try {
      if (req.video.user._id != req.user.id) throw createError.Forbidden();

      const { title, tags, description, category } = await videoSchema.validateAsync(req.body);

      await Video.findByIdAndUpdate(req.video.id, { title, tags, description, category });

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
  deleteVideo: async (req, res, next) => {
    try {
      if (req.video.user._id != req.user.id) throw createError.Forbidden();

      db.transaction(async session => {
        await History.deleteMany({ video: req.video.id }, { session });
        await WatchLater.deleteMany({ video: req.video.id }, { session });
        await Comment.deleteMany({ video: req.video.id }, { session });

        await Video.findByIdAndDelete(req.video.id, { session });

        const fileNamePath = "uploads/videos/" + req.video.filename;
        if (fs.existsSync(fileNamePath)) {
          fs.unlinkSync(fileNamePath);
        }
      });
      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
};
