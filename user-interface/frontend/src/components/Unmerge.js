import React, { useState } from "react";
import * as R from "ramda";
import { Popconfirm, Button } from "antd";
import { useTrack } from "../contexts/TrackProvider";
import { useComments } from "../contexts/CommentsProvider";
import { CloseOutlined, ConsoleSqlOutlined } from "@ant-design/icons";
import DiscussionCard from "./DiscussionCard";
import "../styles/components/unmerge.scss";

export default function Unmerge({ setIsUnmergeOpen, disc }) {
  const { trackEvent } = useTrack();
  const UNMERGE_OPTIONS = {
    UNMERGE_SOURCE: 0,
    UNMERGE_DEST: 1,
    UNMERGE_IGNORE: 2,
  };
  const [commentUnmergeState, setCommentUnmergeState] = useState(
    UNMERGE_OPTIONS["UNMERGE_IGNORE"]
  );
  const { discussions, unmergeUXProblems, setSelectedDisc } = useComments();
  const LAST_MERGE = 0;
  const lastMergeSource = disc.mergeHistory[LAST_MERGE].source;
  const lastMergeDest = disc.mergeHistory[LAST_MERGE].destination;
  const sourceDisc = R.find(R.propEq("_id", lastMergeSource), discussions);
  const destDisc = R.find(R.propEq("_id", lastMergeDest), discussions);

  const confirm = (e) => {
    unmergeUXProblems(
      disc._id,
      sourceDisc._id,
      destDisc._id,
      commentUnmergeState
    );
    trackEvent({
      section: "unmerge-popup",
      action: "unmerge",
      discId: disc._id,
      source: sourceDisc._id,
      destination: destDisc._id,
      commentUnmergeState,
    });
    setIsUnmergeOpen(false);
    setSelectedDisc(undefined);
  };

  const cancel = (e) => {
    // console.log(e);
  };

  return (
    <div className="unmerge-wrapper">
      <div className="unmerge">
        <p className="unmerge-header">Unmerge</p>
        <div className="close-btn" onClick={() => setIsUnmergeOpen(false)}>
          <CloseOutlined />
        </div>
        <div className="unmerge-body">
          <p className="unmerge-info">
            - Please select which thread you would like to place the new
            comments after unmerging (You can select one thread, or none to
            delete the new comments)
          </p>
          <DiscussionCard
            heuristic={sourceDisc.heuristic}
            users={sourceDisc.participants}
            discId={sourceDisc._id}
            severity={sourceDisc.severity}
            time={sourceDisc.time}
            isActive={commentUnmergeState}
            setIsActive={setCommentUnmergeState}
            cardId={UNMERGE_OPTIONS["UNMERGE_SOURCE"]}
            unmergeOptions={UNMERGE_OPTIONS}
          />
          <DiscussionCard
            heuristic={destDisc.heuristic}
            users={destDisc.participants}
            discId={destDisc._id}
            severity={destDisc.severity}
            time={destDisc.time}
            isActive={commentUnmergeState}
            setIsActive={setCommentUnmergeState}
            cardId={UNMERGE_OPTIONS["UNMERGE_DEST"]}
            unmergeOptions={UNMERGE_OPTIONS}
          />
          <Popconfirm
            title="Are you sure to unmerge this problem?"
            onConfirm={confirm}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" className="unmerge-btn">
              Unmerge
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}
