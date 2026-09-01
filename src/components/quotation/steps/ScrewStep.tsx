import { StepShell } from "@/components/quotation/StepShell";
import { useScrewBrands } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";

export function ScrewStep() {
  const { data: screws, isLoading, isError } = useScrewBrands();
  const screwId = useQuotationStore((s) => s.custom.screw_id);
  const setScrew = useQuotationStore((s) => s.setScrew);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  return (
    <StepShell title="Which screw brand would you like?" onBack={prev} onNext={next} nextDisabled={!screwId}>
      {isLoading && <p className="text-grey">Loading screw brands...</p>}
      {isError && <p className="text-red-400">Couldn't load screw brands.</p>}
      <select
        value={screwId ?? ""}
        onChange={(e) => setScrew(e.target.value ? Number(e.target.value) : null)}
        className="w-full rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-cream outline-none focus:border-gold"
      >
        <option value="">Select Brand</option>
        {(screws ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.brand_name} — {s.name} (₹{s.price_per_piece.toLocaleString("en-IN")})
          </option>
        ))}
      </select>
    </StepShell>
  );
}
