import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { getLenis } from "@/hooks/useLenis";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const phases = project.phases ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = phases[activeIndex];

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gold/20 bg-ink"
          data-lenis-prevent
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-ink/80 text-gold transition-colors hover:border-gold hover:text-cream"
          >
            &#10005;
          </button>

          <div className="relative aspect-[16/10] w-full overflow-hidden">
            {active ? (
              <img
                src={active.image}
                alt={active.title}
                className="h-full w-full object-cover"
              />
            ) : project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
          </div>

          <div className="p-6 md:p-8">
            {project.placeholder && (
              <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-xs text-amber-300">
                Placeholder slot — swap in this client's real photos, materials and story before this goes live.
              </div>
            )}
            <p className="text-xs uppercase tracking-widest text-gold">
              {project.category}
              {project.location ? ` · ${project.location}` : ""}
            </p>
            <h2 className="mt-2 font-display text-3xl text-cream">{project.title}</h2>
            {project.year && <p className="mt-1 text-xs text-grey">{project.year}</p>}

            {project.story && project.story.length > 0 && (
              <div className="mt-8 border-l-2 border-gold/30 pl-5">
                <h3 className="text-xs uppercase tracking-widest text-gold">The Story</h3>
                <div className="mt-4 space-y-3">
                  {project.story.map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed text-grey">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {phases.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs uppercase tracking-widest text-gold">Project Phases</h3>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {phases.map((phase, i) => (
                    <button
                      key={phase.title}
                      onClick={() => setActiveIndex(i)}
                      className={`group relative aspect-[4/3] w-32 flex-shrink-0 overflow-hidden rounded-lg border transition-colors duration-300 ${
                        i === activeIndex
                          ? "border-gold"
                          : "border-gold/15 hover:border-gold/50"
                      }`}
                    >
                      <img
                        src={phase.image}
                        alt={phase.title}
                        className="h-full w-full object-cover"
                      />
                      <div
                        className={`absolute inset-0 transition-colors duration-300 ${
                          i === activeIndex ? "bg-transparent" : "bg-ink/50 group-hover:bg-ink/20"
                        }`}
                      />
                      <span className="absolute bottom-1 left-1 right-1 truncate text-[10px] uppercase tracking-wide text-cream">
                        {i + 1}. {phase.title}
                      </span>
                    </button>
                  ))}
                </div>
                {active && (
                  <p className="mt-4 text-sm leading-relaxed text-grey">{active.description}</p>
                )}
              </div>
            )}

            {project.materials && project.materials.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs uppercase tracking-widest text-gold">Materials Used</h3>
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {project.materials.map((material) => (
                    <li
                      key={material}
                      className="flex items-start gap-2 text-sm text-cream/90"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
