import { useState } from "react";
import { calculateArea } from "@/api/area";
import { NumericField } from "@/components/ui/NumericField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { useQuotationStore } from "@/store/quotationStore";
import { useQuotationConfig } from "@/hooks/useCatalog";
import { cn } from "@/lib/utils";
import type { DimensionUnit } from "@/types/quotation";

const UNIT_LABELS: Record<DimensionUnit, string> = {
  FEET: "Feet",
  INCHES: "Inches",
  METERS: "Meters",
  CENTIMETERS: "Centimeters",
};

interface AreaStepProps {
  onContinue: () => void;
  title?: string;
  areaFieldLabel?: string;
}

export function AreaStep({
  onContinue,
  title = "How would you like to enter your kitchen size?",
  areaFieldLabel = "Kitchen Area (sq.ft.)",
}: AreaStepProps) {
  const { data: config } = useQuotationConfig();
  const area = useQuotationStore((s) => s.area);
  const setAreaMode = useQuotationStore((s) => s.setAreaMode);
  const setAreaSqft = useQuotationStore((s) => s.setAreaSqft);
  const setDimensions = useQuotationStore((s) => s.setDimensions);
  const setUnit = useQuotationStore((s) => s.setUnit);
  const applyAreaResult = useQuotationStore((s) => s.applyAreaResult);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const units = config?.dimension_units ?? ["FEET", "INCHES", "METERS", "CENTIMETERS"];

  const canSubmit =
    area.mode === "total_area" ? !!area.areaSqft && area.areaSqft > 0 : !!area.length && !!area.width && area.length > 0 && area.width > 0;

  async function handleCalculate() {
    setError(null);
    setLoading(true);
    try {
      const result =
        area.mode === "total_area"
          ? await calculateArea({ mode: "total_area", area_sqft: area.areaSqft ?? 0 })
          : await calculateArea({ mode: "dimensions", length: area.length ?? 0, width: area.width ?? 0, unit: area.unit });
      applyAreaResult(result.area_sqft, result.running_feet);
      onContinue();
    } catch {
      setError("Couldn't calculate the area. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="mx-auto max-w-xl p-8 md:p-10">
      <h2 className="font-display text-2xl text-cream md:text-3xl">{title}</h2>

      <div className="mt-6 flex gap-3">
        {(["total_area", "dimensions"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setAreaMode(mode)}
            className={cn(
              "flex-1 rounded-full border px-4 py-3 text-xs uppercase tracking-widest transition-colors duration-300",
              area.mode === mode ? "border-gold bg-gold/10 text-gold" : "border-cream/15 text-grey hover:border-gold/40 hover:text-cream"
            )}
          >
            {mode === "total_area" ? "Enter Total Area" : "Enter Dimensions"}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {area.mode === "total_area" ? (
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-grey">{areaFieldLabel}</span>
            <NumericField
              value={area.areaSqft ?? undefined}
              onChange={(v) => setAreaSqft(v ?? null)}
              placeholder="150"
              className="rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-lg text-cream outline-none transition-colors focus:border-gold"
            />
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-grey">Length</span>
              <NumericField
                value={area.length ?? undefined}
                onChange={(v) => setDimensions(v ?? null, area.width)}
                placeholder="10"
                className="rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-lg text-cream outline-none transition-colors focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-grey">Width</span>
              <NumericField
                value={area.width ?? undefined}
                onChange={(v) => setDimensions(area.length, v ?? null)}
                placeholder="15"
                className="rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-lg text-cream outline-none transition-colors focus:border-gold"
              />
            </label>
            <div className="col-span-2 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-grey">Unit</span>
              <div className="flex flex-wrap gap-2">
                {units.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setUnit(unit)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300",
                      area.unit === unit ? "border-gold bg-gold/10 text-gold" : "border-cream/15 text-grey hover:border-gold/40 hover:text-cream"
                    )}
                  >
                    {UNIT_LABELS[unit]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <MagneticButton variant="solid" className="mt-8 w-full justify-center" onClick={handleCalculate} disabled={!canSubmit || loading}>
        {loading ? "Calculating..." : "Continue"}
      </MagneticButton>
    </GlassCard>
  );
}
