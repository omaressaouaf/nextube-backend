require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const initMongodb = require("./helpers/db");
const createError = require("http-errors");
const authRouter = require("./routes/auth");
const videosRouter = require("./routes/videos");
const subscriptionsRouter = require("./routes/subscriptions");
const historiesRouter = require("./routes/histories");
const watchLatersRouter = require("./routes/watchLaters");
const channelsRouter = require("./routes/channels");
const checkAuth = require("./middlewares/checkAuth");
const settingsRouter = require("./routes/settings");

/* App setup */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
initMongodb();

/* Routes */
app.use("/auth", authRouter);
app.use("/videos", videosRouter);
app.use("/channels", channelsRouter);
app.use("/", checkAuth);
app.use("/subscriptions", subscriptionsRouter);
app.use("/histories", historiesRouter);
app.use("/watchlaters", watchLatersRouter);
app.use("/settings", settingsRouter);

/* Catch middlewares for all routes  (Error handling) */
app.use((req, res, next) => {
  next(createError.NotFound());
});
app.use((err, _, res, next) => {
  console.log(err.message);

  let status = err.status ?? 500;

  if (err.isJoi) status = 422; // Joi validation
  if (err.kind === "ObjectId") status = 404; //Mongo failed to convert given object id
  if (err.code == 11000) status = 409; //Duplicate Key

  let message = err.message;
  if (status === 500) message = "Internal Server Error";
  if (status === 404) message = "Not Found";
  // if (status === 409) message = "Conflict";

  res.status(status);
  res.send({ message });
  next();
});

/* Run Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
