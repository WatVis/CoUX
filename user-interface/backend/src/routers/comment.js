const express = require("express");
const Video = require("../models/videos");
const router = new express.Router();

router.get("/comments/:videoId", async (req, res) => {
  let videoId = req.params.videoId;
  const video = await Video.findById(videoId).populate("comments").exec();

  try {
    const comments = video.comments;
    res.status(200).send(comments);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
