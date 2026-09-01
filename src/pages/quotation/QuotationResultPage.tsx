import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { getQuotation } from "@/api/quotations";
import { ApiError } from "@/api/client";
import type { QuotationSavedOut } from "@/types/quotation";

export function QuotationResultPage() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const [quotation, setQuotation] = useState<QuotationSavedOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quotationId) return;
    let cancelled = false;
    getQuotation(quotationId)
      .then((data) => {
        if (!cancelled) setQuotation(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load this quotation.");
      });
    return () => {
      cancelled = true;
    };
  }, [quotationId]);

  return (
    <div className="min-h-screen bg-ink px-4 pb-16 pt-32">
      <GlassCard className="mx-auto max-w-xl p-8 md:p-10">
        {error && <p className="text-red-400">{error}</p>}

        {!error && !quotation && <p className="text-grey">Loading your quotation...</p>}

        {quotation && (
          <>
            <p className="text-xs uppercase tracking-widest text-gold">Quotation Generated</p>
            <h2 className="mt-2 font-display text-2xl text-cream md:text-3xl">
              Quotation No: <span className="text-gold">{quotation.quotation_number}</span>
            </h2>

            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between text-grey">
                <span>Kitchen Area</span>
                <span className="text-cream">{quotation.area_sqft} sq.ft.</span>
              </div>
              <div className="flex justify-between text-grey">
                <span>Customer</span>
                <span className="text-cream">{quotation.customer_name}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gold/30 pt-4">
              <p className="text-xs uppercase tracking-widest text-grey">Estimated Cost</p>
              <p className="font-display text-4xl text-gold">₹{quotation.total.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-[11px] text-grey/60">
                This is an estimate based on the details you provided. The final confirmed project price is set after a site visit.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton variant="solid" onClick={() => window.print()}>
                Download Quotation
              </MagneticButton>
              <MagneticButton
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: quotation.quotation_number, url: window.location.href }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  }
                }}
              >
                Share
              </MagneticButton>
              <MagneticButton variant="ghost" onClick={() => alert("We'll call you back shortly!")}>
                Request Callback
              </MagneticButton>
            </div>

            <Link to="/quote" className="mt-8 inline-block text-sm text-grey hover:text-gold">
              Start a new quotation →
            </Link>
          </>
        )}
      </GlassCard>
    </div>
  );
}
