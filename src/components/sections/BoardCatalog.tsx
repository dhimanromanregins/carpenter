import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BoardArt } from "@/components/ui/BoardArt";
import { BOARD_TYPES_BY_ID, type BoardBrand, type FullBoardType } from "@/data/boardCatalog";
import { getLenis } from "@/hooks/useLenis";
import { cn } from "@/lib/utils";

export interface RatingRow {
  key: string;
  label: string;
}

interface BoardCatalogProps {
  brand: BoardBrand;
  onClose: () => void;
  /** Type lookup for this catalogue (defaults to the board catalogue). */
  types?: Record<string, FullBoardType>;
  ratingRows?: RatingRow[];
  /** Plural noun used in labels, e.g. "boards" or "products". */
  noun?: string;
  /** Label for the sizes row, e.g. "Thickness" or "Pack sizes". */
  sizeLabel?: string;
}

const BOARD_RATING_ROWS: RatingRow[] = [
  { key: "waterResistance", label: "Water resistance" },
  { key: "strength", label: "Strength" },
  { key: "screwHolding", label: "Screw holding" },
  { key: "smoothFinish", label: "Smooth finish" },
  { key: "termiteProtection", label: "Termite protection" },
  { key: "fireResistance", label: "Fire resistance" },
  { key: "cost", label: "Price level" },
];
const MAX_COMPARE = 4;

function RatingBar({ value, muted }: { value: number; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${value} out of 5`}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={cn("h-2 w-5 rounded-sm", n <= value ? (muted ? "bg-cream/70" : "bg-gold") : "bg-cream/10")}
          />
        ))}
      </div>
      <span className="text-[11px] text-grey">{value}/5</span>
    </div>
  );
}

function InsideBlock({ type }: { type: FullBoardType }) {
  return (
    <div className="rounded-xl border border-gold/15 bg-ink/50 p-5">
      <ol className="space-y-3">
        {type.inside.map((layer, i) => (
          <li key={layer.label} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 text-[11px] text-gold">
              {i + 1}
            </span>
            <div>
              <p className="text-sm text-cream">{layer.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-grey">{layer.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gold/10 pt-4 text-xs">
        <div>
          <dt className="uppercase tracking-widest text-cream/50">Bonded with</dt>
          <dd className="mt-1 text-grey">{type.glue}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest text-cream/50">Weight</dt>
          <dd className="mt-1 text-grey">{type.weight}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-grey">
        <span className="uppercase tracking-widest text-cream/50">How it is made · </span>
        {type.howMade}
      </p>
    </div>
  );
}

function CompareTable({
  types,
  brandId,
  ratingRows,
  sizeLabel,
}: {
  types: FullBoardType[];
  brandId: string;
  ratingRows: RatingRow[];
  sizeLabel: string;
}) {
  const textRows: { label: string; get: (t: FullBoardType) => string }[] = [
    { label: "Bonded with", get: (t) => t.glue },
    { label: "Weight", get: (t) => t.weight },
    { label: sizeLabel, get: (t) => t.thickness.join(" · ") },
  ];
  const th = "sticky left-0 bg-ink p-4 text-left text-xs font-normal uppercase tracking-widest text-cream/60";

  return (
    <div className="overflow-x-auto rounded-2xl border border-gold/15" data-lenis-prevent>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-charcoal">
            <th className="sticky left-0 z-10 w-40 bg-charcoal p-4" />
            {types.map((t) => (
              <th key={t.id} className="p-4 align-bottom">
                <div className="mb-3 aspect-[16/10] w-full max-w-[200px]">
                  <BoardArt type={t} seedKey={brandId} />
                </div>
                <p className="font-display text-lg font-normal text-cream">{t.name}</p>
                <p className="mt-0.5 text-[11px] font-normal uppercase tracking-widest text-gold">{t.standard}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {textRows.map((row) => (
            <tr key={row.label} className="border-t border-gold/10">
              <th className={th}>{row.label}</th>
              {types.map((t) => (
                <td key={t.id} className="p-4 text-grey">
                  {row.get(t)}
                </td>
              ))}
            </tr>
          ))}
          {ratingRows.map((row) => (
            <tr key={row.key} className="border-t border-gold/10">
              <th className={th}>{row.label}</th>
              {types.map((t) => (
                <td key={t.id} className="p-4">
                  <RatingBar value={t.ratings[row.key]} muted={row.key === "cost"} />
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-gold/10">
            <th className={cn(th, "align-top")}>Best for</th>
            {types.map((t) => (
              <td key={t.id} className="p-4 align-top text-grey">
                {t.bestFor.join(", ")}
              </td>
            ))}
          </tr>
          <tr className="border-t border-gold/10">
            <th className={cn(th, "align-top")}>What is inside</th>
            {types.map((t) => (
              <td key={t.id} className="p-4 align-top text-xs leading-relaxed text-grey">
                {t.inside.map((l) => l.label).join(" → ")}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function BoardCatalog({
  brand,
  onClose,
  types = BOARD_TYPES_BY_ID,
  ratingRows = BOARD_RATING_ROWS,
  noun = "boards",
  sizeLabel = "Thickness",
}: BoardCatalogProps) {
  const [filter, setFilter] = useState<string>("all");
  const [openInside, setOpenInside] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [view, setView] = useState<"catalog" | "compare">("catalog");

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const products = brand.products.filter((p) => types[p.typeId]);
  const visible = filter === "all" ? products : products.filter((p) => p.typeId === filter);
  const compared = compare.map((id) => types[id]).filter(Boolean);

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : [...c, id]));
  const toggleInside = (id: string) =>
    setOpenInside((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const isInsideOpen = (id: string) => filter !== "all" || openInside.includes(id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${brand.name} catalogue`}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-gold/20 bg-ink"
      >
        <button
          onClick={onClose}
          aria-label="Close catalogue"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-ink/80 text-gold transition-colors hover:border-gold hover:text-cream"
        >
          &#10005;
        </button>

        {/* brand header */}
        <div className="relative overflow-hidden border-b border-gold/15 bg-gradient-to-br from-charcoal-light via-charcoal to-ink px-6 py-10 sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-[100px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span
                className={cn(
                  "inline-block rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.25em]",
                  brand.tier === "Luxury" ? "border-gold/60 bg-gold/10 text-gold" : "border-cream/20 text-grey"
                )}
              >
                {brand.tier} range
              </span>
              <h3 className="mt-4 font-display text-4xl text-cream sm:text-5xl">{brand.name}</h3>
              <p className="mt-2 text-gold">{brand.tagline}</p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-grey">{brand.about}</p>
            </div>
            <div className="rounded-xl border border-gold/15 bg-ink/50 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Why we use {brand.name}</p>
              <ul className="mt-4 space-y-3">
                {brand.whyWeUse.map((w) => (
                  <li key={w} className="flex gap-3 text-sm text-cream/90">
                    <span className="mt-0.5 text-gold">✦</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* category tabs */}
        <div className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-gold/10 bg-ink/95 px-6 py-4 backdrop-blur sm:px-12">
          {[{ id: "all", name: `All ${noun}` }, ...products.map((p) => types[p.typeId])].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setFilter(t.id);
                setView("catalog");
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors",
                view === "catalog" && filter === t.id
                  ? "border-gold bg-gold text-ink"
                  : "border-gold/25 text-grey hover:border-gold/60 hover:text-cream"
              )}
            >
              {t.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (compare.length === 0) setCompare(products.slice(0, 3).map((p) => p.typeId));
              setView("compare");
            }}
            className={cn(
              "ml-auto shrink-0 rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors",
              view === "compare" ? "border-gold bg-gold text-ink" : "border-gold text-gold hover:bg-gold/10"
            )}
          >
            Compare {noun}{compare.length > 0 ? ` (${compare.length})` : ""}
          </button>
        </div>

        {view === "compare" ? (
          <div className="px-6 py-10 sm:px-12">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs uppercase tracking-widest text-grey">Select up to {MAX_COMPARE}:</span>
              {products.map((p) => {
                const t = types[p.typeId];
                const on = compare.includes(p.typeId);
                return (
                  <button
                    key={p.typeId}
                    type="button"
                    onClick={() => toggleCompare(p.typeId)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      on ? "border-gold bg-gold/15 text-gold" : "border-cream/15 text-grey hover:border-gold/50"
                    )}
                  >
                    {on ? "✓ " : "+ "}
                    {t.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setView("catalog")}
                className="ml-auto text-xs uppercase tracking-widest text-grey hover:text-cream"
              >
                &larr; Back to catalogue
              </button>
            </div>

            {compared.length < 2 ? (
              <p className="rounded-xl border border-gold/15 p-8 text-center text-sm text-grey">
                Pick at least two boards above to compare them side by side.
              </p>
            ) : (
              <CompareTable types={compared} brandId={brand.id} ratingRows={ratingRows} sizeLabel={sizeLabel} />
            )}
          </div>
        ) : (
          <div className="grid gap-6 px-6 py-10 sm:px-12 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => {
                const type = types[p.typeId];
                const comparing = compare.includes(p.typeId);
                return (
                  <motion.article
                    layout
                    key={p.typeId}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-charcoal"
                  >
                    <div className="relative aspect-[16/10] bg-gradient-to-b from-charcoal-light to-charcoal p-4">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={`${brand.name} ${type.name}`}
                          loading="lazy"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <BoardArt type={type} seedKey={brand.id} />
                      )}
                      <span className="absolute left-4 top-4 rounded-full border border-gold/30 bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-widest text-gold backdrop-blur">
                        {type.standard}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCompare(p.typeId)}
                        aria-pressed={comparing}
                        className={cn(
                          "absolute right-4 top-4 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest backdrop-blur transition-colors",
                          comparing
                            ? "border-gold bg-gold text-ink"
                            : "border-cream/30 bg-ink/70 text-cream hover:border-gold hover:text-gold"
                        )}
                      >
                        {comparing ? "✓ Comparing" : "+ Compare"}
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-5 p-6">
                      <div>
                        <h4 className="font-display text-2xl text-cream">
                          {p.productName ?? `${brand.name} ${type.name}`}
                        </h4>
                        <p className="mt-1 text-xs uppercase tracking-widest text-gold">{type.short}</p>
                        <p className="mt-3 text-sm leading-relaxed text-grey">{type.description}</p>
                      </div>

                      <div>
                        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-cream/60">Advantages</p>
                        <ul className="space-y-2">
                          {type.advantages.map((a) => (
                            <li key={a} className="flex gap-3 text-sm text-cream/90">
                              <span className="mt-0.5 text-gold">✓</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => toggleInside(p.typeId)}
                          aria-expanded={isInsideOpen(p.typeId)}
                          className="flex w-full items-center justify-between rounded-lg border border-gold/25 px-4 py-3 text-xs uppercase tracking-widest text-gold transition-colors hover:bg-gold/10"
                        >
                          What is inside
                          <span>{isInsideOpen(p.typeId) ? "−" : "+"}</span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isInsideOpen(p.typeId) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3">
                                <InsideBlock type={type} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="mt-auto space-y-4 border-t border-gold/10 pt-5">
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-cream/60">Best for</p>
                          <div className="flex flex-wrap gap-2">
                            {type.bestFor.map((b) => (
                              <span key={b} className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-cream/60">{sizeLabel}</p>
                          <div className="flex flex-wrap gap-2">
                            {type.thickness.map((t) => (
                              <span key={t} className="rounded border border-cream/15 px-2.5 py-1 text-xs text-grey">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {view === "catalog" && compare.length >= 2 && (
          <div className="sticky bottom-4 z-10 mx-auto mb-4 flex w-fit items-center gap-4 rounded-full border border-gold/40 bg-ink/95 px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur">
            <span className="text-xs uppercase tracking-widest text-grey">{compare.length} selected</span>
            <button
              type="button"
              onClick={() => setView("compare")}
              className="rounded-full bg-gold px-5 py-2 text-xs uppercase tracking-widest text-ink"
            >
              Compare now
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 border-t border-gold/10 px-6 py-8 text-center sm:px-12">
          <p className="text-sm text-grey">
            Not sure what suits your project? We will recommend the right choice for every room.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              window.setTimeout(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }), 250);
            }}
            className="rounded-full border border-gold bg-gold px-8 py-3 text-xs uppercase tracking-[0.25em] text-ink transition-colors hover:bg-transparent hover:text-gold"
          >
            Book a free consultation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
