import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";

const HeroAmbient = lazy(() =>
  import("@/components/three/HeroAmbient").then((m) => ({ default: m.HeroAmbient }))
);

const SLIDES = [
  { image: "/projects/mohali-sector-59-kitchen/front.png", label: "Modular Kitchen", place: "Mohali" },
  { image: "/projects/fluted-ivory-tv-panel/front.png", label: "Fluted TV Panel", place: "Zirakpur" },
  { image: "/projects/brass-inlay-foyer-wall/front.png", label: "Brass Inlay Foyer", place: "Chandigarh" },
  { image: "/projects/floating-walnut-staircase/front.png", label: "Floating Staircase", place: "Panchkula" },
  { image: "/projects/sage-green-wardrobe/front.png", label: "Sliding Wardrobe", place: "Zirakpur" },
];

const STATS = [
  { value: "10+", label: "Years of craft" },
  { value: "1000+", label: "Projects completed" },
  { value: "3", label: "Cities served" },
];

const scrollTo = (selector: string) =>
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });

export function Hero() {
  const [index, setIndex] = useState(0);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 800], [0, 80]);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-ink pt-24 pb-16"
    >
      <Suspense fallback={null}>
        <div className="pointer-events-none absolute inset-0">
          <HeroAmbient />
        </div>
      </Suspense>

      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-gold/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-wood/20 blur-[140px]" />

      <div className="container-luxury relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* ——— copy ——— */}
        <div className="order-2 lg:order-1">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-gold"
          >
            <span className="h-px w-12 bg-gold" />
            Interior Design &amp; Architecture
          </motion.span>

          <h1 className="text-5xl leading-[1.02] text-cream sm:text-6xl xl:text-[5.25rem]">
            <AnimatedText text="Spaces Designed" by="word" delay={0.4} className="block" />
            <AnimatedText
              text="To Be Lived In"
              by="word"
              delay={0.6}
              className="block text-gradient-gold"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-lg text-base leading-relaxed text-grey md:text-lg"
          >
            Kraftspace creates refined homes across Zirakpur, Chandigarh &amp; Mohali — bespoke
            kitchens, wardrobes and full-home interiors, from first sketch to final finish.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <MagneticButton variant="solid" data-cursor="View" onClick={() => scrollTo("#projects")}>
              View Projects
            </MagneticButton>
            <MagneticButton variant="outline" onClick={() => scrollTo("#contact")}>
              Book Site Visit
            </MagneticButton>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="mt-14 flex gap-10 border-t border-gold/20 pt-8 sm:gap-14"
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl text-gradient-gold sm:text-4xl">{s.value}</dt>
                <dd className="mt-1 text-[10px] uppercase tracking-[0.25em] text-grey">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ——— arched showcase ——— */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative order-1 mx-auto w-full max-w-[420px] lg:order-2 lg:max-w-[480px]"
        >
          {/* offset gold outline arch */}
          <div className="absolute -right-4 -top-4 h-full w-full rounded-t-[999px] border border-gold/40 sm:-right-6 sm:-top-6" />

          <motion.div
            style={{ y: imageY }}
            className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px] bg-charcoal shadow-[0_40px_120px_-30px_rgba(198,168,106,0.35)]"
          >
            <AnimatePresence mode="sync">
              <motion.img
                key={slide.image}
                src={slide.image}
                alt={`${slide.label} by Kraftspace`}
                initial={{ opacity: 0, scale: 1.12 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: "linear" } }}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          </motion.div>

          {/* caption card */}
          <div className="glass absolute -bottom-6 left-1/2 flex w-[88%] -translate-x-1/2 items-center justify-between gap-4 rounded-sm px-5 py-4 sm:-left-10 sm:w-auto sm:translate-x-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{slide.place}</p>
                <p className="mt-1 font-display text-lg text-cream">{slide.label}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.image}
                  type="button"
                  aria-label={`Show ${s.label}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === index ? "w-6 bg-gold" : "w-1.5 bg-cream/30 hover:bg-cream/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />
    </section>
  );
}
