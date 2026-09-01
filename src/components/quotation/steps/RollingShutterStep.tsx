import { GlassCard } from "@/components/ui/GlassCard";
import { NumericField } from "@/components/ui/NumericField";
import { StepShell } from "@/components/quotation/StepShell";
import { useRollingShutters } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

export function RollingShutterStep() {
  const { data: options, isLoading, isError } = useRollingShutters();
  const selection = useQuotationStore((s) => s.custom.rolling_shutter);
  const setRollingShutter = useQuotationStore((s) => s.setRollingShutter);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  return (
    <StepShell
      title="Would you like rolling shutters?"
      onBack={prev}
      onNext={next}
      nextDisabled={selection.enabled && (!selection.product_id || !selection.width || !selection.height)}
    >
      <div className="flex gap-3">
        {[
          { label: "No", value: false },
          { label: "Yes", value: true },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setRollingShutter({ enabled: opt.value, unit: opt.value ? selection.unit ?? "FEET" : selection.unit })}
            className={cn(
              "flex-1 rounded-full border px-4 py-3 text-xs uppercase tracking-widest transition-colors duration-300",
              selection.enabled === opt.value ? "border-gold bg-gold/10 text-gold" : "border-cream/15 text-grey hover:border-gold/40"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {selection.enabled && (
        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-grey">Loading rolling shutter options...</p>}
          {isError && <p className="text-red-400">Couldn't load rolling shutter options.</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(options ?? []).map((opt) => (
              <GlassCard
                key={opt.id}
                className={cn(
                  "cursor-pointer p-5 transition-colors duration-200",
                  selection.product_id === opt.id ? "border border-gold" : "border border-transparent hover:border-cream/20"
                )}
              >
                <button type="button" onClick={() => setRollingShutter({ product_id: opt.id })} className="w-full text-left">
                  <p className="font-display text-lg text-cream">{opt.name}</p>
                  <p className="mt-2 text-gold">₹{opt.price_per_sqft.toLocaleString("en-IN")} / sq.ft.</p>
                </button>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-grey">Quantity</span>
              <NumericField
                value={selection.quantity}
                onChange={(v) => setRollingShutter({ quantity: v ?? 1 })}
                className="rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-cream outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-grey">Width</span>
              <NumericField
                value={selection.width ?? undefined}
                onChange={(v) => setRollingShutter({ width: v ?? null })}
                className="rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-cream outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-grey">Height</span>
              <NumericField
                value={selection.height ?? undefined}
                onChange={(v) => setRollingShutter({ height: v ?? null })}
                className="rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-cream outline-none focus:border-gold"
              />
            </label>
          </div>
        </div>
      )}
    </StepShell>
  );
}
