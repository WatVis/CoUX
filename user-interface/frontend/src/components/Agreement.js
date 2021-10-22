import React from "react";
import { useTrack } from "../contexts/TrackProvider";
import { Button, Badge, message } from "antd";
import {
  CheckOutlined,
  DislikeOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { contrast } from "../utils/utils";
import * as R from "ramda";

export default function Agreement({
  showTimeline,
  severityStack,
  colorMap,
  getMark,
  nonTBDSverity,
  userId,
  userEmail,
  selectedDisc,
  setFinalSeverity,
  disc,
  isColab,
}) {
  const { trackEvent } = useTrack();
  const badge = (same) => {
    return same ? <CheckOutlined style={{ color: "#3ace7c" }} /> : undefined;
  };

  return (
    <div className="agreement">
      {showTimeline && (
        <>
          <div className="severity-timeline">
            {severityStack.map((el, i) => {
              const curSeverity = getMark(el);

              return (
                <div
                  className="severity-curve"
                  style={{
                    width: `${23 - i * 3}px`,
                    height: `${62 - i * 3}px`,
                    borderColor: colorMap[curSeverity],
                  }}
                ></div>
              );
            })}
          </div>

          <div className="agreement-section">
            <div className="final-severity">
              <p>{isColab && "Choose final severity"}</p>
              <div
                className={`suggested-severities ${
                  isColab ? "" : "individual-mode"
                }`}
              >
                {R.uniq(R.concat(severityStack, nonTBDSverity)).map((el, i) => {
                  const curSeverity = getMark(el);
                  const isInSeverityStack = severityStack.includes(el);
                  const sameSeverity = disc.finalSeverity
                    ? getMark(disc.finalSeverity.severity) === curSeverity
                    : false;

                  return (
                    <div className="severity">
                      <Badge
                        count={
                          <div
                            className={`status-badge${
                              sameSeverity ? " same" : ""
                            }`}
                          >
                            {badge(sameSeverity)}
                          </div>
                        }
                      >
                        <Button
                          type="primary"
                          shape="circle"
                          className={`${sameSeverity ? "chosen" : ""}`}
                          style={{
                            background: colorMap[curSeverity],
                            borderColor: colorMap[curSeverity],
                            color: contrast(colorMap[curSeverity]),
                          }}
                          onClick={() => {
                            if (isColab) {
                              setFinalSeverity(
                                el,
                                userId,
                                userEmail,
                                selectedDisc
                              );
                              trackEvent({
                                section: "agreement-final-severity",
                                action: "click",
                                discId: selectedDisc,
                                finalSeverity: el,
                              });
                            } else {
                              message.warning(
                                "You cannot select final severity in individual mode!"
                              );
                              trackEvent({
                                section: "agreement-final-severity",
                                action: "click",
                                success: false,
                                error:
                                  "You cannot select final severity in individual mode!",
                                discId: selectedDisc,
                                finalSeverity: el,
                              });
                            }
                          }}
                        >
                          {curSeverity}
                        </Button>
                      </Badge>
                      {isInSeverityStack && (
                        <div
                          className="severity-connection-horizontal"
                          style={{
                            width: `${188 - i * 37}px`,
                            height: `${20 - i * 3}px`,
                            left: `${20 + i * 37}px`,
                            bottom: `-${20 - i * 3}px`,
                            borderColor: colorMap[curSeverity],
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
