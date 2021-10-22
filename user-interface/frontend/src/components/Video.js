import React, { useState, useRef, useCallback, useEffect } from "react";
import moment from "moment";
import * as R from "ramda";
import { Button, Divider } from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  RetweetOutlined,
  SettingOutlined,
  ExpandOutlined,
  LineChartOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from "@ant-design/icons";
import ReactPlayer from "react-player";
import OPDATA from "../assets/data/opResult.json";
import { useTrack } from "../contexts/TrackProvider";
import { useProject } from "../contexts/ProjectProvider";
import VideoTimeline from "./VideoTimeline";
import AnnotationTimeline from "./AnnotationTimeline";
import SegmentAvatars from "./SegmentAvatars";
import SegmentSentimentUxKey from "./SegmentSentimentUxKey";
import ScrollinSpeedChart from "./ScrollingSpeedChart";
import GlobalState from "./GlobalState";
import SegmentDetailTable from "./SegmentDetailTable";
import SegmentConnection from "./SegmentConnection";
import SegmentDetailSankey from "./SegmentDetailSankey";
import "../styles/components/video.scss";

export const Video = ({ data }) => {
  let mounted = false;
  const projectId = data ? data._id : undefined;
  const player = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [played, setPlayed] = useState(0);
  const [chartData] = useState(OPDATA);
  const [showDetails, setShowDetails] = useState(true);
  const { trackEvent } = useTrack();
  const {
    setTime,
    setSegmentId,
    segmentId,
    stopPlayback,
    setStopPlayback,
  } = useProject();
  const audioSegments = data.audioSegments;
  const segments = R.map(R.prop("end"), audioSegments);

  const updateVideoStatue = (playedSeconds) => {
    setTime(playedSeconds);
    const calcSegmentId =
      audioSegments[R.findIndex((el) => playedSeconds < el, segments)];
    const calculatedSegmentId = calcSegmentId
      ? calcSegmentId["_id"]
      : segmentId;

    setSegmentId(calculatedSegmentId);
  };

  const handleProgress = (data) => {
    setPlayed(data.playedSeconds);
    setLoaded(data.loadedSeconds);
    updateVideoStatue(data.playedSeconds);
    localStorage.setItem(
      `coux-project-${projectId}`,
      JSON.stringify({ played: data.playedSeconds })
    );
  };

  const onKeyUp = useCallback(
    (e) => {
      if (e.keyCode === 27) {
        trackEvent({
          section: "video-controls",
          action: "keyPress",
          playPause: isPlaying ? "pause" : "play",
        });
        setIsPlaying((prevIsPlaying) => {
          if (!prevIsPlaying) {
            setStopPlayback(false);
          }
          return !prevIsPlaying;
        });
      }
    },
    [isPlaying]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onKeyUp]);

  useEffect(() => {
    if (stopPlayback === true) {
      setIsPlaying(false);
    }
  }, [stopPlayback]);

  return (
    <div className="video">
      <div className="player-wrapper">
        <ReactPlayer
          url={data.url}
          className="react-player"
          width="100%"
          height="100%"
          playing={isPlaying}
          onProgress={handleProgress}
          onEnded={() => {
            setIsPlaying(false);
          }}
          onReady={(p) => {
            if (!mounted) {
              const { played } = JSON.parse(
                localStorage.getItem(`coux-project-${projectId}`)
              );
              if (played) {
                p.seekTo(played);
                setPlayed(played);
                setLoaded(played);
              }
              mounted = true;
            }
          }}
          ref={player}
        />
        <div className={`controls ${!isPlaying ? "active" : ""}`}>
          <div className="timeline">
            <AnnotationTimeline
              played={played}
              duration={data.duration}
              setPlayed={setPlayed}
              player={player.current}
              projectId={projectId}
            />
            <VideoTimeline
              segments={audioSegments}
              played={played}
              loaded={loaded}
              duration={data.duration}
              setPlayed={setPlayed}
              setLoaded={setLoaded}
              player={player.current}
              projectId={projectId}
            />
          </div>

          <div className="non-timeline">
            <div className="left-controls">
              <Button
                type="primary"
                shape="circle"
                size="large"
                onClick={() => {
                  trackEvent({
                    section: "video-controls",
                    action: "click",
                    playPause: isPlaying ? "pause" : "play",
                  });
                  setIsPlaying((prevIsPlaying) => {
                    if (!prevIsPlaying) {
                      setStopPlayback(false);
                    }
                    return !prevIsPlaying;
                  });
                }}
                icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
              />
              <div className="time">
                <span>
                  {moment("2015-01-01")
                    .startOf("day")
                    .seconds(played)
                    .format("HH:mm:ss")}
                </span>{" "}
                /{" "}
                {moment("2015-01-01")
                  .startOf("day")
                  .seconds(data.duration)
                  .format("HH:mm:ss")}
              </div>
            </div>

            {/* <div className="right-controls">
              <SettingOutlined />
            </div> */}
          </div>
        </div>
      </div>

      {chartData && showDetails && (
        <div className="video-control-data">
          {/* <SegmentDetailSankey
            duration={data.duration}
            segments={audioSegments}
            played={played}
            isPlaying={isPlaying}
          /> */}
          <SegmentConnection
            duration={data.duration}
            segments={audioSegments}
            played={played}
            isPlaying={isPlaying}
          />
          <SegmentDetailTable
            segments={audioSegments}
            played={played}
            setPlayed={setPlayed}
            player={player.current}
            projectId={projectId}
          />
          {/* <Divider dashed /> */}
          <ScrollinSpeedChart
            chartData={data.scrollingSpeed}
            sceneBreaks={data.sceneBreaks}
            duration={data.duration}
            segments={audioSegments}
            played={played}
            isPlaying={isPlaying}
            projectId={projectId}
            setPlayed={setPlayed}
            player={player.current}
          />
        </div>
      )}
    </div>
  );
};

export default Video;
