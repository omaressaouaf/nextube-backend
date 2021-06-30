const Video = require("../models/video");

const getSubscriptionsWithLatestVideos = async subscribedToArray => {
  return await Video.aggregate([
    { $sort: { createdAt: 1 } },
    { $match: { user: { $in: subscribedToArray } } },
    {
      $group: {
        _id: "$user",
        videos: { $push: "$$ROOT" },
      },
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $limit: 10 },
    // Modify the videos array to contain only 1 . and modify the user from an array to an object
    { $unwind: "$user" },
    {
      $project: { videos: { $slice: ["$videos", 1] }, user: "$user" },
    },
  ]);
};

module.exports = { getSubscriptionsWithLatestVideos };
