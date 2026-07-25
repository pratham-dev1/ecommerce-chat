import { httpClient } from "@/services/api/httpClient";

import type { ProductSummary, ProductsQueryParams, ProductsResponse } from "../types/product";

export async function getProducts(params: ProductsQueryParams) {
  const { data } = await httpClient.get<ProductsResponse>("/products", {
    params,
  });

  return data;
}

export async function getProduct(productId: string) {
  const { data } = await httpClient.get<ProductSummary>(`/products/${productId}`);
  return data;
}
