import { QueryTypes, UniqueConstraintError } from "sequelize";

import { sequelize } from "../../config/database";
import { AppError } from "../../common/errors/AppError";
import { User, type UserInstance } from "../users/user.model";
import {
  ConversationMember,
  type ConversationMemberInstance,
} from "./conversation-member.model";
import { Conversation, type ConversationInstance } from "./conversation.model";
import { Message, type MessageInstance } from "./message.model";
import type {
  CreateDirectConversationInput,
  CreateGroupConversationInput,
  SendMessageInput,
} from "./chat.validation";

type LastMessageRow = {
  body: string;
  conversationId: number | string;
  createdAt: Date | string;
  deletedAt: Date | string | null;
  editedAt: Date | string | null;
  id: number | string;
  messageType: "text";
  senderId: number | string;
  updatedAt: Date | string;
};

type UnreadCountRow = {
  conversationId: number | string;
  unreadCount: number | string;
};

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

  async listConversations(currentUserId: number) {
    const currentMemberships = await ConversationMember.findAll({
      order: [["joinedAt", "DESC"]],
      where: {
        leftAt: null,
        userId: currentUserId,
      },
    });
    const conversationIds = currentMemberships.map((member) =>
      Number(member.conversationId),
    );

    if (conversationIds.length === 0) {
      return [];
    }

    const [conversations, members, lastMessages, unreadCounts] = await Promise.all([
      Conversation.findAll({
        where: {
          id: conversationIds,
        },
      }),
      ConversationMember.findAll({
        order: [
          ["joinedAt", "ASC"],
          ["userId", "ASC"],
        ],
        where: {
          conversationId: conversationIds,
          leftAt: null,
        },
      }),
      this.listLastMessages(conversationIds),
      this.listUnreadCounts(currentUserId, conversationIds),
    ]);
    const userIds = [
      ...new Set(members.map((member) => Number(member.userId))),
    ];
    const users = await User.findAll({
      attributes: ["id", "name", "username", "email"],
      where: {
        id: userIds,
      },
    });
    const usersById = new Map(users.map((user) => [Number(user.id), user]));
    const membersByConversationId = this.groupMembersByConversationId(members);
    const lastMessagesByConversationId = new Map(
      lastMessages.map((message) => [Number(message.conversationId), message]),
    );
    const unreadCountsByConversationId = new Map(
      unreadCounts.map((unreadCount) => [
        Number(unreadCount.conversationId),
        Number(unreadCount.unreadCount),
      ]),
    );

    return conversations
      .map((conversation) => {
        const conversationId = Number(conversation.id);
        const conversationMembers =
          membersByConversationId.get(conversationId) ?? [];
        const serializedMembers = conversationMembers.map((member) =>
          this.serializeMemberWithUser(member, usersById.get(Number(member.userId))),
        );
        const lastMessage = lastMessagesByConversationId.get(conversationId) ?? null;

        return {
          createdAt: conversation.createdAt.toISOString(),
          createdBy: Number(conversation.createdBy),
          deletedAt: conversation.deletedAt?.toISOString() ?? null,
          displayName: this.getConversationDisplayName(
            conversation,
            serializedMembers,
            currentUserId,
          ),
          id: conversationId,
          lastMessage,
          members: serializedMembers,
          title: conversation.title,
          type: conversation.type,
          unreadCount: unreadCountsByConversationId.get(conversationId) ?? 0,
          updatedAt: conversation.updatedAt.toISOString(),
        };
      })
      .sort((firstConversation, secondConversation) => {
        const firstTime = new Date(
          firstConversation.lastMessage?.createdAt ??
            firstConversation.updatedAt,
        ).getTime();
        const secondTime = new Date(
          secondConversation.lastMessage?.createdAt ??
            secondConversation.updatedAt,
        ).getTime();

        return secondTime - firstTime;
      });
  }

  async createGroupConversation(
    creatorId: number,
    input: CreateGroupConversationInput,
  ) {
    if (input.memberIds.includes(creatorId)) {
      throw new AppError(
        "Current user is added to the group automatically",
        400,
        "GROUP_CREATOR_INCLUDED_IN_MEMBERS",
      );
    }

    await this.ensureUsersExist(input.memberIds);

    const conversation = await sequelize.transaction(async (transaction) => {
      const createdConversation = await Conversation.create(
        {
          createdBy: creatorId,
          directKey: null,
          title: input.title.trim(),
          type: "group",
        },
        { transaction },
      );

      await ConversationMember.bulkCreate(
        [
          {
            conversationId: Number(createdConversation.id),
            role: "owner",
            userId: creatorId,
          },
          ...input.memberIds.map((memberId) => ({
            conversationId: Number(createdConversation.id),
            role: "member" as const,
            userId: memberId,
          })),
        ],
        { transaction },
      );

      return createdConversation;
    });

    return this.serializeConversationWithMembers(conversation);
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

  async getActiveConversationMemberIds(conversationId: number) {
    const members = await ConversationMember.findAll({
      attributes: ["userId"],
      where: {
        conversationId,
        leftAt: null,
      },
    });

    return members.map((member) => Number(member.userId));
  }

  async markConversationAsRead(currentUserId: number, conversationId: number) {
    const member = await ConversationMember.findOne({
      where: {
        conversationId,
        leftAt: null,
        userId: currentUserId,
      },
    });

    if (!member) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }

    const latestMessage = await Message.findOne({
      attributes: ["id"],
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      where: {
        conversationId,
      },
    });
    const lastReadMessageId = latestMessage ? Number(latestMessage.id) : null;

    await member.update({
      lastReadMessageId,
    });

    return {
      conversationId,
      lastReadMessageId,
      unreadCount: 0,
    };
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

  private async ensureUsersExist(userIds: number[]) {
    const users = await User.findAll({
      attributes: ["id"],
      where: {
        id: userIds,
      },
    });

    if (users.length !== userIds.length) {
      throw new AppError(
        "One or more group members were not found",
        404,
        "GROUP_MEMBERS_NOT_FOUND",
      );
    }
  }

  async ensureConversationMember(userId: number, conversationId: number) {
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

  private serializeMemberWithUser(
    member: ConversationMemberInstance,
    user: UserInstance | undefined,
  ) {
    return {
      ...this.serializeMember(member),
      user: user ? this.serializeUserSummary(user) : null,
    };
  }

  private serializeUserSummary(user: UserInstance) {
    return {
      email: user.email,
      id: Number(user.id),
      name: user.name,
      username: user.username,
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

  private async listLastMessages(conversationIds: number[]) {
    return sequelize.query<LastMessageRow>(
      `
        SELECT
          id,
          conversation_id AS "conversationId",
          sender_id AS "senderId",
          body,
          message_type AS "messageType",
          edited_at AS "editedAt",
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          deleted_at AS "deletedAt"
        FROM (
          SELECT
            messages.*,
            ROW_NUMBER() OVER (
              PARTITION BY conversation_id
              ORDER BY created_at DESC, id DESC
            ) AS row_number
          FROM messages
          WHERE conversation_id IN (:conversationIds)
            AND deleted_at IS NULL
        ) ranked_messages
        WHERE row_number = 1
      `,
      {
        replacements: {
          conversationIds,
        },
        type: QueryTypes.SELECT,
      },
    ).then((messages) =>
      messages.map((message) => this.serializeLastMessageRow(message)),
    );
  }

  private async listUnreadCounts(currentUserId: number, conversationIds: number[]) {
    return sequelize.query<UnreadCountRow>(
      `
        SELECT
          messages.conversation_id AS "conversationId",
          COUNT(messages.id) AS "unreadCount"
        FROM messages
        INNER JOIN conversation_members current_member
          ON current_member.conversation_id = messages.conversation_id
          AND current_member.user_id = :currentUserId
          AND current_member.left_at IS NULL
        WHERE messages.conversation_id IN (:conversationIds)
          AND messages.sender_id <> :currentUserId
          AND messages.deleted_at IS NULL
          AND (
            current_member.last_read_message_id IS NULL
            OR messages.id > current_member.last_read_message_id
          )
        GROUP BY messages.conversation_id
      `,
      {
        replacements: {
          conversationIds,
          currentUserId,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  private serializeLastMessageRow(message: LastMessageRow) {
    return {
      body: message.body,
      conversationId: Number(message.conversationId),
      createdAt: this.toIsoString(message.createdAt),
      deletedAt: message.deletedAt
        ? this.toIsoString(message.deletedAt)
        : null,
      editedAt: message.editedAt ? this.toIsoString(message.editedAt) : null,
      id: Number(message.id),
      messageType: message.messageType,
      senderId: Number(message.senderId),
      updatedAt: this.toIsoString(message.updatedAt),
    };
  }

  private groupMembersByConversationId(
    members: ConversationMemberInstance[],
  ) {
    const membersByConversationId = new Map<
      number,
      ConversationMemberInstance[]
    >();

    for (const member of members) {
      const conversationId = Number(member.conversationId);
      const conversationMembers =
        membersByConversationId.get(conversationId) ?? [];

      conversationMembers.push(member);
      membersByConversationId.set(conversationId, conversationMembers);
    }

    return membersByConversationId;
  }

  private getConversationDisplayName(
    conversation: ConversationInstance,
    members: Array<
      ReturnType<ChatService["serializeMemberWithUser"]>
    >,
    currentUserId: number,
  ) {
    if (conversation.type === "group") {
      return conversation.title ?? "Group";
    }

    const otherMember = members.find((member) => member.userId !== currentUserId);

    return otherMember?.user?.name ?? "Unknown user";
  }

  private toIsoString(value: Date | string) {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
