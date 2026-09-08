import { apiClient } from "./client";
import type { LeadCreateRequest, LeadCreatedOut } from "@/types/lead";

export function submitLead(payload: LeadCreateRequest) {
  return apiClient.post<LeadCreatedOut>("v1/leads", payload);
}
