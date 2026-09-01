import { apiClient } from "./client";
import type { QuotationCalculateRequest, QuotationCalculateResponse, QuotationSaveRequest, QuotationSavedOut } from "@/types/quotation";

export function calculateQuotation(payload: QuotationCalculateRequest, signal?: AbortSignal) {
  return apiClient.post<QuotationCalculateResponse>("v1/quotations/calculate", payload, { signal });
}

export function createQuotation(payload: QuotationSaveRequest) {
  return apiClient.post<QuotationSavedOut>("v1/quotations", payload);
}

export function getQuotation(id: number | string, signal?: AbortSignal) {
  return apiClient.get<QuotationSavedOut>(`v1/quotations/${id}`, { signal });
}
