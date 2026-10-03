import { GlassFinishPicker } from "@/components/ui/GlassFinishPicker";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";
import { ShutterDesigner } from "@/components/studio/wardrobe/ShutterDesigner";
import { WardrobeScene, type CameraView } from "@/components/studio/wardrobe/WardrobeScene";
import { buildParts, leafCount, slidingPanelCount } from "@/components/studio/wardrobe/wardrobeParts";
import {
  FINISHES,
  FRAME_FINISHES,
  HANDLE_FINISHES,
  HANDLE_STYLES,
  LED_TEMPS,
  MAX_SECTION,
  MAX_SECTIONS,
  MIN_SECTION,
  MOODS,
  PRESETS,
  WALL_COLORS,
  areaSqft,
  defaultConfig,
  makeSection,
  newSectionId,
  surfaceFromFinish,
  totalHeight,
  totalWidth,
  type DoorFace,
  type DoorMode,
  type Finish,
  type HandleStyle,
  type SectionKind,
  type Surface,
  type WardrobeConfig,
  type WardrobeLights,
  type WardrobeSection,
} from "@/components/studio/wardrobe/wardrobeConfig";

const STORAGE_KEY = "kraftspace-wardrobe-design-v1";
type Tab = "layout" | "style" | "lighting" | "details";

function loadSaved(): WardrobeConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WardrobeConfig;
      if (parsed?.sections?.length) {
        return {
          ...defaultConfig(),
          ...parsed,
          surface: parsed.surface ?? surfaceFromFinish(parsed.shutterFinish),
          sections: parsed.sections.map((s) => ({ ...s, id: newSectionId() })),
        };
      }
    }
  } catch {
    /* ignore corrupt or blocked storage */
  }
  return defaultConfig();
}

/* ───────────────────────── small UI pieces ───────────────────────── */

function Group({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <div className="border-b border-gold/10 py-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{title}</p>
        {hint && <p className="text-[10px] text-grey">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-gold/15 bg-ink/60 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "flex-1 rounded-md px-2 py-2 text-[11px] uppercase tracking-wider transition-colors",
            value === o.id ? "bg-gold text-ink" : "text-grey hover:text-cream"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-gold/10 bg-ink/40 px-3 py-2.5 text-left transition-colors hover:border-gold/40"
    >
      <span>
        <span className="block text-sm text-cream">{label}</span>
        {sub && <span className="block text-[11px] text-grey">{sub}</span>}
      </span>
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-gold" : "bg-cream/15")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-ink transition-all", checked ? "left-[18px]" : "left-0.5 bg-cream")} />
      </span>
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "m",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-xs text-grey">
        {label}
        <span className="text-cream">
          {unit === "m" ? value.toFixed(2) : value.toFixed(1)}
          {unit && ` ${unit}`}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-cream/15 accent-[#c6a86a]"
      />
    </label>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between text-xs text-grey">
      {label}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="h-7 w-7 rounded-full border border-gold/30 text-gold disabled:opacity-30"
        >
          −
        </button>
        <span className="w-4 text-center text-cream">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="h-7 w-7 rounded-full border border-gold/30 text-gold disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Swatches({ list, value, onChange }: { list: Finish[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {list.map((f) => (
        <button
          key={f.id}
          type="button"
          title={f.name}
          aria-label={f.name}
          aria-pressed={value === f.id}
          onClick={() => onChange(f.id)}
          className={cn(
            "aspect-square rounded-full border-2 transition-transform hover:scale-110",
            value === f.id ? "scale-110 border-gold" : "border-cream/20"
          )}
          style={{
            background: f.ring
              ? `repeating-linear-gradient(90deg, ${f.color} 0 5px, ${f.ring} 5px 6px)`
              : f.metalness
                ? `linear-gradient(135deg, #fff6 0%, ${f.color} 40%, #0006 100%), ${f.color}`
                : f.color,
          }}
        />
      ))}
    </div>
  );
}

const KIND_LABEL: Record<SectionKind, string> = { doors: "Doors", drawers: "Drawers", open: "Open shelves" };

/* ───────────────────────── page ───────────────────────── */

export function WardrobeDesignerPage() {
  useSeo({
    title: "Wardrobe Designer — 3D Design Studio",
    description:
      "Design your dream wardrobe in real-time 3D — choose doors, glass, drawers, finishes, handles and LED profile lighting with Kraftspace Interiors.",
    path: "/design-studio/wardrobe",
  });

  const [config, setConfig] = useState<WardrobeConfig>(loadSaved);
  const [tab, setTab] = useState<Tab>("layout");
  const [blueprint, setBlueprint] = useState(false);
  const [designScope, setDesignScope] = useState<"all" | "section">("all");
  const [view, setView] = useState<CameraView>("perspective");
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<number | null>(() => null);
  const [toast, setToast] = useState<string | null>(null);
  const capture = useRef<(() => string) | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* storage unavailable */
    }
  }, [config]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const update = useCallback((patch: Partial<WardrobeConfig>) => setConfig((c) => ({ ...c, ...patch })), []);
  const updateLights = (patch: Partial<WardrobeLights>) => setConfig((c) => ({ ...c, lights: { ...c.lights, ...patch } }));
  const updateSection = (id: number, patch: Partial<WardrobeSection>) =>
    setConfig((c) => ({ ...c, sections: c.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const W = totalWidth(config);
  const TH = totalHeight(config);
  const area = areaSqft(config);

  // which surface the Shutter design panel edits: everything, or one selected doors section
  const targetSection = designScope === "section" ? config.sections.find((s) => s.id === selectedId && s.kind === "doors") ?? null : null;
  const designSurface: Surface = targetSection?.surface ?? config.surface;
  const changeSurface = (next: Surface) => {
    if (designScope === "section") {
      if (targetSection) updateSection(targetSection.id, { surface: next });
      return;
    }
    // "All doors" makes every section uniform again
    setConfig((c) => ({ ...c, surface: next, sections: c.sections.map((s) => ({ ...s, surface: undefined })) }));
  };

  const toggle = useCallback((key: string) => setOpenState((o) => ({ ...o, [key]: !o[key] })), []);
  const anyOpen = useMemo(() => Object.values(openState).some(Boolean), [openState]);
  const setAllOpen = (open: boolean) => {
    const next: Record<string, boolean> = {};
    config.sections.forEach((s) => {
      const leaves = leafCount(s.width);
      if (s.kind === "doors" && s.doorMode === "sliding") next[`s${s.id}`] = open;
      if (s.kind === "doors" && s.doorMode === "hinged") {
        for (let i = 0; i < leaves; i++) next[`h${s.id}.${i}`] = open;
      }
      if (s.kind === "doors") {
        for (let i = 0; i < (s.innerDrawers ?? 0); i++) next[`i${s.id}.${i}`] = open;
      }
      if (s.kind === "drawers") {
        for (let i = 0; i < s.drawers; i++) next[`d${s.id}.${i}`] = open;
      }
      if (config.loft) {
        for (let i = 0; i < leaves; i++) next[`l${s.id}.${i}`] = open;
      }
    });
    setOpenState(next);
  };

  const addSection = (kind: SectionKind) => {
    if (config.sections.length >= MAX_SECTIONS) return;
    const s = makeSection(kind);
    setConfig((c) => ({ ...c, sections: [...c.sections, s] }));
    setSelectedId(s.id);
  };
  const removeSection = (id: number) => {
    if (config.sections.length <= 1) return;
    setConfig((c) => ({ ...c, sections: c.sections.filter((s) => s.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };
  const moveSection = (id: number, dir: -1 | 1) =>
    setConfig((c) => {
      const i = c.sections.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= c.sections.length) return c;
      const arr = [...c.sections];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, sections: arr };
    });
  const duplicateSection = (id: number) => {
    if (config.sections.length >= MAX_SECTIONS) return;
    setConfig((c) => {
      const i = c.sections.findIndex((s) => s.id === id);
      if (i < 0) return c;
      const arr = [...c.sections];
      arr.splice(i + 1, 0, { ...c.sections[i], id: newSectionId() });
      return { ...c, sections: arr };
    });
  };

  const applyPreset = (build: () => WardrobeConfig) => {
    setConfig(build());
    setOpenState({});
    setSelectedId(null);
    setToast("Design loaded");
  };

  const snapshot = () => {
    const url = capture.current?.();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "kraftspace-wardrobe-design.png";
    a.click();
    setToast("Photo saved");
  };

  /** One-click: put a viewing mirror on the selected door section (or the first one that can take it). */
  const addMirror = () => {
    const doors = config.sections.filter((s) => s.kind === "doors");
    const target =
      doors.find((s) => s.id === selectedId) ?? doors.find((s) => s.face === "laminate") ?? doors[0];
    if (!target) {
      setToast("Add a doors section first");
      return;
    }
    updateSection(target.id, { face: "laminate", mirrorLeaf: target.mirrorLeaf != null && target.mirrorLeaf >= 0 ? target.mirrorLeaf : 0 });
    setSelectedId(target.id);
    setTab("layout");
    setBlueprint(false);
    setToast(`Mirror added to section ${config.sections.indexOf(target) + 1} — choose the door below`);
  };

  const toggleBlueprint = () => {
    const next = !blueprint;
    setBlueprint(next);
    if (next) {
      setView("front");
      setTab("details");
      setSelectedId(null);
    } else {
      setView("perspective");
      setTab("layout");
    }
  };

  const parts = useMemo(() => buildParts(config), [config]);
  const copyCutList = async () => {
    const lines = parts.map((p) => `${p.group} | ${p.name} | ${p.w} x ${p.h} x ${p.t} mm | qty ${p.qty}${p.note ? ` | ${p.note}` : ""}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setToast("Cut list copied");
    } catch {
      setToast("Copy not available");
    }
  };

  const views: { id: CameraView; label: string }[] = [
    { id: "perspective", label: "3D" },
    { id: "front", label: "Front" },
    { id: "top", label: "Top" },
    { id: "closeup", label: "Close-up" },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-ink text-cream lg:flex-row">
      {/* ——— 3D viewport ——— */}
      <div className="relative h-[52vh] shrink-0 lg:h-full lg:flex-1">
        <WardrobeScene
          config={config}
          view={view}
          openState={openState}
          onToggle={toggle}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            if (id !== null) setTab("layout");
          }}
          registerCapture={(fn) => {
            capture.current = fn;
          }}
          blueprint={blueprint}
        />

        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-4">
          <Link
            to="/design-studio"
            className="pointer-events-auto rounded-full border border-gold/30 bg-ink/70 px-4 py-2 text-[11px] uppercase tracking-widest text-cream backdrop-blur transition-colors hover:border-gold hover:text-gold"
          >
            &larr; Design Studio
          </Link>
          <div className="pointer-events-auto flex gap-1 rounded-full border border-gold/25 bg-ink/70 p-1 backdrop-blur">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors",
                  view === v.id ? "bg-gold text-ink" : "text-grey hover:text-cream"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* action bar */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4">
          <div className="pointer-events-auto rounded-xl border border-gold/20 bg-ink/75 px-4 py-3 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Your wardrobe</p>
            <p className="mt-1 font-display text-lg text-cream">
              {W.toFixed(2)} × {TH.toFixed(2)} × {config.depth.toFixed(2)} m
            </p>
            <p className="text-[11px] text-grey">
              {area.toFixed(0)} sq ft front area &middot; {config.sections.length} sections
            </p>
          </div>
          <div className="pointer-events-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addMirror}
              className="rounded-full border border-gold/30 bg-ink/75 px-4 py-2 text-[11px] uppercase tracking-widest text-cream backdrop-blur hover:border-gold"
            >
              + Mirror
            </button>
            <button
              type="button"
              onClick={toggleBlueprint}
              aria-pressed={blueprint}
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest backdrop-blur transition-colors",
                blueprint ? "border-gold bg-gold text-ink" : "border-gold/30 bg-ink/75 text-cream hover:border-gold"
              )}
            >
              {blueprint ? "Exit details" : "Details"}
            </button>
            <button
              type="button"
              onClick={() => setAllOpen(!anyOpen)}
              className="rounded-full border border-gold/30 bg-ink/75 px-4 py-2 text-[11px] uppercase tracking-widest text-cream backdrop-blur hover:border-gold"
            >
              {anyOpen ? "Close all" : "Open all"}
            </button>
            <button
              type="button"
              onClick={snapshot}
              className="rounded-full border border-gold/30 bg-ink/75 px-4 py-2 text-[11px] uppercase tracking-widest text-cream backdrop-blur hover:border-gold"
            >
              Save photo
            </button>
          </div>
        </div>

        <p className={cn("pointer-events-none absolute left-1/2 top-16 hidden -translate-x-1/2 text-[11px] text-cream/60 md:block", blueprint && "md:hidden")}>
          Drag to orbit &middot; scroll to zoom &middot; click a door or drawer to open it
        </p>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 rounded-full bg-gold px-4 py-2 text-xs text-ink"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ——— control panel ——— */}
      <aside className="flex min-h-0 flex-1 flex-col border-t border-gold/20 bg-charcoal lg:w-[400px] lg:flex-none lg:border-l lg:border-t-0">
        <div className="border-b border-gold/15 px-5 pb-4 pt-5">
          <h1 className="font-display text-2xl text-cream">Wardrobe Designer</h1>
          <p className="mt-1 text-xs text-grey">Build it in 3D, light it, and see it come to life.</p>
          <div className="mt-4 flex gap-1 rounded-lg border border-gold/15 bg-ink/60 p-1">
            {(["layout", "style", "lighting", "details"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  if (t === "details" && !blueprint) toggleBlueprint();
                }}
                className={cn(
                  "flex-1 rounded-md py-2 text-[10px] uppercase tracking-wider transition-colors",
                  tab === t ? "bg-gold text-ink" : "text-grey hover:text-cream"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div ref={panelRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6" data-lenis-prevent>
          {tab === "layout" && (
            <>
              <Group title="Start from a design">
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.build)}
                      className="rounded-lg border border-gold/15 bg-ink/40 p-3 text-left transition-colors hover:border-gold"
                    >
                      <span className="block text-sm text-cream">{p.name}</span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-grey">{p.blurb}</span>
                    </button>
                  ))}
                </div>
              </Group>

              <Group title="Size">
                <div className="space-y-4">
                  <Slider label="Height" value={config.height} min={2} max={3} step={0.05} onChange={(v) => update({ height: v })} />
                  <Slider label="Depth" value={config.depth} min={0.45} max={0.75} step={0.05} onChange={(v) => update({ depth: v })} />
                  <Slider label="Plinth" value={config.plinth} min={0.05} max={0.15} step={0.01} onChange={(v) => update({ plinth: v })} />
                  <Toggle checked={config.loft} onChange={(v) => update({ loft: v })} label="Loft cabinets" sub="Extra storage above the wardrobe" />
                  {config.loft && (
                    <Slider label="Loft height" value={config.loftHeight} min={0.35} max={0.9} step={0.05} onChange={(v) => update({ loftHeight: v })} />
                  )}
                </div>
              </Group>

              <Group title="Sections" hint={`${config.sections.length}/${MAX_SECTIONS}`}>
                <div className="space-y-2">
                  {config.sections.map((s, i) => {
                    const active = s.id === selectedId;
                    return (
                      <div
                        key={s.id}
                        className={cn("rounded-lg border transition-colors", active ? "border-gold bg-gold/5" : "border-gold/10 bg-ink/40")}
                      >
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedId(active ? null : s.id)}
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold/40 text-[11px] text-gold">
                              {i + 1}
                            </span>
                            <span>
                              <span className="block text-sm text-cream">
                                {KIND_LABEL[s.kind]}
                                {s.kind === "doors" && ` · ${s.doorMode}`}
                              </span>
                              <span className="block text-[11px] text-grey">
                                {s.width.toFixed(2)} m{s.kind === "doors" && s.face !== "laminate" ? ` · ${s.face}` : ""}
                              </span>
                            </span>
                          </button>
                          <button type="button" aria-label="Move left" onClick={() => moveSection(s.id, -1)} disabled={i === 0} className="h-7 w-7 rounded text-grey hover:text-gold disabled:opacity-25">
                            ←
                          </button>
                          <button type="button" aria-label="Move right" onClick={() => moveSection(s.id, 1)} disabled={i === config.sections.length - 1} className="h-7 w-7 rounded text-grey hover:text-gold disabled:opacity-25">
                            →
                          </button>
                        </div>

                        {active && (
                          <div className="space-y-4 border-t border-gold/15 px-3 pb-4 pt-4">
                            <Seg<SectionKind>
                              value={s.kind}
                              options={[
                                { id: "doors", label: "Doors" },
                                { id: "drawers", label: "Drawers" },
                                { id: "open", label: "Open" },
                              ]}
                              onChange={(kind) => updateSection(s.id, { kind })}
                            />
                            <Slider label="Width" value={s.width} min={MIN_SECTION} max={MAX_SECTION} step={0.05} onChange={(v) => updateSection(s.id, { width: v })} />

                            {s.kind === "doors" && (
                              <>
                                <div>
                                  <p className="mb-1.5 text-xs text-grey">Door opening</p>
                                  <Seg<DoorMode>
                                    value={s.doorMode}
                                    options={[
                                      { id: "hinged", label: "Hinged" },
                                      { id: "sliding", label: "Sliding" },
                                    ]}
                                    onChange={(doorMode) => updateSection(s.id, { doorMode })}
                                  />
                                </div>
                                <div>
                                  <p className="mb-1.5 text-xs text-grey">Door face</p>
                                  <Seg<DoorFace>
                                    value={s.face}
                                    options={[
                                      { id: "laminate", label: "Laminate" },
                                      { id: "glass", label: "Glass" },
                                      { id: "mirror", label: "Mirror" },
                                    ]}
                                    onChange={(face) => updateSection(s.id, { face })}
                                  />
                                </div>
                                <Toggle checked={s.rod} onChange={(rod) => updateSection(s.id, { rod })} label="Hanging rod" sub="For clothes and shirts" />
                                <div className="rounded-lg border border-gold/10 bg-ink/40 p-3">
                                  <Stepper
                                    label="Drawers inside"
                                    value={s.innerDrawers ?? 0}
                                    min={0}
                                    max={4}
                                    onChange={(v) => updateSection(s.id, { innerDrawers: v })}
                                  />
                                  <p className="mt-2 text-[11px] leading-snug text-grey">
                                    Drawers sit behind the doors at the bottom of this section. Open the door, then click a drawer to pull it out.
                                  </p>
                                </div>
                                {s.face === "laminate" ? (
                                  <div className="space-y-3">
                                    <Toggle
                                      checked={(s.mirrorLeaf ?? -1) >= 0}
                                      onChange={(on) => updateSection(s.id, { mirrorLeaf: on ? 0 : -1 })}
                                      label="Viewing mirror"
                                      sub="Add a mirror on one of the doors"
                                    />
                                    {(s.mirrorLeaf ?? -1) >= 0 && (
                                      <>
                                        <div>
                                          <p className="mb-1.5 text-xs text-grey">Which door</p>
                                          <Seg<string>
                                            value={String(s.mirrorLeaf ?? 0)}
                                            options={Array.from({ length: s.doorMode === "hinged" ? leafCount(s.width) : slidingPanelCount(s.width) }).map((_, k) => ({
                                              id: String(k),
                                              label: `${s.doorMode === "hinged" ? "Door" : "Panel"} ${k + 1}`,
                                            }))}
                                            onChange={(v) => updateSection(s.id, { mirrorLeaf: parseInt(v, 10) })}
                                          />
                                        </div>
                                        <div>
                                          <p className="mb-1.5 text-xs text-grey">Mirror size</p>
                                          <Seg<"full" | "half">
                                            value={s.mirrorSize ?? "full"}
                                            options={[
                                              { id: "full", label: "Full length" },
                                              { id: "half", label: "Half" },
                                            ]}
                                            onChange={(mirrorSize) => updateSection(s.id, { mirrorSize })}
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-grey">
                                    A viewing mirror can be added to laminate doors. Choose Mirror as the door face for fully mirrored doors.
                                  </p>
                                )}
                              </>
                            )}
                            {s.kind !== "drawers" && (
                              <Stepper label="Shelves" value={s.shelves} min={0} max={8} onChange={(v) => updateSection(s.id, { shelves: v })} />
                            )}
                            {s.kind === "drawers" && (
                              <Stepper label="Drawers" value={s.drawers} min={1} max={6} onChange={(v) => updateSection(s.id, { drawers: v })} />
                            )}

                            <div className="flex gap-2 pt-1">
                              <button type="button" onClick={() => duplicateSection(s.id)} disabled={config.sections.length >= MAX_SECTIONS} className="flex-1 rounded-lg border border-gold/25 py-2 text-[11px] uppercase tracking-widest text-gold hover:bg-gold/10 disabled:opacity-30">
                                Duplicate
                              </button>
                              <button type="button" onClick={() => removeSection(s.id)} disabled={config.sections.length <= 1} className="flex-1 rounded-lg border border-red-400/30 py-2 text-[11px] uppercase tracking-widest text-red-300 hover:bg-red-400/10 disabled:opacity-30">
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["doors", "drawers", "open"] as SectionKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => addSection(k)}
                      disabled={config.sections.length >= MAX_SECTIONS}
                      className="rounded-lg border border-dashed border-gold/40 py-2.5 text-[11px] uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 disabled:opacity-30"
                    >
                      + {KIND_LABEL[k]}
                    </button>
                  ))}
                </div>
              </Group>
            </>
          )}

          {tab === "style" && (
            <>
              <Group title="Body finish" hint={FINISHES.find((f) => f.id === config.bodyFinish)?.name}>
                <Swatches list={FINISHES} value={config.bodyFinish} onChange={(bodyFinish) => update({ bodyFinish })} />
              </Group>
              <Group title="Shutter design" hint="Material, colours & pattern">
                <ShutterDesigner
                  surface={designSurface}
                  onChange={changeSurface}
                  scope={designScope}
                  onScope={setDesignScope}
                  canSection={!!targetSection}
                  sectionLabel={targetSection ? `Section ${config.sections.indexOf(targetSection) + 1}` : null}
                  hasOverride={!!targetSection?.surface}
                  onResetSection={() => targetSection && updateSection(targetSection.id, { surface: undefined })}
                />
              </Group>
              <Group title="Handles" hint={`${HANDLE_STYLES.length} styles`}>
                <div className="grid grid-cols-2 gap-2">
                  {HANDLE_STYLES.map((h) => {
                    const on = config.handle === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => update({ handle: h.id as HandleStyle })}
                        aria-pressed={on}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left transition-colors",
                          on ? "border-gold bg-gold/10" : "border-gold/10 bg-ink/40 hover:border-gold/40"
                        )}
                      >
                        <span className={cn("block text-[12px]", on ? "text-gold" : "text-cream")}>{h.name}</span>
                        <span className="block text-[10px] leading-snug text-grey">{h.hint}</span>
                      </button>
                    );
                  })}
                </div>
                {config.handle !== "none" && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-grey">Handle finish · {HANDLE_FINISHES.find((f) => f.id === config.handleFinish)?.name}</p>
                    <Swatches list={HANDLE_FINISHES} value={config.handleFinish} onChange={(handleFinish) => update({ handleFinish })} />
                  </div>
                )}
              </Group>
              <Group title="Glass doors" hint="Applies to every glass door">
                <GlassFinishPicker value={config.glassTint} onChange={(glassTint) => update({ glassTint })} />
                <div className="mt-4">
                  <p className="mb-2 text-xs text-grey">Aluminium frame · {FRAME_FINISHES.find((f) => f.id === config.frameFinish)?.name}</p>
                  <Swatches list={FRAME_FINISHES} value={config.frameFinish} onChange={(frameFinish) => update({ frameFinish })} />
                </div>
                <p className="mt-3 text-[11px] text-grey">Tip: set a section's door face to Glass or Mirror in the Layout tab.</p>
              </Group>
              <Group title="Wall colour">
                <div className="flex gap-2">
                  {WALL_COLORS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      title={w.name}
                      aria-label={w.name}
                      onClick={() => update({ wallColor: w.id })}
                      className={cn("h-9 w-9 rounded-full border-2 transition-transform hover:scale-110", config.wallColor === w.id ? "scale-110 border-gold" : "border-cream/20")}
                      style={{ background: w.id }}
                    />
                  ))}
                </div>
              </Group>
            </>
          )}

          {tab === "lighting" && (
            <>
              <Group title="Profile & LED lighting" hint="Glows in the 3D view">
                <div className="space-y-2">
                  <Toggle checked={config.lights.interior} onChange={(interior) => updateLights({ interior })} label="Interior strip lights" sub="Vertical LEDs light every compartment" />
                  <Toggle checked={config.lights.shelf} onChange={(shelf) => updateLights({ shelf })} label="Shelf lights" sub="LED under each shelf" />
                  <Toggle checked={config.lights.profile} onChange={(profile) => updateLights({ profile })} label="Profile lights" sub="Light between the shutters" />
                  <Toggle checked={config.lights.top} onChange={(top) => updateLights({ top })} label="Cove light" sub="Glow washing the ceiling" />
                  <Toggle checked={config.lights.plinth} onChange={(plinth) => updateLights({ plinth })} label="Plinth light" sub="Floating-base glow" />
                </div>
              </Group>
              <Group title="Light colour">
                <Seg
                  value={config.lights.temp}
                  options={(Object.keys(LED_TEMPS) as (keyof typeof LED_TEMPS)[]).map((k) => ({
                    id: k,
                    label: `${LED_TEMPS[k].name}`,
                  }))}
                  onChange={(temp) => updateLights({ temp })}
                />
                <p className="mt-2 text-[11px] text-grey">{LED_TEMPS[config.lights.temp].kelvin}</p>
                <div className="mt-4">
                  <Slider label="Brightness" value={config.lights.brightness} min={0.2} max={2} step={0.1} unit="x" onChange={(brightness) => updateLights({ brightness })} />
                </div>
              </Group>
              <Group title="Room lighting" hint="See your LEDs at their best at night">
                <Seg value={config.mood} options={MOODS.map((m) => ({ id: m.id, label: m.name }))} onChange={(mood) => update({ mood })} />
              </Group>
            </>
          )}

          {tab === "details" && (
            <>
              <Group title="Dimension view" hint="All sizes in mm">
                <p className="text-xs leading-relaxed text-grey">
                  The 3D view now shows every board, door and drawer as outlines with its measurements. Rotate or zoom to inspect any joint, and
                  use the list below as your cut list.
                </p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={copyCutList} className="flex-1 rounded-lg border border-gold/30 py-2 text-[11px] uppercase tracking-widest text-gold hover:bg-gold/10">
                    Copy list
                  </button>
                  <button type="button" onClick={toggleBlueprint} className="flex-1 rounded-lg border border-cream/20 py-2 text-[11px] uppercase tracking-widest text-cream hover:border-gold">
                    Back to 3D
                  </button>
                </div>
              </Group>
              {Array.from(new Set(parts.map((p) => p.group))).map((group) => (
                <Group key={group} title={group}>
                  <div className="overflow-hidden rounded-lg border border-gold/10">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-ink/60 text-grey">
                        <tr>
                          <th className="px-2 py-1.5 font-normal">Part</th>
                          <th className="px-2 py-1.5 font-normal">W × H × T (mm)</th>
                          <th className="px-2 py-1.5 text-right font-normal">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parts
                          .filter((p) => p.group === group)
                          .map((p, i) => (
                            <tr key={i} className="border-t border-gold/10">
                              <td className="px-2 py-1.5 text-cream">
                                {p.name}
                                {p.note && <span className="block text-[10px] text-grey">{p.note}</span>}
                              </td>
                              <td className="px-2 py-1.5 text-grey">
                                {p.w} × {p.h} × {p.t}
                              </td>
                              <td className="px-2 py-1.5 text-right text-gold">{p.qty}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Group>
              ))}
            </>
          )}
        </div>

        <div className="space-y-2 border-t border-gold/20 bg-ink/60 p-4">
          <Link
            to="/free-design-consultation"
            className="block rounded-full bg-gold py-3 text-center text-xs uppercase tracking-[0.25em] text-ink transition-colors hover:bg-gold-light"
          >
            Get a quote for this design
          </Link>
          <button
            type="button"
            onClick={() => applyPreset(defaultConfig)}
            className="w-full py-1.5 text-[11px] uppercase tracking-widest text-grey hover:text-cream"
          >
            Reset design
          </button>
        </div>
      </aside>
    </div>
  );
}
