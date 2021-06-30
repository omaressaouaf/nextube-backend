const historiesRouter = require("express").Router();
const {
  index,
  storeOrUpdate,
  destroy,
  destroyAll,
  search,
} = require("../controllers/historyController");
const checkVideoId = require("../middlewares/checkVideoId");

historiesRouter.get("/", index);
historiesRouter.get("/search", search);
historiesRouter.delete("/", destroyAll);

historiesRouter.use("/:videoId", checkVideoId);
historiesRouter.put("/:videoId", storeOrUpdate);
historiesRouter.delete("/:videoId", destroy);

module.exports = historiesRouter;
