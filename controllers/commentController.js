const Comment = require("../models/comment");
const storeCommentSchema = require("../validation/storeCommentSchema");
const createError = require("http-errors");

module.exports = {
  index: async (req, res, next) => {
    try {
      const comments = await Comment.find({ video: req.params.videoId });

      res.json({ comments });
    } catch (err) {
      next(err);
    }
  },

  store: async (req, res, next) => {
    try {
      const { content } = await storeCommentSchema.validateAsync(req.body);

      const newComment = await Comment.create({
        content,
        user: req.user.id,
        video: req.video.id,
      });

      return res.json({ newComment });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.commentId).populate("user");
      if (!comment) throw createError.NotFound();

      if (comment.user.id != req.user.id) throw createError.Forbidden();

      await comment.delete();

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
};
