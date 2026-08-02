import { io } from "socket.io-client";

import { env } from "@/config/env";
import type { ChatMessage } from "@/features/chat/types/chat";

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

export type SendSocketMessageResponse =
  | {
      message: ChatMessage;
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

export function sendSocketMessage(input: {
  body: string;
  conversationId: number;
}) {
  return new Promise<ChatMessage>((resolve, reject) => {
    socket.timeout(5000).emit(
      "message:send",
      input,
      (error: Error | null, response?: SendSocketMessageResponse) => {
        if (error) {
          reject(error);
          return;
        }

        if (!response) {
          reject(new Error("Message send did not return a response"));
          return;
        }

        if (!response.ok) {
          reject(new Error(response.message));
          return;
        }

        resolve(response.message);
      },
    );
  });
}
