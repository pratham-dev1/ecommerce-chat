import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../../config/database";
import { AppError } from "../../common/errors/AppError";
import { User } from "../users/user.model";
import {
  ConversationMember,
  type ConversationMemberInstance,
} from "./conversation-member.model";
import { Conversation, type ConversationInstance } from "./conversation.model";
import { Message, type MessageInstance } from "./message.model";
import type {
  CreateDirectConversationInput,
  SendMessageInput,
} from "./chat.validation";

export class ChatService {
  async createDirectConversation(
    senderId: number,
    input: CreateDirectConversationInput,
  ) {
    const receiverId = input.receiverId;

    if (senderId === receiverId) {
      throw new AppError(
        "You cannot create a direct conversation with yourself",
        400,
        "DIRECT_CONVERSATION_SELF_NOT_ALLOWED",
      );
    }

    await this.ensureUserExists(receiverId);

    const directKey = this.createDirectKey(senderId, receiverId);
    const existingConversation = await Conversation.findOne({
      where: {
        directKey,
      },
    });

    if (existingConversation) {
      return {
        conversation: await this.serializeConversationWithMembers(existingConversation),
        wasCreated: false,
      };
    }

    try {
      const conversation = await sequelize.transaction(async (transaction) => {
        const createdConversation = await Conversation.create(
          {
            createdBy: senderId,
            directKey,
            title: null,
            type: "direct",
          },
          { transaction },
        );

        await ConversationMember.bulkCreate(
          [
            {
              conversationId: Number(createdConversation.id),
              role: "member",
              userId: senderId,
            },
            {
              conversationId: Number(createdConversation.id),
              role: "member",
              userId: receiverId,
            },
          ],
          { transaction },
        );

        return createdConversation;
      });

      return {
        conversation: await this.serializeConversationWithMembers(conversation),
        wasCreated: true,
      };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const conversation = await Conversation.findOne({
          where: {
            directKey,
          },
        });

        if (conversation) {
          return {
            conversation: await this.serializeConversationWithMembers(conversation),
            wasCreated: false,
          };
        }
      }

      throw error;
    }
  }

  async listMessages(currentUserId: number, conversationId: number) {
    await this.ensureConversationMember(currentUserId, conversationId);

    const messages = await Message.findAll({
      order: [
        ["createdAt", "ASC"],
        ["id", "ASC"],
      ],
      where: {
        conversationId,
      },
    });

    return messages.map((message) => this.serializeMessage(message));
  }

  async sendMessage(
    currentUserId: number,
    conversationId: number,
    input: SendMessageInput,
  ) {
    await this.ensureConversationMember(currentUserId, conversationId);

    const message = await Message.create({
      body: input.body.trim(),
      conversationId,
      senderId: currentUserId,
    });

    return this.serializeMessage(message);
  }

  private createDirectKey(firstUserId: number, secondUserId: number) {
    return [firstUserId, secondUserId]
      .sort((firstId, secondId) => firstId - secondId)
      .join(":");
  }

  private async ensureUserExists(userId: number) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("Receiver was not found", 404, "RECEIVER_NOT_FOUND");
    }
  }

  private async ensureConversationMember(userId: number, conversationId: number) {
    const member = await ConversationMember.findOne({
      where: {
        conversationId,
        leftAt: null,
        userId,
      },
    });

    if (!member) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }
  }

  private async serializeConversationWithMembers(
    conversation: ConversationInstance,
  ) {
    const members = await ConversationMember.findAll({
      order: [
        ["joinedAt", "ASC"],
        ["userId", "ASC"],
      ],
      where: {
        conversationId: Number(conversation.id),
      },
    });

    return {
      createdAt: conversation.createdAt.toISOString(),
      createdBy: Number(conversation.createdBy),
      deletedAt: conversation.deletedAt?.toISOString() ?? null,
      id: Number(conversation.id),
      members: members.map((member) => this.serializeMember(member)),
      title: conversation.title,
      type: conversation.type,
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }

  private serializeMember(member: ConversationMemberInstance) {
    return {
      conversationId: Number(member.conversationId),
      createdAt: member.createdAt.toISOString(),
      joinedAt: member.joinedAt.toISOString(),
      lastReadMessageId:
        member.lastReadMessageId === null
          ? null
          : Number(member.lastReadMessageId),
      leftAt: member.leftAt?.toISOString() ?? null,
      role: member.role,
      updatedAt: member.updatedAt.toISOString(),
      userId: Number(member.userId),
    };
  }

  private serializeMessage(message: MessageInstance) {
    return {
      body: message.body,
      conversationId: Number(message.conversationId),
      createdAt: message.createdAt.toISOString(),
      deletedAt: message.deletedAt?.toISOString() ?? null,
      editedAt: message.editedAt?.toISOString() ?? null,
      id: Number(message.id),
      messageType: message.messageType,
      senderId: Number(message.senderId),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}
