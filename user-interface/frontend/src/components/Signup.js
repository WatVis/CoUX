import React from "react";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import SignupForm from "./SignupForm";
import loginSide from "../assets/images/letsWork.svg";
import "../styles/components/login.scss";

export const Signup = () => (
  <div className="login">
    <div className="login-header">
      <div className="logo">
        <strong>CO</strong>UX
      </div>
      <Link to="/login" className="button-transparent">
        Log In
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
                Get started <strong>CO</strong>/UX
              </h2>

              <SignupForm />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
);

export default Signup;
