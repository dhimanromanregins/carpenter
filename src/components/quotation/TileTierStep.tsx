import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useTileCalculation } from "@/hooks/useTileCalculation";
import { useQuotationStore } from "@/store/quotationStore";

export function TileTierStep() {
  const area = useQuotationStore((s) => s.area);
  const installMethod = useQuotationStore((s) => s.tileInstallMethod);
  const selectTileTier = useQuotationStore((s) => s.selectTileTier);
  const setStage = useQuotationStore((s) => s.setStage);

  const areaSqft = area.areaSqft ?? 0;
  const { data: result, isLoading, isError } = useTileCalculation(area.areaSqft, installMethod);

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="font-display text-2xl text-cream md:text-3xl">Choose Your Tile Finish</h2>
      <p className="mt-2 text-sm text-grey">
        Based on your flooring area of <span className="text-gold">{areaSqft} sq.ft.</span>
      </p>

      {isLoading && <p className="mt-10 text-grey">Calculating your estimate...</p>}
      {isError && <p className="mt-10 text-red-400">Couldn't load pricing. Please try again.</p>}

      {result && (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {result.tiers.map((option) => (
            <GlassCard key={option.tier} className="flex flex-col p-8 text-left">
              <h3 className="font-display text-xl text-cream">{option.name}</h3>
              <p className="mt-2 text-3xl text-gold">
                ₹{option.rate_per_sqft.toLocaleString("en-IN")}
                <span className="text-sm text-grey"> / sq.ft.</span>
              </p>
              {option.installation_extra_per_sqft > 0 && (
                <p className="mt-1 text-xs text-grey">
                  (₹{option.base_rate_per_sqft.toLocaleString("en-IN")} base + ₹
                  {option.installation_extra_per_sqft.toLocaleString("en-IN")} chemical fixing)
                </p>
              )}
              <p className="mt-3 text-sm text-grey">{option.description}</p>

              <ul className="mt-5 flex-1 space-y-2 text-sm text-cream/80">
                {option.included_items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-gold">✓</span> {item}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs uppercase tracking-widest text-grey">Estimated Total</p>
              <p className="font-display text-2xl text-cream">₹{option.total.toLocaleString("en-IN")}</p>
              <MagneticButton
                variant="outline"
                className="mt-6 w-full justify-center"
                onClick={() => selectTileTier(option)}
              >
                Select {option.name}
              </MagneticButton>
            </GlassCard>
          ))}
        </div>
      )}

      <div className="mt-10">
        <MagneticButton variant="ghost" onClick={() => setStage("tilesInstallMethod")}>
          Back
        </MagneticButton>
      </div>
    </div>
  );
}
