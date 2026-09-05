import { apiClient } from "./client";
import type { ContactCreateRequest, ContactOut } from "@/types/contact";

export function submitContactEnquiry(payload: ContactCreateRequest) {
  return apiClient.post<ContactOut>("v1/contact", payload);
}
