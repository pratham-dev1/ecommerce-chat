import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../../config/database";

export type UserAttributes = {
  id: number;
  name: string;
  username: string;
  age: number | null;
  dob: string | null;
  email: string;
  password: string | null;
};

export type UserTimestampAttributes = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "age" | "dob" | "password"
>;

export type UserInstance = Model<UserAttributes, UserCreationAttributes> &
  UserAttributes &
  UserTimestampAttributes;

export const User = sequelize.define<UserInstance>(
  "User",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(120),
    },
    username: {
      allowNull: false,
      type: DataTypes.STRING(80),
    },
    age: {
      allowNull: true,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    dob: {
      allowNull: true,
      type: DataTypes.DATEONLY,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING(255),
      validate: {
        isEmail: true,
      },
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING(255),
    },
  },
  {
    paranoid: true,
    underscored: true,
    tableName: "users",
    timestamps: true,
  },
);
