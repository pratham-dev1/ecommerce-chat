import { httpClient } from "@/services/api/httpClient";

import type { ChatMessage, Conversation } from "../types/chat";

export async function createDirectConversation(receiverId: number) {
  const { data } = await httpClient.post<Conversation>(
    "/chat/conversations/direct",
    {
      receiverId,
    },
  );

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
