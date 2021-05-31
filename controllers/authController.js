const createError = require("http-errors");
const User = require("../models/User");
const registerSchema = require('../validation/registerSchema')

const register = async (req, res, next) => {
  try {
    const { channelName, email, password } = await registerSchema.validateAsync(req.body);
    const doesExist =await User.findOne({ email })
    if (doesExist) throw createError.Conflict("email is already used");

    const user = new User({ channelName, email, password });
    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register };
