const joi = require("joi");

const videoSchema = joi.object({
  title: joi.string().required(),
  tags: joi.string().required(),
  description: joi.string().required(),
  category: joi.string().valid('music' , 'gaming' , 'sports'),
});

module.exports = videoSchema;
