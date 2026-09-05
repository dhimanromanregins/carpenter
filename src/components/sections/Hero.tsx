import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";

const HeroScene = lazy(() =>
  import("@/components/three/HeroScene").then((m) => ({ default: m.HeroScene }))
);

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex h-[100svh] w-full items-center overflow-hidden bg-ink"
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-ink to-ink" />
        }
      >
        <HeroScene />
      </Suspense>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

      <div className="container-luxury relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-gold"
        >
          <span className="h-px w-10 bg-gold" />
          Est. 2013 &middot; Bespoke Carpentry Studio
        </motion.span>

        <h1 className="max-w-4xl text-5xl leading-[1.02] text-cream sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          <AnimatedText
            text="Luxury Carpentry"
            by="word"
            delay={0.5}
            className="block"
          />
          <AnimatedText
            text="Crafted To Perfection"
            by="word"
            delay={0.7}
            className="block text-gradient-gold"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-md text-base leading-relaxed text-grey md:text-lg"
        >
          Premium interior solutions for modern homes — bespoke wardrobes,
          modular kitchens, and full home interiors, handcrafted with
          uncompromising precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center gap-5"
        >
          <MagneticButton
            variant="solid"
            data-cursor="View"
            onClick={() =>
              document
                .querySelector("#projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            View Projects
          </MagneticButton>
          <MagneticButton
            variant="outline"
            onClick={() =>
              document
                .querySelector("#contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Book Site Visit
          </MagneticButton>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-grey">
          Scroll
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-cream/20">
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-gold"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
