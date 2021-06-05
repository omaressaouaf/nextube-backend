const router = require("express").Router();
const { register, login, logout, refreshToken } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.put("/logout", logout);
router.put('/refreshtoken' , refreshToken)

module.exports = router;
