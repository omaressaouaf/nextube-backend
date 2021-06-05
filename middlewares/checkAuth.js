const createError = require("http-errors");
const authService = require("../services/authService");

const checkAuth = async (req, _, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      throw createError.Unauthorized()
    }
    const accessToken = req.headers.authorization.split("Bearer ")[1];
    const user = await authService.verifyAccessToken(accessToken);
    req.user = user;
    return next();
  } catch (err) {
    next(err);
  }
};

module.exports = checkAuth;
