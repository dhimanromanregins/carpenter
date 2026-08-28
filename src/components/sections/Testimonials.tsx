import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { TESTIMONIALS } from "@/data/testimonials";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const active = TESTIMONIALS[index];

  return (
    <section id="testimonials" className="relative bg-charcoal py-28 md:py-40">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="Testimonials"
          title="Words from our clients"
          align="center"
          className="mx-auto mb-16 items-center"
        />

        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-10 text-center md:p-14">
                <div className="mb-6 flex justify-center gap-1 text-gold">
                  {Array.from({ length: active.rating }).map((_, i) => (
                    <FaStar key={i} size={14} />
                  ))}
                </div>
                <p className="font-display text-xl leading-relaxed text-cream md:text-2xl">
                  &ldquo;{active.quote}&rdquo;
                </p>
                <div className="mt-8">
                  <p className="text-sm text-cream">{active.name}</p>
                  <p className="text-xs uppercase tracking-widest text-grey">
                    {active.role}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-1">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setIndex(i)}
                aria-label={`Testimonial ${i + 1}`}
                className="flex h-10 w-10 items-center justify-center"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === index ? "w-8 bg-gold" : "w-1.5 bg-grey/40"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
