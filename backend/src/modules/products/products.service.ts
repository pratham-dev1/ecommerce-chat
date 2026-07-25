import { Op, WhereOptions } from "sequelize";

import { AppError } from "../../common/errors/AppError";
import { CacheService } from "../../common/services/cache.service";
import type { ProductAttributes, ProductInstance } from "./product.model";
import { ProductsRepository } from "./products.repository";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./products.validation";

const productsListCacheTtlSeconds = 60 * 5;
const productDetailCacheTtlSeconds = 60 * 10;
const productsCacheVersion = "v1";
const productsListCacheKeyPattern = `products:${productsCacheVersion}:list:*`;

type SerializedProduct = {
  description?: string;
  id: string;
  image?: string;
  name: string;
  price: number;
};

type ProductsListResponse = {
  data: SerializedProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export class ProductsService {
  private readonly cacheService = new CacheService();
  private readonly productsRepository = new ProductsRepository();

  async createProduct(input: CreateProductInput) {
    const normalizedInput = this.normalizeCreateProductInput(input);

    const product = await this.productsRepository.create({
      description: normalizedInput.description ?? null,
      image: normalizedInput.image ?? null,
      name: normalizedInput.name,
      price: normalizedInput.price,
    });

    await this.cacheService.deleteByPattern(productsListCacheKeyPattern);

    return this.serializeProduct(product);
  }

  async listProducts(input: ListProductsQuery): Promise<ProductsListResponse> {
    const productsListCacheKey = input.search
      ? null
      : this.cacheService.createKey(
          "products",
          productsCacheVersion,
          "list",
          "page",
          input.page,
          "pageSize",
          input.pageSize,
        );

    if (productsListCacheKey) {
      const cachedProducts = await this.cacheService.getJson<ProductsListResponse>(productsListCacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }
    }

    const { count, rows } = await this.productsRepository.findPaginated({
      limit: input.pageSize,
      offset: (input.page - 1) * input.pageSize,
      where: this.toListProductsWhere(input),
    });

    const response = {
      data: rows.map((product) => this.serializeProduct(product)),
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total: count,
        totalPages: Math.ceil(count / input.pageSize),
      },
    };

    if (productsListCacheKey) {
      await this.cacheService.setJson(
        productsListCacheKey,
        response,
        productsListCacheTtlSeconds,
      );
    }

    return response;
  }

  async getProductById(productId: number) {
    const productDetailCacheKey = this.cacheService.createKey(
      "products",
      productsCacheVersion,
      "detail",
      productId,
    );
    const cachedProduct = await this.cacheService.getJson<SerializedProduct>(
      productDetailCacheKey,
    );

    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    const serializedProduct = this.serializeProduct(product);

    await this.cacheService.setJson(
      productDetailCacheKey,
      serializedProduct,
      productDetailCacheTtlSeconds,
    );

    return serializedProduct;
  }

  async updateProduct(productId: number, input: UpdateProductInput) {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    const normalizedInput = this.normalizeProductInput(input);

    await product.update(this.toUpdatePayload(normalizedInput));

    await this.cacheService.deleteKey(
      this.cacheService.createKey("products", productsCacheVersion, "detail", productId),
    );
    await this.cacheService.deleteByPattern(productsListCacheKeyPattern);

    return this.serializeProduct(product);
  }

  async deleteProduct(productId: number) {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    await product.destroy();
    await this.cacheService.deleteKey(
      this.cacheService.createKey("products", productsCacheVersion, "detail", productId),
    );
    await this.cacheService.deleteByPattern(productsListCacheKeyPattern);
  }

  private normalizeCreateProductInput(input: CreateProductInput): CreateProductInput {
    return {
      description: input.description?.trim(),
      image: input.image?.trim(),
      name: input.name.trim(),
      price: input.price,
    };
  }

  private toListProductsWhere(
    input: ListProductsQuery,
  ): WhereOptions<ProductAttributes> | undefined {
    if (!input.search) {
      return undefined;
    }

    const pattern = `%${input.search}%`;

    return {
      [Op.or]: [
        { name: { [Op.iLike]: pattern } },
        { description: { [Op.iLike]: pattern } },
      ],
    } as WhereOptions<ProductAttributes>;
  }

  private normalizeProductInput(input: UpdateProductInput) {
    return {
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.image !== undefined ? { image: input.image.trim() } : {}),
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
    };
  }

  private toUpdatePayload(input: UpdateProductInput) {
    return {
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
    };
  }

  private serializeProduct(product: ProductInstance): SerializedProduct {
    return {
      description: product.description ?? undefined,
      id: String(product.id),
      image: product.image ?? undefined,
      name: product.name,
      price: Number(product.price),
    };
  }

}
