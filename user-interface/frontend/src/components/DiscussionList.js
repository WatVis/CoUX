import React, { useState, useRef, createRef } from "react";
import {
  Avatar,
  Row,
  Col,
  Tooltip,
  message,
  Carousel,
  Modal,
  Button,
  Input,
} from "antd";
import moment from "moment";
import { marks, severityToMark } from "../utils/utils";
import * as R from "ramda";
import {
  CheckOutlined,
  CloseOutlined,
  DashOutlined,
  ExclamationCircleOutlined,
  BranchesOutlined,
  CommentOutlined,
  LikeOutlined,
  LeftOutlined,
  RightOutlined,
  DislikeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import randomColor from "randomcolor";
import { useTrack } from "../contexts/TrackProvider";
import { useComments } from "../contexts/CommentsProvider";
import { useProject } from "../contexts/ProjectProvider";
import "../styles/components/discussion-list.scss";
import "../styles/components/css-shake.scss";

const { confirm } = Modal;

const STATUS_TO_STYLE = {
  AGREED: "agreed",
  NOT_AGREED: "disagreed",
  IN_PROGRESS: "in-progress",
};

export const DiscussionList = ({ isBlur }) => {
  const { trackEvent } = useTrack();
  const [activeId, setActiveId] = useState(undefined);
  const [nominateEmail, setNominateEmail] = useState(undefined);
  const [deleteDisc, setDeleteDisc] = useState(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mergeableCardId, setMergeableCardId] = useState(undefined);
  const {
    discussions,
    comments,
    setSelectedDisc,
    userId,
    deleteUXProblem,
    mergeUXProblems,
    userEmail,
  } = useComments();

  const { segmentId, isColab } = useProject();
  const filteredDiscussions = isColab
    ? discussions
    : R.filter(
        (el) => R.any(R.propEq("id", userId), el.participants),
        discussions
      );
  const activeDisc = R.filter(R.propEq("isActive", true), filteredDiscussions);
  const commentsBySegment = R.filter(R.propEq("segment", segmentId), comments);
  const commentsByDisc = R.groupBy(R.prop("discussion"), commentsBySegment);
  const discBySegment = R.filter(R.propEq("segment", segmentId), activeDisc);
  const discIds = R.map(R.prop("_id"), discBySegment);

  const elRefs = useRef([]);
  if (elRefs.current.length !== discIds.length) {
    // add or remove refs
    elRefs.current = Array(discIds.length)
      .fill()
      .map((_, i) => elRefs.current[i] || createRef());
  }

  const showConfirm = (source, destination) => {
    confirm({
      title: "Do you want to merge these items?",
      icon: <ExclamationCircleOutlined />,
      centered: true,
      onOk() {
        mergeUXProblems(source, destination);
        trackEvent({
          section: "annotation-merge",
          action: "merge",
          success: true,
          source: source,
          destination: destination,
        });
        setMergeableCardId(undefined);
      },
      onCancel() {},
    });
  };

  const mergeCards = (source, destination) => {
    showConfirm(source, destination);
  };

  const onDragEnd = (result) => {
    if (result.combine) {
      const source = result.draggableId;
      const destination = result.combine.draggableId;
      mergeCards(source, destination);
    }
  };

  const changeCarousel = (direction, e, index) => {
    e.stopPropagation();
    switch (direction) {
      case "right":
        elRefs.current[index].current.next();
        break;
      case "left":
        elRefs.current[index].current.prev();
        break;
      default:
        elRefs.current[index].current.next();
        break;
    }
  };

  const setNominateEmailHandler = (e) => {
    const nominateEmail = e.target.value;
    setNominateEmail(nominateEmail);
  };

  const handleOk = (discId) => {
    deleteUXProblem(discId);
    trackEvent({
      section: "annotation-delete",
      action: "submit",
      discId: discId,
      userEmail,
    });
    setNominateEmail(undefined);
    setDeleteDisc(undefined);
    setShowDeleteModal(false);
  };

  const handleCancel = (e) => {
    setNominateEmail(undefined);
    setDeleteDisc(undefined);
    setShowDeleteModal(false);
  };

  return (
    <div className={`discussion-list ${isBlur ? "blured" : ""}`}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" isCombineEnabled>
          {(provided) => (
            <div
              className="discussion-list-wrapper"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {discIds.map((discId, index) => {
                const comments = R.isNil(commentsByDisc[discId])
                  ? []
                  : R.filter(R.propEq("pinned", true), commentsByDisc[discId]);
                const disc = R.find(R.propEq("_id", discId), discBySegment);
                const time = disc.time;
                const users = disc.participants;
                const discStatus = STATUS_TO_STYLE[disc.status];
                const isActiveDisc = activeId === discId ? " active" : "";
                const heuristic = disc.heuristic;
                const isNotDecided = (n) => n === 0;
                const nonTBDSverity = R.reject(isNotDecided, disc.severity);
                const hasFinalSeverity = R.hasPath(["finalSeverity"], disc);
                const hasFinalHeuristic = R.hasPath(["finalHeuristic"], disc);
                const severity = disc
                  ? hasFinalSeverity
                    ? [disc.finalSeverity.severity]
                    : disc.severity.length > 1
                    ? nonTBDSverity
                    : disc.severity
                  : [];
                const isMergable =
                  mergeableCardId && mergeableCardId !== discId;

                return (
                  <Draggable draggableId={discId} index={index} key={discId}>
                    {(provided) => (
                      <div
                        className="discussion-card"
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <div
                          className={`child${
                            isMergable
                              ? " shake-little shake-constant shake-constant--hover merge"
                              : ""
                          }${isActiveDisc} ${discStatus}`}
                          onClick={() => {
                            if (isMergable) {
                              mergeCards(mergeableCardId, discId);
                            } else {
                              if (mergeableCardId === discId) {
                                setMergeableCardId(undefined);
                              }
                              if (discId === activeId) {
                                setActiveId(undefined);
                              } else {
                                setActiveId(discId);
                              }
                            }
                            trackEvent({
                              section: "annotation-card",
                              action: "click",
                              discHeuristic: heuristic,
                              discTime: time,
                              discId: discId,
                            });
                          }}
                        >
                          <div className="discussion-card-container">
                            <div className="discussion-card-header">
                              <Row gutter={8} style={{ width: "100%" }}>
                                <Col span={12}>
                                  <div className="discussion-segment">
                                    <p>Heuristic</p>
                                    <div className="segment-heuristic">
                                      {heuristic.map((el) => {
                                        return (
                                          <Tooltip title={el}>
                                            <p>{el}</p>
                                          </Tooltip>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </Col>
                                <Col span={8}>
                                  <div className="discussion-segment">
                                    <p>Users</p>
                                    <div className="discussion-card-avatar">
                                      {users.map((el) => (
                                        <Avatar
                                          size="medium"
                                          style={{
                                            backgroundColor: randomColor({
                                              seed: el.email,
                                            }),
                                          }}
                                        >
                                          {el.email
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </Avatar>
                                      ))}
                                    </div>
                                  </div>
                                </Col>

                                <Col span={4}>
                                  <div className="discussion-segment">
                                    <p>
                                      Severity
                                      {severity.length > 1 && (
                                        <Tooltip title="Severity Conflict!">
                                          <ExclamationCircleOutlined className="segment-icon" />
                                        </Tooltip>
                                      )}
                                    </p>
                                    <div className="details">
                                      <span>
                                        {severity.map((sev, i) => {
                                          if (i === severity.length - 1) {
                                            return marks[severityToMark(sev)];
                                          }
                                          return `${
                                            marks[severityToMark(sev)]
                                          },`;
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                            {!R.isEmpty(comments) && (
                              <div className="discussion-card-body">
                                <div className="discussion-segment">
                                  <p>Pinned Comments</p>
                                  <div className="carousel-controls">
                                    <LeftOutlined
                                      className="left"
                                      onClick={(e) =>
                                        changeCarousel("left", e, index)
                                      }
                                    />
                                    <RightOutlined
                                      className="right"
                                      onClick={(e) =>
                                        changeCarousel("right", e, index)
                                      }
                                    />
                                  </div>

                                  <div className="last-comment">
                                    <Carousel
                                      ref={elRefs.current[index]}
                                      autoplay
                                      dots={false}
                                      effect="fade"
                                    >
                                      {comments.map((comment) => (
                                        <div>
                                          <p>
                                            <Avatar
                                              size="small"
                                              style={{
                                                backgroundColor: randomColor({
                                                  seed: comment.user.email,
                                                }),
                                              }}
                                            >
                                              {comment.user.email
                                                .substring(0, 2)
                                                .toUpperCase()}
                                            </Avatar>
                                            {comment.message}
                                          </p>
                                        </div>
                                      ))}
                                    </Carousel>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="discussion-card-footer">
                              {time != null
                                ? moment("2015-01-01")
                                    .startOf("day")
                                    .seconds(time)
                                    .format("mm:ss")
                                : undefined}
                            </div>
                          </div>
                        </div>
                        <nav className={`nav${isActiveDisc} ${discStatus}`}>
                          <div
                            className="action-button"
                            onClick={() => {
                              setSelectedDisc(discId);
                              trackEvent({
                                section: "annotation-card-buttons",
                                action: "click",
                                button: "comments",
                                discHeuristic: heuristic,
                                discTime: time,
                                discId: discId,
                              });
                            }}
                          >
                            <div className="icon">
                              <CommentOutlined />
                            </div>
                          </div>

                          <div
                            className={`action-button ${
                              mergeableCardId ? "active" : ""
                            }`}
                            onClick={() => {
                              if (mergeableCardId === discId) {
                                setMergeableCardId(undefined);
                              } else {
                                setMergeableCardId(discId);
                              }

                              trackEvent({
                                section: "annotation-card-buttons",
                                action: "click",
                                button: "merge",
                                discHeuristic: heuristic,
                                discTime: time,
                                discId: discId,
                              });
                            }}
                          >
                            <div className="icon">
                              <BranchesOutlined />
                            </div>
                          </div>

                          <div
                            className={`action-button`}
                            onClick={() => {
                              setDeleteDisc(discId);
                              setShowDeleteModal(true);
                              trackEvent({
                                section: "annotation-card-buttons",
                                action: "click",
                                button: "delete",
                                discHeuristic: heuristic,
                                discTime: time,
                                discId: discId,
                              });
                            }}
                          >
                            <div className="icon">
                              <DeleteOutlined />
                            </div>
                          </div>
                        </nav>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              <div className="placeholder"></div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Modal
        title="Delete UX Problem"
        visible={showDeleteModal}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        className="delete-modal"
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            disabled={nominateEmail !== userEmail}
            onClick={() => handleOk(deleteDisc)}
          >
            Delete
          </Button>,
        ]}
      >
        <p>
          To delete discussion <strong>{deleteDisc}</strong> you should enter
          your email address.
        </p>
        <Input
          value={nominateEmail}
          placeholder="Your email address"
          className="ant-input-revert ltr app-name"
          size="large"
          onChange={setNominateEmailHandler}
        />
      </Modal>
    </div>
  );
};

export default DiscussionList;
