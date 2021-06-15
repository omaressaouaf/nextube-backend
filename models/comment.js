const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    repliedTo : {type : Schema.Types.ObjectId , ref :'Comment' }
  },
  { timestamps: true }
);

commentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
