import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VIRGO_LAMINATES, VIRGO_LAMINATES_CREDIT } from "@/data/virgoLaminates";
import { cn } from "@/lib/utils";

export function VirgoLaminateGallery() {
  const [activeSlug, setActiveSlug] = useState(VIRGO_LAMINATES[0].slug);
  const [selected, setSelected] = useState<{ slug: string; code: string; name: string; image: string } | null>(
    null
  );

  const activeCollection = VIRGO_LAMINATES.find((c) => c.slug === activeSlug) ?? VIRGO_LAMINATES[0];

  return (
    <div className="mt-8 rounded-2xl border border-gold/15 bg-ink p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Virgo Laminates</p>
          <h3 className="mt-2 font-display text-2xl text-cream md:text-3xl">
            Browse the full collection
          </h3>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-grey">{VIRGO_LAMINATES_CREDIT}</p>
      </div>

      {/* Selected swatch preview */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass mb-6 flex items-center gap-5 rounded-xl p-4"
          >
            <img
              src={selected.image}
              alt={selected.name}
              className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            />
            <div>
              <p className="font-display text-lg text-cream">{selected.name}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-gold">
                Design VL-{selected.code} &middot; {VIRGO_LAMINATES.find((c) => c.slug === selected.slug)?.label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {VIRGO_LAMINATES.map((collection) => (
          <button
            key={collection.slug}
            onClick={() => setActiveSlug(collection.slug)}
            data-cursor={collection.slug === activeSlug ? "" : "View"}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-widest transition-colors duration-300",
              collection.slug === activeSlug
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-gold/15 text-grey hover:border-gold/40 hover:text-cream"
            )}
          >
            {collection.label}
            <span className="ml-1.5 text-grey/60">{collection.designs.length}</span>
          </button>
        ))}
      </div>

      {/* Swatch grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {activeCollection.designs.map((design) => {
          const isSelected = selected?.slug === activeCollection.slug && selected.code === design.code;
          return (
            <button
              key={design.code}
              onClick={() => setSelected({ slug: activeCollection.slug, ...design })}
              data-cursor="Select"
              aria-label={design.name}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300",
                isSelected ? "border-gold scale-95" : "border-transparent hover:border-gold/40"
              )}
            >
              <img
                src={design.image}
                alt={design.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 truncate bg-ink/80 px-1.5 py-1 text-[9px] leading-tight text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {design.name}
              </div>
              {isSelected && (
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
