const User = require("../models/User");
const Subscription = require("../models/subscription");
const createError = require("http-errors");
const subscriptionService = require("../services/subscriptionService");

module.exports = {
  getSubscriptions: async (req, res, next) => {
    try {
      const subscriptions = await Subscription.find({ subscriber: req.user.id })
        .select("-subscriber")
        .populate("subscribedTo");

      return res.json({ subscriptions });
    } catch (err) {
      next(err);
    }
  },
  getSubscriptionsVideos: async (req, res, next) => {
    try {
      const subscriptions = await Subscription.find({ subscriber: req.user.id });
      const subscribedToArray = subscriptions.map(subscription => subscription.subscribedTo);

      const subscriptionsVideos = await subscriptionService.getSubscriptionsWithLatestVideos(
        subscribedToArray
      );

      return res.json({ subscriptionsVideos });
    } catch (err) {
      next(err);
    }
  },

  subscribe: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const subscribedTo = await User.findById(userId);
      if (!subscribedTo) throw createError.NotFound();
      if (subscribedTo.id === req.user.id) throw createError.BadRequest();

      const newSubscription = await Subscription.create({
        subscriber: req.user.id,
        subscribedTo: subscribedTo.id,
      });

      await newSubscription.populate("subscribedTo").execPopulate();

      return res.status(201).json({ newSubscription });
    } catch (err) {
      next(err);
    }
  },

  unsubscribe: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const deletedSubscription = await Subscription.findOneAndRemove({
        subscriber: req.user.id,
        subscribedTo: userId,
      });
      if (!deletedSubscription) throw createError.NotFound();

      return res.json({ deletedSubscription });
    } catch (err) {
      next(err);
    }
  },
};
