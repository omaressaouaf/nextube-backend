const joi = require("joi");

const updatePasswordSchema = joi.object({
  currentPassword: joi.string().required(),
  newPassword: joi.string().min(8).required(),
});

module.exports = updatePasswordSchema;
