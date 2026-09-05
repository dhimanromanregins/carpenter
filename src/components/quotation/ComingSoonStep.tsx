import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useQuotationStore } from "@/store/quotationStore";

const CATEGORY_LABELS: Record<string, string> = {
  tilesFlooring: "Tiles & Flooring",
  wardrobe: "Wardrobe",
  ceiling: "Ceiling",
};

export function ComingSoonStep() {
  const category = useQuotationStore((s) => s.category);
  const setStage = useQuotationStore((s) => s.setStage);

  const label = (category && CATEGORY_LABELS[category]) ?? "This category";

  return (
    <GlassCard className="mx-auto max-w-xl p-8 text-center md:p-10">
      <h2 className="font-display text-2xl text-cream md:text-3xl">{label} quotations are coming soon</h2>
      <p className="mt-3 text-sm text-grey">
        We're still building instant pricing for this category. Meanwhile, get a Kitchen quotation, or reach out to our
        team directly for {label.toLowerCase()}.
      </p>
      <MagneticButton variant="outline" className="mt-8" onClick={() => setStage("category")}>
        Back to Categories
      </MagneticButton>
    </GlassCard>
  );
}
