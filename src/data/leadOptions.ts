// Shared between the public capture form (LeadPage) and the admin table
// (LeadsAdminPage). The `value` strings are stored verbatim in the leads
// table, so keep them stable — changing one orphans existing rows.

export interface LeadOption {
  value: string;
  label: string;
}

export const SERVICE_OPTIONS: LeadOption[] = [
  { value: "modular-kitchen", label: "Modular Kitchen" },
  { value: "wardrobe", label: "Wardrobe" },
  { value: "full-home", label: "Full Home Interiors" },
  { value: "tv-panel", label: "TV Panel / Media Wall" },
  { value: "false-ceiling", label: "False Ceiling" },
  { value: "not-sure", label: "Not sure yet" },
];

export const CITY_OPTIONS: LeadOption[] = [
  "Zirakpur",
  "Chandigarh",
  "Mohali",
  "Panchkula",
  "Other",
].map((city) => ({ value: city, label: city }));

export const BUDGET_OPTIONS: LeadOption[] = [
  { value: "under-2l", label: "Under 2 Lakh" },
  { value: "2-5l", label: "2 - 5 Lakh" },
  { value: "5-10l", label: "5 - 10 Lakh" },
  { value: "above-10l", label: "Above 10 Lakh" },
  { value: "not-decided", label: "Not decided" },
];

export const TIMELINE_OPTIONS: LeadOption[] = [
  { value: "immediately", label: "Immediately" },
  { value: "1-3-months", label: "In 1 - 3 months" },
  { value: "3-6-months", label: "In 3 - 6 months" },
  { value: "just-exploring", label: "Just exploring" },
];

/** Falls back to the raw value so older or hand-entered rows still render. */
export function labelFor(options: LeadOption[], value: string | null | undefined) {
  if (!value) return "—";
  return options.find((option) => option.value === value)?.label ?? value;
}
