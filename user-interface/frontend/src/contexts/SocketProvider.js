import React, { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { host } from "../actions/consts/host";

const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ projectId, children }) {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const newSocket = io(host, { query: { projectId: projectId } });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [projectId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
