const channelsRouter = require("express").Router();
const { show } = require("../controllers/channelController");

channelsRouter.get("/:channelName", show);

module.exports = channelsRouter;
