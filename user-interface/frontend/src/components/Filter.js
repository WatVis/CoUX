import React from "react";
import * as R from "ramda";
import { Form, Select, Input, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { nielsonHeuristics } from "../utils/utils";
import { useComments } from "../contexts/CommentsProvider";
import "../styles/components/filter.scss";

export const marks = {
  0: "TBD",
  1: "0",
  2: "1",
  3: "2",
  4: "3",
  5: "4",
};

const { Option } = Select;

const STATUS = {
  AGREED: "Agreed",
  NOT_AGREED: "Disagreed",
  IN_PROGRESS: "In-Progress",
};

export default function Filter({ setIsFilterOpen }) {
  const [form] = Form.useForm();
  const { filters, setFilters, resetFilters } = useComments();

  const onFinish = (data) => {
    setFilters(data);
    setIsFilterOpen(false);
  };

  const onReset = () => {
    resetFilters();
    form.resetFields();
  };

  return (
    <div className="filter-wrapper">
      <div className="filter">
        <p className="filter-header">Filter</p>
        <div className="close-btn" onClick={() => setIsFilterOpen(false)}>
          <CloseOutlined />
        </div>
        <div className="filter-form">
          <Form
            form={form}
            name="filter-form"
            onFinish={onFinish}
            initialValues={filters}
          >
            <Form.Item name="message" label="By Text">
              <Input placeholder="Enter Text ..." />
            </Form.Item>
            <Form.Item name="heuristic" label="By Nielson’s heuristic">
              <Select
                mode="multiple"
                allowClear
                placeholder="Please select heuristic"
                maxTagCount={1}
              >
                {nielsonHeuristics.map((el) => (
                  <Option value={el} key={el}>
                    {el}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Form.Item
                name="severity"
                className="half"
                label="By Severity Rating"
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Please select severity"
                  maxTagCount={1}
                >
                  {R.keys(marks).map((el) => (
                    <Option value={el} key={el}>
                      {marks[el]}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="state"
                className="half"
                label="By UX Problem Status"
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Please select state"
                  maxTagCount={1}
                >
                  {R.keys(STATUS).map((el) => (
                    <Option value={el} key={el}>
                      {STATUS[el]}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form.Item>
            {/* <Form.Item name="participants" label="By Participants">
              <Select
                mode="multiple"
                allowClear
                placeholder="Please select participants"
                maxTagCount="responsive"
                maxTagCount={1}
              >
                {[
                  "ehsan.jsoure@gmail.com",
                  "test@test.com",
                  "test2@test.com",
                ].map((el) => (
                  <Option value={el} key={el}>
                    {el}
                  </Option>
                ))}
              </Select>
            </Form.Item> */}
            <Form.Item className="form-controls">
              <Button type="primary" htmlType="submit">
                Set Filters
              </Button>
              <Button
                htmlType="button"
                onClick={onReset}
                type="text"
                className="reset-btn"
              >
                Clear Filters
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
