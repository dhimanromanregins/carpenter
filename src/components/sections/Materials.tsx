import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { GlassCard } from "@/components/ui/GlassCard";
import { VirgoLaminateGallery } from "./VirgoLaminateGallery";
import { MATERIALS } from "@/data/materials";
import { cn } from "@/lib/utils";

export function Materials() {
  const [showLaminates, setShowLaminates] = useState(false);

  return (
    <section id="materials" className="relative bg-charcoal py-28 md:py-40">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="Craftsmanship"
          title="Materials We Trust"
          description="Every project is built on branded, quality-tested material — never low-grade boards or unverified hardware."
          align="left"
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS.map((category, i) => (
            <RevealOnScroll key={category.id} delay={i * 0.1}>
              <GlassCard className="flex h-full flex-col gap-5 p-8">
                <h3 className="font-display text-2xl text-cream">{category.title}</h3>
                <p className="text-sm leading-relaxed text-grey">{category.description}</p>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {category.brands.map((brand) => {
                    const isVirgoLaminate = category.id === "laminates" && brand.name === "Virgo";
                    const pillClass = cn(
                      "flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors duration-300",
                      brand.tier === "Luxury"
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-cream/20 text-grey",
                      isVirgoLaminate && "cursor-pointer hover:border-gold hover:text-gold"
                    );

                    if (isVirgoLaminate) {
                      return (
                        <button
                          key={brand.name}
                          type="button"
                          onClick={() => setShowLaminates((v) => !v)}
                          data-cursor="Browse"
                          className={pillClass}
                        >
                          {brand.name}
                          <span className="text-[9px] tracking-normal text-grey/70">
                            {showLaminates ? "Hide swatches" : "Browse swatches"}
                          </span>
                        </button>
                      );
                    }

                    return (
                      <span key={brand.name} className={pillClass}>
                        {brand.name}
                        <span className="text-[9px] tracking-normal text-grey/70">
                          {brand.tier}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>

        <AnimatePresence>
          {showLaminates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <VirgoLaminateGallery />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
