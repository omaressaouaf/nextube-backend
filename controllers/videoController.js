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
    const video = await Video.findById(req.params.videoId).populate("user")
    if (!video) throw createError.NotFound();

    video.viewsCount += 1;
    await video.save();

    return res.json({ video });
  } catch (err) {
    next(err);
  }
};

const getSuggestions = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) throw createError.NotFound();

    const suggestions = await Video.find({ $text: { $search: video.tags }, _id: { $ne: video.id } }).populate("user");

    return res.json({ suggestions });
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
    const contentLength = end - start + 1;

    //proper headers
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
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

const toggleLike = async (req, res, next) => {
  try {
    await videoService.toggleFeeling({ videoId: req.params.videoId, authUser: req.user, feelings: "likes" });

    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const toggleDislike = async (req, res, next) => {
  try {
    await videoService.toggleFeeling({ videoId: req.params.videoId, authUser: req.user, feelings: "dislikes" });

    return res.sendStatus(200);
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

      return res.status(201).json({ video });
    } catch (err) {
      next(err);
    }
  });
};

module.exports = { index, show, toggleLike, toggleDislike, getSuggestions, stream, upload };
