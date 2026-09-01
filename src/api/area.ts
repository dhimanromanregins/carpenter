import { apiClient } from "./client";
import type { AreaCalculateRequest, AreaCalculateResponse } from "@/types/quotation";

export function calculateArea(payload: AreaCalculateRequest, signal?: AbortSignal) {
  return apiClient.post<AreaCalculateResponse>("v1/area/calculate", payload, { signal });
}
