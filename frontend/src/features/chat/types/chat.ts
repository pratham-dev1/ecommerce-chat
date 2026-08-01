export type ConversationMember = {
  conversationId: number;
  createdAt: string;
  joinedAt: string;
  lastReadMessageId: number | null;
  leftAt: string | null;
  role: "admin" | "member" | "owner";
  updatedAt: string;
  userId: number;
};

export type Conversation = {
  createdAt: string;
  createdBy: number;
  deletedAt: string | null;
  id: number;
  members: ConversationMember[];
  title: string | null;
  type: "direct" | "group";
  updatedAt: string;
};

export type ChatMessage = {
  body: string;
  conversationId: number;
  createdAt: string;
  deletedAt: string | null;
  editedAt: string | null;
  id: number;
  messageType: "text";
  senderId: number;
  updatedAt: string;
};
