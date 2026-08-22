import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Counter } from "@/components/ui/Counter";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STATS = [
  { value: 1000, suffix: "+", label: "Projects Completed" },
  { value: 12, suffix: "+", label: "Years of Experience" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
  { value: 5, suffix: "★", label: "Average Rating" },
];

const REASONS = [
  {
    title: "In-House Craftsmen",
    desc: "No subcontracting — every piece is built by our own master carpenters.",
  },
  {
    title: "Premium Materials",
    desc: "Only Century Ply, Greenply, Merino and top-tier hardware make the cut.",
  },
  {
    title: "On-Time Delivery",
    desc: "Structured project timelines with weekly progress transparency.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />
      </div>

      <div className="container-luxury relative">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Craftsmanship you can trust"
          align="center"
          className="mx-auto mb-20 items-center"
        />

        <div className="grid grid-cols-2 gap-8 border-b border-gold/10 pb-20 md:grid-cols-4">
          {STATS.map((stat) => (
            <RevealOnScroll key={stat.label} className="text-center">
              <p className="font-display text-4xl text-gold sm:text-5xl md:text-6xl">
                <Counter to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-grey">
                {stat.label}
              </p>
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 gap-10 md:grid-cols-3">
          {REASONS.map((reason, i) => (
            <RevealOnScroll key={reason.title} delay={i * 0.15}>
              <div className="border-t border-gold/20 pt-6">
                <h3 className="font-display text-xl text-cream">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-grey">
                  {reason.desc}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
