import { GlassCard } from "@/components/ui/GlassCard";
import { StepShell } from "@/components/quotation/StepShell";
import { usePantryTypes } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

export function PantryStep() {
  const { data: pantryTypes, isLoading, isError } = usePantryTypes();
  const pantry = useQuotationStore((s) => s.custom.pantry);
  const setPantryEnabled = useQuotationStore((s) => s.setPantryEnabled);
  const setPantryType = useQuotationStore((s) => s.setPantryType);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  return (
    <StepShell
      title="Do you want a pantry unit?"
      onBack={prev}
      onNext={next}
      nextDisabled={pantry.enabled && !pantry.pantry_type_id}
    >
      <div className="flex gap-3">
        {[
          { label: "No", value: false },
          { label: "Yes", value: true },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setPantryEnabled(opt.value)}
            className={cn(
              "flex-1 rounded-full border px-4 py-3 text-xs uppercase tracking-widest transition-colors duration-300",
              pantry.enabled === opt.value ? "border-gold bg-gold/10 text-gold" : "border-cream/15 text-grey hover:border-gold/40"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {pantry.enabled && (
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-widest text-grey">Pantry Type</p>
          {isLoading && <p className="text-grey">Loading pantry types...</p>}
          {isError && <p className="text-red-400">Couldn't load pantry types.</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(pantryTypes ?? []).map((type) => (
              <GlassCard
                key={type.id}
                className={cn(
                  "cursor-pointer p-5 transition-colors duration-200",
                  pantry.pantry_type_id === type.id ? "border border-gold" : "border border-transparent hover:border-cream/20"
                )}
              >
                <button type="button" onClick={() => setPantryType(type.id)} className="w-full text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-3 w-3 rounded-full border",
                        pantry.pantry_type_id === type.id ? "border-gold bg-gold" : "border-cream/30"
                      )}
                    />
                    <p className="font-display text-lg text-cream">{type.name}</p>
                  </div>
                  <p className="mt-2 text-gold">₹{type.base_price.toLocaleString("en-IN")}</p>
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  );
}
