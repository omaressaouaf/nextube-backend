const multer = require("multer");
const uploadSchema = require("../validation/uploadSchema");
const createError = require("http-errors");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
const mongoose = require("mongoose");
const Video = require("../models/video");
const { db } = require("../models/video");

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const videoFilter = async (req, file, cb) => {
  if (file.mimetype !== "video/mp4") cb(new Error("Only mp4 files are allowed"), false);
  try {
    await uploadSchema.validateAsync(req.body);
    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
};

const uploadVideo = multer({ storage: videoStorage, fileFilter: videoFilter, limits: { fileSize: 1024 * 1024 * 10 } }).single("file");

const handleUploadVideoErrors = err => {
  if (err instanceof multer.MulterError) {
    throw createError.UnprocessableEntity(err.message);
  } else if (err.isJoi) {
    throw err;
  }
  throw createError.InternalServerError();
};

const generateAndSaveThumbnail = filePath => {
  return new Promise((resolve, reject) => {
    let thumbnail = "";
    ffmpeg(filePath)
      .on("filenames", filenames => {
        thumbnail = `${process.env.APP_URL}/uploads/thumbnails/${filenames[0]}`;
      })
      .on("end", () => resolve(thumbnail))
      .on("error", err => reject(createError.InternalServerError()))
      .takeScreenshots(
        {
          filename: Date.now() + "thumbnail.jpg",
          count: [1],
          timemarks: ["50%"],
        },
        "uploads/thumbnails/"
      );
  });
};

const toggleFeeling = ({ videoId, authUser, feelings }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (feelings !== "likes" && feelings !== "dislikes") console.error("feelings must be likes or dislikes");

      const oppositeFeelings = feelings === "likes" ? "dislikes" : "likes";

      const video = await Video.findById(videoId);
      if (video[feelings].includes(authUser.id)) {
        video[feelings] = video[feelings].filter(userId => userId != authUser.id);
      } else {
        if (video[oppositeFeelings].includes(authUser.id)) {
          video[oppositeFeelings] = video[oppositeFeelings].filter(userId => userId != authUser.id);
        }
        video[feelings].addToSet(authUser.id);
      }
      await video.save();
      resolve();
    } catch (err) {
      console.log(err);
      reject(createError.InternalServerError());
    }
  });
};

module.exports = { uploadVideo, handleUploadVideoErrors, generateAndSaveThumbnail, toggleFeeling };
