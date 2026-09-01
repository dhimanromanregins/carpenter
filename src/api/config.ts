import { apiClient } from "./client";
import type { QuotationConfig } from "@/types/quotation";

export function getQuotationConfig(signal?: AbortSignal) {
  return apiClient.get<QuotationConfig>("v1/quotation/config", { signal });
}
