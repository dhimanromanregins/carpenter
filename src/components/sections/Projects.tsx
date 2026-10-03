import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROJECTS, PROJECT_CATEGORIES, type Project } from "@/data/projects";
import { ProjectModal } from "@/components/sections/ProjectModal";
import { cn } from "@/lib/utils";

const ProjectsCarousel3D = lazy(() =>
  import("@/components/three/ProjectsCarousel3D").then((m) => ({ default: m.ProjectsCarousel3D }))
);

const SHOWN = PROJECTS.filter((p) => p.image && !p.placeholder);
const CATEGORIES = PROJECT_CATEGORIES.filter(
  (c) => c === "All" || SHOWN.some((p) => p.category === c)
);
const PX_PER_CARD = 240;

export function Projects() {
  const [category, setCategory] = useState<string>("All");
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);

  const items = useMemo(
    () => (category === "All" ? SHOWN : SHOWN.filter((p) => p.category === category)),
    [category]
  );

  const target = useRef(0);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, i));
      target.current = clamped;
      setActive(clamped);
    },
    [items.length]
  );

  const current = items[Math.min(active, items.length - 1)];
  const hasDetail = Boolean(current?.phases?.length || current?.story?.length);

  const onPick = (i: number) => {
    if (justDragged.current) return;
    if (i === active) {
      if (hasDetail && current) setSelected(current);
    } else {
      goTo(i);
    }
  };

  return (
    <section id="projects" className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.07] blur-[160px]" />

      <div className="container-luxury relative">
        <div className="mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Portfolio"
            title="Featured Projects"
            description="Drag the gallery, or use the arrows — click the centred project to see how it was made."
          />

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  target.current = 0;
                  setActive(0);
                }}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-xs uppercase tracking-widest transition-colors duration-300",
                  category === cat
                    ? "border-gold bg-gold text-ink"
                    : "border-gold/25 text-grey hover:border-gold/60 hover:text-cream"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D gallery */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Project gallery. Use left and right arrow keys to browse."
        className="relative h-[460px] w-full select-none outline-none sm:h-[560px] lg:h-[640px]"
        style={{ touchAction: "pan-y" }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(active + 1);
          if (e.key === "ArrowLeft") goTo(active - 1);
          if (e.key === "Enter" && hasDetail && current) setSelected(current);
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, start: target.current, moved: false };
          justDragged.current = false;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 6) {
            d.moved = true;
            justDragged.current = true;
          }
          if (d.moved) {
            target.current = Math.max(-0.3, Math.min(items.length - 0.7, d.start - dx / PX_PER_CARD));
          }
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d?.moved) {
            goTo(Math.round(target.current));
            window.setTimeout(() => (justDragged.current = false), 50);
          }
        }}
        onPointerLeave={() => {
          if (drag.current?.moved) goTo(Math.round(target.current));
          drag.current = null;
        }}
      >
        <Suspense
          fallback={<div className="absolute inset-0 animate-pulse bg-gradient-to-b from-charcoal/40 to-transparent" />}
        >
          <ProjectsCarousel3D key={category} items={items} target={target} onPick={onPick} />
        </Suspense>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent sm:w-40" />

        <button
          type="button"
          aria-label="Previous project"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ink/60 text-gold backdrop-blur transition hover:bg-gold hover:text-ink disabled:opacity-25 sm:left-8"
        >
          &#8592;
        </button>
        <button
          type="button"
          aria-label="Next project"
          onClick={() => goTo(active + 1)}
          disabled={active >= items.length - 1}
          className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ink/60 text-gold backdrop-blur transition hover:bg-gold hover:text-ink disabled:opacity-25 sm:right-8"
        >
          &#8594;
        </button>
      </div>

      {/* active project caption */}
      <div className="container-luxury relative mt-6 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-gold">
                {current.category}
                {current.location ? ` · ${current.location}` : ""}
              </p>
              <h3 className="mt-3 font-display text-3xl text-cream md:text-5xl">{current.title}</h3>
              {hasDetail && (
                <button
                  type="button"
                  onClick={() => setSelected(current)}
                  className="mt-6 rounded-full border border-gold px-7 py-3 text-xs uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  View Project &#8599;
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-4">
          <span className="font-display text-sm text-gold">{String(active + 1).padStart(2, "0")}</span>
          <div className="flex gap-1.5">
            {items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Go to ${p.title}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === active ? "w-8 bg-gold" : "w-3 bg-cream/20 hover:bg-cream/50"
                )}
              />
            ))}
          </div>
          <span className="font-display text-sm text-grey">{String(items.length).padStart(2, "0")}</span>
        </div>
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
