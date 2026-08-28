import { apiClient } from "./client";
import type { QuoteCalculateRequest, QuoteCalculateResponse } from "./types";

// The backend is the sole source of truth for pricing — this call is the
// only place a quotation total is ever produced. Never derive/sum a total
// from product prices in a component.
export function calculateQuote(payload: QuoteCalculateRequest, signal?: AbortSignal) {
  return apiClient.post<QuoteCalculateResponse>("quotation/quotes/calculate", payload, { signal });
}
