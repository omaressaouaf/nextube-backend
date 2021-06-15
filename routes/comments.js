const commentsRouter = require("express").Router({ mergeParams: true });
const { index, getReplies, store, update, destroy } = require("../controllers/commentController");
const checkAuth = require("../middlewares/checkAuth");

// Public
commentsRouter.get("/", index);
commentsRouter.get("/:commentId/replies", getReplies);

// Auth
commentsRouter.use("/", checkAuth);
commentsRouter.post("/", store);
commentsRouter.put("/:commentId", update);
commentsRouter.delete("/:commentId", destroy);

module.exports = commentsRouter;
