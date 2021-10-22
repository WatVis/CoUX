const express = require("express");
const mongoose = require("mongoose");
const router = new express.Router();
const R = require("ramda");
const auth = require("../middleware/auth");
const User = require("../models/users");
const Video = require("../models/videos");
const Heuristic = require("../models/heuristics");
const Discussion = require("../models/discussions");
const Comment = require("../models/comments");
const Log = require("../models/logs");

const isAdmin = (el) => el.isAdmin;

router.get("/study/videos", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const videos = await Video.find({});
      res.status(200).send(videos);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/users", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const users = await User.find({});
      res.status(200).send(users);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/users/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const user = await User.findById(req.params.userId);
      res.status(200).send(user);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/annotations", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const discussions = await Discussion.find({});
      res.status(200).send(discussions);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/annotations/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const discussions = await Discussion.find({
        participants: {
          $elemMatch: { id: req.params.userId },
        },
      });
      res.status(200).send(discussions);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/comments", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const comments = await Comment.find({});
      res.status(200).send(comments);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/comments/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const comments = await Comment.find({
        author: req.params.userId,
      });
      res.status(200).send(comments);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/logs", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const logs = await Log.find({});
      res.status(200).send(logs);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/logs/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const logs = await Log.find({
        userId: req.params.userId,
      });
      res.status(200).send(logs);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

module.exports = router;
