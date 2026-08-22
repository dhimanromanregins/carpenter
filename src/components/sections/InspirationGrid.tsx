import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { InspirationCategory } from "@/data/wardrobeInspiration";
import { cn } from "@/lib/utils";

interface InspirationGridProps {
  categories: InspirationCategory[];
}

export function InspirationGrid({ categories }: InspirationGridProps) {
  const [active, setActive] = useState<string>("all");

  const images =
    active === "all"
      ? categories.flatMap((c) => c.images.map((img) => ({ ...img, category: c.label })))
      : categories
          .filter((c) => c.slug === active)
          .flatMap((c) => c.images.map((img) => ({ ...img, category: c.label })));

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {[{ slug: "all", label: "All" }, ...categories.map((c) => ({ slug: c.slug, label: c.label }))].map(
          (cat) => (
            <button
              key={cat.slug}
              onClick={() => setActive(cat.slug)}
              data-cursor={cat.slug === active ? "" : "View"}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-widest transition-colors duration-300",
                active === cat.slug
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-gold/15 text-grey hover:border-gold/40 hover:text-cream"
              )}
            >
              {cat.label}
            </button>
          )
        )}
      </div>

      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {images.map((img) => (
            <motion.div
              layout
              key={img.src}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/10"
            >
              <img
                src={img.src}
                alt={img.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

              <div className="absolute inset-x-0 bottom-0 translate-y-3 p-6 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs uppercase tracking-widest text-gold">{img.category}</p>
                <h3 className="mt-2 font-display text-xl text-cream">{img.title}</h3>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
