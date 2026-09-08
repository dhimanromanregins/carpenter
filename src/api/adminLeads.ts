import { apiClient } from "./client";
import type { LeadListOut, LeadOut, LeadStatus } from "@/types/lead";

// The backend has no login system, so the admin endpoints are gated by a
// shared key sent as X-Admin-Key (ADMIN_API_KEY in backend/.env).
function authHeaders(adminKey: string) {
  return { "X-Admin-Key": adminKey };
}

interface ListLeadsOptions {
  status?: LeadStatus | "";
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

export function listLeads(
  adminKey: string,
  { status, limit = 100, offset = 0, signal }: ListLeadsOptions = {}
) {
  return apiClient.get<LeadListOut>("v1/leads", {
    params: { status: status || undefined, limit, offset },
    headers: authHeaders(adminKey),
    signal,
  });
}

export function updateLeadStatus(adminKey: string, leadId: number, status: LeadStatus) {
  return apiClient.patch<LeadOut>(`v1/leads/${leadId}/status`, undefined, {
    params: { status },
    headers: authHeaders(adminKey),
  });
}
