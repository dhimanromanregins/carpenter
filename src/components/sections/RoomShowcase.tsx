import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/utils";
import { FINISHES } from "@/data/finishes";

const RoomShowcaseScene = lazy(() =>
  import("@/components/three/RoomShowcaseScene").then((m) => ({
    default: m.RoomShowcaseScene,
  }))
);

const HOTSPOT_INFO: Record<string, { title: string; desc: string }> = {
  wardrobe: {
    title: "Sliding Wardrobe",
    desc: "Soft-close sliding shutters in your chosen laminate finish.",
  },
  kitchen: {
    title: "Island Counter",
    desc: "Quartz-top island with integrated storage and warm under-lighting.",
  },
  tv: {
    title: "TV Feature Panel",
    desc: "Wood-panel media wall with concealed cable management.",
  },
};

export function RoomShowcase() {
  const [finishId, setFinishId] = useState("walnut");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section id="showcase" className="relative bg-charcoal py-28 md:py-40">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="Interactive Showroom"
          title="Step inside, in 3D"
          description="Drag to rotate, scroll to zoom, and click any piece to see it up close. Switch the wood finish to preview your room."
          className="mb-14"
        />

        <RevealOnScroll>
          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-gold/15 bg-ink md:h-[600px]">
            <Suspense
              fallback={
                <div className="h-full w-full bg-gradient-to-br from-charcoal via-ink to-ink" />
              }
            >
              <RoomShowcaseScene
                finishId={finishId}
                selected={selected}
                onSelect={(id) => setSelected(id === "" ? null : id)}
              />
            </Suspense>

            <div
              data-capture-ui
              className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-6"
            >
              <span className="rounded-full border border-gold/30 bg-ink/60 px-4 py-2 text-[10px] uppercase tracking-widest text-grey backdrop-blur">
                Drag to rotate &middot; Click furniture
              </span>
            </div>

            <AnimatePresence>
              {selected && HOTSPOT_INFO[selected] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="glass absolute bottom-6 left-6 max-w-xs rounded-xl p-5"
                >
                  <p className="text-xs uppercase tracking-widest text-gold">
                    {HOTSPOT_INFO[selected].title}
                  </p>
                  <p className="mt-2 text-sm text-grey">
                    {HOTSPOT_INFO[selected].desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div data-capture-ui className="absolute bottom-6 right-6 flex gap-2">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFinishId(f.id)}
                  data-cursor={f.label}
                  aria-label={f.label}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-transform duration-300",
                    finishId === f.id
                      ? "scale-110 border-gold"
                      : "border-cream/30 hover:scale-105"
                  )}
                  style={{ background: f.base }}
                />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
