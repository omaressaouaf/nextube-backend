const Video = require("../models/video");
const videoService = require("../services/videoService");

const index = async (req, res , next) => {
  try {
     const videos = await Video.find().populate('user')
      
     return res.json({videos})
  }catch(err) {
    next(err)
  }
}
const upload = async (req, res, next) => {
  videoService.uploadVideo(req, res, async err => {
    try {
      if (err) {
        videoService.handleUploadVideoErrors(err);
      }

      const filename = req.file.filename;
      const thumbnail = await videoService.generateAndSaveThumbnail(req.file.path);

      const { title, tags, description } = req.body;
      const video = await Video.create({
        title,
        tags,
        description,
        filename,
        thumbnail,
        user : req.user.id
      });

      return res.json({video})
    } catch (err) {
      next(err);
    }
  });
};

module.exports = { index, upload };
