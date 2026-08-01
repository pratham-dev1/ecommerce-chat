import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { socket } from "./socketClient";

export function SocketConnectionProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const handleConnect = () => {
      console.log(`Socket connected: ${socket.id}`);
    };
    const handleDisconnect = (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);
    };
    const handleConnectError = (error: Error) => {
      console.error("Socket connection failed", error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, []);

  return children;
}
