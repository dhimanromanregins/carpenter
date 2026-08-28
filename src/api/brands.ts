import { apiClient } from "./client";
import type { Brand, BrandFilters } from "./types";

export function getBrands(filters: BrandFilters = {}, signal?: AbortSignal) {
  return apiClient.get<Brand[]>("quotation/brands", {
    params: { category: filters.category, tier: filters.tier },
    signal,
  });
}
