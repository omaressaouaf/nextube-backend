const videosRouter = require("express").Router();
const {
  index,
  getTrending,
  show,
  getSuggestions,
  toggleLike,
  upload,
  toggleDislike,
} = require("../controllers/videoController");
const streamController = require("../controllers/streamController");
const checkAuth = require("../middlewares/checkAuth");
const checkVideoId = require("../middlewares/checkVideoId");
const commentsRouter = require("./comments");
// Public
videosRouter.get("/", index);
videosRouter.get("/trending", getTrending);
videosRouter.get("/stream/:filename", streamController.index);

//Auth
videosRouter.post("/upload", checkAuth, upload);

// Video specific
videosRouter.use("/:videoId", checkVideoId);
videosRouter.get("/:videoId", show);
videosRouter.use("/:videoId/comments", commentsRouter);
videosRouter.get("/:videoId/suggestions", getSuggestions);

//Auth & Video specific
videosRouter.use("/:videoId", checkAuth);
videosRouter.put("/:videoId/togglelike", toggleLike);
videosRouter.put("/:videoId/toggledislike", toggleDislike);

module.exports = videosRouter;
