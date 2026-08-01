import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

import { env } from "./env";

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      credentials: true,
      origin: env.clientUrl,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
