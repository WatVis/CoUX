import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTrack } from "../contexts/TrackProvider";
import { useProject } from "../contexts/ProjectProvider";
import "../styles/components/video-timeline.scss";

export const VideoTimeline = ({
  segments,
  played,
  loaded,
  duration,
  setPlayed,
  player,
  projectId,
}) => {
  const { trackEvent } = useTrack();

  const { isMobile, width } = useProject();
  const scrubber = useRef(null);
  const segmentCount = segments.length;
  const sidebarW = isMobile ? 0 : 450;
  const margin = 30;
  const marginRight = 2;
  const timelineW =
    width - sidebarW - margin - marginRight * (segmentCount - 1);
  const timelineLenScrubber = width - sidebarW - margin;

  let scrubberPos = (width - sidebarW - margin) * (played / duration);
  let timelineLen = 0;

  const startDragging = ({ clientX }) => {
    const head = ((clientX - 15) / timelineLenScrubber) * duration;
    player.seekTo(head);
    setPlayed(head);
    localStorage.setItem(
      `coux-project-${projectId}`,
      JSON.stringify({ played: head })
    );
  };

  const handleClick = (e) => {
    var cursorX = e.pageX - 15;
    const head = (cursorX / timelineLenScrubber) * duration;
    player.seekTo(head);
    setPlayed(head);
    localStorage.setItem(
      `coux-project-${projectId}`,
      JSON.stringify({ played: head })
    );
    trackEvent({
      section: "video-timeline",
      action: "click",
      newHead: head,
    });
  };

  const stopDragging = () => {
    window.removeEventListener("mousemove", startDragging, false);
    window.removeEventListener("mouseup", stopDragging, false);
    trackEvent({
      section: "video-timeline",
      action: "dragging",
    });
  };

  const initialiseDrag = () => {
    window.addEventListener("mousemove", startDragging, false);
    window.addEventListener("mouseup", stopDragging, false);
  };

  return (
    <div className="video-timeline">
      <div className="progress-bar-container">
        <div className="progress-bar" onClick={handleClick}>
          <div className="progress-bar-segments-container">
            {segments.map((segment, index) => {
              const segmentDuration = segment.end - segment.start;

              let segmentW;
              const isLastSegment = index === segmentCount - 1;

              if (!isLastSegment) {
                // if (index % 2 === 0) {
                //   segmentW = Math.floor(
                //     timelineW * (segmentDuration / duration)
                //   );
                // } else {
                //   segmentW = Math.ceil(
                //     timelineW * (segmentDuration / duration)
                //   );
                // }

                segmentW = Math.round(timelineW * (segmentDuration / duration));
              } else {
                segmentW = timelineW - timelineLen;
                const isTimeLineFit = timelineLen + segmentW <= timelineW;
                if (!isTimeLineFit) {
                  segmentW -= timelineLen + segmentW - timelineW;
                }
              }

              const loadHead = (loaded / duration) * timelineW;
              const playHead = (played / duration) * timelineW;

              let loadScale =
                loaded < segment.start
                  ? 0
                  : loaded > segment.end
                  ? 1
                  : (loadHead - timelineLen) / segmentW;
              let playScale =
                played < segment.start
                  ? 0
                  : played > segment.end
                  ? 1
                  : (playHead - timelineLen) / segmentW;

              timelineLen += segmentW;

              return (
                <div
                  className="progress-bar-segment-hover-container exp-segment-hover-container"
                  style={{
                    width: `${segmentW}px`,
                    marginRight: `${isLastSegment ? 0 : marginRight}px`,
                  }}
                  key={`${segment.start}-${segment.end}`}
                >
                  <div className="progress-bar-padding"></div>
                  <div className="progress-list">
                    <div
                      className="play-progress"
                      style={{ left: "0px", transform: `scaleX(${playScale})` }}
                    ></div>
                    <div
                      className="load-progress"
                      style={{ left: "0px", transform: `scaleX(${loadScale})` }}
                    ></div>
                    <div className="hover-progress"></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="scrubber-container"
            style={{
              left: "0px",
              transform: `translateX(${scrubberPos}px)`,
            }}
            onMouseDown={initialiseDrag}
            ref={scrubber}
          >
            <div className="scrubber-button">
              <div className="scrubber-pull-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTimeline;
