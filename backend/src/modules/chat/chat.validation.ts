import { z } from "zod";

export const createDirectConversationSchema = z
  .object({
    receiverId: z.number().int().positive(),
  })
  .strict();

export const conversationIdParamsSchema = z.object({
  conversationId: z.string().regex(/^\d+$/),
});

export const sendMessageSchema = z
  .object({
    body: z.string().trim().min(1).max(4000),
  })
  .strict();

export type CreateDirectConversationInput = z.infer<
  typeof createDirectConversationSchema
>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
