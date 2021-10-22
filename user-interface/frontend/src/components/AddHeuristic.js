import React, { useState } from "react";
import * as R from "ramda";
import { Form, Input, Button, Select, Tooltip, Radio } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useTrack } from "../contexts/TrackProvider";
import { useHeuristics } from "../contexts/HeuristicProvider";
import "../styles/components/add-heuristic.scss";

const { Option } = Select;

export default function AddHeuristic() {
  const { trackEvent } = useTrack();
  const [scope, setScope] = useState(1);
  const [heuristicName, setHeuristicName] = useState(undefined);
  const [selectedType, setSelectedType] = useState("Nilesen");
  const [selectedTypeText, setSelectedTypeText] = useState(undefined);
  const { heuristics, deleteHeuristic, addHeuristic } = useHeuristics();
  const onFinish = () => {
    addHeuristic({ heuristicName, selectedType, selectedTypeText, scope });
    if (selectedType === "Add New Type") {
      setSelectedType(selectedTypeText);
    }
    trackEvent({
      section: "add-heuristic-form",
      action: "submit",
      heuristicName,
      selectedType,
      selectedTypeText,
      scope,
    });
  };

  const onChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "name") {
      setHeuristicName(value);
    } else if (name === "type-text") {
      setSelectedTypeText(value);
    }
  };

  const onChangeRadio = (e) => {
    setScope(e.target.value);
  };

  const handleChange = (value) => {
    setSelectedType(value);
  };

  const isPredefined = ["Nilesen", "Norman"].includes(selectedType);
  const heuristicTypes = [...Object.keys(heuristics), "Add New Type"];

  const heuristicList = R.propOr([], selectedType, heuristics);
  return (
    <div className="add-heuristic">
      <Form name="heuristic-form">
        <Form.Item label="Type">
          <Select
            onChange={handleChange}
            value={selectedType}
            defaultValue="Nilesen"
            allowClear
          >
            {heuristicTypes.map((el) => {
              return <Option value={el}>{el}</Option>;
            })}
          </Select>
        </Form.Item>
        {selectedType === "Add New Type" && (
          <Form.Item name="type-text" label="Type">
            <Input
              placeholder="Add heuristic type"
              name="type-text"
              onChange={onChange}
              value={selectedTypeText}
            />
          </Form.Item>
        )}

        <Form.Item name="name" label="Title">
          <Input
            placeholder="Add heuristic title"
            onChange={onChange}
            value={heuristicName}
            name="name"
          />
        </Form.Item>
        <Form.Item name="radio-group" label="Scope">
          <Radio.Group onChange={onChangeRadio} value={scope} defaultValue={1}>
            <Radio value={1}>Only This Project</Radio>
            <Radio value={2}>All Projects</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="btn-wrapper">
          <Button
            type="primary"
            htmlType="submit"
            onClick={onFinish}
            disabled={isPredefined}
          >
            Submit
          </Button>
        </div>
      </Form>

      <div className="heuristic-list">
        <p className="list-header">
          {selectedType === "Add New Type" ? selectedTypeText : selectedType}
        </p>
        {heuristicList.map((el) => {
          return (
            <Tooltip title={el.name}>
              <div className="heuristic">
                <p>{el.name}</p>
                {!isPredefined && (
                  <span
                    className="heuristic-delete-btn"
                    onClick={() => {
                      deleteHeuristic(el);
                      trackEvent({
                        section: "add-heuristic-form",
                        action: "delete",
                        heuristicName: el.name,
                        selectedType,
                      });
                    }}
                  >
                    <DeleteOutlined />
                  </span>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
