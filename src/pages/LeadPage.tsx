import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaPhoneAlt, FaWhatsapp, FaCheck } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSeo } from "@/hooks/useSeo";
import { submitLead } from "@/api/leads";
import { ApiError } from "@/api/client";
import { TESTIMONIALS } from "@/data/testimonials";
import { SERVICES } from "@/data/services";
import {
  BUDGET_OPTIONS,
  CITY_OPTIONS,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/data/leadOptions";

const PHONE = "+917717545979";
const WHATSAPP_TEXT = encodeURIComponent(
  "Hi Dhiman Interiors, I'd like to book my free design consultation."
);

const OFFER_POINTS = [
  "A 45-minute consultation with a senior designer, at our studio or your site",
  "3D visualisation of your kitchen, wardrobe or living space",
  "Transparent, itemised quotation with brand and material names",
  "Material and finish samples in hand, not just on a screen",
];

const STEPS = [
  {
    number: "01",
    title: "Share your space",
    description: "Fill the form with your city, room and rough budget. It takes under a minute.",
  },
  {
    number: "02",
    title: "Talk to a designer",
    description: "We call you within 24 hours and book a free consultation at your convenience.",
  },
  {
    number: "03",
    title: "Get your 3D design and quote",
    description:
      "You receive a 3D layout and an itemised quotation, with zero obligation to proceed.",
  },
];

const FAQS = [
  {
    question: "Is the consultation really free?",
    answer:
      "Yes. The consultation, the 3D concept and the itemised quotation are all free. You only pay once you approve a design and sign the work order.",
  },
  {
    question: "Which areas do you serve?",
    answer:
      "Zirakpur, Chandigarh, Mohali, Panchkula and the surrounding Tricity region. We take select projects further afield, so mention it in the form and we will confirm.",
  },
  {
    question: "How long does a project take?",
    answer:
      "A modular kitchen or wardrobe is typically installed in 3 to 5 weeks from design sign-off. Full home interiors run 8 to 12 weeks depending on scope.",
  },
  {
    question: "Do you use branded hardware?",
    answer:
      "Yes, Hettich, Hafele, Ebco and Century or Greenply boards, all named line by line in your quotation so you know exactly what you are paying for.",
  },
];

const STATS = [
  { value: "250+", label: "Homes delivered" },
  { value: "12 yrs", label: "Of craftsmanship" },
  { value: "4.9/5", label: "Client rating" },
];

const GALLERY = SERVICES.filter((service) => service.image).slice(0, 3);

interface SelectFieldProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
}

/** Matches FloatingInput's underline styling for the fields that need a dropdown. */
function SelectField({ label, name, options, required = false }: SelectFieldProps) {
  return (
    <div className="relative">
      <label className="block text-xs text-gold" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue=""
        required={required}
        className="mt-2 w-full appearance-none border-b border-grey/30 bg-transparent pb-3 pt-2 text-cream outline-none transition-colors focus:border-gold [&>option]:bg-charcoal [&>option]:text-cream"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LeadPage() {
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: "Free Design Consultation and 3D Quote",
    description:
      "Book a free 45-minute design consultation with Dhiman Interiors: 3D visualisation, itemised quotation and material samples for kitchens, wardrobes and full home interiors across the Tricity.",
    path: "/free-design-consultation",
  });

  // Ad campaigns land here with ?utm_source=..., so carry the attribution
  // through to the lead record and the sales team knows where it came from.
  const attribution = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const utmSource = params.get("utm_source");
    return {
      source: params.get("source") ?? (utmSource ? "campaign" : "website"),
      utm_source: utmSource,
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      page_path: location.pathname,
    };
  }, [location.search, location.pathname]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();

    // Mirrors the server rule (10-15 digits) so a typo gets a readable message
    // instead of the API's raw validation payload.
    const digits = value("phone").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      setError("Please enter a valid phone number so we can call you back.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitLead({
        name: value("name"),
        phone: value("phone"),
        email: value("email") || null,
        city: value("city") || null,
        service: value("service") || "not-sure",
        budget_range: value("budget_range") || null,
        timeline: value("timeline") || null,
        message: value("message"),
        ...attribution,
      });
      setSubmitted(true);
      // The submit button sits well below the top of the card, so bring the
      // confirmation into view rather than leaving the user on blank space.
      requestAnimationFrame(scrollToForm);
    } catch (err) {
      // VALIDATION_ERROR carries the raw pydantic payload — not something to
      // put in front of a customer.
      setError(
        err instanceof ApiError && err.code !== "VALIDATION_ERROR"
          ? err.message
          : "Couldn't send your request. Please check your details, or call us instead."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () =>
    document.querySelector("#lead-form")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-ink pb-32 pt-28 md:pb-28 md:pt-36">
      <div className="container-luxury">
        {/* Hero + capture form */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div>
            <span className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
              <span className="h-px w-8 bg-gold" />
              Free Design Consultation
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] text-cream sm:text-5xl md:text-6xl">
              Your dream interior, <span className="text-gradient-gold">designed free</span> before
              you spend a rupee.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-grey md:text-lg">
              Book a 45-minute session with a senior designer and walk away with a 3D concept, an
              itemised quotation and real material samples. No cost, no obligation.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {OFFER_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-grey md:text-base">
                  <FaCheck className="mt-1 shrink-0 text-gold" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-gold/15 pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl text-gold md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-grey">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <RevealOnScroll>
            <GlassCard className="p-7 md:p-10">
              <div id="lead-form" className="scroll-mt-32">
                {submitted ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
                      <FaCheck />
                    </span>
                    <p className="font-display text-2xl text-gold">Request received.</p>
                    <p className="max-w-sm text-sm leading-relaxed text-grey">
                      A design consultant will call you within 24 hours to book your free
                      consultation. Prefer to talk right now?
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-3">
                      <a
                        href={`tel:${PHONE}`}
                        className="flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-cream transition-colors hover:bg-gold hover:text-ink"
                      >
                        <FaPhoneAlt /> Call now
                      </a>
                      <a
                        href={`https://wa.me/${PHONE.replace("+", "")}?text=${WHATSAPP_TEXT}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-cream transition-colors hover:bg-gold hover:text-ink"
                      >
                        <FaWhatsapp /> WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                    <div>
                      <h2 className="font-display text-2xl text-cream">
                        Book your free consultation
                      </h2>
                      <p className="mt-2 text-sm text-grey">
                        Takes under a minute. We call you back within 24 hours.
                      </p>
                    </div>

                    <FloatingInput label="Full Name" name="name" required />
                    <FloatingInput label="Phone Number" name="phone" type="tel" required />
                    <FloatingInput label="Email Address (optional)" name="email" type="email" />

                    <SelectField label="City" name="city" options={CITY_OPTIONS} />
                    <SelectField
                      label="What do you need?"
                      name="service"
                      options={SERVICE_OPTIONS}
                      required
                    />

                    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                      <SelectField label="Budget" name="budget_range" options={BUDGET_OPTIONS} />
                      <SelectField label="Timeline" name="timeline" options={TIMELINE_OPTIONS} />
                    </div>

                    <FloatingInput
                      label="Anything specific? (optional)"
                      name="message"
                      as="textarea"
                    />

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <MagneticButton type="submit" variant="solid" disabled={submitting}>
                      {submitting ? "Sending..." : "Get My Free Design"}
                    </MagneticButton>

                    <p className="text-xs leading-relaxed text-grey/70">
                      We use your details only to contact you about this enquiry. No spam, ever.
                    </p>
                  </form>
                )}
              </div>
            </GlassCard>
          </RevealOnScroll>
        </div>

        {/* How it works */}
        <div className="mt-24 md:mt-32">
          <SectionHeading
            eyebrow="How It Works"
            title="Three steps to your design"
            description="From first message to a 3D layout in hand, here is exactly what happens."
            className="mb-14"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <RevealOnScroll key={step.number} delay={index * 0.1}>
                <GlassCard className="h-full p-8">
                  <span className="font-display text-3xl text-gold/50">{step.number}</span>
                  <h3 className="mt-4 font-display text-xl text-cream">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-grey">{step.description}</p>
                </GlassCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        {/* Work gallery */}
        <div className="mt-24 md:mt-32">
          <SectionHeading
            eyebrow="Our Work"
            title="Built in the Tricity, finished to the millimetre"
            className="mb-14"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {GALLERY.map((service) => (
              <div key={service.id} className="overflow-hidden rounded-2xl border border-gold/10">
                <div className="aspect-[4/3]">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="bg-charcoal-light px-4 py-3 text-xs text-grey">{service.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24 md:mt-32">
          <SectionHeading eyebrow="Client Stories" title="What homeowners say" className="mb-14" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
              <RevealOnScroll key={testimonial.id} delay={index * 0.1}>
                <GlassCard className="h-full p-8">
                  <p className="text-sm text-gold">{"*".repeat(testimonial.rating)}</p>
                  <p className="mt-4 text-sm leading-relaxed text-grey">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <p className="mt-6 text-sm text-cream">{testimonial.name}</p>
                  <p className="text-xs text-grey">{testimonial.role}</p>
                </GlassCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl md:mt-32">
          <SectionHeading eyebrow="FAQ" title="Before you book" className="mb-10" />
          <div className="divide-y divide-gold/10 border-y border-gold/10">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="cursor-pointer list-none text-cream marker:hidden">
                  <span className="flex items-start justify-between gap-6">
                    {faq.question}
                    <span className="mt-1 shrink-0 text-gold transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-grey">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        {!submitted && (
          <div className="mt-24 text-center md:mt-32">
            <h2 className="font-display text-3xl text-cream md:text-4xl">
              Ready to see your space in 3D?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-grey md:text-base">
              Book the free consultation now. Slots this month are limited to fifteen homes.
            </p>
            <div className="mt-8 flex justify-center">
              <MagneticButton variant="solid" onClick={scrollToForm}>
                Get My Free Design
              </MagneticButton>
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile action bar — the phone is where most of these leads land. */}
      {!submitted && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-gold/15 bg-ink/95 p-3 backdrop-blur md:hidden">
          <a
            href={`tel:${PHONE}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 py-3 text-sm text-cream"
          >
            <FaPhoneAlt /> Call
          </a>
          <button
            type="button"
            onClick={scrollToForm}
            className="flex-1 rounded-full bg-gold py-3 text-sm font-medium text-ink"
          >
            Get Free Design
          </button>
        </div>
      )}
    </div>
  );
}
