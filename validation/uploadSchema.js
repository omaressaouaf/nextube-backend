const joi = require('joi')

const uploadSchema = joi.object({
    title : joi.string().required(),
    tags : joi.string().required(),
    description : joi.string().required(),
})

module.exports = uploadSchema;
