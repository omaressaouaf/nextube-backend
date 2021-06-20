const createError = require("http-errors");
const Video = require("../models/video");

const checkVideoId = async (req, _, next) => {
  try {
    const video = await Video.findById(req.params.videoId).populate('user');
    if (!video) throw createError.NotFound();
    req.video = video;
    return next();
  } catch (err) {
    next(err);
  }
};

module.exports = checkVideoId;
