import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../../config/database";

export type RoleName = string;

export type RoleAttributes = {
  id: number;
  name: RoleName;
};

export type RoleTimestampAttributes = {
  createdAt: Date;
  updatedAt: Date;
};

export type RoleCreationAttributes = Optional<RoleAttributes, "id">;

export type RoleInstance = Model<RoleAttributes, RoleCreationAttributes> &
  RoleAttributes &
  RoleTimestampAttributes;

export const Role = sequelize.define<RoleInstance>(
  "Role",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(50),
      unique: true,
    },
  },
  {
    tableName: "roles",
    underscored: true,
    timestamps: true,
  },
);
