"use strict";

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB);

const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

module.exports = function (app) {
  app.route("/api/threads/:board")
    .post(threadController.createThread)
    .get(threadController.readThreads)
    .put(threadController.updateThread)
    .delete(threadController.deleteThread);

  app.route("/api/replies/:board")
    .post(replyController.createReply)
    .get(replyController.readReply)
    .put(replyController.updateReply)
    .delete(replyController.deleteReply);
};
