const Comment = require("../models/comment");
const storeCommentSchema = require("../validation/storeCommentSchema");
const createError = require("http-errors");
const { db } = require("../models/comment");

module.exports = {
  index: async (req, res, next) => {
    try {
      const comments = await Comment.find({ video: req.params.videoId, parentComment: null })
        .populate("user")
        .populate("repliesCount")
        .sort({ createdAt: "desc" });

      res.json({ comments });
    } catch (err) {
      next(err);
    }
  },
  getReplies: async (req, res, next) => {
    try {
      const parentComment = await Comment.findById(req.params.commentId);
      if (!parentComment) throw createError.NotFound();

      const replies = await Comment.find({ parentComment: parentComment.id })
        .populate("user")
        .populate("repliesCount");

      return res.json({ replies });
    } catch (err) {
      next(err);
    }
  },

  store: async (req, res, next) => {
    try {
      const { content, parentCommentId } = await storeCommentSchema.validateAsync(req.body);

      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) throw createError.NotFound();
      }

      const newComment = await Comment.create({
        content,
        user: req.user.id,
        video: req.video.id,
        parentComment: parentCommentId,
      });
      await newComment.populate("user").populate("repliesCount").execPopulate();
      return res.status(201).json({ newComment });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { content } = await storeCommentSchema.validateAsync(req.body);

      const comment = await Comment.findById(req.params.commentId).populate("user");
      if (!comment) throw createError.NotFound();

      if (comment.user.id != req.user.id) throw createError.Forbidden();

      comment.content = content;
      await comment.save();

      return res.json({ updatedComment: comment });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.commentId).populate("user");
      if (!comment) throw createError.NotFound();

      if (comment.user.id != req.user.id) throw createError.Forbidden();

      db.transaction(async session => {
        await Comment.deleteMany({ parentComment: comment.id }, { session });

        await comment.delete({ session });
      });

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
};
