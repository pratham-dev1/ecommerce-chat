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

export type ConversationMemberUser = {
  email: string;
  id: number;
  name: string;
  username: string;
};

export type ConversationMemberWithUser = ConversationMember & {
  user: ConversationMemberUser | null;
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

export type ChatConversation = Omit<Conversation, "members"> & {
  displayName: string;
  lastMessage: ChatMessage | null;
  members: ConversationMemberWithUser[];
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
