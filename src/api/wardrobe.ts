import { apiClient, API_BASE_URL } from "./client";
import type { WardrobeCalculateRequest, WardrobeCalculateResponse, WardrobeSaveRequest, WardrobeSavedOut } from "@/types/quotation";

export function calculateWardrobe(payload: WardrobeCalculateRequest, signal?: AbortSignal) {
  return apiClient.post<WardrobeCalculateResponse>("v1/wardrobe/calculate", payload, { signal });
}

export function createWardrobeQuotation(payload: WardrobeSaveRequest) {
  return apiClient.post<WardrobeSavedOut>("v1/wardrobe/quotes", payload);
}

export function getWardrobeQuotation(id: number | string, signal?: AbortSignal) {
  return apiClient.get<WardrobeSavedOut>(`v1/wardrobe/quotes/${id}`, { signal });
}

export function getWardrobeQuotationPdfUrl(id: number | string) {
  return `${API_BASE_URL}/v1/wardrobe/quotes/${id}/pdf`;
}
