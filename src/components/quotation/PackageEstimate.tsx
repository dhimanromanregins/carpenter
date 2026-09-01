import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { usePackages } from "@/hooks/useCatalog";
import { useQuotationCalculation } from "@/hooks/useQuotationCalculation";
import { useQuotationStore } from "@/store/quotationStore";

export function PackageEstimate({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const area = useQuotationStore((s) => s.area);
  const packageId = useQuotationStore((s) => s.packageId);
  const { data: packages } = usePackages();
  const pkg = packages?.find((p) => p.id === packageId);

  const { data: result, isLoading } = useQuotationCalculation(
    "package",
    area.areaSqft ? { area_sqft: area.areaSqft, running_feet: area.runningFeet } : null,
    packageId,
    null
  );

  return (
    <GlassCard className="mx-auto max-w-xl p-8 md:p-10">
      <h2 className="font-display text-2xl text-cream md:text-3xl">{pkg?.name ?? "Your Package"}</h2>

      {isLoading || !result ? (
        <p className="mt-6 text-grey">Calculating your estimate...</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-grey">
            {area.areaSqft} sq.ft. × ₹{pkg?.rate_per_sqft.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs uppercase tracking-widest text-grey">Estimated Kitchen Cost</p>
          <p className="font-display text-4xl text-gold">₹{result.total.toLocaleString("en-IN")}</p>

          <div className="mt-6 space-y-1 text-sm text-grey">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{result.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Installation</span>
              <span>₹{result.installation.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{result.tax.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <h3 className="mt-8 text-sm uppercase tracking-widest text-cream">What's Included</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {(pkg?.included_items ?? []).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gold">✓</span> {item}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8 flex gap-3">
        <MagneticButton variant="ghost" onClick={onBack}>
          Back
        </MagneticButton>
        <MagneticButton variant="solid" className="flex-1 justify-center" onClick={onContinue} disabled={isLoading || !result}>
          Continue
        </MagneticButton>
      </div>
    </GlassCard>
  );
}
