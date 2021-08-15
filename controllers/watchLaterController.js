const WatchLater = require("../models/watchLater");

module.exports = {
  index: async (req, res, next) => {
    try {
      const watchLaters = await WatchLater.find({ user: req.user.id })
        .select("-user")
        .populate("video");

      return res.json({ watchLaters });
    } catch (err) {
      next(err);
    }
  },
  toggleWatchLater: async (req, res, next) => {
    try {
      const oldWatchLater = await WatchLater.findOne({ user: req.user.id, video: req.video.id });

      if (oldWatchLater) {
        await WatchLater.deleteOne({ user: req.user.id, video: req.video.id });

        return res.sendStatus(204);
      } else {
        await WatchLater.create({ user: req.user.id, video: req.video.id });
        return res.sendStatus(201);
      }
    } catch (err) {
      next(err);
    }
  },
  destroyAll: async (req, res, next) => {
    try {
      await WatchLater.deleteMany({ user: req.user.id });

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
  checkIfVideoIsWatchLater: async (req, res, next) => {
    try {
      const watchLater = await WatchLater.findOne({ user: req.user.id, video: req.video.id });

      if (!watchLater) {
        return res.json({ isWatchLater: false });
      }

      res.json({ isWatchLater: true });
    } catch (err) {
      next(err);
    }
  },
};
