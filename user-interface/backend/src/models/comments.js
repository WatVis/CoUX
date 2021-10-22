const mongoose = require("mongoose");
const validator = require("validator");

const commentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    discussionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
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
    severity: {
      type: Number,
      required: true,
    },
    pinned: {
      type: Boolean,
      require: true,
      default: false,
    },
    user: {
      email: {
        type: String,
        required: true,
        validate(value) {
          if (!validator.isEmail(value)) {
            throw new Error("Email is invalid");
          }
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
