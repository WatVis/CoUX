const express = require("express");
const Video = require("../models/videos");
const auth = require("../middleware/auth");
const router = new express.Router();

router.get("/discussions/:videoId", async (req, res) => {
  let videoId = req.params.videoId;
  const video = await Video.findById(videoId).populate("discussions").exec();

  try {
    const discussions = video.discussions;
    res.status(200).send(discussions);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
