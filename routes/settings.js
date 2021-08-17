const settingsRouter = require("express").Router();
const {
  updateProfile,
  updatePassword,
  updateAvatar,
} = require("../controllers/settingsController");

settingsRouter.put("/profile", updateProfile);
settingsRouter.put("/password", updatePassword);
settingsRouter.put("/avatar", updateAvatar);

module.exports = settingsRouter;
