import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate";
import { validateRequest } from "../../common/middleware/validateRequest";
import { asyncHandler } from "../../common/utils/asyncHandler";
import {
  createDirectConversationController,
  createGroupConversationController,
  listConversationsController,
  listMessagesController,
  sendMessageController,
} from "./chat.controller";
import {
  conversationIdParamsSchema,
  createDirectConversationSchema,
  createGroupConversationSchema,
  sendMessageSchema,
} from "./chat.validation";

export const chatRouter = Router();

chatRouter.post(
  "/conversations/direct",
  authenticate,
  validateRequest({ body: createDirectConversationSchema }),
  asyncHandler(createDirectConversationController),
);

chatRouter.post(
  "/conversations/group",
  authenticate,
  validateRequest({ body: createGroupConversationSchema }),
  asyncHandler(createGroupConversationController),
);

chatRouter.get(
  "/conversations",
  authenticate,
  asyncHandler(listConversationsController),
);

chatRouter.get(
  "/conversations/:conversationId/messages",
  authenticate,
  validateRequest({ params: conversationIdParamsSchema }),
  asyncHandler(listMessagesController),
);

chatRouter.post(
  "/conversations/:conversationId/send-message",
  authenticate,
  validateRequest({
    body: sendMessageSchema,
    params: conversationIdParamsSchema,
  }),
  asyncHandler(sendMessageController),
);
