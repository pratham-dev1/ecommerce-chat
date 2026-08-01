import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../../config/database";
import { User } from "../users/user.model";
import { Conversation } from "./conversation.model";
import { Message } from "./message.model";

export type ConversationMemberRole = "owner" | "admin" | "member";

export type ConversationMemberAttributes = {
  conversationId: number;
  userId: number;
  role: ConversationMemberRole;
  joinedAt: Date;
  leftAt: Date | null;
  lastReadMessageId: number | null;
};

export type ConversationMemberTimestampAttributes = {
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationMemberCreationAttributes = Optional<
  ConversationMemberAttributes,
  "role" | "joinedAt" | "leftAt" | "lastReadMessageId"
>;

export type ConversationMemberInstance = Model<
  ConversationMemberAttributes,
  ConversationMemberCreationAttributes
> &
  ConversationMemberAttributes &
  ConversationMemberTimestampAttributes;

export const ConversationMember = sequelize.define<ConversationMemberInstance>(
  "ConversationMember",
  {
    conversationId: {
      allowNull: false,
      primaryKey: true,
      references: {
        key: "id",
        model: Conversation,
      },
      type: DataTypes.BIGINT,
    },
    userId: {
      allowNull: false,
      primaryKey: true,
      references: {
        key: "id",
        model: User,
      },
      type: DataTypes.BIGINT,
    },
    role: {
      allowNull: false,
      defaultValue: "member",
      type: DataTypes.ENUM("owner", "admin", "member"),
    },
    joinedAt: {
      allowNull: false,
      defaultValue: DataTypes.NOW,
      type: DataTypes.DATE,
    },
    leftAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    lastReadMessageId: {
      allowNull: true,
      references: {
        key: "id",
        model: Message,
      },
      type: DataTypes.BIGINT,
    },
  },
  {
    tableName: "conversation_members",
    underscored: true,
    timestamps: true,
  },
);
