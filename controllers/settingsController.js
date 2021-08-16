const updateProfileSchema = require("../validation/updateProfileSchema");
const User = require("../models/user");
const authService = require("../services/authService");
const Subscription = require("../models/subscription");

module.exports = {
  updateProfile: async (req, res, next) => {
    try {
      const { channelName, email } = await updateProfileSchema.validateAsync(req.body);

      let user = await User.findOne({ channelName: req.user.channelName });

      await authService.checkUserExistence({ channelName, email, exceptUser: user });

      user.channelName = channelName;
      user.email = email;
      await user.save();

      user = user.toJSON();

      const newAccessToken = await authService.createAccessToken(user);
      const newRefreshToken = await authService.createRefreshToken(user);
      authService.setRefreshTokenCookie(res, newRefreshToken);

      user.subscriptions = await Subscription.find({ subscriber: user.id }).populate({
        path: "subscribedTo",
        populate: {
          path: "subscribersCount",
        },
      });

      return res.status(201).json({
        accessToken: newAccessToken,
        accessTokenEndDate: Date.now() + authService.accessTokenLifeTime,
        user,
      });
    } catch (err) {
      next(err);
    }
  },
  updatePassword: async (req, res, next) => {
    try {
      return res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  },
};
