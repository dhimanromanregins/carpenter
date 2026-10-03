import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useKitchenStore } from "../store/kitchenStore";
import { useUi } from "../store/uiStore";
import { bomProducts, priceDesign, quotationToCsv } from "../engine/pricing";
import { inr } from "../model/units";
import { capturePng, downloadDataUrl } from "../scene/capture";
import { Btn } from "./atoms";

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  downloadDataUrl(url, name);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 text-sm ${strong ? "border-t border-gold/30 pt-3 font-display text-lg text-gold" : "text-grey"}`}>
      <span className={strong ? "" : "text-cream/80"}>{label}</span>
      <span className={strong ? "" : "text-cream"}>{value}</span>
    </div>
  );
}

export function QuoteModal() {
  const open = useUi((s) => s.quoteOpen);
  const toggle = useUi((s) => s.toggle);
  const design = useKitchenStore((s) => s.design);
  const q = useMemo(() => (open ? priceDesign(design) : null), [open, design]);
  const products = useMemo(() => (open ? bomProducts(design) : []), [open, design]);
  const b = q?.breakdown;

  const appliances = products.filter((p) => p.product.category === "appliance" || p.product.category === "sink" || p.product.category === "faucet");
  const hardware = products.filter((p) => p.product.category === "hardware" || p.product.category === "accessory");

  return (
    <AnimatePresence>
      {open && q && b && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-3 backdrop-blur-sm sm:p-6" onClick={() => toggle("quoteOpen")}>
          <motion.div
            id="kitchen-quote"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-gold/25 bg-charcoal"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Kitchen quotation"
          >
            <style>{`@media print { body * { visibility: hidden !important; } #kitchen-quote, #kitchen-quote * { visibility: visible !important; } #kitchen-quote { position: absolute !important; inset: 0 !important; max-height: none !important; overflow: visible !important; background: #fff !important; color: #111 !important; } #kitchen-quote .no-print { display: none !important; } }`}</style>
            <button onClick={() => toggle("quoteOpen")} aria-label="Close" className="no-print absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold hover:text-cream">
              ✕
            </button>

            <div className="border-b border-gold/15 px-6 py-8 sm:px-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Estimated quotation</p>
              <h2 className="mt-2 font-display text-3xl text-cream sm:text-4xl">{design.name}</h2>
              <p className="mt-1 text-sm text-grey">
                {design.layout} layout · {design.room.width} × {design.room.depth} mm · {design.modules.length} modules · {q.areaSqft} sq ft of fronts
              </p>
              <p className="mt-5 font-display text-5xl text-gradient-gold">{inr(b.total)}</p>
              <p className="text-xs text-grey">Including {inr(b.gst)} GST. An estimate only — the final quote follows a site visit.</p>
            </div>

            <div className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_1.3fr]">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-gold">Cost breakdown</p>
                <Row label="Cabinets (carcass + shutters)" value={inr(b.material)} />
                <Row label="Hardware" value={inr(b.hardware)} />
                <Row label="Handles & accessories" value={inr(b.accessories)} />
                <Row label="Appliances, sink & fixtures" value={inr(b.appliances)} />
                <Row label="Countertop & backsplash" value={inr(b.countertop)} />
                <Row label="Installation & delivery" value={inr(b.installation)} />
                <Row label="Labour" value={inr(b.labour)} />
                <Row label="Subtotal" value={inr(b.subtotal)} />
                <Row label="GST (18%)" value={inr(b.gst)} />
                <Row label="Total" value={inr(b.total)} strong />

                <p className="mb-2 mt-8 text-[10px] uppercase tracking-[0.28em] text-gold">Sheet materials</p>
                <ul className="space-y-1 text-sm">
                  {Object.entries(q.materialSheetSqm).map(([k, v]) => (
                    <li key={k} className="flex justify-between text-cream/80">
                      <span>{k}</span>
                      <span className="text-grey">{v} m²</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-gold">Cabinet list</p>
                  <div className="overflow-hidden rounded-lg border border-gold/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ink/60 text-grey">
                        <tr>
                          <th className="px-3 py-2 font-normal">Unit</th>
                          <th className="px-3 py-2 font-normal">Size (mm)</th>
                          <th className="px-3 py-2 font-normal">Finish</th>
                          <th className="px-3 py-2 text-right font-normal">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {q.cabinetList.map((c, i) => (
                          <tr key={i} className="border-t border-gold/10">
                            <td className="px-3 py-1.5 text-cream">{c.type}</td>
                            <td className="px-3 py-1.5 text-grey">{c.size}</td>
                            <td className="px-3 py-1.5 text-grey">{c.finish}</td>
                            <td className="px-3 py-1.5 text-right text-gold">{c.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {[["Hardware & accessories", hardware], ["Appliances & fixtures", appliances]].map(([title, list]) => (
                  <div key={title as string}>
                    <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-gold">{title as string}</p>
                    <ul className="space-y-1.5 text-xs">
                      {(list as typeof products).length === 0 && <li className="text-grey">None selected.</li>}
                      {(list as typeof products).map(({ product, qty }) => (
                        <li key={product.id} className="flex justify-between gap-3 border-b border-gold/10 pb-1.5">
                          <span className="text-cream">
                            {product.name}
                            <span className="ml-2 text-grey">{product.sku}</span>
                          </span>
                          <span className="shrink-0 text-grey">
                            {qty} × <span className="text-gold">{inr(product.price)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-3 border-t border-gold/15 px-6 py-5 sm:px-10">
              <Btn onClick={() => download("kitchen-boq.csv", quotationToCsv(q, design), "text/csv")}>Download BOQ (CSV)</Btn>
              <Btn onClick={() => download("kitchen-design.json", JSON.stringify(design, null, 2), "application/json")}>Design JSON</Btn>
              <Btn
                onClick={() => {
                  const png = capturePng(2);
                  if (png) downloadDataUrl(png, "kitchen-render.png");
                }}
              >
                Render image
              </Btn>
              <Btn onClick={() => window.print()}>Print / Save PDF</Btn>
              <Link to="/free-design-consultation" className="ml-auto rounded-lg bg-gold px-5 py-2.5 text-[11px] uppercase tracking-widest text-ink hover:bg-gold-light">
                Book a free consultation
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
