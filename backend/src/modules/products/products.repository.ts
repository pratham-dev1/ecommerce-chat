import type { WhereOptions } from "sequelize";

import { Product } from "./product.model";
import type { ProductAttributes, ProductCreationAttributes } from "./product.model";

export class ProductsRepository {
  async findAll() {
    return Product.findAll({
      order: [["id", "ASC"]],
    });
  }

  async findPaginated(input: {
    limit: number;
    offset: number;
    where?: WhereOptions<ProductAttributes>;
  }) {
    return Product.findAndCountAll({
      limit: input.limit,
      offset: input.offset,
      order: [["id", "ASC"]],
      where: input.where,
    });
  }

  async findById(productId: number) {
    return Product.findByPk(productId);
  }

  async create(product: ProductCreationAttributes) {
    return Product.create(product);
  }
}
