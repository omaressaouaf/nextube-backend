const createError = require("http-errors");
const User = require("../models/User");
const registerSchema = require("../validation/registerSchema");
const authService = require("../services/authService");
const Subscription = require("../models/subscription");

module.exports = {
  register: async (req, res, next) => {
    try {
      const { channelName, email, password } = await registerSchema.validateAsync(req.body);
      if (await User.findOne({ email })) throw createError.Conflict("Email is already used");
      if (await User.findOne({ channelName })) throw createError.Conflict("Channel name is already used");

      const user = new User({ channelName, email, password });
      await user.save();
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      let user = await authService.attemptLogin(email, password);
      user = user.toJSON();
      const accessToken = await authService.createAccessToken(user);
      const refreshToken = await authService.createRefreshToken(user);
      authService.setRefreshTokenCookie(res, refreshToken);

      user.subscriptions = await Subscription.find({ subscriber: user.id }).populate({
        path: "subscribedTo",
        populate: {
          path: "subscribersCount",
        },
      });

      return res.json({
        accessToken,
        accessTokenEndDate: Date.now() + authService.accessTokenLifeTime,
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) throw createError.BadRequest("Missing refresh token");

      const user = await authService.verifyRefreshToken(refreshToken);

      await User.findByIdAndUpdate(user.id, { refreshToken: null });
      authService.setRefreshTokenCookie(res, "", 0);

      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) throw createError.BadRequest();

      const user = await authService.verifyRefreshToken(refreshToken);

      const newAccessToken = await authService.createAccessToken(user);
      const newRefreshToken = await authService.createRefreshToken(user);
      authService.setRefreshTokenCookie(res, newRefreshToken);

      user.subscriptions = await Subscription.find({ subscriber: user.id }).populate({
        path: "subscribedTo",
        populate: {
          path: "subscribersCount",
        },
      });
      return res.json({
        accessToken: newAccessToken,
        accessTokenEndDate: Date.now() + authService.accessTokenLifeTime,
        user,
      });
    } catch (err) {
      next(err);
    }
  },
};
