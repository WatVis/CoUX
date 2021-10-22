import React, { useContext, useState, useEffect, useCallback } from "react";
import { message } from "antd";
import * as R from "ramda";
import axios from "axios";
import { host } from "../actions/consts/host";
import { useProject } from "./ProjectProvider";
import { useSocket } from "./SocketProvider";

const HeuristicsContext = React.createContext();

export function useHeuristics() {
  return useContext(HeuristicsContext);
}

export function HeuristicsProvider({ user, children }) {
  const socket = useSocket();
  const { project } = useProject();
  const [sourceHeuristics, setSourceHeuristics] = useState([]);
  const [heuristics, setHeuristics] = useState([]);
  const [projectHeuristics, setProjectHeuristics] = useState([]);

  const addHeuristicToState = useCallback(
    (heuristic) => {
      setSourceHeuristics((prevHeuristics) => {
        return [...prevHeuristics, heuristic];
      });
    },
    [setSourceHeuristics]
  );

  const removeHeuristic = useCallback(
    (heuristicId) => {
      setSourceHeuristics((prevHeuristics) => {
        const heuristics = prevHeuristics.filter(
          (heuristics) => heuristics["_id"] !== heuristicId
        );
        return heuristics;
      });
    },
    [setSourceHeuristics]
  );

  useEffect(() => {
    const filteredHeuristics = R.filter((el) => {
      const hasId = R.isNil(el.projectId);
      const noFilter = hasId ? true : el.projectId === project._id;
      return noFilter;
    }, sourceHeuristics);
    const finalHeuristics = R.groupBy(R.prop("type"), filteredHeuristics);
    setProjectHeuristics(finalHeuristics);
  }, [heuristics, project]);

  useEffect(() => {
    const finalHeuristics = R.groupBy(R.prop("type"), sourceHeuristics);
    setHeuristics(finalHeuristics);
  }, [sourceHeuristics]);

  useEffect(() => {
    async function getHeuristics() {
      const { data } = await axios.get(`${host}/heuristics`);
      setSourceHeuristics(data);
    }
    getHeuristics();
  }, []);

  useEffect(() => {
    if (socket == null) return;

    socket.on("receive-heuristic", addHeuristicToState);
    socket.on("remove-heuristic", removeHeuristic);
  }, [socket, addHeuristicToState, removeHeuristic]);

  const deleteHeuristic = (heuristic) => {
    const heuristicUserId = R.propOr(undefined, "userId", heuristic);
    if (heuristicUserId === user._id) {
      socket.emit("delete-heuristic", {
        heuristicId: heuristic._id,
      });
    } else {
      message.error("You can only delete your own heuristics.");
    }
  };

  const addHeuristic = (data) => {
    const heuristicType =
      data.selectedType === "Add New Type"
        ? data.selectedTypeText
        : data.selectedType;
    const projectId = data.scope === 1 ? project._id : undefined;
    const heuristic = {
      name: data.heuristicName,
      type: heuristicType,
      userId: user._id,
      projectId: projectId,
    };
    socket.emit("add-heuristic", {
      heuristic,
    });
  };

  return (
    <HeuristicsContext.Provider
      value={{
        heuristics,
        deleteHeuristic,
        addHeuristic,
        projectHeuristics,
      }}
    >
      {children}
    </HeuristicsContext.Provider>
  );
}
