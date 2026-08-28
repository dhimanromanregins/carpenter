import { apiClient } from "./client";
import type { Category, City } from "./types";

export function getCategories(signal?: AbortSignal) {
  return apiClient.get<Category[]>("quotation/categories", { signal });
}

export function getCities(signal?: AbortSignal) {
  return apiClient.get<City[]>("quotation/cities", { signal });
}
