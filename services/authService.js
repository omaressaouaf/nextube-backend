const createError = require("http-errors");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const accessTokenLifeTime = 1000 * 60 * 15;
const refreshTokenLifeTime = 1000 * 60 * 60 * 24 * 7;

const attemptLogin = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw createError.Unauthorized("No user with such credentials");

  if (!(await bcrypt.compare(password, user.password))) {
    throw createError.Unauthorized("No user with such credentials");
  }

  return user;
};

const createAccessToken = user => {
  return new Promise((resolve, reject) => {
    jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" }, (err, token) => {
      if (err) {
        console.log(err.message);
        return reject(createError.InternalServerError());
      }
      return resolve(token);
    });
  });
};

const verifyAccessToken = accessToken => {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        console.log(err.message);
        return reject(createError.Unauthorized(err.name === "TokenExpiredError" ? 'access token expired' : "Unauthorized"));
      }
      const { iat, exp, ...user } = payload;
      return resolve(user);
    });
  });
};

const createRefreshToken = user => {
  return new Promise((resolve, reject) => {
    jwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" }, async (err, token) => {
      if (err) {
        console.log(err.message);
        return reject(createError.InternalServerError());
      }
      await User.findByIdAndUpdate(user.id, { refreshToken: token });

      return resolve(token);
    });
  });
};

const verifyRefreshToken = refreshToken => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        console.log(err.message);
        return reject(createError.Unauthorized(err.name === "TokenExpiredError" ? 'refresh token expired' : "Unauthorized"));
      }
      const user = await User.findById(payload.id);
      if (user.refreshToken !== refreshToken) reject(createError.Unauthorized());

      return resolve(user);
    });
  });
};
const setRefreshTokenCookie = async (res, refreshToken, maxAge =refreshTokenLifeTime) => {
  res.cookie("refreshToken", refreshToken, {
    maxAge,
    httpOnly: true,
  });
};



module.exports = {
  attemptLogin,
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  accessTokenLifeTime
};
