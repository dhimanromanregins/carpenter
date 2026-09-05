import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { getWardrobeQuotation, getWardrobeQuotationPdfUrl } from "@/api/wardrobe";
import { ApiError } from "@/api/client";
import { useSeo } from "@/hooks/useSeo";
import type { WardrobeSavedOut } from "@/types/quotation";

export function WardrobeQuotationResultPage() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const [quotation, setQuotation] = useState<WardrobeSavedOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: "Your Wardrobe Quotation",
    description: "View and download your Dhiman Interiors wardrobe quotation.",
    path: `/quote/wardrobe/${quotationId ?? ""}`,
    noindex: true,
  });

  useEffect(() => {
    if (!quotationId) return;
    let cancelled = false;
    getWardrobeQuotation(quotationId)
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
            <h1 className="mt-2 font-display text-2xl text-cream md:text-3xl">
              Quotation No: <span className="text-gold">{quotation.quotation_number}</span>
            </h1>

            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between text-grey">
                <span>Wardrobe Finish</span>
                <span className="text-cream">{quotation.tier_name}</span>
              </div>
              <div className="flex justify-between text-grey">
                <span>Wardrobe Area</span>
                <span className="text-cream">{quotation.area_sqft} sq.ft.</span>
              </div>
              <div className="flex justify-between text-grey">
                <span>Customer</span>
                <span className="text-cream">{quotation.customer_name}</span>
              </div>
            </div>

            <h3 className="mt-6 text-sm uppercase tracking-widest text-cream">What's Included</h3>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              {quotation.included_items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gold">✓</span> {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-gold/30 pt-4">
              <p className="text-xs uppercase tracking-widest text-grey">Estimated Cost</p>
              <p className="font-display text-4xl text-gold">₹{quotation.total.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-[11px] text-grey/60">
                This is an estimate based on the details you provided. The final confirmed project price is set after a site visit.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={getWardrobeQuotationPdfUrl(quotation.id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-medium uppercase tracking-wide text-ink transition-colors duration-300 hover:bg-gold-light"
              >
                Download PDF
              </a>
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
