import { GlassCard } from "@/components/ui/GlassCard";
import { QUOTATION_CATEGORIES, useQuotationStore, type QuotationCategory } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

const CATEGORY_INFO: Record<QuotationCategory, { label: string; image: string }> = {
  tilesFlooring: {
    label: "Tiles & Flooring",
    image: "/bathroom-inspiration/contemporary/contemporary-bathroom-design-with-beige-wall-and-floor-tiles.png",
  },
  kitchen: {
    label: "Kitchen",
    image: "/kitchen-inspiration/l-shaped/l-shaped-modern-kitchen-design-with-marble-backsplash-tiles-kc-pid-10958.webp",
  },
  wardrobe: {
    label: "Wardrobe",
    image: "/wardrobe-inspiration/sliding/637638843872201466249.png",
  },
  ceiling: {
    label: "Ceiling",
    image: "/ceiling-inspiration/gypsum-pop/geometric-gypsum-rectangular-ceiling-design-for-the-kitchen.webp",
  },
};

export function CategoryStep() {
  const selectCategory = useQuotationStore((s) => s.selectCategory);

  return (
    <div className="mx-auto max-w-4xl text-center">
      <h2 className="font-display text-2xl text-cream md:text-3xl">What do you need a quotation for?</h2>
      <p className="mt-2 text-sm text-grey">Pick a category to get started.</p>

      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
        {QUOTATION_CATEGORIES.map((category) => {
          const info = CATEGORY_INFO[category];
          return (
            <GlassCard key={category} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => selectCategory(category)}
                className={cn(
                  "group flex w-full flex-col text-left transition-colors duration-300",
                  "focus:outline-none"
                )}
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={info.image}
                    alt={info.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="border-t border-cream/10 px-3 py-4 transition-colors duration-300 group-hover:border-gold/40">
                  <span className="text-xs uppercase tracking-widest text-cream group-hover:text-gold">
                    {info.label}
                  </span>
                </div>
              </button>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
