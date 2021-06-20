const subscriptionsRouter = require("express").Router();
const { getSubscriptions,getSubscriptionsVideos, subscribe, unsubscribe } = require("../controllers/subscriptionController");
const checkAuth = require("../middlewares/checkAuth");

subscriptionsRouter.get("/", checkAuth, getSubscriptions);
subscriptionsRouter.get("/videos", checkAuth, getSubscriptionsVideos);
subscriptionsRouter.put("/subscribe/:userId", checkAuth, subscribe);
subscriptionsRouter.put("/unsubscribe/:userId", checkAuth, unsubscribe);

module.exports = subscriptionsRouter;
