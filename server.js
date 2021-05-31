require("dotenv").config();
require("./helpers/initMongodb");
const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const authRouter = require("./routes/auth");

/* App setup */
const app = express();
app.use(express.json());
app.use(morgan("dev"));

/* Routes */
app.use("/auth", authRouter);

/* Catch middlewares for all routes  (Error handling) */
app.use((req, res, next) => {
  next(createError.NotFound());
});
app.use((err, _, res, next) => {
  let message = status === 500 ? "Internal server error" : err.message;
  let status = err.status || 500;
  if (err.isJoi) status = 422;

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
