import type { ListProductsQuery } from "./products.validation";

export const productsListCacheKeyPattern = "products:list:*";

export function getProductsListCacheKey(input: ListProductsQuery) {
  if (input.search) {
    return null;
  }

  return [
    "products:list",
    `page:${input.page}`,
    `pageSize:${input.pageSize}`,
  ].join(":");
}

export function getProductDetailCacheKey(productId: number) {
  return `product:${productId}`;
}
