import React from "react";
import * as R from "ramda";
import { connect } from "react-redux";
import { ProjectProvider } from "../contexts/ProjectProvider";
import Loading from "./Loading";
import ProjectInner from "./ProjectInner";
import "../styles/components/project.scss";

export const Project = ({ project, user }) => {
  return (
    <>
      {project ? (
        <ProjectProvider project={project}>
          <ProjectInner project={project} user={user} />
        </ProjectProvider>
      ) : (
        <Loading />
      )}
    </>
  );
};

const mapStateToProps = (state, props) => {
  const selectedId = props.match.params.id;
  const project = R.find(R.propEq("_id", selectedId), state.projects);
  return {
    project,
    user: state.auth,
  };
};

export default connect(mapStateToProps)(Project);
