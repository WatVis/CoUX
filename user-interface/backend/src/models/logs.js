const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    videoTime: {
      type: Number,
      required: true,
    },
    isColab: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
