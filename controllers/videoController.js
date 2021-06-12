const createError = require("http-errors");
const Video = require("../models/video");
const videoService = require("../services/videoService");
const fs = require("fs");

const index = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ createdAt: "desc" }).populate("user");

    return res.json({ videos });
  } catch (err) {
    next(err);
  }
};

const show = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).populate("user");
    if (!video) throw createError.NotFound();

    return res.json({ video });
  } catch (err) {
    next(err);
  }
};

const stream = async (req, res, next) => {
  try {
    // check file path and get stats
    const path = `uploads/videos/${req.params.filename}`;
    if (!fs.existsSync(path)) throw createError.NotFound();
    const fileSize = fs.statSync(path).size;

    // Some browsers dont't send a range in the initial request . so we  send the first few chunks of the video
    const range = req.headers.range;

    if (!range) {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      return fs.createReadStream(path).pipe(res);
    }

    // Parse range
    const chunkSize = 1024 * 1024 * 10; // about 10MB
    const start = Number(range.replace(/bytes=/, "").split("-")[0]);
    const end = Math.min(start + chunkSize, fileSize - 1);

    //proper headers
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    // create read stream and pipe through the response
    const fileStream = fs.createReadStream(path, { start, end });
    res.writeHead(206, head);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

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
        user: req.user.id,
      });

      return res.json({ video });
    } catch (err) {
      next(err);
    }
  });
};

module.exports = { index, show, stream, upload };
