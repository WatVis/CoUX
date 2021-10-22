import React from "react";
import * as R from "ramda";
import { Popover } from "antd";
import randomColor from "randomcolor";
import { useProject } from "../contexts/ProjectProvider";
import { useComments } from "../contexts/CommentsProvider";
import { useTrack } from "../contexts/TrackProvider";
import DiscussionCard from "./DiscussionCard";
import "../styles/components/annotation-timeline.scss";

export const AnnotationTimeline = ({
  projectId,
  duration,
  setPlayed,
  player,
}) => {
  const { trackEvent } = useTrack();
  const annotaionMargin = 4;
  const annotationRadius = 10;
  const { discussions, userId, setSelectedDisc, newDiscs } = useComments();
  const { isMobile, width, isColab } = useProject();
  const filteredDiscussions = isColab
    ? discussions
    : R.filter(
        (el) => R.any(R.propEq("id", userId), el.participants),
        discussions
      );
  const sidebarW = isMobile ? 0 : 450;
  const margin = 30;
  const timelineW = width - sidebarW - margin;
  const numberOfSegments = Math.floor(timelineW / annotationRadius);
  const segmentDuration = duration / numberOfSegments;

  const binIndexes = R.map(
    (el) => ({ data: el, binIndex: Math.floor(el.time / segmentDuration) }),
    filteredDiscussions
  );
  const byBinIndex = R.groupBy(function (el) {
    return el.binIndex;
  });
  const binnedData = byBinIndex(binIndexes);
  const bins = R.keys(binnedData);

  const setPlayHead = (time, discId, heuristic) => {
    player.seekTo(time);
    setPlayed(time);
    localStorage.setItem(
      `coux-project-${projectId}`,
      JSON.stringify({ played: time })
    );
    setSelectedDisc(discId);

    trackEvent({
      section: "annotation-timeline",
      action: "click",
      discHeuristic: heuristic,
      discTime: time,
      discId: discId,
    });
  };

  return (
    <div className="annotation-timeline">
      {bins.map((el) => {
        const xPos = el * annotationRadius;
        const annotations = binnedData[el];

        return (
          <div
            className="annotations"
            key={el}
            style={{
              left: "0px",
              transform: `translateX(${xPos}px)`,
              width: `${annotationRadius}px`,
            }}
          >
            {annotations.map((el, index) => {
              const yPoss = index * (annotationRadius + annotaionMargin);
              const isMe = R.any(R.propEq("id", userId), el.data.participants);
              const {
                heuristic,
                participants,
                severity,
                time,
                _id,
                isActive,
              } = el.data;
              const isUpdated = newDiscs ? newDiscs.includes(_id) : false;
              return (
                <Popover
                  style={{
                    background: "transparent",
                    boxShadow: "none",
                  }}
                  overlayClassName="annotation-popover"
                  content={
                    <div onClick={() => setPlayHead(time, _id, heuristic)}>
                      <DiscussionCard
                        heuristic={heuristic}
                        users={participants}
                        discId={_id}
                        severity={severity}
                        time={time}
                        isAnnotation={true}
                        isDiscActive={isActive}
                      />
                    </div>
                  }
                >
                  <div
                    className={`annotation ${isMe ? "me" : ""} ${
                      isActive ? "" : "not-active"
                    } ${isUpdated ? "is-updated" : ""}`}
                    style={{
                      width: `${annotationRadius}px`,
                      height: `${annotationRadius}px`,
                      transform: `translateY(-${yPoss}px)`,
                      background: randomColor({
                        seed: el.data.participants[0].email,
                      }),
                      borderColor: randomColor({
                        seed: el.data.participants[0].email,
                      }),
                    }}
                    onClick={() => setPlayHead(time, _id, heuristic)}
                  ></div>
                </Popover>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default AnnotationTimeline;
