const joi = require("joi");

const storeCommentSchema = joi.object({
  content: joi.string().required(),
  parentCommentId : joi.string()
});

module.exports = storeCommentSchema;
