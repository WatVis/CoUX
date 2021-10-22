import React, { useState, useEffect } from "react";
import { Tooltip } from "antd";
import "../styles/components/segment-sentiment-ux-key.scss";

export const SegmentSentimentUxKey = React.memo(({ segments, duration }) => {
  const { width } = useWindowSize();
  const segmentMargin = 2;

  const segmentCount = segments.length;
  const marginToRemove = (segmentCount - 1) * segmentMargin;
  const finalW = width;
  const timelineW = finalW - marginToRemove - 450;
  let timelineLen = 0;

  const uxKeywords = {
    q: "icon-question-solid",
    n: "icon-minus-circle-solid",
    f: "icon-comment-slash-solid",
  };
  const sentiments = {
    Neg: "icon-frown-solid",
    Pos: "icon-smile-solid",
    Neu: "icon-meh-blank-solid",
  };

  return (
    <div className="segment-sentiment-ux-key">
      <div className="video-segments-container">
        {segments.map((segment, index) => {
          const segmentUxKeyword = segment.uxKeywords[0];
          const uxKeyword = uxKeywords[segmentUxKeyword];
          const sentiment = sentiments[segment.semantics];
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
              <div className="sentiments loudness">
                <Tooltip
                  title="prompt text"
                  placement="bottom"
                  color="#2db7f5"
                  className="inner"
                >
                  <i className={sentiment}></i>
                </Tooltip>
              </div>
              {segmentUxKeyword && (
                <div className="sentiments speech-rate">
                  <Tooltip
                    title="prompt text"
                    placement="bottom"
                    color="geekblue"
                    className="inner"
                  >
                    <i className={uxKeyword}></i>
                  </Tooltip>
                </div>
              )}
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

export default SegmentSentimentUxKey;
