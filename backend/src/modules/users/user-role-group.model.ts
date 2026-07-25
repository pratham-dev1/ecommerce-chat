import { DataTypes, Model } from "sequelize";

import { sequelize } from "../../config/database";
import { Role } from "../roles/role.model";
import { User } from "./user.model";

export type UserRoleGroupAttributes = {
  userId: number;
  roleId: number;
};

export type UserRoleGroupTimestampAttributes = {
  createdAt: Date;
  updatedAt: Date;
};

export type UserRoleGroupInstance = Model<UserRoleGroupAttributes> &
  UserRoleGroupAttributes &
  UserRoleGroupTimestampAttributes;

export const UserRoleGroup = sequelize.define<UserRoleGroupInstance>(
  "UserRoleGroup",
  {
    userId: {
      allowNull: false,
      primaryKey: true,
      references: {
        key: "id",
        model: User,
      },
      type: DataTypes.BIGINT,
    },
    roleId: {
      allowNull: false,
      primaryKey: true,
      references: {
        key: "id",
        model: Role,
      },
      type: DataTypes.BIGINT,
    },
  },
  {
    tableName: "user_role_group",
    underscored: true,
    timestamps: true,
  },
);

User.belongsToMany(Role, {
  as: "roles",
  foreignKey: "userId",
  otherKey: "roleId",
  through: UserRoleGroup,
});

Role.belongsToMany(User, {
  as: "users",
  foreignKey: "roleId",
  otherKey: "userId",
  through: UserRoleGroup,
});
