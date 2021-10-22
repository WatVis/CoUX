import React, { useState, useEffect } from "react";
import "../styles/components/global-state.scss";

export const GlobalState = React.memo(({ segments, duration }) => {
  const { width } = useWindowSize();
  const segmentMargin = 2;
  const segmentCount = segments.length;
  const marginToRemove = (segmentCount - 1) * segmentMargin;
  const finalW = width;
  const timelineW = finalW - marginToRemove - 450;
  let timelineLen = 0;
  const status = ["agreed", "not-labelled", "disagreed", "in-progress"];
  return (
    <div className="global-state">
      <div className="global-state-container">
        <div className="global-state-segments-container">
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
                className={`global-state-segment ${
                  status[Math.floor(Math.random() * 4)]
                }`}
                style={{
                  width: `${segmentW}px`,
                }}
                key={`${segment.start}-${segment.end}-state`}
              ></div>
            );
          })}
        </div>
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

export default GlobalState;
