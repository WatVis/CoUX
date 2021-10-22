import React, { useState } from "react";
import * as R from "ramda";
import { Form, Select, message, Button, Drawer } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useHeuristics } from "../contexts/HeuristicProvider";
import { useComments } from "../contexts/CommentsProvider";
import { useTrack } from "../contexts/TrackProvider";
import AddHeuristic from "./AddHeuristic";
import "../styles/components/edit-heuristic.scss";

const { Option, OptGroup } = Select;

export default function EditDiscHeuristic({
  setIsEditHeuristicOpen,
  discHeuristics,
}) {
  const { trackEvent } = useTrack();
  const [form] = Form.useForm();
  const [showDrawer, setShowDrawer] = useState(false);
  const { heuristics, projectHeuristics } = useHeuristics();
  const { editHeuristicsUXProblem, selectedDisc } = useComments();

  const onFinish = (data) => {
    editHeuristicsUXProblem(selectedDisc, data.heuristic);
    setIsEditHeuristicOpen(false);
    trackEvent({
      section: "edit-annotation-heuristics",
      action: "submit",
      heuristics: data.heuristic,
      discId: selectedDisc,
    });
  };

  return (
    <div className="edit-heuristic-wrapper">
      <div className="edit-heuristic">
        <p className="edit-heuristic-header">Edit Heuristics</p>
        <div
          className="close-btn"
          onClick={() => setIsEditHeuristicOpen(false)}
        >
          <CloseOutlined />
        </div>
        <div className="edit-heuristic-form">
          <Form
            form={form}
            name="heuristic-form"
            initialValues={{ heuristic: discHeuristics }}
            onFinish={onFinish}
          >
            <Form.Item
              name="heuristic"
              label="Heuristic"
              rules={[
                {
                  required: true,
                  message: "You should at least have one heuristic!",
                },
              ]}
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                tokenSeparators={[","]}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div
                      onClick={() => setShowDrawer(true)}
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
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <Drawer
        title="Add Heuristic"
        placement="left"
        closable={false}
        onClose={() => setShowDrawer(false)}
        visible={showDrawer}
        key="Add Heuristic"
        width={400}
      >
        <AddHeuristic heuristics={heuristics} />
      </Drawer>
    </div>
  );
}
