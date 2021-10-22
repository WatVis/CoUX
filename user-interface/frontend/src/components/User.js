import React from "react";
import { connect } from "react-redux";
import { Popover, Avatar, Badge } from "antd";
import { UserOutlined, CaretDownOutlined } from "@ant-design/icons";
import randomColor from "randomcolor";
import { startLogout } from "../actions/auth";
import "../styles/components/user.scss";

const User = ({ startLogout, email }) => (
  <div className="user">
    <Popover
      content={<Content startLogout={startLogout} />}
      trigger="click"
      placement="topRight"
    >
      <div className="user-info">
        <div className="text-left ml-2 mt-2">
          <p className="user-email">{email}</p>
        </div>
        <div className="avatar">
          <Badge dot>
            <Avatar
              style={{
                backgroundColor: randomColor({
                  seed: email,
                }),
              }}
              icon={<UserOutlined />}
            />
          </Badge>
          <CaretDownOutlined className="user-dropdown-icon" />
        </div>
      </div>
    </Popover>
  </div>
);

const Content = (props) => (
  <div className="user-popup">
    <button className="user-dropdown-button" onClick={props.startLogout}>
      Log Out
    </button>
  </div>
);

const mapDispatchToProps = (dispatch) => ({
  startLogout: () => dispatch(startLogout()),
});

const mapStateToProps = (state) => ({
  email: state.auth.email,
});

export default connect(mapStateToProps, mapDispatchToProps)(User);
