const createError = require("http-errors");
const User = require("../models/user");
const Video = require("../models/video");

module.exports = {
  show: async (req, res, next) => {
    try {
      const { channelName } = req.params;
      const user = await User.findOne({ channelName }).populate('subscribersCount');
      if (!user) throw createError.NotFound();
      const videos = await Video.find({ user: user.id }).sort({ createdAt: "desc" });

      return res.json({ user , videos });
    } catch (err) {
      next(err);
    }
  },
};
