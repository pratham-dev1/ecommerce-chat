import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../../config/database";
import { Role } from "../roles/role.model";

export type RoleGrantAttributes = {
  id: number;
  name: string;
  roleId: number;
};

export type RoleGrantTimestampAttributes = {
  createdAt: Date;
  updatedAt: Date;
};

export type RoleGrantCreationAttributes = Optional<RoleGrantAttributes, "id">;

export type RoleGrantInstance = Model<
  RoleGrantAttributes,
  RoleGrantCreationAttributes
> &
  RoleGrantAttributes &
  RoleGrantTimestampAttributes;

export const RoleGrant = sequelize.define<RoleGrantInstance>(
  "RoleGrant",
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
    roleId: {
      allowNull: false,
      references: {
        key: "id",
        model: Role,
      },
      type: DataTypes.BIGINT,
    },
  },
  {
    indexes: [
      {
        fields: ["role_id", "name"],
        unique: true,
      },
    ],
    tableName: "role_grants",
    underscored: true,
    timestamps: true,
  },
);

Role.hasMany(RoleGrant, {
  as: "grants",
  foreignKey: "roleId",
});

RoleGrant.belongsTo(Role, {
  as: "role",
  foreignKey: "roleId",
});
