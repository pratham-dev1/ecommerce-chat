import { httpClient } from "@/services/api/httpClient";

import type { ChatConversation, ChatMessage, Conversation } from "../types/chat";

export type CreateGroupConversationPayload = {
  memberIds: number[];
  title: string;
};

export async function createDirectConversation(receiverId: number) {
  const { data } = await httpClient.post<Conversation>(
    "/chat/conversations/direct",
    {
      receiverId,
    },
  );

  return data;
}

export async function createGroupConversation(
  payload: CreateGroupConversationPayload,
) {
  const { data } = await httpClient.post<Conversation>(
    "/chat/conversations/group",
    payload,
  );

  return data;
}

export async function getConversations() {
  const { data } = await httpClient.get<ChatConversation[]>("/chat/conversations");
  return data;
}

export async function getConversationMessages(conversationId: number) {
  const { data } = await httpClient.get<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
  );

  return data;
}

export async function sendMessage(input: {
  body: string;
  conversationId: number;
}) {
  const { data } = await httpClient.post<ChatMessage>(
    `/chat/conversations/${input.conversationId}/send-message`,
    {
      body: input.body,
    },
  );

  return data;
}
