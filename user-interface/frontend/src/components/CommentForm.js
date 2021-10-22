import React, { useEffect, useState } from "react";
import { Form, Input, Button, Slider } from "antd";
import * as R from "ramda";
import { severity, marks, markToSeverity } from "../utils/utils";
import { useComments } from "../contexts/CommentsProvider";
import { useProject } from "../contexts/ProjectProvider";
import "../styles/components/comment-form.scss";

export const CommentForm = ({ isBlur }) => {
  const [form] = Form.useForm();
  const { createComment } = useComments();
  const { time, setStopPlayback, stopPlayback } = useProject();
  const { discussions, selectedDisc } = useComments();
  const disc = R.find(R.propEq("_id", selectedDisc), discussions);
  const isActiveDisc = disc ? disc.isActive : false;
  const initSeverity = 0;
  const isDisable =
    R.any(R.equals(R.prop("status", disc)), ["AGREED", "NOT_AGREED"]) ||
    !isActiveDisc;

  const onFinish = (data) => {
    let finalData = { ...data };
    delete finalData.time;
    finalData.severity = markToSeverity(finalData.severity);
    if (data.time) {
      finalData = { ...finalData, time };
    }
    createComment(
      R.reject((el) => R.or(R.isNil(el), R.isEmpty(el)), finalData)
    );
    form.resetFields();
  };

  const formatter = (value) => severity[markToSeverity(value)];

  const onFieldsChange = () => {
    if (!stopPlayback) {
      setStopPlayback(true);
    }
  };

  return (
    <div className={`comment-form ${isBlur || !isActiveDisc ? "blured" : ""}`}>
      <Form
        form={form}
        name="comment-form"
        onFinish={onFinish}
        initialValues={{
          message: "",
          severity: initSeverity,
        }}
        onFieldsChange={onFieldsChange}
      >
        <Form.Item name="message">
          <Input.TextArea
            placeholder="Leave your comment here..."
            autoSize={{ minRows: 1 }}
            disabled={isDisable}
          />
        </Form.Item>
        <Form.Item className="darker in-comment-wrapper">
          <Form.Item
            name="severity"
            className={`full ${isDisable ? "voting" : ""}`}
            label="Severity Rating"
          >
            <Slider
              marks={marks}
              step={null}
              tipFormatter={formatter}
              disabled={isDisable}
            />
          </Form.Item>
          <Form.Item className="rtl in-comment">
            <Button type="primary" htmlType="submit" disabled={isDisable}>
              Submit
            </Button>
          </Form.Item>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommentForm;
