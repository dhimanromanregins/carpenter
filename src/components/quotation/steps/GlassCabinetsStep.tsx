import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NumericField } from "@/components/ui/NumericField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StepShell } from "@/components/quotation/StepShell";
import { useGlassCabinets } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";
import type { DimensionUnit } from "@/types/quotation";

export function GlassCabinetsStep() {
  const { data: options } = useGlassCabinets();
  const standardOption = options?.find((o) => o.pricing_mode === "FLAT_PER_CABINET");
  const customOption = options?.find((o) => o.pricing_mode === "PER_SQFT");

  const selection = useQuotationStore((s) => s.custom.glass_cabinets);
  const setEnabled = useQuotationStore((s) => s.setGlassCabinetsEnabled);
  const setQuantity = useQuotationStore((s) => s.setGlassCabinetStandardQuantity);
  const addCustomItem = useQuotationStore((s) => s.addGlassCabinetCustomItem);
  const removeCustomItem = useQuotationStore((s) => s.removeGlassCabinetCustomItem);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | undefined>();
  const [customHeight, setCustomHeight] = useState<number | undefined>();
  const [customUnit, setCustomUnit] = useState<DimensionUnit>("FEET");
  const [customQty, setCustomQty] = useState<number | undefined>(1);

  function handleAddCustom() {
    if (!customWidth || !customHeight) return;
    addCustomItem({ width: customWidth, height: customHeight, unit: customUnit, quantity: customQty ?? 1 });
    setCustomWidth(undefined);
    setCustomHeight(undefined);
    setCustomQty(1);
    setShowCustomForm(false);
  }

  return (
    <StepShell title="Do you want glass cabinets?" onBack={prev} onNext={next}>
      <div className="flex gap-3">
        {[
          { label: "No", value: false },
          { label: "Yes", value: true },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setEnabled(opt.value)}
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
        <div className="mt-6 space-y-6">
          <GlassCard className="flex items-center justify-between p-5">
            <div>
              <p className="font-display text-lg text-cream">{standardOption?.name ?? "Standard Cabinet"}</p>
              <p className="text-gold">₹{(standardOption?.price ?? 0).toLocaleString("en-IN")} / cabinet</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(selection.standard_quantity - 1)}
                className="h-8 w-8 rounded-full border border-cream/20 text-cream hover:border-gold"
              >
                −
              </button>
              <span className="w-6 text-center text-cream">{selection.standard_quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(selection.standard_quantity + 1)}
                className="h-8 w-8 rounded-full border border-cream/20 text-cream hover:border-gold"
              >
                +
              </button>
            </div>
          </GlassCard>

          {selection.custom_items.length > 0 && (
            <div className="space-y-2">
              {selection.custom_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-cream/10 px-4 py-3 text-sm text-cream/80">
                  <span>
                    {item.width} × {item.height} {item.unit.toLowerCase()} × {item.quantity}
                  </span>
                  <button type="button" onClick={() => removeCustomItem(i)} className="text-grey hover:text-red-400">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {showCustomForm ? (
            <GlassCard className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-grey">Width</span>
                  <NumericField
                    value={customWidth}
                    onChange={setCustomWidth}
                    className="rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-cream outline-none focus:border-gold"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-grey">Height</span>
                  <NumericField
                    value={customHeight}
                    onChange={setCustomHeight}
                    className="rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-cream outline-none focus:border-gold"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-grey">Unit</span>
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as DimensionUnit)}
                    className="rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-cream outline-none focus:border-gold"
                  >
                    {(["FEET", "INCHES", "METERS", "CENTIMETERS"] as const).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-grey">Quantity</span>
                  <NumericField
                    value={customQty}
                    onChange={setCustomQty}
                    className="rounded-lg border border-cream/15 bg-charcoal-light px-3 py-2 text-cream outline-none focus:border-gold"
                  />
                </label>
              </div>
              <p className="text-[11px] text-grey/70">Rate: ₹{(customOption?.price ?? 0).toLocaleString("en-IN")} / sq.ft.</p>
              <MagneticButton variant="outline" onClick={handleAddCustom} disabled={!customWidth || !customHeight}>
                Add Custom Cabinet
              </MagneticButton>
            </GlassCard>
          ) : (
            <button type="button" onClick={() => setShowCustomForm(true)} className="text-sm text-gold hover:text-gold-light">
              + Add custom size
            </button>
          )}
        </div>
      )}
    </StepShell>
  );
}
