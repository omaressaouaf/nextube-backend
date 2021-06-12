require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const createError = require("http-errors");
const authRouter = require("./routes/auth");
const videosRouter = require("./routes/videos");
const initMongodb = require("./helpers/db");
const checkAuth = require("./middlewares/checkAuth");

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
app.get("/", checkAuth, (req, res) => {
  return res.json({ refreshtoken: req.cookies["jid"] });
});

/* Catch middlewares for all routes  (Error handling) */
app.use((req, res, next) => {
  next(createError.NotFound());
});
app.use((err, _, res, next) => {
  console.log(err.message);

  let status = err.status;

  if (!err.status) status = 500;
  if (err.isJoi) status = 422;
  if (err.kind === "ObjectId") status = 404;

  let message = err.message;
  if (status === 500) message = "Internal Server Error";
  if (status === 404) message = "Not Found";

  res.status(status);
  res.send({ message });
  next();
});

/* Run Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
