import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useCeilingCalculation } from "@/hooks/useCeilingCalculation";
import { useQuotationStore } from "@/store/quotationStore";

export function CeilingEstimateStep() {
  const area = useQuotationStore((s) => s.area);
  const confirmCeilingEstimate = useQuotationStore((s) => s.confirmCeilingEstimate);
  const setStage = useQuotationStore((s) => s.setStage);

  const areaSqft = area.areaSqft ?? 0;
  const { data: result, isLoading, isError } = useCeilingCalculation(area.areaSqft);

  return (
    <div className="mx-auto max-w-xl text-center">
      <h2 className="font-display text-2xl text-cream md:text-3xl">Your Ceiling Estimate</h2>
      <p className="mt-2 text-sm text-grey">
        Based on your ceiling area of <span className="text-gold">{areaSqft} sq.ft.</span>
      </p>

      {isLoading && <p className="mt-10 text-grey">Calculating your estimate...</p>}
      {isError && <p className="mt-10 text-red-400">Couldn't load pricing. Please try again.</p>}

      {result && (
        <GlassCard className="mt-10 flex flex-col p-8 text-left">
          <h3 className="font-display text-xl text-cream">False Ceiling</h3>
          <p className="mt-2 text-3xl text-gold">
            ₹{result.rate_per_sqft.toLocaleString("en-IN")}
            <span className="text-sm text-grey"> / sq.ft.</span>
          </p>
          <p className="mt-3 text-sm text-grey">{result.description}</p>

          <ul className="mt-5 space-y-2 text-sm text-cream/80">
            {result.included_items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gold">✓</span> {item}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs uppercase tracking-widest text-grey">Estimated Total</p>
          <p className="font-display text-2xl text-cream">₹{result.total.toLocaleString("en-IN")}</p>

          <MagneticButton
            variant="solid"
            className="mt-6 w-full justify-center"
            onClick={() => confirmCeilingEstimate(result)}
          >
            Continue
          </MagneticButton>
        </GlassCard>
      )}

      <div className="mt-10">
        <MagneticButton variant="ghost" onClick={() => setStage("ceilingArea")}>
          Back
        </MagneticButton>
      </div>
    </div>
  );
}
