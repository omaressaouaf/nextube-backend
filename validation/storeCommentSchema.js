const joi = require("joi");

const storeCommentSchema = joi.object({
  content: joi.string().required(),
  repliedTo : joi.string()
});

module.exports = storeCommentSchema;
