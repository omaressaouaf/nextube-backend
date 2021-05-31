const joi = require('joi')

const registerSchema = joi.object({
    channelName : joi.string().required(),
    email : joi.string().email().lowercase().required(),
    password : joi.string().min(8).required()
})

module.exports = registerSchema;
