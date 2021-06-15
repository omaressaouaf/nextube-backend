const joi = require("joi");

const storeCommentSchema = joi.object({
  content: joi.string().required(),
});

module.exports = storeCommentSchema;
