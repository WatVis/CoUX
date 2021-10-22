import React, { useContext, useEffect } from "react";
import * as R from "ramda";
import { useSocket } from "./SocketProvider";
import { useProject } from "./ProjectProvider";

const TrackContext = React.createContext();

export function useTrack() {
  return useContext(TrackContext);
}

export function TrackProvider({ project, user, children }) {
  const socket = useSocket();
  const { time, segmentId, isColab } = useProject();

  const trackEvent = (data) => {
    log({
      ...data,
      projectId: project._id,
      userId: user._id,
      userEmail: user.email,
      segmentId,
      videoTime: time,
      timestamp: Date.now(),
      isColab,
    });
  };

  const log = (data) => {
    const isInlogMode = R.propOr(false, "logData", user);
    if (isInlogMode) {
      socket.emit("log", data);
    }
  };

  return (
    <TrackContext.Provider value={{ trackEvent }}>
      {children}
    </TrackContext.Provider>
  );
}
