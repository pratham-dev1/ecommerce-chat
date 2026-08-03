import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

import { AppError } from "../common/errors/AppError";
import { ChatService } from "../modules/chat/chat.service";
import { env } from "./env";
import { accessTokenCookieName } from "../modules/auth/auth.cookie";
import { verifyAccessToken } from "../modules/auth/token";

const chatService = new ChatService();

type JoinConversationAck =
  | {
      conversationId: number;
      ok: true;
    }
  | {
      code: string;
      message: string;
      ok: false;
    };

type SocketChatMessage = Awaited<ReturnType<ChatService["sendMessage"]>>;

type ConversationUpdatedPayload = {
  conversationId: number;
  lastMessage: SocketChatMessage;
};

type SendMessageAck =
  | {
      message: SocketChatMessage;
      ok: true;
    }
  | {
      code: string;
      message: string;
      ok: false;
    };

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      credentials: true,
      origin: env.clientUrl,
    },
  });

  io.use((socket, next) => {
    const token = getHandshakeAccessToken(socket.handshake.headers);

    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      next(new Error("Invalid or expired token"));
      return;
    }

    socket.data.userId = payload.sub;
    next();
  });

  io.on("connection", (socket) => {
    const currentUserId = Number(socket.data.userId);

    socket.join(getUserRoomName(currentUserId));

    console.log(`Socket connected: ${socket.id} (user ${currentUserId})`);

    socket.on(
      "conversation:join",
      async (payload: unknown, ack?: (response: JoinConversationAck) => void) => {
        try {
          const conversationId = getConversationIdFromPayload(payload);
          const currentUserId = Number(socket.data.userId);

          await chatService.ensureConversationMember(currentUserId, conversationId);
          await socket.join(getConversationRoomName(conversationId));

          ack?.({
            conversationId,
            ok: true,
          });
        } catch (error) {
          ack?.(toJoinConversationError(error));
        }
      },
    );

    socket.on(
      "message:send",
      async (payload: unknown, ack?: (response: SendMessageAck) => void) => {
        try {
          const { body, conversationId } = getSendMessagePayload(payload);
          const currentUserId = Number(socket.data.userId);
          const message = await chatService.sendMessage(
            currentUserId,
            conversationId,
            { body },
          );

          io.to(getConversationRoomName(conversationId)).emit(
            "message:new",
            message,
          );

          const memberIds = await chatService.getActiveConversationMemberIds(
            conversationId,
          );
          const conversationUpdatedPayload: ConversationUpdatedPayload = {
            conversationId,
            lastMessage: message,
          };

          for (const memberId of memberIds) {
            io.to(getUserRoomName(memberId)).emit(
              "conversation:updated",
              conversationUpdatedPayload,
            );
          }

          ack?.({
            message,
            ok: true,
          });
        } catch (error) {
          ack?.(toSendMessageError(error));
        }
      },
    );

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

function getConversationRoomName(conversationId: number) {
  return `conversation:${conversationId}`;
}

function getUserRoomName(userId: number) {
  return `user:${userId}`;
}

function getConversationIdFromPayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    throw new AppError(
      "conversationId is required",
      400,
      "CONVERSATION_ID_REQUIRED",
    );
  }

  const conversationIdValue = (payload as { conversationId?: unknown })
    .conversationId;
  const conversationId =
    typeof conversationIdValue === "number"
      ? conversationIdValue
      : typeof conversationIdValue === "string"
        ? Number(conversationIdValue)
        : NaN;

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    throw new AppError(
      "conversationId must be a positive integer",
      400,
      "INVALID_CONVERSATION_ID",
    );
  }

  return conversationId;
}

function getSendMessagePayload(payload: unknown) {
  const conversationId = getConversationIdFromPayload(payload);

  if (typeof payload !== "object" || payload === null) {
    throw new AppError("Message body is required", 400, "MESSAGE_BODY_REQUIRED");
  }

  const bodyValue = (payload as { body?: unknown }).body;

  if (typeof bodyValue !== "string") {
    throw new AppError("Message body is required", 400, "MESSAGE_BODY_REQUIRED");
  }

  const body = bodyValue.trim();

  if (!body) {
    throw new AppError("Message body is required", 400, "MESSAGE_BODY_REQUIRED");
  }

  if (body.length > 4000) {
    throw new AppError(
      "Message body must be at most 4000 characters",
      400,
      "MESSAGE_BODY_TOO_LONG",
    );
  }

  return {
    body,
    conversationId,
  };
}

function toJoinConversationError(error: unknown): JoinConversationAck {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ok: false,
    };
  }

  return {
    code: "JOIN_CONVERSATION_FAILED",
    message: "Failed to join conversation",
    ok: false,
  };
}

function toSendMessageError(error: unknown): SendMessageAck {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ok: false,
    };
  }

  return {
    code: "SEND_MESSAGE_FAILED",
    message: "Failed to send message",
    ok: false,
  };
}

function getHandshakeAccessToken(headers: {
  authorization?: string | string[];
  cookie?: string | string[];
}) {
  const cookieHeader = Array.isArray(headers.cookie) ? headers.cookie.join("; ") : headers.cookie;
  const cookieToken = cookieHeader ? getCookieValue(cookieHeader, accessTokenCookieName) : undefined;

  if (cookieToken) {
    return cookieToken;
  }

  const authorizationHeader = Array.isArray(headers.authorization)
    ? headers.authorization[0]
    : headers.authorization;

  return authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : undefined;
}

function getCookieValue(cookieHeader: string, name: string) {
  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName === name) {
      return decodeCookieValue(rawValueParts.join("="));
    }
  }

  return undefined;
}

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
