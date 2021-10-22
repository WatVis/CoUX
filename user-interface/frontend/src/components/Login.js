import React from "react";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import Logo from "./Logo";
import loginSide from "../assets/images/letsWork.svg";
import "../styles/components/login.scss";

export const Login = () => (
  <div className="login">
    <div className="login-header">
      <Logo />
      <Link to="/signup" className="button-transparent">
        Sign Up
      </Link>
    </div>

    <Row>
      <Col span={24}>
        <Row>
          <Col span={12} className="login-left-side">
            <img src={loginSide} alt="login" />
          </Col>
          <Col
            xxl={12}
            xl={12}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            className="login-side"
          >
            <div className="login-form-container">
              <h2>
                Sign in to <strong>CO</strong>/UX
              </h2>

              <LoginForm />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
);

export default Login;
