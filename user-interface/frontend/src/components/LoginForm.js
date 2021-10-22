import React from "react";
import { connect } from "react-redux";
import { startLogin } from "../actions/auth";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const LoginForm = ({ fetchInProgress, startLogin }) => {
  const onFinish = (values) => {
    startLogin(values.email, values.password);
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: "Please input your Email!",
          },
        ]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="Email"
          className="login-inputs"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your Password!",
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
          className="login-inputs"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="login-form-button"
          loading={fetchInProgress}
        >
          Log In
        </Button>
      </Form.Item>
    </Form>
  );
};

const mapStateToProps = (state) => ({
  fetchInProgress: state.fetchInProgress,
});

const mapDispatchToProps = (dispatch) => ({
  startLogin: (user, pass) => dispatch(startLogin(user, pass)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
