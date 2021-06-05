require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const authRouter = require("./routes/auth");
const initMongodb = require("./helpers/db");
const checkAuth = require("./middlewares/checkAuth");

/* App setup */
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
initMongodb();

/* Routes */
app.use("/auth", authRouter);
app.get('/' , checkAuth  , (req , res) => {
  return res.json({refreshtoken : req.cookies['jid']})
})

/* Catch middlewares for all routes  (Error handling) */
app.use((req, res, next) => {
  next(createError.NotFound());
});
app.use((err, _, res, next) => {
  console.log(err.message);

  let status = err.status || 500;
  if (err.isJoi) status = 422;
  let message = status === 500 ? "Internal server error" : err.message;

  res.status(status);
  res.json({
    error: {
      status,
      message,
    },
  });
  next();
});

/* Run Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
