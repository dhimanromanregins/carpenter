import { StepShell } from "@/components/quotation/StepShell";
import { useHardwareByCategory } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";
import type { HardwareCategory } from "@/types/quotation";

type HardwareProductField =
  | "hinges_product_id"
  | "drawer_channels_product_id"
  | "pantry_product_id"
  | "lift_up_product_id"
  | "other_product_id";

const CATEGORY_FIELDS: { category: HardwareCategory; label: string; field: HardwareProductField }[] = [
  { category: "HINGES", label: "Hinges", field: "hinges_product_id" },
  { category: "DRAWER_CHANNELS", label: "Drawer Channels", field: "drawer_channels_product_id" },
  { category: "PANTRY", label: "Pantry", field: "pantry_product_id" },
  { category: "LIFT_UP", label: "Lift-Up", field: "lift_up_product_id" },
  { category: "OTHER", label: "Other Hardware", field: "other_product_id" },
];

function HardwareCategoryRow({ category, label, field }: (typeof CATEGORY_FIELDS)[number]) {
  const { data: products, isLoading } = useHardwareByCategory(category);
  const value = useQuotationStore((s) => s.custom.hardware[field]);
  const setIndividualHardware = useQuotationStore((s) => s.setIndividualHardware);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-cream/10 py-4 last:border-0">
      <span className="text-sm text-cream">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => setIndividualHardware(field, e.target.value ? Number(e.target.value) : null)}
        disabled={isLoading}
        className={cn(
          "min-w-[220px] rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-sm text-cream outline-none focus:border-gold"
        )}
      >
        <option value="">Select Brand</option>
        {(products ?? []).map((p) => (
          <option key={p.id} value={p.id}>
            {p.brand_name} — ₹{p.price.toLocaleString("en-IN")}
          </option>
        ))}
      </select>
    </div>
  );
}

export function IndividualHardwareStep() {
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  return (
    <StepShell title="Choose Your Hardware" subtitle="Pick a brand for each category." onBack={prev} onNext={next}>
      <div>
        {CATEGORY_FIELDS.map((entry) => (
          <HardwareCategoryRow key={entry.category} {...entry} />
        ))}
      </div>
    </StepShell>
  );
}
