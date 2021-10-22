import React, { useEffect, useRef } from "react";
import { Avatar } from "antd";
import { PushpinOutlined } from "@ant-design/icons";
import { marks, severityToMark, contrast } from "../utils/utils";
import * as R from "ramda";
import moment from "moment";
import randomColor from "randomcolor";
import { useTrack } from "../contexts/TrackProvider";
import { useComments } from "../contexts/CommentsProvider";
import { useProject } from "../contexts/ProjectProvider";
import Agreement from "./Agreement";
import "../styles/components/comment-list.scss";

const colorMap = [
  "#f53e4c",
  "#fdae61",
  "#ffffbf",
  "#abd9e9",
  "#2c7bb6",
].reverse();

export const CommentList = ({ isBlur }) => {
  const {
    comments,
    selectedDisc,
    userEmail,
    userId,
    togglePinComment,
    setFinalSeverity,
    discussions,
    removeDiscsFromUpdatedList,
  } = useComments();
  const { trackEvent } = useTrack();
  const { isColab } = useProject();
  const disc = R.find(R.propEq("_id", selectedDisc), discussions);
  const isActiveDisc = disc.isActive;
  const isNotDecided = (n) => n === 0;
  const nonTBDSverity = R.reject(isNotDecided, disc.severity);
  const getMark = (el) => marks[severityToMark(el)];
  const showTimeline = nonTBDSverity.length > 0 && isColab && isActiveDisc;
  const discComments = R.filter((el) => {
    const isInDisc = R.propEq("discussion", selectedDisc, el);
    const isInHistory = el.discussionHistory.includes(selectedDisc);
    return isInDisc || isInHistory;
  }, comments);
  const filteredComments = isColab
    ? discComments
    : R.filter(R.propEq("author", userId), discComments);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(scrollToBottom, [comments]);

  useEffect(() => {
    removeDiscsFromUpdatedList(selectedDisc);
  }, [selectedDisc]);

  const pinComment = (id, pinned) => {
    togglePinComment(id);
    trackEvent({
      section: "comments-list",
      action: "click",
      pinUnpin: pinned ? "unpin" : "pin",
      commentId: id,
      discId: selectedDisc,
    });
  };

  let severityStack = [];

  return (
    <div className={`comment-list ${isBlur ? "blured" : ""}`}>
      <div className="comment-list-wrapper">
        {filteredComments.map((comment) => {
          const severity = getMark(comment.severity);
          const isNonTBD = severity !== marks["0"];
          const isNewSeverity =
            !severityStack.includes(comment.severity) && isNonTBD;
          if (isNewSeverity) {
            severityStack.push(comment.severity);
          }
          return (
            <div className={`comment-card ${comment.pinned ? "pinned" : ""}`}>
              <div
                className={`child${
                  showTimeline ? " has-severity-conflict" : ""
                }`}
              >
                <div className="comment-card-avatar">
                  <Avatar
                    style={{
                      backgroundColor: randomColor({
                        seed: comment.user.email,
                      }),
                      verticalAlign: "middle",
                    }}
                    size="medium"
                  >
                    {comment.user.email.substring(0, 2).toUpperCase()}
                  </Avatar>
                </div>
                <div className="comment-card-container">
                  <div className="comment-card-header">
                    <div className="details">
                      <h4
                        style={{
                          color: randomColor({
                            seed: comment.user.email,
                          }),
                        }}
                      >
                        {comment.user.email === userEmail
                          ? "Me"
                          : comment.user.email}
                      </h4>
                    </div>

                    <div className="segment-time">
                      {moment(comment.createdAt).fromNow()}{" "}
                    </div>
                  </div>
                  <div className="comment-card-body">
                    <p>{comment.message}</p>
                  </div>
                  {isActiveDisc && (
                    <div
                      className={`comment-card-footer ${
                        comment.pinned ? "pinned" : ""
                      }`}
                      onClick={() => pinComment(comment["_id"], comment.pinned)}
                    >
                      <PushpinOutlined />
                    </div>
                  )}
                  {isNonTBD && (
                    <div className="comment-card-severity">
                      Severity
                      <span
                        style={{
                          background: isNewSeverity
                            ? colorMap[severity]
                            : "transparent",
                          color: contrast(colorMap[severity]),
                        }}
                      >
                        {severity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`severity-timeline${
                  showTimeline ? "" : " has-severity-conflict"
                }`}
              >
                {severityStack.map((el, i) => {
                  const curSeverity = getMark(el);
                  const isLast = i === severityStack.length - 1;
                  const addNewConnection = isNewSeverity && isLast;

                  return (
                    <>
                      <div
                        className={`severity-bar ${
                          addNewConnection ? "connection" : ""
                        }`}
                        style={{
                          background: colorMap[curSeverity],
                        }}
                      ></div>
                      {addNewConnection && (
                        <div
                          className="severity-connection"
                          style={{
                            width: `${23 - i * 3}px`,
                            borderColor: colorMap[curSeverity],
                          }}
                        ></div>
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          );
        })}

        <span ref={messagesEndRef}></span>
      </div>
      <Agreement
        showTimeline={showTimeline}
        severityStack={severityStack}
        colorMap={colorMap}
        getMark={getMark}
        nonTBDSverity={nonTBDSverity}
        userId={userId}
        userEmail={userEmail}
        selectedDisc={selectedDisc}
        setFinalSeverity={setFinalSeverity}
        disc={disc}
        isColab={isColab}
      />
    </div>
  );
};

export default CommentList;
