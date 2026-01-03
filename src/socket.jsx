import { createContext, useMemo, useContext, useEffect } from "react";
import io from "socket.io-client";
import { server } from "./constants/config";

const SocketContext = createContext();

const getSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    return io(server, {
      autoConnect: true,
      auth: {
        token: localStorage.getItem("chattu-token"),
      },
    });
  }, []);

  useEffect(() => {
    // When we (re)connect, make sure auth token is the latest one
    const onReconnectAttempt = () => {
      socket.auth = { token: localStorage.getItem("chattu-token") };
    };

    socket.io.on("reconnect_attempt", onReconnectAttempt);
    return () => {
      socket.io.off("reconnect_attempt", onReconnectAttempt);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, getSocket };
