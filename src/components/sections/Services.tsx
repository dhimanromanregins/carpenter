import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { TiltCard } from "@/components/ui/TiltCard";
import { SERVICES } from "@/data/services";

export function Services() {
  return (
    <section id="services" className="relative bg-charcoal py-28 md:py-40">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="What We Craft"
          title="Services built around your home"
          description="From bespoke wardrobes to full modular kitchens — every service is executed in-house, end to end."
          align="left"
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <RevealOnScroll key={service.id} delay={(i % 4) * 0.08}>
              <TiltCard
                className="group relative h-72 overflow-hidden rounded-2xl border border-gold/10 bg-gradient-to-br from-charcoal-light to-ink p-6"
                tiltStrength={8}
              >
                {service.image && (
                  <>
                    <img
                      src={service.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-500 group-hover:opacity-55"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
                  </>
                )}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(198,168,106,0.18), transparent 70%)",
                  }}
                />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <span className="font-display text-sm text-gold">
                    {service.index}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-cream">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-grey">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
