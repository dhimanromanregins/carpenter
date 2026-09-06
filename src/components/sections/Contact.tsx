import { useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { submitContactEnquiry } from "@/api/contact";
import { ApiError } from "@/api/client";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    setSubmitting(true);
    setError(null);
    try {
      await submitContactEnquiry({ name, phone, email, message });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative bg-ink py-28 md:py-40">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Book your site visit"
          description="Tell us about your space — our design team will get back to you within 24 hours."
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <RevealOnScroll className="lg:col-span-3">
            <GlassCard className="p-8 md:p-12">
              {submitted ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center">
                  <p className="font-display text-2xl text-gold">
                    Thank you.
                  </p>
                  <p className="text-sm text-grey">
                    Our design consultant will reach out to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <FloatingInput label="Full Name" name="name" required />
                    <FloatingInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      required
                    />
                  </div>
                  <FloatingInput
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                  />
                  <FloatingInput
                    label="Tell us about your project"
                    name="message"
                    as="textarea"
                  />
                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <MagneticButton
                    type="submit"
                    variant="solid"
                    className="self-start"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Send Enquiry"}
                  </MagneticButton>
                </form>
              )}
            </GlassCard>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15} className="flex flex-col gap-6 lg:col-span-2">
            <GlassCard className="flex flex-col gap-6 p-8">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="mt-1 text-gold" />
                <div>
                  <p className="text-sm text-cream">Studio Address</p>
                  <p className="mt-1 text-sm text-grey">
                    Highland Marg, Highway, Patiala, Zirakpur, Punjab 140603
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaPhoneAlt className="mt-1 text-gold" />
                <div>
                  <p className="text-sm text-cream">Call Us</p>
                  <p className="mt-1 text-sm text-grey">+91 77175 45979</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaEnvelope className="mt-1 text-gold" />
                <div>
                  <p className="text-sm text-cream">Email</p>
                  <p className="mt-1 text-sm text-grey">
                    contact@dhimaninteriors.in
                  </p>
                </div>
              </div>
            </GlassCard>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-gold/15">
              <iframe
                title="Studio Location"
                src="https://maps.google.com/maps?q=Highland+Marg%2C+Zirakpur%2C+Punjab+140603&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-full min-h-[220px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
