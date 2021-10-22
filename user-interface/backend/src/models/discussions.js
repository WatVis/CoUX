const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      required: true,
    },
    mergeHistory: [
      {
        source: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        destination: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      required: true,
    },
    participants: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        email: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          required: true,
        },
      },
    ],
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    time: {
      type: Number,
      required: true,
    },
    comment_count: {
      type: Number,
      default: 1,
      required: true,
    },
    heuristic: [
      {
        type: String,
        required: true,
      },
    ],
    finalHeuristic: {
      heuristic: {
        type: String,
      },
      user: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        email: {
          type: String,
        },
      },
    },
    severity: [
      {
        type: Number,
        required: true,
      },
    ],
    finalSeverity: {
      severity: {
        type: Number,
      },
      user: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        email: {
          type: String,
        },
      },
    },
    deleted: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

discussionSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "discussion",
});

const Discussion = mongoose.model("Discussion", discussionSchema);

module.exports = Discussion;
