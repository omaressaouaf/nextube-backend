const multer = require("multer");
const uploadSchema = require("../validation/uploadSchema");
const createError = require("http-errors");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

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

const uploadVideo = multer({ storage: videoStorage, fileFilter: videoFilter, limits: { fileSize: 1024 * 1024 * 1000 } }).single("file");

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
          timemarks: ['50%'],
        },
        "uploads/thumbnails/"
      );
  });
};

module.exports = { uploadVideo, handleUploadVideoErrors, generateAndSaveThumbnail };
