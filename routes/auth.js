const authRouter = require("express").Router();
const { register, login, logout, refreshToken } = require("../controllers/authController");

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.put("/logout", logout);
authRouter.put('/refreshtoken' , refreshToken)

module.exports = authRouter;
