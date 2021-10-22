const express = require("express");
const Heuristic = require("../models/heuristics");
const router = new express.Router();

router.get("/heuristics", async (req, res) => {
  const heuristics = await Heuristic.find({});

  try {
    res.status(200).send(heuristics);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
