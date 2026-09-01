import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { usePackages } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";

export function PackageCards({ onCustomize }: { onCustomize: () => void }) {
  const { data: packages, isLoading, isError } = usePackages();
  const area = useQuotationStore((s) => s.area);
  const chooseQuotationType = useQuotationStore((s) => s.chooseQuotationType);
  const selectPackage = useQuotationStore((s) => s.selectPackage);

  function handleSelect(packageId: string) {
    chooseQuotationType("package");
    selectPackage(packageId);
  }

  if (isLoading) return <p className="text-center text-grey">Loading packages...</p>;
  if (isError) return <p className="text-center text-red-400">Couldn't load kitchen packages. Please try again.</p>;

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="text-center font-display text-2xl text-cream md:text-3xl">Choose Your Kitchen Type</h2>
      {area.areaSqft && (
        <p className="mt-2 text-center text-sm text-grey">
          Based on your kitchen area of <span className="text-gold">{area.areaSqft} sq.ft.</span>
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {(packages ?? []).map((pkg) => (
          <GlassCard key={pkg.id} className="flex flex-col p-8">
            <h3 className="font-display text-xl text-cream">{pkg.name}</h3>
            <p className="mt-2 text-3xl text-gold">
              ₹{pkg.rate_per_sqft.toLocaleString("en-IN")}
              <span className="text-sm text-grey"> / sq.ft.*</span>
            </p>
            <p className="mt-3 text-sm text-grey">{pkg.description}</p>
            <ul className="mt-5 flex-1 space-y-2 text-sm text-cream/80">
              {pkg.included_items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gold">✓</span> {item}
                </li>
              ))}
            </ul>
            <MagneticButton variant="outline" className="mt-6 w-full justify-center" onClick={() => handleSelect(pkg.id)}>
              Select {pkg.name}
            </MagneticButton>
          </GlassCard>
        ))}
      </div>

      <div className="mt-10 text-center">
        <MagneticButton variant="ghost" onClick={onCustomize}>
          Customize Everything
        </MagneticButton>
      </div>
    </div>
  );
}
