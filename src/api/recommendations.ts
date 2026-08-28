import { apiClient } from "./client";
import type { RecommendationCriteria, RecommendationResponse } from "./types";

export function getRecommendation(criteria: RecommendationCriteria, signal?: AbortSignal) {
  return apiClient.post<RecommendationResponse>("quotation/recommendations", criteria, { signal });
}
