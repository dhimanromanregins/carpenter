import { GlassCard } from "@/components/ui/GlassCard";
import { NumericField } from "@/components/ui/NumericField";
import { StepShell } from "@/components/quotation/StepShell";
import { useShutters } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

export function ShutterStep() {
  const { data: shutters, isLoading, isError } = useShutters();
  const shutterId = useQuotationStore((s) => s.custom.shutter_id);
  const shutterArea = useQuotationStore((s) => s.custom.shutter_area_sqft);
  const kitchenArea = useQuotationStore((s) => s.area.areaSqft);
  const setShutter = useQuotationStore((s) => s.setShutter);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  const effectiveArea = shutterArea ?? kitchenArea ?? 0;

  return (
    <StepShell title="Choose Your Shutter Finish" onBack={prev} onNext={next} nextDisabled={!shutterId}>
      {isLoading && <p className="text-grey">Loading shutter finishes...</p>}
      {isError && <p className="text-red-400">Couldn't load shutter finishes.</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(shutters ?? []).map((shutter) => (
          <GlassCard
            key={shutter.id}
            className={cn(
              "cursor-pointer p-5 transition-colors duration-200",
              shutterId === shutter.id ? "border border-gold" : "border border-transparent hover:border-cream/20"
            )}
          >
            <button type="button" onClick={() => setShutter(shutter.id)} className="w-full text-left">
              <p className="text-xs uppercase tracking-widest text-grey">{shutter.finish_type}</p>
              <p className="mt-1 font-display text-lg text-cream">{shutter.name}</p>
              <p className="mt-1 text-xs text-grey">{shutter.brand_name}</p>
              <p className="mt-3 text-gold">₹{shutter.price_per_sqft.toLocaleString("en-IN")} / sq.ft.</p>
            </button>
          </GlassCard>
        ))}
      </div>

      <label className="mt-6 flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-grey">Shutter Area (sq.ft.)</span>
        <NumericField
          value={effectiveArea}
          onChange={(v) => setShutter(shutterId ?? null, v ?? kitchenArea ?? 0)}
          commitOnBlur
          className="max-w-[200px] rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-lg text-cream outline-none transition-colors focus:border-gold"
        />
        <span className="text-[11px] text-grey/70">Defaults to your kitchen area — adjust if your shutter coverage differs.</span>
      </label>
    </StepShell>
  );
}
