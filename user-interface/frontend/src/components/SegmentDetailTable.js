import React, { useState, useEffect } from "react";
import { useTrack } from "../contexts/TrackProvider";
import { Tooltip } from "antd";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import "../styles/components/segment-detail.scss";

const SegmentDetailTable = React.memo(
  ({ segments, played, setPlayed, player, projectId }) => {
    const { trackEvent } = useTrack();

    const rows = [
      { name: "Loudness", prop: "loudness" },
      { name: "Pitch", prop: "pitch" },
      { name: "Speech Rate", prop: "lowSpeechRate" },
      { name: "Sentiment", prop: "semantics" },
      { name: "UxKeyword", prop: "uxKeywords" },
    ];
    const uxKeywords = {
      q: "icon-question-solid",
      n: "icon-minus-circle-solid",
      f: "icon-comment-slash-solid",
    };
    const uxKeywordsName = {
      q: "Question",
      n: "Negation",
      f: "Fillers Words",
    };
    const sentiments = {
      Neg: "icon-frown-solid",
      Pos: "icon-smile-solid",
      Neu: "icon-meh-blank-solid",
    };
    const LPState = ["low", "medium", "high"];
    const speechState = ["normal", "low"];
    const LPSIcons = {
      low: <CaretDownOutlined />,
      high: <CaretUpOutlined />,
    };

    const seekPlay = (segment, rowName) => {
      const segmentStart = segment.start;
      player.seekTo(segmentStart);
      setPlayed(segmentStart);
      localStorage.setItem(
        `coux-project-${projectId}`,
        JSON.stringify({ played: segmentStart })
      );
      trackEvent({
        section: "feature-matrix",
        action: "click",
        newHead: segmentStart,
        rowName: rowName,
        segmentId: segment._id,
      });
    };
    return (
      <div className="authority-table">
        <table className="zui-table zui-table-highlight-all">
          <tbody>
            {rows.map((row, index) => {
              return (
                <tr>
                  <td className="table-row-head">{row.name}</td>
                  {segments.map((segment) => {
                    const activeSegment =
                      played < segment.end && played > segment.start;

                    const offset = 1;
                    let jsx;
                    switch (row.name) {
                      case "Loudness":
                        jsx = (
                          <>
                            {LPState[segment[row.prop] + offset] !==
                              "medium" && (
                              <Tooltip
                                title={LPState[segment[row.prop] + offset]}
                                placement="bottom"
                                color="geekblue"
                                className="inner"
                              >
                                <div
                                  className={`anomalies  ${
                                    LPState[segment[row.prop] + offset]
                                  }`}
                                >
                                  {
                                    LPSIcons[
                                      LPState[segment[row.prop] + offset]
                                    ]
                                  }
                                </div>
                              </Tooltip>
                            )}
                          </>
                        );
                        break;
                      case "Pitch":
                        jsx = (
                          <>
                            {LPState[segment[row.prop] + offset] !==
                              "medium" && (
                              <Tooltip
                                title={LPState[segment[row.prop] + offset]}
                                placement="bottom"
                                color="geekblue"
                                className="inner"
                              >
                                <div
                                  className={`anomalies  ${
                                    LPState[segment[row.prop] + offset]
                                  }`}
                                >
                                  {
                                    LPSIcons[
                                      LPState[segment[row.prop] + offset]
                                    ]
                                  }
                                </div>
                              </Tooltip>
                            )}
                          </>
                        );
                        break;
                      case "Speech Rate":
                        jsx = (
                          <>
                            {speechState[segment[row.prop]] !== "normal" && (
                              <Tooltip
                                title={speechState[segment[row.prop]]}
                                placement="bottom"
                                color="geekblue"
                                className="inner"
                              >
                                <div
                                  className={`anomalies  ${
                                    speechState[segment[row.prop]]
                                  }`}
                                >
                                  {LPSIcons[speechState[segment[row.prop]]]}
                                </div>
                              </Tooltip>
                            )}
                          </>
                        );
                        break;
                      case "Sentiment":
                        jsx = (
                          <div
                            className={`sentiments loudness ${
                              segment[row.prop]
                            }`}
                          >
                            <Tooltip
                              title={segment[row.prop]}
                              placement="bottom"
                              color="#2db7f5"
                              className="inner"
                            >
                              <i className={sentiments[segment[row.prop]]}></i>
                            </Tooltip>
                          </div>
                        );
                        break;
                      case "UxKeyword":
                        const segmentUxKeyword = segment[row.prop][0];
                        jsx = segmentUxKeyword ? (
                          <div className="sentiments speech-rate non-emoji">
                            <Tooltip
                              title={uxKeywordsName[segmentUxKeyword]}
                              placement="bottom"
                              color="geekblue"
                              className="inner"
                            >
                              <i className={uxKeywords[segmentUxKeyword]}></i>
                            </Tooltip>
                          </div>
                        ) : undefined;
                        break;
                      default:
                        break;
                    }
                    return (
                      <td
                        className={`${activeSegment ? "active" : ""}`}
                        onClick={() => seekPlay(segment, row.name)}
                      >
                        {jsx}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

export default SegmentDetailTable;
