const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    subscribedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

subscriptionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

subscriptionSchema.index({ subscriber: 1, subscribedTo: 1 }, { unique: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
