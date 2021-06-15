const mongoose = require("mongoose");

const initMongodb = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });

  mongoose.connection.on("connected", () => {
    console.log("Connection to mongodb succeeded");
  });
  mongoose.connection.on("error", err => {
    console.log("Connection to mongodb failed . Error is : " + err);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("Connection to mongodb disconnected");
  });

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    process.exit();
  });
}
module.exports = initMongodb
