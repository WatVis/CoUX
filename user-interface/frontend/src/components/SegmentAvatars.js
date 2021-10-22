import React, { useState, useEffect } from "react";
import "../styles/components/segment-avatars.scss";

export const SegmentAvatars = React.memo(({ segments, duration }) => {
  const { width } = useWindowSize();
  const segmentMargin = 2;

  const segmentCount = segments.length;
  const marginToRemove = (segmentCount - 1) * segmentMargin;
  const finalW = width;
  const timelineW = finalW - marginToRemove - 450;
  let timelineLen = 0;

  const states = ["low", "medium", "high"];
  return (
    <div className="segment-avatars">
      <div className="video-segments-container">
        {segments.map((segment, index) => {
          const segmentDuration = segment.end - segment.start;
          let segmentW;
          if (index !== segmentCount - 1) {
            if (index % 2 === 0) {
              segmentW = Math.floor(timelineW * (segmentDuration / duration));
            } else {
              segmentW = Math.ceil(timelineW * (segmentDuration / duration));
            }
          } else {
            segmentW = timelineW - timelineLen;
          }

          timelineLen += segmentW;
          return (
            <div
              className={`video-segment ${segmentW < 66 ? "vertical" : ""}`}
              key={`comments-${segment.start}-${segment.end}`}
              style={{
                width: `${segmentW}px`,
              }}
            >
              <div
                className={`anomalies loudness ${
                  states[Math.floor(Math.random() * 3)]
                }`}
              >
                L
              </div>
              <div
                className={`anomalies speech-rate ${
                  states[Math.floor(Math.random() * 3)]
                }`}
              >
                S
              </div>
              <div
                className={`anomalies pitch ${
                  states[Math.floor(Math.random() * 3)]
                }`}
              >
                P
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Hook
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default SegmentAvatars;
