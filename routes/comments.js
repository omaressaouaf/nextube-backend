const commentsRouter = require("express").Router({ mergeParams: true });
const { index, store, destroy } = require("../controllers/commentController");
const checkAuth = require("../middlewares/checkAuth");

// Public
commentsRouter.get("/", index);

// Auth
commentsRouter.use("/", checkAuth);
commentsRouter.post("/", store);
commentsRouter.delete("/:commentId", destroy);

module.exports = commentsRouter;
