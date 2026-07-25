import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../../config/database";

export type ProductAttributes = {
  id: number;
  description: string | null;
  image: string | null;
  name: string;
  price: number;
};

export type ProductCreationAttributes = Optional<ProductAttributes, "id" | "description" | "image">;

export type ProductInstance = Model<ProductAttributes, ProductCreationAttributes> &
  ProductAttributes;

export const Product = sequelize.define<ProductInstance>(
  "Product",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    image: {
      allowNull: true,
      type: DataTypes.STRING(2048),
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(160),
    },
    price: {
      allowNull: false,
      type: DataTypes.DECIMAL(12, 2),
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "products",
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
);
