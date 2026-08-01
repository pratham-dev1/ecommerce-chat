import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { useAuthUser } from "@/features/auth";
import { hasAuthSessionHint } from "@/features/auth/utils/authSession";

import { socket } from "./socketClient";

export function SocketConnectionProvider({ children }: PropsWithChildren) {
  const shouldCheckAuth = hasAuthSessionHint();
  const { data: user } = useAuthUser({ enabled: shouldCheckAuth });

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

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      if (socket.connected) {
        socket.disconnect();
      }

      return;
    }

    if (!socket.connected) {
      socket.connect();
    }
  }, [user]);

  return children;
}
