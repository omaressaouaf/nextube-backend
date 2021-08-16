const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    },
    refreshToken: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.virtual("subscribersCount", {
  ref: "Subscription",
  localField: "_id",
  foreignField: "subscribedTo",
  count: true,
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
    delete ret.refreshToken;
  },
});

const populateSubscribersCount = function (next) {
  try {
    this.populate("subscribersCount");
    next();
  } catch (err) {
    console.log(`error populating subscribers count in user model : ${err}`);
  }
};

userSchema.pre("findOne", populateSubscribersCount);
userSchema.pre("find", populateSubscribersCount);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
