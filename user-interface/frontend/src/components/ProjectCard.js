import React from "react";
import moment from "moment";
import { UserOutlined } from "@ant-design/icons";
import { history } from "../routers/AppRouter";
import { host } from "../actions/consts/host";
import "../styles/components/project-card.scss";

// TODO: need refactor -> thumbnail generator is not good enough

export class ProjectCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      x: 0,
      translate: 0,
    };
  }
  onMouseMove = (e) => {
    const x = e.nativeEvent.offsetX;
    this.setState(() => ({
      x,
      translate:
        Math.floor(x / (270 / this.props.data.preview.thumbCount)) * 270,
    }));
  };

  doRouting = () => {
    history.push(`/project/${this.props.data._id}`);
  };
  render() {
    const {
      name,
      preview,
      duration,
      participants,
      createdAt,
    } = this.props.data;
    const style = {
      backgroundImage: `url(${host}/${preview.url})`,
      backgroundPosition: `-${this.state.translate}px 0px`,
    };
    return (
      <div className="project-card" onClick={this.doRouting}>
        <div className="project-card-inner">
          <div className="project-thumbnail" onMouseMove={this.onMouseMove}>
            <div className="player-wrapper">
              <div style={style} alt="thumbnail" className="thumbnail-image" />
              <div className="scrub-bar" style={{ left: this.state.x }}></div>
            </div>
            <span className="project-duration">
              {moment("2015-01-01")
                .startOf("day")
                .seconds(duration)
                .format("HH:mm:ss")}
            </span>
            <div className="project-status">
              <div className="status-indicator"></div>
              <p>In progress</p>
            </div>
          </div>
          <div className="project-info">
            <h3>{name}</h3>
            <div className="project-info-details">
              {moment(createdAt).format("MMMM Do, YYYY")}
              <div className="comments">
                <UserOutlined />
                <span>{participants ? participants.length : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectCard;
