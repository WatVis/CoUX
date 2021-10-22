import React from "react";
import ProjectSidebar from "./ProjectSidebar";
import Video from "./Video";
import { useProject } from "../contexts/ProjectProvider";
import { CommentsProvider } from "../contexts/CommentsProvider";
import { SocketProvider } from "../contexts/SocketProvider";
import { TrackProvider } from "../contexts/TrackProvider";
import { CommentOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { HeuristicsProvider } from "../contexts/HeuristicProvider";

export default function ProjectInner({ project, user }) {
  const { isMobile, toggleSidebar, setToggleSidebar } = useProject();
  return (
    <div className="project">
      <SocketProvider projectId={project._id}>
        <TrackProvider user={user} project={project}>
          <HeuristicsProvider user={user}>
            <CommentsProvider user={user}>
              {!isMobile ? (
                <>
                  <Video data={project} />
                  <ProjectSidebar data={project} user={user} />
                </>
              ) : (
                <>
                  {toggleSidebar ? (
                    <ProjectSidebar data={project} user={user} />
                  ) : undefined}
                  <Video data={project} />

                  <div
                    className="toggle-sidebar"
                    onClick={() => setToggleSidebar((prevState) => !prevState)}
                  >
                    {toggleSidebar ? (
                      <VideoCameraOutlined />
                    ) : (
                      <CommentOutlined />
                    )}
                  </div>
                </>
              )}
            </CommentsProvider>
          </HeuristicsProvider>
        </TrackProvider>
      </SocketProvider>
    </div>
  );
}
