const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dislikeSchema = new Schema(
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
dislikeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

dislikeSchema.index({user : 1 , video : 1} , {unique : true})

const Dislike = mongoose.model("Dislike", dislikeSchema);

module.exports = Dislike;
