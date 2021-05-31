require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const authRouter = require("./routes/auth");

// app setup and  middlewares
const app = express();
app.use(morgan("dev"));

/* Routes */
app.use("/auth", authRouter);

/* Catch middlewares for all routes  (Error handling) */
app.use((req, res, next) => {
  next(createError.NotFound());
});
app.use((err, _, res, next) => {
  const status = err.status || 500;
  res.status(status);
  res.json({
    error: {
      status: status,
      message: err.message,
    },
  });
  next();
});

/* Run Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

