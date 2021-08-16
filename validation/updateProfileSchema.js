const joi = require('joi')

const updateProfileSchema = joi.object({
    channelName : joi.string().required(),
    email : joi.string().email().lowercase().required(),
})

module.exports = updateProfileSchema;
