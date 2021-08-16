const settingsRouter = require("express").Router();
const { updateProfile, updatePassword } = require("../controllers/settingsController");

settingsRouter.put("/profile", updateProfile);
settingsRouter.put("/password", updatePassword);

module.exports = settingsRouter;
