const router = require("express").Router();

router.post("/register", async (req, res) => {
  res.send("register");
});

module.exports = router
