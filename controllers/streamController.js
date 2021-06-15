const fs = require("fs");
const createError = require("http-errors");

module.exports = {
  index: async (req, res, next) => {
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
  },
};
