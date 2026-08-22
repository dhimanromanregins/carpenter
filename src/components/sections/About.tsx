import { lazy, Suspense } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Counter } from "@/components/ui/Counter";

const AboutCube = lazy(() =>
  import("@/components/three/AboutCube").then((m) => ({ default: m.AboutCube }))
);

const TIMELINE = [
  { year: "2013", label: "Studio founded in Chandigarh" },
  { year: "2017", label: "500th residential project delivered" },
  { year: "2021", label: "Launched in-house modular manufacturing" },
  { year: "2025", label: "1000+ luxury interiors crafted" },
];

const STATS = [
  { value: 12, suffix: "+", label: "Years of Craft" },
  { value: 1000, suffix: "+", label: "Projects Delivered" },
  { value: 850, suffix: "+", label: "Happy Clients" },
];

export function About() {
  return (
    <section id="about" className="relative bg-ink py-28 md:py-40">
      <div className="container-luxury grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="About Dhiman Interiors"
            title="A legacy of wood, light and form"
            description="For over a decade, Dhiman Interiors has been shaping homes across North India with handcrafted carpentry — where every panel, joint and finish is considered, not mass-produced."
          />

          <div className="grid grid-cols-3 gap-6 border-y border-gold/10 py-8">
            {STATS.map((stat) => (
              <RevealOnScroll key={stat.label}>
                <div>
                  <p className="font-display text-3xl text-gold sm:text-4xl">
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-grey">
                    {stat.label}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <div className="flex flex-col">
            {TIMELINE.map((item, i) => (
              <RevealOnScroll key={item.year} delay={i * 0.1}>
                <div className="flex items-center gap-6 border-b border-gold/10 py-5 last:border-none">
                  <span className="font-display text-xl text-gold">
                    {item.year}
                  </span>
                  <span className="h-px flex-1 bg-gold/15" />
                  <span className="max-w-[60%] text-right text-sm text-grey md:text-base">
                    {item.label}
                  </span>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        <RevealOnScroll className="relative min-h-[380px] lg:min-h-[560px]">
          <div className="sticky top-28 h-[380px] overflow-hidden rounded-2xl border border-gold/15 bg-charcoal lg:h-[560px]">
            <Suspense
              fallback={
                <div className="h-full w-full bg-gradient-to-br from-charcoal via-charcoal-light to-ink" />
              }
            >
              <AboutCube />
            </Suspense>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
