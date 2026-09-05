import { GlassCard } from "@/components/ui/GlassCard";
import { useQuotationStore } from "@/store/quotationStore";
import type { TileInstallationMethod } from "@/types/quotation";

const OPTIONS: { method: TileInstallationMethod; label: string; description: string }[] = [
  {
    method: "cement",
    label: "Cement Fixing",
    description: "Traditional sand-cement mortar bed fixing.",
  },
  {
    method: "chemical",
    label: "Chemical Fixing",
    description: "Tile adhesive fixing for a stronger, faster bond. Adds ₹10/sq.ft.",
  },
];

export function TileInstallMethodStep() {
  const selectTileInstallMethod = useQuotationStore((s) => s.selectTileInstallMethod);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="font-display text-2xl text-cream md:text-3xl">How should the tiles be fixed?</h2>
      <p className="mt-2 text-sm text-grey">Choose the installation method for your flooring.</p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {OPTIONS.map((option) => (
          <GlassCard key={option.method} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => selectTileInstallMethod(option.method)}
              className="group flex w-full flex-col p-8 text-left transition-colors duration-300 focus:outline-none"
            >
              <span className="font-display text-xl text-cream group-hover:text-gold">{option.label}</span>
              <span className="mt-3 text-sm text-grey">{option.description}</span>
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
