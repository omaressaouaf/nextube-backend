const History = require("../models/history");
const ObjectId = require("mongoose").Types.ObjectId;

const getHistoriesPerDay = async (userId, videosIds = null) => {
  return await History.aggregate([
    {
      $match: {
        user: ObjectId(userId),
        video: videosIds ? { $in: videosIds } : { $ne: null },
      },
    },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        updatedAtDay: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        video: "$video",
        updatedAt: "$updatedAt",
      },
    },
    { $group: { _id: { updatedAtDay: "$updatedAtDay" }, histories: { $push: "$$ROOT" } } },
    { $unwind: "$histories" },
    {
      $lookup: {
        from: "videos",
        localField: "histories.video",
        foreignField: "_id",
        as: "histories.video",
      },
    },
    { $unwind: "$histories.video" },
    {
      $lookup: {
        from: "users",
        localField: "histories.video.user",
        foreignField: "_id",
        as: "histories.video.user",
      },
    },
    { $unwind: "$histories.video.user" },
    {
      $group: {
        _id: "$_id",
        histories: { $push: "$histories" },
      },
    },
    { $project: { _id: 0, updatedAtDay: "$_id.updatedAtDay", histories: "$histories" } },
    { $sort: { updatedAtDay: -1 } },
  ]);
};

module.exports = { getHistoriesPerDay };
