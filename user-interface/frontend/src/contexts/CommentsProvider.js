import React, { useContext, useState, useCallback, useEffect } from "react";
import * as R from "ramda";
import { message } from "antd";
import axios from "axios";
import { useProject } from "./ProjectProvider";
import { useSocket } from "./SocketProvider";
import { host } from "../actions/consts/host";
import { useLocalStorage } from "../utils/useLocalStorage";

const CommentsContext = React.createContext();

export function useComments() {
  return useContext(CommentsContext);
}

export function CommentsProvider({ user, children }) {
  const [filters, setFilters] = useState({
    message: "",
    heuristic: [],
    participants: [],
    severity: [],
    state: [],
  });
  const [sourceDiscussions, setSourceDiscussions] = useState([]);
  const [sourceComments, setSourceComments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedDisc, setSelectedDisc] = useState(undefined);
  const socket = useSocket();
  const { time, segmentId, project } = useProject();
  const [newDiscs, setNewDiscs] = useLocalStorage(
    `coux-${user["_id"]}-new-discs`
  );

  useEffect(() => {
    // const { message, heuristic, participants, severity, state } = filters;
    // const filteredComments = filterByText(sourceComments, message);
    // const noneMessageFilters = { ...filters };
    // delete noneMessageFilters.message;
    // const discussionIdsByComments = R.map(
    //   R.prop("discussion"),
    //   filteredComments
    // );
    // const discussionsByComments = R.filter(
    //   R.pipe(R.prop("_id"), R.includes(R.__, discussionIdsByComments)),
    //   sourceDiscussions
    // );
    // setDiscussions(
    //   filterBySeverity(
    //     filterByParticipants(
    //       filterByStatus(
    //         filterByHeuristic(discussionsByComments, heuristic),
    //         state
    //       ),
    //       participants
    //     ),
    //     severity
    //   )
    // );

    setDiscussions(filterDeletedDiscussions(sourceDiscussions));
    setComments(sourceComments);
  }, [sourceDiscussions, sourceComments, filters]);

  const filterDeletedDiscussions = (discussions) => {
    const result = R.filter(
      R.pipe(R.propEq("deleted", true), R.not),
      discussions
    );
    return result;
  };

  const filterByText = (comments, message) => {
    return comments.filter((comment) =>
      R.toLower(R.propOr("", "message", comment)).includes(
        message.toLowerCase()
      )
    );
  };

  const filterByHeuristic = (discussions, heuristic) => {
    const result = R.isEmpty(heuristic)
      ? discussions
      : R.filter(
          R.pipe(R.prop("heuristic"), R.includes(R.__, heuristic)),
          discussions
        );
    return result;
  };

  const filterByStatus = (discussions, status) => {
    const result = R.isEmpty(status)
      ? discussions
      : R.filter(
          R.pipe(R.prop("status"), R.includes(R.__, status)),
          discussions
        );
    return result;
  };

  const filterByParticipants = (discussions, participants) => {
    const result = R.isEmpty(participants)
      ? discussions
      : R.filter(
          R.pipe(
            R.prop("participants"),
            R.map(R.prop("email")),
            R.any((el) => R.any(R.equals(el), participants))
          ),
          discussions
        );
    // return result;
    return discussions;
  };

  const filterBySeverity = (discussions, severity) => {
    const numericalSeverity = R.map((el) => parseInt(el, 10), severity);

    const result = R.isEmpty(severity)
      ? discussions
      : R.filter(
          R.pipe(
            R.prop("severity"),
            R.any((el) => R.any(R.equals(el), numericalSeverity))
          ),
          discussions
        );
    return result;
  };

  const addDiscsToUpdatedList = (disId) => {
    setNewDiscs((prevDiscs) => {
      const discs = prevDiscs ? [...prevDiscs] : [];
      discs.push(disId);
      const finalDiscs = R.uniq(discs);
      return finalDiscs;
    });
  };

  const removeDiscsFromUpdatedList = (disId) => {
    setNewDiscs((prevDiscs) => {
      const discs = prevDiscs ? [...prevDiscs] : [];
      const finalDiscs = R.filter((el) => el != disId, discs);
      return finalDiscs;
    });
  };

  const addComment = useCallback(
    (comment) => {
      if (comment.author !== user._id) {
        addDiscsToUpdatedList(comment.discussion);
      }
      setSourceComments((prevComments) => {
        return [...prevComments, comment];
      });
    },
    [setSourceComments]
  );

  const addDiscussion = useCallback(
    (discussion) => {
      const isAuthor = R.any(
        (el) => el.id === user._id,
        discussion.participants
      );
      if (!isAuthor) {
        addDiscsToUpdatedList(discussion._id);
      }
      setSourceDiscussions((prevDiscussions) => {
        return prevDiscussions.concat(discussion);
      });
    },
    [setSourceDiscussions]
  );

  const updateDiscussion = useCallback(
    (discussion) => {
      setSourceDiscussions((prevDiscussions) => {
        return prevDiscussions.map((el) => {
          if (el["_id"] === discussion["_id"]) {
            return discussion;
          }
          return el;
        });
      });
    },
    [setSourceDiscussions]
  );

  const updateCommentsOnMerge = useCallback(
    (source, destination, newDisc) => {
      setSourceComments((prevComments) => {
        return prevComments.map((el) => {
          if (el.discussion === source || el.discussion === destination) {
            const discussionHistory = R.append(
              el.discussion,
              el.discussionHistory
            );
            return { ...el, discussion: newDisc, discussionHistory };
          }
          return el;
        });
      });
    },
    [setSourceComments]
  );
  const unmergeCommentsOnMerge = useCallback(
    (source, destination, oldDiscId, commentUnmergeState, UNMERGE_LIST) => {
      setSourceComments((prevComments) => {
        return prevComments.map((el) => {
          console.log(el.discussionHistory);
          if (el.discussionHistory.includes(source)) {
            return { ...el, discussion: source };
          } else if (el.discussionHistory.includes(destination)) {
            return { ...el, discussion: destination };
          } else if (el.discussion === oldDiscId) {
            const commentDisc = UNMERGE_LIST[commentUnmergeState];
            return { ...el, discussion: commentDisc };
          }
          return el;
        });
      });
    },
    [setSourceComments]
  );

  const updateCommentPin = useCallback(
    (id) => {
      console.log(id);
      setSourceComments((prevComments) => {
        return prevComments.map((el) => {
          if (el["_id"] === id) {
            console.log(el.pinned);
            return { ...el, pinned: !el.pinned };
          }
          return el;
        });
      });
    },
    [setSourceComments]
  );

  const removeProblem = useCallback(
    (problemId) => {
      setSourceDiscussions((prevProblems) => {
        const problems = prevProblems.filter(
          (problem) => problem["_id"] !== problemId
        );
        return problems;
      });
    },
    [setSourceDiscussions]
  );

  useEffect(() => {
    async function getDiscussions() {
      const { data } = await axios.get(`${host}/discussions/${project["_id"]}`);
      setSourceDiscussions(data);
    }
    getDiscussions();
  }, []);

  useEffect(() => {
    async function getComments() {
      const { data } = await axios.get(`${host}/comments/${project["_id"]}`);
      setSourceComments(data);
    }
    getComments();
  }, []);

  useEffect(() => {
    if (socket == null) return;

    socket.on("receive-comment", addComment);
    socket.on("update-comment-pin", updateCommentPin);
    socket.on("receive-discussion", addDiscussion);
    socket.on("update-discussion", updateDiscussion);
    socket.on("remove-problem", removeProblem);
    socket.on("update-comments-problem", updateCommentsOnMerge);
    socket.on("unmerge-comments-problem", unmergeCommentsOnMerge);

    return () => socket.off("receive-comment");
  }, [socket, addComment, addDiscussion, updateDiscussion]);

  function createComment(data) {
    socket.emit("send-comment", {
      ...data,
      author: user["_id"],
      segment: segmentId,
      video: project["_id"],
      user: { email: user.email },
      discussion: selectedDisc,
    });
  }

  function createUXProblem(data) {
    socket.emit("send-problem", {
      ...data,
      author: user["_id"],
      segment: segmentId,
      video: project["_id"],
      user: { email: user.email },
      discussion: selectedDisc,
    });
  }

  function mergeUXProblems(source, destination) {
    socket.emit("merge-problem", {
      source,
      destination,
    });
  }

  function unmergeUXProblems(discId, source, destination, commentUnmergeState) {
    socket.emit("unmerge-problem", {
      discId,
      source,
      destination,
      commentUnmergeState,
    });
  }

  function togglePinComment(id) {
    socket.emit("toggle-pin-comment", {
      id,
    });
  }

  function setFinalSeverity(severity, userId, userEmail, discId) {
    socket.emit("set-final-severity", {
      severity,
      userId,
      userEmail,
      discId,
    });
  }

  function deleteUXProblem(discId) {
    socket.emit("delete-ux-problem", {
      discId,
    });
  }

  function editHeuristicsUXProblem(discId, heuristics) {
    socket.emit("edit-heuristics-ux-problem", {
      discId,
      heuristics,
    });
  }

  const resetFilters = () => {
    setFilters({
      message: "",
      heuristic: [],
      participants: [],
      severity: [],
      state: [],
    });
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
        createComment,
        discussions,
        selectedDisc,
        setSelectedDisc,
        userEmail: user.email,
        userId: user["_id"],
        createUXProblem,
        mergeUXProblems,
        unmergeUXProblems,
        togglePinComment,
        setFinalSeverity,
        deleteUXProblem,
        filters,
        setFilters,
        resetFilters,
        sourceDiscussions,
        newDiscs,
        removeDiscsFromUpdatedList,
        editHeuristicsUXProblem,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}
