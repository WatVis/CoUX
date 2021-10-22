import React from "react";
import { Avatar } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import randomColor from "randomcolor";
import { startLogout } from "../actions/auth";
import "../styles/components/nav.scss";

export default function Nav({ isNavOpen }) {
  const { email } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return (
    <div id="nav" className={`nav ${isNavOpen ? "navigation" : ""}`}>
      <div className="nav-user">
        <Avatar
          style={{
            backgroundColor: randomColor({
              seed: email,
            }),
          }}
          className="nav-avatar"
          icon={<UserOutlined />}
          size={{ xs: 48, sm: 48, md: 64, lg: 64, xl: 64, xxl: 64 }}
        />
        <p className="nav-user-email">{email}</p>
      </div>

      <button
        className="nav-user-button"
        onClick={() => dispatch(startLogout())}
      >
        <LogoutOutlined />
        Log Out
      </button>
    </div>
  );
}
