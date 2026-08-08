import type { Request, Response } from "express";

import { AppError } from "../../common/errors/AppError";
import { emitConversationRead } from "../../config/socket";
import { ChatService } from "./chat.service";
import {
  conversationIdParamsSchema,
  createGroupConversationSchema,
  sendMessageSchema,
} from "./chat.validation";

const chatService = new ChatService();

export async function createDirectConversationController(
  req: Request,
  res: Response,
) {
  if (!req.userId) {
    throw new AppError("Current user is not available", 401, "AUTH_REQUIRED");
  }

  const { conversation, wasCreated } = await chatService.createDirectConversation(
    Number(req.userId),
    req.body,
  );

  res.status(wasCreated ? 201 : 200).json(conversation);
}

export async function createGroupConversationController(
  req: Request,
  res: Response,
) {
  if (!req.userId) {
    throw new AppError("Current user is not available", 401, "AUTH_REQUIRED");
  }

  const input = createGroupConversationSchema.parse(req.body);
  const conversation = await chatService.createGroupConversation(
    Number(req.userId),
    input,
  );

  res.status(201).json(conversation);
}

export async function listConversationsController(req: Request, res: Response) {
  if (!req.userId) {
    throw new AppError("Current user is not available", 401, "AUTH_REQUIRED");
  }

  const conversations = await chatService.listConversations(Number(req.userId));

  res.status(200).json(conversations);
}

export async function listMessagesController(req: Request, res: Response) {
  if (!req.userId) {
    throw new AppError("Current user is not available", 401, "AUTH_REQUIRED");
  }

  const { conversationId } = conversationIdParamsSchema.parse(req.params);
  const messages = await chatService.listMessages(
    Number(req.userId),
    Number(conversationId),
  );

  res.status(200).json(messages);
}

export async function markConversationReadController(
  req: Request,
  res: Response,
) {
  if (!req.userId) {
    throw new AppError("Current user is not available", 401, "AUTH_REQUIRED");
  }

  const { conversationId } = conversationIdParamsSchema.parse(req.params);
  const readState = await chatService.markConversationAsRead(
    Number(req.userId),
    Number(conversationId),
  );
  const memberIds = await chatService.getActiveConversationMemberIds(
    Number(conversationId),
  );

  emitConversationRead(readState, memberIds);

  res.status(200).json(readState);
}

export async function sendMessageController(req: Request, res: Response) {
  if (!req.userId) {
    throw new AppError("Current user is not available", 401, "AUTH_REQUIRED");
  }

  const { conversationId } = conversationIdParamsSchema.parse(req.params);
  const input = sendMessageSchema.parse(req.body);
  const message = await chatService.sendMessage(
    Number(req.userId),
    Number(conversationId),
    input,
  );

  res.status(201).json(message);
}
