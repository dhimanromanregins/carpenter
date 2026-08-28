import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROJECTS, PROJECT_CATEGORIES, type Project } from "@/data/projects";
import { ProjectModal } from "@/components/sections/ProjectModal";
import { cn } from "@/lib/utils";

const SIZE_CLASSES: Record<string, string> = {
  tall: "sm:row-span-2 aspect-[3/4]",
  wide: "sm:col-span-2 aspect-[16/10]",
  square: "aspect-square",
};

export function Projects() {
  const [active, setActive] = useState<(typeof PROJECT_CATEGORIES)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered =
    active === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <section id="projects" className="relative bg-ink py-28 md:py-40">
      <div className="container-luxury">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Portfolio"
            title="Featured Projects"
            description="A curated selection of homes and spaces we've crafted across North India."
          />

          <div className="flex flex-wrap gap-2">
            {PROJECT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                data-cursor={cat === active ? "" : "View"}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-xs uppercase tracking-widest transition-colors duration-300",
                  active === cat
                    ? "border-gold bg-gold text-ink"
                    : "border-gold/25 text-grey hover:border-gold/60 hover:text-cream"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => {
              const hasDetail = Boolean(project.phases?.length || project.story?.length);
              return (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-gold/10",
                  hasDetail ? "cursor-pointer" : "",
                  SIZE_CLASSES[project.size]
                )}
                data-cursor="View"
                onClick={() => hasDetail && setSelected(project)}
              >
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br transition-transform duration-700 ease-out group-hover:scale-110",
                      project.gradient
                    )}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

                {project.sample && (
                  <span className="absolute left-5 top-5 rounded-full border border-gold/40 bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
                    Sample Style
                  </span>
                )}
                {project.placeholder && (
                  <span className="absolute left-5 top-5 rounded-full border border-amber-400/50 bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-widest text-amber-400">
                    Add Real Photos
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 translate-y-3 p-6 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-xs uppercase tracking-widest text-gold">
                    {project.sample
                      ? `${project.category} · Reference`
                      : `${project.category} · ${project.location}`}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-cream">
                    {project.title}
                  </h3>
                  {!project.sample && <p className="mt-1 text-xs text-grey">{project.year}</p>}
                </div>

                <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold opacity-60 transition-all duration-500 sm:-translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                  &#8599;
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
