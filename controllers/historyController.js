const History = require("../models/history");
const Video = require("../models/video");
const historyService = require("../services/historyService");
module.exports = {
  index: async (req, res, next) => {
    try {
      const historiesPerDay = await historyService.getHistoriesPerDay(req.user.id);

      return res.json({ historiesPerDay });
    } catch (err) {
      next(err);
    }
  },
  storeOrUpdate: async (req, res, next) => {
    try {
      const oldHistory = await History.findOne({ user: req.user.id, video: req.video.id });

      if (oldHistory) {
        await History.updateMany(
          { user: req.user.id, video: req.video.id },
          { createdAt: Date.now() }
        );
      } else {
        await History.create({ user: req.user.id, video: req.video.id });
      }

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      await History.deleteMany({ user: req.user.id, video: req.video.id });

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
  destroyAll: async (req, res, next) => {
    try {
      await History.deleteMany({ user: req.user.id });

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },

  search: async (req, res, next) => {
    try {
      const { query } = req.query;
      if (!query) return createError.BadRequest("No Query present");

      const videos = await Video.find({
        $text: { $search: query },
      }).select("_id");

      const videosIds = videos.map(video => video._id);

      const historiesPerDay = await historyService.getHistoriesPerDay(req.user.id, videosIds);

      return res.json({ historiesPerDay });
    } catch (err) {
      next(err);
    }
  },
};
