const createError = require("http-errors");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const attemptLogin = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw createError.Unauthorized("No user with such email");

  if (!(await bcrypt.compare(password, user.password))) {
    throw createError.Unauthorized("Wrong password");
  }

  return user;
};

const createAccessToken = user => {
  return new Promise((resolve, reject) => {
    jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" }, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

const verifyAccessToken = accessToken => {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        console.log(err.message);
        reject(createError.Unauthorized(err.name === "TokenExpiredError" ? err.message : "Unauthorized"));
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
        reject(createError.InternalServerError());
      }
      await User.findByIdAndUpdate(user.id, { refreshToken: token });

      resolve(token);
    });
  });
};

const verifyRefreshToken = refreshToken => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        console.log(err.message);
        reject(createError.Unauthorized(err.name === "TokenExpiredError" ? err.message : "Unauthorized"));
      }
      const user = await User.findById(payload.id);
      if (user.refreshToken !== refreshToken) reject(createError.Unauthorized());

      return resolve(user);
    });
  });
};
const setRefreshTokenCookie = async (res, refreshToken , maxAge =1000 * 60 * 60  ) => {
  res.cookie("refreshToken", refreshToken, {
    maxAge,
    httpOnly: true,
    path: "/auth/",
  });
};

module.exports = {
  attemptLogin,
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
};
