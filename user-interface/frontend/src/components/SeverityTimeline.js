import React from "react";

export default function SeverityTimeline({
  showTimeline,
  severityStack,
  getMark,
  isNewSeverity,
  colorMap,
}) {
  return (
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
              className={`severity-bar ${addNewConnection ? "connection" : ""}`}
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
  );
}
