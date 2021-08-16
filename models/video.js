const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["music", "gaming", "sports"],
      required: false,
    },
    viewsCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

videoSchema.index({ title: "text", tags: "text", description: "text" });

const populateUser = function (next) {
  try {
    this.populate("user");

    next();
  } catch (err) {
    console.log(`error populating user in video model : ${err}`);
  }
};

videoSchema.pre("findOne", populateUser);
videoSchema.pre("find", populateUser);

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
