import { apiClient, API_BASE_URL } from "./client";
import type { TileCalculateRequest, TileCalculateResponse, TileSaveRequest, TileSavedOut } from "@/types/quotation";

export function calculateTiles(payload: TileCalculateRequest, signal?: AbortSignal) {
  return apiClient.post<TileCalculateResponse>("v1/tiles/calculate", payload, { signal });
}

export function createTileQuotation(payload: TileSaveRequest) {
  return apiClient.post<TileSavedOut>("v1/tiles/quotes", payload);
}

export function getTileQuotation(id: number | string, signal?: AbortSignal) {
  return apiClient.get<TileSavedOut>(`v1/tiles/quotes/${id}`, { signal });
}

export function getTileQuotationPdfUrl(id: number | string) {
  return `${API_BASE_URL}/v1/tiles/quotes/${id}/pdf`;
}
