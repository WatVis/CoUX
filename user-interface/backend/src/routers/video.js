const express = require("express");
const R = require("ramda");
const User = require("../models/users");
const auth = require("../middleware/auth");
const router = new express.Router();
const Video = require("../models/videos");

router.get("/videos", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("projects").exec();
    const videos = user.projects;
    res.status(200).send(videos);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/videos", async (req, res) => {
  const video = new Video(req.body);

  try {
    await video.save();
    await video.generateThumbnail();
    video.generatePreview();

    res.status(201).send({ video });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/videos/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      throw new Error();
    }

    const isPrticipant = R.any(
      (el) => req.body.user_id == el,
      video.participants
    );

    if (!isPrticipant) {
      video.participants = video.participants.concat(req.body.user_id);
      await video.save();
    }

    res.status(201).send({ video });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/videos/:id/preview", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || !video.preview) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");

    res.status(200).send(video.preview);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
