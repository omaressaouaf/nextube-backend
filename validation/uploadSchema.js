const joi = require("joi");

const uploadSchema = joi.object({
  title: joi.string().required(),
  tags: joi.string().required(),
  description: joi.string().required(),
  category: joi.string().valid('music' , 'gaming' , 'sports'),
});

module.exports = uploadSchema;
