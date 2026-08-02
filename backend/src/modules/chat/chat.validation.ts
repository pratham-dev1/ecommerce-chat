import { z } from "zod";

export const createDirectConversationSchema = z
  .object({
    receiverId: z.number().int().positive(),
  })
  .strict();

export const createGroupConversationSchema = z
  .object({
    memberIds: z
      .array(z.number().int().positive())
      .min(1)
      .refine(
        (memberIds) => new Set(memberIds).size === memberIds.length,
        "memberIds must not contain duplicate users",
      ),
    title: z.string().trim().min(1).max(160),
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
export type CreateGroupConversationInput = z.infer<
  typeof createGroupConversationSchema
>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
