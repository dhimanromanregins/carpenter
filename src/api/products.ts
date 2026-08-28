import { apiClient } from "./client";
import type { Product, ProductFilters } from "./types";

export function getProducts(filters: ProductFilters = {}, signal?: AbortSignal) {
  return apiClient.get<Product[]>("quotation/products", {
    params: {
      category: filters.category,
      brand: filters.brand,
      tier: filters.tier,
      spaceType: filters.spaceType,
      recommendedFor: filters.recommendedFor,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
    },
    signal,
  });
}

export function compareProducts(ids: number[], signal?: AbortSignal) {
  return apiClient.get<Product[]>("quotation/products/compare", {
    params: { ids: ids.join(",") },
    signal,
  });
}
