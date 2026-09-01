import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StepShell } from "@/components/quotation/StepShell";
import { BrandThroughoutModal } from "@/components/quotation/BrandThroughoutModal";
import { useHardwareBrands, useHardwareByCategory } from "@/hooks/useCatalog";
import { getHardware } from "@/api/products";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";
import type { HardwareBrand } from "@/types/quotation";

export function PantryHardwareBrandStep() {
  const { data: brands, isLoading, isError } = useHardwareBrands();
  const hardware = useQuotationStore((s) => s.custom.hardware);
  const setHardwareBrandThroughout = useQuotationStore((s) => s.setHardwareBrandThroughout);
  const setIndividualHardware = useQuotationStore((s) => s.setIndividualHardware);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  const [pendingBrand, setPendingBrand] = useState<HardwareBrand | null>(null);
  const selectedBrand = brands?.find((b) => b.id === hardware.brand_id);

  // Prefetch so the "Only Use for Pantry" choice can resolve a product id
  // synchronously-ish without a second loading state inside the modal.
  useHardwareByCategory("PANTRY", pendingBrand?.id);

  async function handleUseThroughout() {
    if (!pendingBrand) return;
    setHardwareBrandThroughout(pendingBrand.id, true);
    setPendingBrand(null);
    next();
  }

  async function handleOnlyPantry() {
    if (!pendingBrand) return;
    const pantryProducts = await getHardware("PANTRY", pendingBrand.id);
    setHardwareBrandThroughout(pendingBrand.id, false);
    if (pantryProducts[0]) {
      setIndividualHardware("pantry_product_id", pantryProducts[0].id);
    }
    setPendingBrand(null);
    next();
  }

  return (
    <StepShell title="Which hardware brand would you like?" onBack={prev} onNext={next} nextDisabled={!hardware.brand_id}>
      {isLoading && <p className="text-grey">Loading hardware brands...</p>}
      {isError && <p className="text-red-400">Couldn't load hardware brands.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {(brands ?? []).map((brand) => (
          <GlassCard
            key={brand.id}
            className={cn(
              "cursor-pointer p-5 text-center transition-colors duration-200",
              selectedBrand?.id === brand.id ? "border border-gold" : "border border-transparent hover:border-cream/20"
            )}
          >
            <button type="button" onClick={() => setPendingBrand(brand)} className="w-full">
              <p className="font-display text-lg text-cream">{brand.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-grey">{brand.tier}</p>
            </button>
          </GlassCard>
        ))}
      </div>

      {selectedBrand && (
        <p className="mt-4 text-sm text-grey">
          Selected: <span className="text-gold">{selectedBrand.name}</span>{" "}
          {hardware.use_brand_throughout ? "(applied throughout the kitchen)" : "(applied to pantry)"}
        </p>
      )}

      <BrandThroughoutModal
        open={!!pendingBrand}
        brandName={pendingBrand?.name ?? ""}
        onClose={() => setPendingBrand(null)}
        onUseThroughout={handleUseThroughout}
        onOnlyPantry={handleOnlyPantry}
      />
    </StepShell>
  );
}
