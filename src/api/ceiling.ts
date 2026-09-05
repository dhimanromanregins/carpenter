import { apiClient, API_BASE_URL } from "./client";
import type { CeilingCalculateRequest, CeilingCalculateResponse, CeilingSaveRequest, CeilingSavedOut } from "@/types/quotation";

export function calculateCeiling(payload: CeilingCalculateRequest, signal?: AbortSignal) {
  return apiClient.post<CeilingCalculateResponse>("v1/ceiling/calculate", payload, { signal });
}

export function createCeilingQuotation(payload: CeilingSaveRequest) {
  return apiClient.post<CeilingSavedOut>("v1/ceiling/quotes", payload);
}

export function getCeilingQuotation(id: number | string, signal?: AbortSignal) {
  return apiClient.get<CeilingSavedOut>(`v1/ceiling/quotes/${id}`, { signal });
}

export function getCeilingQuotationPdfUrl(id: number | string) {
  return `${API_BASE_URL}/v1/ceiling/quotes/${id}/pdf`;
}

