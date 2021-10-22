import React, { useState } from "react";
import * as R from "ramda";
import { Avatar, Row, Col, Tooltip, Button } from "antd";
import {
  ArrowLeftOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  ForkOutlined,
  EditOutlined,
} from "@ant-design/icons";
import randomColor from "randomcolor";
import { marks, severityToMark } from "../utils/utils";
import { useComments } from "../contexts/CommentsProvider";
import { useTrack } from "../contexts/TrackProvider";
import DiscussionList from "./DiscussionList";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import DiscussionForm from "./DiscussionForm";
import Filter from "./Filter";
import EditDiscHeuristic from "./EditDiscHeuristic";
import Unmerge from "./Unmerge";
import "../styles/components/comments.scss";

export const Comments = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditHeuristicOpen, setIsEditHeuristicOpen] = useState(false);
  const {
    selectedDisc,
    setSelectedDisc,
    filters,
    resetFilters,
    discussions,
  } = useComments();

  const [isUnmergeOpen, setIsUnmergeOpen] = useState(false);
  const { trackEvent } = useTrack();
  const hasFilters = R.any((el) => !R.isEmpty(el), R.values(filters));
  const disc = R.find(R.propEq("_id", selectedDisc), discussions);
  const isActiveDisc = disc ? disc.isActive : false;
  const hasFinalSeverity = R.hasPath(["finalSeverity"], disc);
  const hasMergeHistory = disc ? !R.isEmpty(disc.mergeHistory) : false;

  const isNotDecided = (n) => n === 0;
  const nonTBDSverity = disc ? R.reject(isNotDecided, disc.severity) : [];
  const severity = disc
    ? hasFinalSeverity
      ? [disc.finalSeverity.severity]
      : disc.severity.length > 1
      ? nonTBDSverity
      : disc.severity
    : [];

  return (
    <div className="comments-section">
      <div
        className={`comments-header ${R.isNil(selectedDisc) ? "disc" : "chat"}`}
      >
        <div className="sort">
          <h2>
            {R.isNil(selectedDisc) ? (
              "UX Problems"
            ) : (
              <>
                <ArrowLeftOutlined
                  onClick={() => {
                    setSelectedDisc(undefined);
                  }}
                  className="back"
                />
                Chat
              </>
            )}
          </h2>
        </div>
        <div>
          {/* {hasFilters && (
            <Button onClick={resetFilters} type="text" className="reset-btn">
              Clear Filters
            </Button>
          )}
          <Button
            className="filter-btn"
            icon={<FilterOutlined />}
            onClick={() => setIsFilterOpen((prevState) => !prevState)}
          ></Button> */}
        </div>
      </div>

      {selectedDisc && (
        <div className="discussion-card-header-comments">
          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <div className="discussion-segment">
                <p>
                  Heuristic
                  {isActiveDisc && (
                    <div
                      className="edit-discussion"
                      onClick={() => {
                        setIsEditHeuristicOpen(true);
                        trackEvent({
                          section: "edit-annotation-heuristics",
                          action: "click",
                        });
                      }}
                    >
                      <EditOutlined />
                    </div>
                  )}
                </p>
                <div className="segment-heuristic">
                  {disc.heuristic.map((el) => {
                    return (
                      <Tooltip title={el} placement="bottom">
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
                  {disc.participants.map((el) => (
                    <Avatar
                      size="medium"
                      style={{
                        backgroundColor: randomColor({
                          seed: el.email,
                        }),
                      }}
                    >
                      {el.email.substring(0, 2).toUpperCase()}
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
                      return `${marks[severityToMark(sev)]},`;
                    })}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {selectedDisc && hasMergeHistory && (
        <Button
          type="primary"
          icon={<ForkOutlined />}
          className="unmerge-btn-comments"
          onClick={() => {
            setIsUnmergeOpen((prevValue) => !prevValue);
            trackEvent({
              section: "unmerge-button",
              action: "click",
              discId: selectedDisc,
            });
          }}
        >
          Unmerge
        </Button>
      )}

      {R.isNil(selectedDisc) ? (
        <DiscussionList isBlur={isFilterOpen} />
      ) : (
        <CommentList isBlur={isFilterOpen} />
      )}
      {/* 
      <div className="comment-form-toggle">Add UX Problem</div> */}

      {R.isNil(selectedDisc) ? (
        <DiscussionForm isBlur={isFilterOpen} />
      ) : (
        <CommentForm isBlur={isFilterOpen} />
      )}

      {isFilterOpen && <Filter setIsFilterOpen={setIsFilterOpen} />}
      {isUnmergeOpen && (
        <Unmerge setIsUnmergeOpen={setIsUnmergeOpen} disc={disc} />
      )}
      {isEditHeuristicOpen && (
        <EditDiscHeuristic
          setIsEditHeuristicOpen={setIsEditHeuristicOpen}
          discHeuristics={disc.heuristic}
        />
      )}
    </div>
  );
};

export default Comments;
