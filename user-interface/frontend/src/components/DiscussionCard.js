import React, { useEffect } from "react";
import * as R from "ramda";
import { useTrack } from "../contexts/TrackProvider";
import { marks, severityToMark } from "../utils/utils";
import { Avatar, Row, Col, Tooltip } from "antd";
import moment from "moment";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import randomColor from "randomcolor";
import "../styles/components/discussion-card.scss";

export default function DiscussionCard({
  heuristic,
  users,
  discId,
  severity,
  time,
  isActive,
  setIsActive,
  cardId,
  unmergeOptions,
  isAnnotation = false,
  isDiscActive,
}) {
  const { trackEvent } = useTrack();

  useEffect(() => {
    if (isAnnotation) {
      trackEvent({
        section: "annotation-timeline",
        action: "hover",
        discHeuristic: heuristic,
        discTime: time,
        discId: discId,
      });
    }
  }, []);

  return (
    <div
      className={`child-popover ${
        !R.isNil(isActive) && isActive === cardId ? "is-active" : ""
      } ${isAnnotation ? "" : "merge-card"}`}
      onClick={() => {
        if (!R.isNil(isActive)) {
          setIsActive((prevState) => {
            return prevState === cardId
              ? unmergeOptions["UNMERGE_IGNORE"]
              : cardId;
          });
        }
      }}
    >
      <p
        className={`${
          isAnnotation ? (isDiscActive ? "not-merged" : "merged") : "not-merged"
        }`}
      >
        Merged
      </p>
      <div className="discussion-card-container">
        <div className="discussion-card-header">
          <Row gutter={8} style={{ width: "100%" }}>
            <Col span={12}>
              <div className="discussion-segment">
                <p>Heuristic</p>
                <div className="segment-heuristic">
                  <p>{heuristic}</p>
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

        <div className="discussion-card-footer">
          {time != null
            ? moment("2015-01-01").startOf("day").seconds(time).format("mm:ss")
            : undefined}
        </div>
      </div>
    </div>
  );
}
