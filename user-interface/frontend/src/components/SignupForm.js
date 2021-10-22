import React from "react";
import { connect } from "react-redux";
import { startRegister } from "../actions/auth";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const SignupForm = ({ fetchInProgress, startRegister }) => {
  const onFinish = (values) => {
    if (values.password === values.passwordAgain) {
      startRegister(values.email, values.password);
    } else {
      message.warning("Passwords do not match!");
    }
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
          { min: 8, message: "Password must be minimum 8 characters." },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
          className="login-inputs"
        />
      </Form.Item>
      <Form.Item
        name="passwordAgain"
        rules={[
          {
            required: true,
            message: "Please input your Password!",
          },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              const pass = getFieldValue("password");
              if (value === pass) {
                return Promise.resolve();
              }
              return Promise.reject("Passwords does not match!");
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Repeat Password"
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
          Sign Up
        </Button>
      </Form.Item>
    </Form>
  );
};

const mapStateToProps = (state) => ({
  fetchInProgress: state.fetchInProgress,
});

const mapDispatchToProps = (dispatch) => ({
  startRegister: (user, pass) => dispatch(startRegister(user, pass)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SignupForm);
