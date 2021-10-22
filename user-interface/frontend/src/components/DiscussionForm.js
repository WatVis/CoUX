import React, { useState } from "react";
import { Form, Input, Button, Select, Slider, Checkbox, Drawer } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { severity, marks, markToSeverity } from "../utils/utils";
import moment from "moment";
import * as R from "ramda";
import { useComments } from "../contexts/CommentsProvider";
import { useProject } from "../contexts/ProjectProvider";
import { useHeuristics } from "../contexts/HeuristicProvider";
import { useTrack } from "../contexts/TrackProvider";
import AddHeuristic from "./AddHeuristic";
import "../styles/components/comment-form.scss";

const { Option, OptGroup } = Select;

export const DiscussionForm = ({ isBlur }) => {
  const { trackEvent } = useTrack();
  const [form] = Form.useForm();
  const [showDrawer, setShowDrawer] = useState(false);
  const { createUXProblem } = useComments();
  const { time, setStopPlayback, stopPlayback } = useProject();
  const { projectHeuristics } = useHeuristics();

  const onFinish = (data) => {
    let finalData = { ...data };
    delete finalData.time;
    finalData.severity = markToSeverity(finalData.severity);
    if (data.time) {
      finalData = { ...finalData, time };
    }
    createUXProblem(
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
    <div className={`comment-form ${isBlur ? "blured" : ""}`}>
      <Form
        form={form}
        name="discussion-form"
        onFinish={onFinish}
        initialValues={{
          message: "",
          heuristic: undefined,
          severity: 0,
          time: true,
        }}
        onFieldsChange={onFieldsChange}
      >
        <Form.Item name="message">
          <Input.TextArea
            placeholder="Leave your comment here..."
            autoSize={{ minRows: 1 }}
          />
        </Form.Item>
        <Form.Item className="darker">
          <Form.Item
            name="heuristic"
            className="half"
            label="Heuristic"
            rules={[
              {
                required: true,
                message: "Please select a heuristic!",
              },
            ]}
            hasFeedback
          >
            <Select
              placeholder="Please select a heuristic"
              allowClear
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div
                    onClick={() => {
                      setShowDrawer(true);
                      trackEvent({
                        section: "discussion-form-add-heuristic-btn",
                        action: "click",
                      });
                    }}
                    className="select-add-btn"
                  >
                    <PlusOutlined /> Add Heuristic
                  </div>
                </div>
              )}
            >
              {Object.keys(projectHeuristics).map((type) => {
                return (
                  <OptGroup label={type}>
                    {projectHeuristics[type].map((h) => (
                      <Option value={h.name} key={h.name}>
                        {h.name}
                      </Option>
                    ))}
                  </OptGroup>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="severity" className="half" label="Severity Rating">
            <Slider marks={marks} step={null} tipFormatter={formatter} />
          </Form.Item>
        </Form.Item>
        <Form.Item className="form-controls">
          <Form.Item name="time" className="half" valuePropName="checked">
            <Checkbox className="time">
              {moment("2015-01-01")
                .startOf("day")
                .seconds(time)
                .format("mm:ss")}
            </Checkbox>
          </Form.Item>

          <Form.Item className="half rtl">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form.Item>
      </Form>
      <Drawer
        title="Add Heuristic"
        placement="left"
        closable={false}
        onClose={() => setShowDrawer(false)}
        visible={showDrawer}
        key="Add Heuristic"
        width={400}
      >
        <AddHeuristic />
      </Drawer>
    </div>
  );
};

export default DiscussionForm;
