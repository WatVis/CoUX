import React from "react";
import Comments from "./Comments";
import "../styles/components/project-sidebar.scss";

export const ProjectSidebar = ({ data, user }) => {
  return (
    <div className="project-sidebar">
      <Comments />
    </div>
  );
};

export default ProjectSidebar;
