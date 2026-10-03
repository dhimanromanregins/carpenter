import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const STEPS = [
  { n: "01", title: "Consultation", desc: "A free site visit to understand your space, lifestyle and budget." },
  { n: "02", title: "3D Design", desc: "Photo-real 3D visualisation and an itemised quotation before anything is built." },
  { n: "03", title: "Craft", desc: "Every piece is manufactured and finished in-house by our own craftsmen." },
  { n: "04", title: "Installation", desc: "Clean, on-time installation with weekly progress updates." },
  { n: "05", title: "Handover", desc: "A final walkthrough, styling touches and after-sales support." },
];

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="process" className="relative bg-charcoal py-28 md:py-40">
      <div className="container-luxury">
        <SectionHeading eyebrow="How We Work" title="From first sketch to final finish" className="mb-20" />

        <div ref={ref} className="relative mx-auto max-w-3xl">
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-gold/15" />
          <motion.div
            style={{ scaleY }}
            className="absolute bottom-0 left-[19px] top-0 w-px origin-top bg-gradient-to-b from-gold-light to-gold"
          />

          <div className="flex flex-col gap-16">
            {STEPS.map((s, i) => (
              <RevealOnScroll key={s.n} delay={i * 0.05} className="relative pl-16">
                <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-ink font-display text-sm text-gold">
                  {s.n}
                </span>
                <h3 className="font-display text-2xl text-cream md:text-3xl">{s.title}</h3>
                <p className="mt-2 max-w-lg text-grey">{s.desc}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
