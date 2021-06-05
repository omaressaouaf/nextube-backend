const createError = require("http-errors");
const User = require("../models/User");
const registerSchema = require("../validation/registerSchema");
const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { channelName, email, password } = await registerSchema.validateAsync(req.body);
    if (await User.findOne({ email })) throw createError.Conflict("email is already used");

    const user = new User({ channelName, email, password });
    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authService.attemptLogin(email, password);
    
    const accessToken = await authService.createAccessToken(user);
    const refreshToken = await authService.createRefreshToken(user);

    authService.setRefreshTokenCookie(res , refreshToken)

    res.json({ accessToken , user });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createError.BadRequest();

    const user = await authService.verifyRefreshToken(refreshToken);

    await User.findByIdAndUpdate(user.id, { refreshToken: null });
    authService.setRefreshTokenCookie(res , '' , 0)

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createError.BadRequest();

    const user = await authService.verifyRefreshToken(refreshToken);

    const newAccessToken = await authService.createAccessToken(user);
    const newRefreshToken = await authService.createRefreshToken(user);

    authService.setRefreshTokenCookie(res , newRefreshToken)

    res.json({ accessToken: newAccessToken, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, refreshToken };
