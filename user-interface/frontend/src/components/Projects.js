import React from "react";
import { connect } from "react-redux";
import ProjectCard from "./ProjectCard";
import { Empty, Row, Col } from "antd";
import "../styles/components/projects.scss";

export const Projects = ({ videos }) => {
  return (
    <>
      <Row className="projects" gutter={8}>
        {videos.length > 0 ? (
          videos.map((video) => (
            <Col
              xxl={6}
              xl={6}
              lg={8}
              md={12}
              sm={12}
              xs={24}
              className="project-card-wrapper"
            >
              <ProjectCard key={video.name} data={video} />
            </Col>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Row>
    </>
  );
};

const mapStateToProps = (state) => ({
  videos: state.projects,
});

export default connect(mapStateToProps)(Projects);
