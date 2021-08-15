const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const watchLaterSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  { timestamps: true }
);

watchLaterSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});
watchLaterSchema.index({ video: 1, user: 1 }, { unique: true });

const WatchLater = mongoose.model("WatchLater", watchLaterSchema);

module.exports = WatchLater;
