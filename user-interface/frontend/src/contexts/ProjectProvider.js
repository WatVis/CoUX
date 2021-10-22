import React, { useContext, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size";
import { useSelector } from "react-redux";

const ProjectContext = React.createContext();

export function useProject() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ project, children }) {
  const width = useWindowWidth();
  const isMobile = width < 768;

  const firstSegment = project.audioSegments[0]["_id"];
  const [time, setTime] = useState(0);
  const [segmentId, setSegmentId] = useState(firstSegment);
  const isColab = useSelector((state) => state.auth.isColab);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [stopPlayback, setStopPlayback] = useState(false);

  return (
    <ProjectContext.Provider
      value={{
        project,
        setSegmentId,
        setTime,
        time,
        segmentId,
        isColab,
        isMobile,
        toggleSidebar,
        setToggleSidebar,
        width,
        stopPlayback,
        setStopPlayback,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
