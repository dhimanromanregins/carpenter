import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { GlassCard } from "@/components/ui/GlassCard";
import { MATERIALS } from "@/data/materials";
import { cn } from "@/lib/utils";

export function Materials() {
  return (
    <section id="materials" className="relative bg-charcoal py-28 md:py-40">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="Craftsmanship"
          title="Materials We Trust"
          description="Every project is built on branded, quality-tested material — never low-grade boards or unverified hardware."
          align="left"
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS.map((category, i) => (
            <RevealOnScroll key={category.id} delay={i * 0.1}>
              <GlassCard className="flex h-full flex-col gap-5 p-8">
                <h3 className="font-display text-2xl text-cream">{category.title}</h3>
                <p className="text-sm leading-relaxed text-grey">{category.description}</p>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {category.brands.map((brand) => (
                    <span
                      key={brand.name}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest",
                        brand.tier === "Luxury"
                          ? "border-gold/50 bg-gold/10 text-gold"
                          : "border-cream/20 text-grey"
                      )}
                    >
                      {brand.name}
                      <span className="text-[9px] tracking-normal text-grey/70">
                        {brand.tier}
                      </span>
                    </span>
                  ))}
                </div>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>

        
      </div>
    </section>
  );
}
