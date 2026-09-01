import { apiClient } from "./client";
import type { Package } from "@/types/quotation";

export function getPackages(signal?: AbortSignal) {
  return apiClient.get<Package[]>("v1/packages", { signal });
}
