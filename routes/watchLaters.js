const watchLatersRouter = require("express").Router();
const { index, toggleWatchLater, destroyAll , checkIfVideoIsWatchLater } = require("../controllers/watchLaterController");
const checkVideoId = require("../middlewares/checkVideoId");

watchLatersRouter.get("/", index);
watchLatersRouter.delete("/", destroyAll);

watchLatersRouter.use("/:videoId", checkVideoId);
watchLatersRouter.put("/:videoId", toggleWatchLater);
watchLatersRouter.get("/:videoId", checkIfVideoIsWatchLater);

module.exports = watchLatersRouter;
