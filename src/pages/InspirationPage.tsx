import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { TiltCard } from "@/components/ui/TiltCard";
import { useSeo } from "@/hooks/useSeo";
import { INSPIRATION_ROOMS } from "@/data/inspirationCategories";
import { cn } from "@/lib/utils";

const InspirationScene = lazy(() =>
  import("@/components/three/InspirationScene").then((m) => ({ default: m.InspirationScene }))
);

const COVERS = INSPIRATION_ROOMS.map((r) => r.categories[0]?.images[0]?.src).filter(
  (s): s is string => Boolean(s)
);
const SCENE_IMAGES = COVERS.slice(0, 12);
const TOTAL_DESIGNS = INSPIRATION_ROOMS.reduce(
  (n, r) => n + r.categories.reduce((m, c) => m + c.images.length, 0),
  0
);

// Every 7th card in the grid is a wide feature tile to break up the rhythm.
const isFeature = (i: number) => i % 7 === 0;

export function InspirationPage() {
  useSeo({
    title: "Interior Design Inspiration Gallery",
    description:
      "Browse kitchen, wardrobe, bedroom and full-home interior design inspiration from Kraftspace Interiors, serving Zirakpur, Chandigarh and Mohali.",
    path: "/inspiration",
  });

  return (
    <div className="min-h-screen bg-ink pb-28">
      {/* ——— 3D hero ——— */}
      <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden pt-28">
        {SCENE_IMAGES.length > 0 && (
          <div className="absolute inset-0 opacity-70">
            <Suspense fallback={null}>
              <InspirationScene images={SCENE_IMAGES} />
            </Suspense>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,5,0.88)_0%,rgba(5,5,5,0.55)_45%,rgba(5,5,5,0.9)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        <div className="container-luxury relative z-10 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-gold"
          >
            <span className="h-px w-10 bg-gold" />
            The Look Book
            <span className="h-px w-10 bg-gold" />
          </motion.span>

          <h1 className="text-5xl leading-[1.02] text-cream sm:text-7xl lg:text-[6.5rem]">
            <AnimatedText text="Design" by="word" delay={0.3} className="block" />
            <AnimatedText text="Inspiration" by="word" delay={0.5} className="block text-gradient-gold" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-base leading-relaxed text-grey md:text-lg"
          >
            Browse reference styles room by room, then bring the ones you love to your quote or a
            Design Studio session.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-10 flex gap-12 border-t border-gold/20 pt-6"
          >
            <div>
              <p className="font-display text-3xl text-gradient-gold">{INSPIRATION_ROOMS.length}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-grey">Room types</p>
            </div>
            <div>
              <p className="font-display text-3xl text-gradient-gold">{TOTAL_DESIGNS}+</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-grey">Design ideas</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ——— room grid ——— */}
      <div className="container-luxury mt-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INSPIRATION_ROOMS.map((room, i) => {
            const cover = room.categories[0]?.images[0];
            const count = room.categories.reduce((n, c) => n + c.images.length, 0);
            return (
              <RevealOnScroll
                key={room.slug}
                delay={(i % 3) * 0.08}
                className={cn(isFeature(i) && "lg:col-span-2")}
              >
                <TiltCard className="h-full" tiltStrength={5}>
                  <Link
                    to={`/inspiration/${room.slug}`}
                    data-cursor="View"
                    className={cn(
                      "group relative block overflow-hidden rounded-2xl border border-gold/10",
                      isFeature(i) ? "aspect-[16/9]" : "aspect-[4/5]"
                    )}
                  >
                    {cover ? (
                      <img
                        src={cover.src}
                        alt={`${room.label} interior design inspiration`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-charcoal" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_100%,rgba(198,168,106,0.28),transparent_65%)]" />

                    <span className="absolute left-6 top-6 font-display text-sm tracking-widest text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ink/40 text-gold backdrop-blur transition-all duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-ink">
                      &#8599;
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{count} ideas</p>
                      <h3 className="mt-2 font-display text-3xl text-cream md:text-4xl">{room.label}</h3>
                      <p className="mt-2 max-w-sm translate-y-2 text-xs leading-relaxed text-grey opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        {room.description}
                      </p>
                      <span className="mt-4 block h-px w-10 bg-gold transition-all duration-500 group-hover:w-24" />
                    </div>
                  </Link>
                </TiltCard>
              </RevealOnScroll>
            );
          })}
        </div>

        <Link to="/" className="mt-16 inline-block text-xs uppercase tracking-widest text-grey hover:text-cream">
          &larr; Back home
        </Link>
      </div>
    </div>
  );
}
