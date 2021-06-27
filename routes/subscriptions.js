const subscriptionsRouter = require("express").Router();
const {
  getSubscriptions,
  getSubscriptionsVideos,
  subscribe,
  unsubscribe,
} = require("../controllers/subscriptionController");


subscriptionsRouter.get("/", getSubscriptions);
subscriptionsRouter.get("/videos", getSubscriptionsVideos);
subscriptionsRouter.post("/subscribe/:userId", subscribe);
subscriptionsRouter.delete("/unsubscribe/:userId", unsubscribe);

module.exports = subscriptionsRouter;
