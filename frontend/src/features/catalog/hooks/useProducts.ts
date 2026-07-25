import { useQuery } from "@tanstack/react-query";

import { getProduct, getProducts } from "../api/catalogApi";
import type { ProductsQueryParams } from "../types/product";

const productsQueryKey = ["products"] as const;
export const productQueryKey = (productId: string) =>
  [...productsQueryKey, "detail", productId] as const;
const productsCacheFreshTime = 5 * 60 * 1000;

export function useProducts(params: ProductsQueryParams) {
  return useQuery({
    placeholderData: (previousData) => previousData,
    queryFn: () => getProducts(params),
    queryKey: [...productsQueryKey, params],
    staleTime: productsCacheFreshTime,
  });
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    enabled: Boolean(productId),
    queryFn: () => getProduct(String(productId)),
    queryKey: productId ? productQueryKey(productId) : [...productsQueryKey, "detail"],
    retry: false,
    staleTime: productsCacheFreshTime,
  });
}
