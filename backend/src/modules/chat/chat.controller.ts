import type { Request, Response } from "express";

import { AppError } from "../../common/errors/AppError";
import { ChatService } from "./chat.service";
import {
  conversationIdParamsSchema,
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
