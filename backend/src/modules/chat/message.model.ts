import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../../config/database";
import { User } from "../users/user.model";
import { Conversation } from "./conversation.model";

export type MessageType = "text";

export type MessageAttributes = {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  messageType: MessageType;
  editedAt: Date | null;
};

export type MessageTimestampAttributes = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type MessageCreationAttributes = Optional<
  MessageAttributes,
  "id" | "messageType" | "editedAt"
>;

export type MessageInstance = Model<MessageAttributes, MessageCreationAttributes> &
  MessageAttributes &
  MessageTimestampAttributes;

export const Message = sequelize.define<MessageInstance>(
  "Message",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    conversationId: {
      allowNull: false,
      references: {
        key: "id",
        model: Conversation,
      },
      type: DataTypes.BIGINT,
    },
    senderId: {
      allowNull: false,
      references: {
        key: "id",
        model: User,
      },
      type: DataTypes.BIGINT,
    },
    body: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    messageType: {
      allowNull: false,
      defaultValue: "text",
      type: DataTypes.ENUM("text"),
    },
    editedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  },
  {
    paranoid: true,
    tableName: "messages",
    underscored: true,
    timestamps: true,
  },
);
