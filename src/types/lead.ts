// Mirrors backend/app/schemas/lead.py exactly (snake_case on the wire).

export interface LeadCreateRequest {
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  service?: string;
  property_type?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  message?: string;
  source?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  page_path?: string | null;
}

/** The public form only gets an acknowledgement back â€” no stored PII is echoed. */
export interface LeadCreatedOut {
  id: number;
  created_at: string;
  message: string;
}

/** Full lead record — admin endpoints only (customer PII). */
export interface LeadOut {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  service: string;
  property_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  page_path: string | null;
  status: LeadStatus;
}

export interface LeadListOut {
  total: number;
  items: LeadOut[];
}

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
