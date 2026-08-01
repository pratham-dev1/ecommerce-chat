import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../../config/database";
import { User } from "../users/user.model";

export type ConversationType = "direct" | "group";

export type ConversationAttributes = {
  id: number;
  type: ConversationType;
  title: string | null;
  directKey: string | null;
  createdBy: number;
};

export type ConversationTimestampAttributes = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ConversationCreationAttributes = Optional<
  ConversationAttributes,
  "id" | "title" | "directKey"
>;

export type ConversationInstance = Model<
  ConversationAttributes,
  ConversationCreationAttributes
> &
  ConversationAttributes &
  ConversationTimestampAttributes;

export const Conversation = sequelize.define<ConversationInstance>(
  "Conversation",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM("direct", "group"),
    },
    title: {
      allowNull: true,
      type: DataTypes.STRING(160),
    },
    directKey: {
      allowNull: true,
      type: DataTypes.STRING(255),
      unique: true,
    },
    createdBy: {
      allowNull: false,
      references: {
        key: "id",
        model: User,
      },
      type: DataTypes.BIGINT,
    },
  },
  {
    paranoid: true,
    tableName: "conversations",
    underscored: true,
    timestamps: true,
  },
);
