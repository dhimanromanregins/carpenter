import { Navigate, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useSeo } from "@/hooks/useSeo";
import { getLocalSeoPage } from "@/data/localSeoPages";

export function LocalSeoPage({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const page = getLocalSeoPage(slug);

  useSeo({
    title: page?.metaTitle ?? "Interior Designer",
    description: page?.metaDescription ?? "",
    path: `/interior-designer-${slug}`,
  });

  if (!page) return <Navigate to="/" replace />;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-ink pb-28 pt-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="container-luxury">
        {/* Hero */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
              <span className="h-px w-8 bg-gold" />
              Serving {page.city}
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] text-cream sm:text-5xl md:text-6xl">
              {page.heroHeadline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-grey md:text-lg">{page.heroSubtext}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <MagneticButton variant="solid" onClick={() => navigate("/quote")}>
                Get a Free Quote
              </MagneticButton>
              <MagneticButton
                variant="outline"
                onClick={() => document.querySelector("#faq")?.scrollIntoView({ behavior: "smooth" })}
              >
                Read FAQs
              </MagneticButton>
            </div>
          </div>
          <RevealOnScroll>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-gold/10">
              <img src={page.heroImage} alt={`${page.city} interior design`} className="h-full w-full object-cover" />
            </div>
          </RevealOnScroll>
        </div>

        {/* Intro */}
        <div className="mt-20 max-w-3xl space-y-5">
          {page.intro.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-grey md:text-lg">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Services */}
        <div className="mt-20">
          <h2 className="font-display text-3xl text-cream md:text-4xl">
            Our Services in {page.city}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {page.services.map((service) => (
              <GlassCard key={service.title} className="p-6">
                <h3 className="font-display text-xl text-cream">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-grey">{service.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-20">
          <h2 className="font-display text-3xl text-cream md:text-4xl">Our Work</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-grey">{page.galleryNote}</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {page.gallery.map((image) => (
              <div key={image.src} className="overflow-hidden rounded-2xl border border-gold/10">
                <div className="aspect-[4/3]">
                  <img src={image.src} alt={image.caption} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <p className="bg-charcoal-light px-4 py-3 text-xs text-grey">{image.caption}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why choose us */}
        <div className="mt-20">
          <h2 className="font-display text-3xl text-cream md:text-4xl">
            Why Choose Dhiman Interiors in {page.city}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {page.whyChooseUs.map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="mt-1 text-gold">✓</span>
                <div>
                  <h3 className="text-cream">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-grey">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="mt-20 max-w-3xl scroll-mt-32">
          <h2 className="font-display text-3xl text-cream md:text-4xl">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-3">
            {page.faqs.map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-gold/10 bg-charcoal-light px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-cream marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-grey">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <GlassCard className="mt-20 flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="font-display text-2xl text-cream md:text-3xl">
              Ready to start your {page.city} project?
            </h2>
            <p className="mt-2 text-sm text-grey">Get an instant estimate, or book a site visit — no obligation.</p>
          </div>
          <MagneticButton variant="solid" onClick={() => navigate("/quote")}>
            Get a Free Quote
          </MagneticButton>
        </GlassCard>
      </div>
    </div>
  );
}
