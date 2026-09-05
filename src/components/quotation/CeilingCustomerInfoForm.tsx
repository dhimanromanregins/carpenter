import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { createCeilingQuotation } from "@/api/ceiling";
import { useQuotationStore } from "@/store/quotationStore";
import { ApiError } from "@/api/client";

export function CeilingCustomerInfoForm({ onGenerated }: { onGenerated: (quotationId: number) => void }) {
  const area = useQuotationStore((s) => s.area);
  const ceilingQuote = useQuotationStore((s) => s.ceilingQuote);
  const customer = useQuotationStore((s) => s.customer);
  const setCustomer = useQuotationStore((s) => s.setCustomer);
  const setStage = useQuotationStore((s) => s.setStage);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    customer.name.trim().length > 0 &&
    customer.phone.trim().length > 0 &&
    customer.address.trim().length > 0 &&
    !!ceilingQuote &&
    !!area.areaSqft;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !ceilingQuote || !area.areaSqft) return;

    setSubmitting(true);
    setError(null);
    try {
      const saved = await createCeilingQuotation({
        area_sqft: area.areaSqft,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email.trim() || null,
        customer_address: customer.address.trim(),
      });
      onGenerated(saved.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't generate your quotation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="mx-auto max-w-xl p-8 md:p-10">
      <h2 className="font-display text-2xl text-cream md:text-3xl">Your Details</h2>
      <p className="mt-2 text-sm text-grey">We'll use these to prepare your ceiling quotation PDF.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-grey">Name</span>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => setCustomer({ name: e.target.value })}
            required
            className="rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-cream outline-none focus:border-gold"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-grey">Address</span>
          <textarea
            value={customer.address}
            onChange={(e) => setCustomer({ address: e.target.value })}
            required
            rows={3}
            className="resize-none rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-cream outline-none focus:border-gold"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-grey">Phone</span>
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => setCustomer({ phone: e.target.value })}
            required
            className="rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-cream outline-none focus:border-gold"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-grey">Email (optional)</span>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({ email: e.target.value })}
            className="rounded-lg border border-cream/15 bg-charcoal-light px-4 py-3 text-cream outline-none focus:border-gold"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <MagneticButton variant="ghost" type="button" onClick={() => setStage("ceilingEstimate")}>
            Back
          </MagneticButton>
          <MagneticButton variant="solid" type="submit" className="flex-1 justify-center" disabled={!canSubmit || submitting}>
            {submitting ? "Generating..." : "Generate Quotation"}
          </MagneticButton>
        </div>
      </form>
    </GlassCard>
  );
}
