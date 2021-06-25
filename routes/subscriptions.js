const subscriptionsRouter = require("express").Router();
const {
  getSubscriptions,
  getSubscriptionsWithVideos,
  subscribe,
  unsubscribe,
} = require("../controllers/subscriptionController");


subscriptionsRouter.get("/", getSubscriptions);
subscriptionsRouter.get("/videos", getSubscriptionsWithVideos);
subscriptionsRouter.post("/subscribe/:userId", subscribe);
subscriptionsRouter.delete("/unsubscribe/:userId", unsubscribe);

module.exports = subscriptionsRouter;
