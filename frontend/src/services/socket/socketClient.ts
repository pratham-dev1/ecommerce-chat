import { io } from "socket.io-client";

import { env } from "@/config/env";

export const socket = io(env.socketBaseUrl, {
  autoConnect: false,
  withCredentials: true,
});

export type JoinConversationResponse =
  | {
      conversationId: number;
      ok: true;
    }
  | {
      code: string;
      message: string;
      ok: false;
    };

export function joinConversationRoom(conversationId: number) {
  return new Promise<JoinConversationResponse>((resolve, reject) => {
    socket.timeout(5000).emit(
      "conversation:join",
      { conversationId },
      (error: Error | null, response?: JoinConversationResponse) => {
        if (error) {
          reject(error);
          return;
        }

        if (!response) {
          reject(new Error("Conversation join did not return a response"));
          return;
        }

        resolve(response);
      },
    );
  });
}
