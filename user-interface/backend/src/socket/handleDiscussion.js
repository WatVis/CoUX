const { generateComment } = require("../utils/comments");
const R = require("ramda");
const Comment = require("../models/comments");
const Discussion = require("../models/discussions");
const Heuristic = require("../models/heuristics");
const Log = require("../models/logs");

module.exports = function (socket, io) {
  const socketId = socket.handshake.query.projectId;
  socket.join(socketId);
  console.log(`new connection id=${socketId}!`);

  socket.on("send-comment", async (data) => {
    const { author, user, severity } = data;
    let discussionId = data.discussion;

    const discussion = await Discussion.findById(discussionId);
    const isParticipant = discussion.participants.some(
      (el) => el.id.toString() === author
    );
    const duplicateSeverity = discussion.severity.includes(severity);
    if (!duplicateSeverity) {
      discussion.severity = discussion.severity.concat(severity);
    }
    await discussion.updateOne({ $inc: { comment_count: 1 } });
    if (!isParticipant) {
      discussion.participants = discussion.participants.concat({
        id: author,
        status: "IN_PROGRESS",
        email: user.email,
      });
    }
    await discussion.save();
    io.to(socketId).emit("update-discussion", discussion);

    const comment = new Comment({
      ...data,
      discussion: discussionId,
    });
    await comment.save();
    io.to(socketId).emit("receive-comment", comment);
  });

  socket.on("toggle-pin-comment", async ({ id }) => {
    const comment = await Comment.findById(id);

    comment.pinned = !comment.pinned;
    comment.save();
    io.to(socketId).emit("update-comment-pin", id);
  });

  socket.on("send-problem", async (data) => {
    const {
      author,
      segment,
      video,
      discussion,
      user,
      time,
      heuristic,
      severity,
    } = data;
    let discussionId = discussion;
    const discData = {
      status: "IN_PROGRESS",
      participants: [{ id: author, status: "IN_PROGRESS", email: user.email }],
      video,
      segment,
      heuristic: [heuristic],
      severity: [severity],
      isActive: true,
      mergeHistory: [],
      deleted: false,
    };
    if (time != null) {
      discData.time = time;
    }
    const newDiscussion = new Discussion({
      ...discData,
    });
    await newDiscussion.save();
    io.to(socketId).emit("receive-discussion", newDiscussion);
    discussionId = newDiscussion["_id"];

    if (data.message) {
      const comment = new Comment({
        message: data.message,
        author,
        segment,
        video,
        discussion,
        user,
        discussion: discussionId,
        severity,
        pinned: true,
      });
      await comment.save();
      io.to(socketId).emit("receive-comment", comment);
    }
  });

  socket.on("merge-problem", async ({ source, destination }) => {
    const sourceDiscussion = await Discussion.findById(source);
    const destDiscussion = await Discussion.findById(destination);
    const destDisc = await Discussion.findById(destination)
      .populate("comments")
      .exec();
    const sourceDisc = await Discussion.findById(source)
      .populate("comments")
      .exec();
    const sourceComments = sourceDisc.comments;
    const destComments = destDisc.comments;

    const mergedParticipants = destDiscussion.participants.concat(
      sourceDiscussion.participants
    );
    const nonDuplicateParticipants = R.uniqBy(R.prop("id"), mergedParticipants);
    nonDuplicateParticipants.forEach((el) => {
      el.status = "IN_PROGRESS";
    });
    const mergedCommentCount =
      destDiscussion.comment_count + sourceDiscussion.comment_count;
    const mergedSeverity = destDiscussion.severity.concat(
      sourceDiscussion.severity
    );

    const mergedHeuristic = destDiscussion.heuristic.concat(
      sourceDiscussion.heuristic
    );

    const mergeHistory = destDiscussion.mergeHistory.concat(
      sourceDiscussion.mergeHistory
    );

    const discData = {
      video: destDiscussion.video,
      segment: destDiscussion.segment,
      heuristic: R.uniq(mergedHeuristic),
      time: destDiscussion.time,
      status: "IN_PROGRESS",
      participants: nonDuplicateParticipants,
      isActive: true,
      mergeHistory: [
        {
          source: sourceDiscussion._id,
          destination: destDiscussion._id,
        },
        ...mergeHistory,
      ],
      severity: R.uniq(mergedSeverity),
      comment_count: mergedCommentCount,
      deleted: destDiscussion.deleted,
    };

    const newDiscussion = new Discussion(discData);
    await newDiscussion.save();

    sourceComments.forEach((comment) => {
      comment.discussionHistory = R.uniq(
        comment.discussionHistory.concat(comment.discussion)
      );
      comment.discussion = newDiscussion["_id"];
      comment.save();
    });
    destComments.forEach((comment) => {
      comment.discussionHistory = R.uniq(
        comment.discussionHistory.concat(comment.discussion)
      );
      comment.discussion = newDiscussion["_id"];
      comment.save();
    });

    sourceDiscussion.isActive = false;
    destDiscussion.isActive = false;

    await destDiscussion.save();
    await sourceDiscussion.save();

    io.to(socketId).emit("receive-discussion", newDiscussion);
    io.to(socketId).emit("update-discussion", destDiscussion);
    io.to(socketId).emit("update-discussion", sourceDiscussion);
    io.to(socketId).emit(
      "update-comments-problem",
      source,
      destination,
      newDiscussion["_id"]
    );
  });

  socket.on(
    "unmerge-problem",
    async ({ discId, source, destination, commentUnmergeState }) => {
      const UNMERGE_SOURCE = 0;
      const UNMERGE_DEST = 1;
      const UNMERGE_IGNORE = 2;
      const UNMERGE_LIST = [source, destination, undefined];

      const sourceDiscussion = await Discussion.findById(source);
      const destDiscussion = await Discussion.findById(destination);
      const disc = await Discussion.findById(discId)
        .populate("comments")
        .exec();
      const comments = disc.comments;

      comments.forEach((comment) => {
        const discHistory = comment.discussionHistory;
        if (discHistory.includes(source)) {
          comment.discussion = source;
          comment.save();
        } else if (discHistory.includes(destination)) {
          comment.discussion = destination;
          comment.save();
        } else {
          if (commentUnmergeState === UNMERGE_IGNORE) {
            comment.remove();
          } else if (commentUnmergeState === UNMERGE_SOURCE) {
            comment.discussion = source;
            if (!sourceDiscussion.severity.includes(comment.severity)) {
              sourceDiscussion.severity = sourceDiscussion.severity.concat(
                comment.severity
              );
            }
            comment.save();
          } else if (commentUnmergeState === UNMERGE_DEST) {
            comment.discussion = destination;
            if (!destDiscussion.severity.includes(comment.severity)) {
              destDiscussion.severity = destDiscussion.severity.concat(
                comment.severity
              );
            }
            comment.save();
          }
        }
      });

      sourceDiscussion.isActive = true;
      destDiscussion.isActive = true;

      await destDiscussion.save();
      await sourceDiscussion.save();
      await disc.remove();

      io.to(socketId).emit("update-discussion", sourceDiscussion);
      io.to(socketId).emit("update-discussion", destDiscussion);
      io.to(socketId).emit("remove-problem", discId);
      io.to(socketId).emit(
        "unmerge-comments-problem",
        source,
        destination,
        discId,
        commentUnmergeState,
        UNMERGE_LIST
      );
    }
  );

  socket.on(
    "set-final-severity",
    async ({ severity, userId, userEmail, discId }) => {
      const discussion = await Discussion.findById(discId);
      const user = { id: userId, email: userEmail };
      discussion.finalSeverity = {
        severity,
        user,
      };
      const isParticipant = discussion.participants.some(
        (el) => el.id.toString() === userId
      );
      if (!isParticipant) {
        discussion.participants = discussion.participants.concat({
          id: userId,
          status: "IN_PROGRESS",
          email: userEmail,
        });
      }
      discussion.status = "FINAL";
      discussion.participants.forEach((el) => {
        el.status = "IN_PROGRESS";
      });

      discussion.save();
      io.to(socketId).emit("update-discussion", discussion);
    }
  );

  socket.on("delete-ux-problem", async ({ discId }) => {
    const discussion = await Discussion.findById(discId);
    discussion.deleted = true;
    discussion.save();
    discussion.mergeHistory.forEach(async ({ source, destination }) => {
      const sourceDisc = await Discussion.findById(source);
      sourceDisc.deleted = true;
      sourceDisc.save();
      const destinationDisc = await Discussion.findById(destination);
      destinationDisc.deleted = true;
      destinationDisc.save();
      io.to(socketId).emit("update-discussion", sourceDisc);
      io.to(socketId).emit("update-discussion", destinationDisc);
    });
    io.to(socketId).emit("update-discussion", discussion);
  });

  socket.on("edit-heuristics-ux-problem", async ({ discId, heuristics }) => {
    const discussion = await Discussion.findById(discId);
    discussion.heuristic = heuristics;
    await discussion.save();
    io.to(socketId).emit("update-discussion", discussion);
  });

  socket.on("add-heuristic", async ({ heuristic }) => {
    const heur = new Heuristic(heuristic);
    await heur.save();
    io.to(socketId).emit("receive-heuristic", heur);
  });

  socket.on("delete-heuristic", async ({ heuristicId }) => {
    const discussion = await Heuristic.findById(heuristicId);
    await discussion.remove();
    io.to(socketId).emit("remove-heuristic", heuristicId);
  });

  socket.on("log", async (data) => {
    const newLog = new Log(data);
    newLog.save();
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
};
