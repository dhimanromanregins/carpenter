import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useQuotationCalculation } from "@/hooks/useQuotationCalculation";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  carcass: "Carcass",
  shutter_finish: "Shutter Finish",
  glass_cabinets: "Glass Cabinets",
  pantry: "Pantry",
  hardware: "Hardware",
  rolling_shutter: "Rolling Shutter",
  screws: "Screws",
  lighting: "Lighting",
};

export function LiveEstimatePanel() {
  const quotationType = useQuotationStore((s) => s.quotationType);
  const area = useQuotationStore((s) => s.area);
  const packageId = useQuotationStore((s) => s.packageId);
  const custom = useQuotationStore((s) => s.custom);
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  const { data: result, isFetching } = useQuotationCalculation(
    quotationType,
    area.areaSqft ? { area_sqft: area.areaSqft, running_feet: area.runningFeet } : null,
    packageId,
    quotationType === "custom" ? custom : null
  );

  if (!result) return null;

  const content = (
    <>
      <h3 className="font-display text-lg text-cream">Your Kitchen Estimate</h3>
      <div className="mt-4 flex justify-between text-sm text-grey">
        <span>Kitchen Area</span>
        <span className="text-cream">{area.areaSqft} sq.ft.</span>
      </div>

      <div className="mt-3 space-y-3 border-t border-cream/10 pt-3">
        {result.line_items.map((item) => (
          <div key={item.role} className="flex justify-between text-sm">
            <span className="text-grey">{ROLE_LABELS[item.role] ?? item.label}</span>
            <span className={cn("text-cream", isFetching && "opacity-50")}>₹{item.subtotal.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-cream/10 pt-4 text-sm">
        <div className="flex justify-between text-grey">
          <span>Subtotal</span>
          <span>₹{result.subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-grey">
          <span>Installation</span>
          <span>₹{result.installation.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-grey">
          <span>Tax</span>
          <span>₹{result.tax.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gold/30 pt-4">
        <span className="text-sm uppercase tracking-widest text-cream">Estimated Total</span>
        <span className={cn("font-display text-2xl text-gold", isFetching && "opacity-60")}>₹{result.total.toLocaleString("en-IN")}</span>
      </div>
      <p className="mt-2 text-[11px] text-grey/60">*Estimated price — the final confirmed project price is set after a site visit.</p>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-charcoal/95 backdrop-blur-md">
        <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between px-5 py-3">
          <span className="text-sm text-grey">Estimated Total</span>
          <span className="font-display text-xl text-gold">₹{result.total.toLocaleString("en-IN")}</span>
        </button>
        {expanded && <div className="max-h-[60vh] overflow-y-auto border-t border-cream/10 px-5 pb-6 pt-4">{content}</div>}
      </div>
    );
  }

  return <GlassCard className="sticky top-24 p-6">{content}</GlassCard>;
}
