import { GlassCard } from "@/components/ui/GlassCard";
import { NumericField } from "@/components/ui/NumericField";
import { StepShell } from "@/components/quotation/StepShell";
import { useLighting } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

export function LightingStep() {
  const { data: lighting, isLoading, isError } = useLighting();
  const items = useQuotationStore((s) => s.custom.lighting);
  const addItem = useQuotationStore((s) => s.addLightingItem);
  const updateQuantity = useQuotationStore((s) => s.updateLightingQuantity);
  const removeItem = useQuotationStore((s) => s.removeLightingItem);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  return (
    <StepShell title="Kitchen Lighting" onBack={prev} onNext={next} nextLabel="Review Estimate">
      {isLoading && <p className="text-grey">Loading lighting options...</p>}
      {isError && <p className="text-red-400">Couldn't load lighting options.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(lighting ?? []).map((light) => {
          const selected = items.find((i) => i.product_id === light.id);
          return (
            <GlassCard key={light.id} className={cn("p-5", selected ? "border border-gold" : "border border-transparent")}>
              <p className="font-display text-lg text-cream">{light.name}</p>
              <p className="text-xs text-grey">{light.brand_name}</p>
              <p className="mt-2 text-gold">₹{light.price_per_piece.toLocaleString("en-IN")} / piece</p>

              {selected ? (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => (selected.quantity > 1 ? updateQuantity(light.id, selected.quantity - 1) : removeItem(light.id))}
                    className="h-8 w-8 rounded-full border border-cream/20 text-cream hover:border-gold"
                  >
                    −
                  </button>
                  <NumericField
                    value={selected.quantity}
                    onChange={(v) => updateQuantity(light.id, v ?? 1)}
                    className="w-14 rounded-lg border border-cream/15 bg-charcoal-light px-2 py-1 text-center text-cream outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(light.id, selected.quantity + 1)}
                    className="h-8 w-8 rounded-full border border-cream/20 text-cream hover:border-gold"
                  >
                    +
                  </button>
                  <button type="button" onClick={() => removeItem(light.id)} className="ml-auto text-xs text-grey hover:text-red-400">
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addItem({ product_id: light.id, quantity: 1 })}
                  className="mt-4 rounded-full border border-cream/20 px-4 py-2 text-xs uppercase tracking-widest text-cream hover:border-gold hover:text-gold"
                >
                  Add Lighting
                </button>
              )}
            </GlassCard>
          );
        })}
      </div>
    </StepShell>
  );
}
