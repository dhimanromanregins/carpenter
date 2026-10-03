/** DOM overlays on top of the 3D viewport: hover tooltip, context menu, walk HUD, presentation HUD, toasts, issue chip. */
import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useKitchenStore } from "../store/kitchenStore";
import { useInteraction, useSelection } from "../store/interactionStore";
import { useUi } from "../store/uiStore";
import { validateDesign } from "../engine/validation";
import { planRoutes } from "../engine/services";
import { presentationSteps } from "../scene/cameraPoses";
import { getModuleType } from "../data/modules";
import { Btn } from "./atoms";
import type { TimeOfDay } from "../model/types";

export function HoverTooltip() {
  const hover = useInteraction((s) => s.hover);
  const pointer = useInteraction((s) => s.pointer);
  const mode = useUi((s) => s.mode);
  if (!hover || mode !== "design") return null;
  return (
    <div className="pointer-events-none fixed z-50 rounded-md border border-gold/40 bg-ink/90 px-2.5 py-1 text-[11px] text-cream shadow-lg backdrop-blur" style={{ left: pointer.x + 14, top: pointer.y + 16 }}>
      {hover.label}
      <span className="ml-2 text-[9px] text-grey">click</span>
    </div>
  );
}

export function ContextMenu() {
  const menu = useInteraction((s) => s.contextMenu);
  const design = useKitchenStore((s) => s.design);
  const command = useUi((s) => s.command);
  useEffect(() => {
    if (!menu) return;
    const close = () => useInteraction.getState().showContextMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", close);
    };
  }, [menu]);
  if (!menu) return null;
  const m = design.modules.find((x) => x.id === menu.moduleId);
  if (!m) return null;
  const t = getModuleType(m.typeId);
  const items: { label: string; run: () => void; danger?: boolean }[] = [
    { label: "Open / close all parts", run: () => {
        const it = useInteraction.getState();
        const any = Object.keys(it.open).some((k) => k.startsWith(`${m.id}:`) && it.open[k]);
        it.setGroup(`${m.id}:`, !any);
      } },
    { label: "Focus camera here", run: () => command({ kind: "focus", name: "focus", moduleId: m.id }) },
    { label: "Duplicate", run: () => useKitchenStore.getState().duplicateModule(m.id) },
    { label: "Delete", danger: true, run: () => { useKitchenStore.getState().removeModule(m.id); useSelection.getState().select(null); } },
  ];
  return (
    <div className="fixed z-[55] min-w-[210px] overflow-hidden rounded-xl border border-gold/30 bg-charcoal shadow-2xl" style={{ left: menu.x, top: menu.y }} role="menu">
      <p className="border-b border-gold/15 px-3 py-2 text-[10px] uppercase tracking-widest text-gold">{t.name}</p>
      {items.map((i) => (
        <button key={i.label} type="button" role="menuitem" onClick={i.run} className={cn("block w-full px-3 py-2 text-left text-xs hover:bg-gold/10", i.danger ? "text-red-300" : "text-cream")}>
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function Toasts() {
  const notice = useKitchenStore((s) => s.notice);
  const toast = useUi((s) => s.toast);
  const clear = useKitchenStore((s) => s.clearNotice);
  const setToast = useUi((s) => s.setToast);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(clear, 3600);
    return () => window.clearTimeout(id);
  }, [notice, clear]);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast, setToast]);
  const text = notice ?? toast;
  return (
    <AnimatePresence>
      {text && (
        <motion.div key={text} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className={cn("pointer-events-none fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full px-5 py-2.5 text-xs shadow-xl", notice ? "bg-red-500/90 text-white" : "bg-gold text-ink")}>
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function IssueChip() {
  const design = useKitchenStore((s) => s.design);
  const issues = useMemo(() => validateDesign(design), [design]);
  const errors = issues.filter((i) => i.severity === "error").length;
  const warns = issues.filter((i) => i.severity === "warning").length;
  const select = useSelection.getState().select;
  const first = issues.find((i) => i.severity === "error") ?? issues.find((i) => i.severity === "warning");
  return (
    <button
      type="button"
      onClick={() => first?.moduleIds[0] && select(first.moduleIds[0])}
      title={first?.message ?? "No problems found"}
      className={cn("pointer-events-auto flex items-center gap-2 rounded-full border bg-ink/80 px-3.5 py-1.5 text-[11px] backdrop-blur", errors ? "border-red-400/60 text-red-200" : warns ? "border-amber-400/60 text-amber-200" : "border-emerald-400/50 text-emerald-200")}
    >
      <span className={cn("h-2 w-2 rounded-full", errors ? "bg-red-400" : warns ? "bg-amber-400" : "bg-emerald-400")} />
      {errors ? `${errors} problem${errors > 1 ? "s" : ""}` : warns ? `${warns} warning${warns > 1 ? "s" : ""}` : "All checks passed"}
    </button>
  );
}

export function WalkOverlay() {
  const locked = useUi((s) => s.walkLocked);
  const setMode = useUi((s) => s.setMode);
  const eye = useUi((s) => s.eyeHeight);
  const setEye = useUi((s) => s.setEyeHeight);
  const hover = useInteraction((s) => s.hover);
  const scene = useKitchenStore((s) => s.design.lighting.scene);
  const updateLighting = useKitchenStore((s) => s.updateLighting);
  const lock = () => (window as unknown as { __kitchenLock?: () => void }).__kitchenLock?.();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyM" && useUi.getState().walkLocked) {
        // release the mouse and select what you're looking at, to change its finish
        const h = useInteraction.getState().hover;
        if (h) useSelection.getState().select(h.moduleId);
        document.exitPointerLock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {locked && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={cn("h-2 w-2 rounded-full border border-white/80 transition-all", hover ? "scale-150 bg-gold" : "bg-white/20")} />
            {hover && <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-md border border-gold/40 bg-ink/80 px-3 py-1 text-xs text-cream backdrop-blur">{hover.label}</div>}
          </div>
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-4 py-2 text-[11px] text-grey backdrop-blur">WASD move · Shift run · click or E interact · O open/close everything · M change finish · Esc release</div>
          <div className="pointer-events-auto absolute right-4 top-4 flex gap-1 rounded-full border border-gold/25 bg-ink/70 p-1 backdrop-blur">
            {(["day", "evening", "night"] as TimeOfDay[]).map((s) => (
              <button key={s} type="button" onClick={() => updateLighting({ scene: s })} className={cn("rounded-full px-3 py-1 text-[10px] uppercase tracking-wider", scene === s ? "bg-gold text-ink" : "text-grey hover:text-cream")}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}
      {!locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/55 backdrop-blur-[2px]">
          <div className="max-w-sm rounded-2xl border border-gold/30 bg-charcoal/95 p-6 text-center">
            <p className="font-display text-2xl text-cream">Walk inside your kitchen</p>
            <p className="mt-2 text-sm text-grey">Move with WASD, look with the mouse, and click any door, drawer or appliance to use it.</p>
            <label className="mt-5 block text-left text-xs text-grey">
              <span className="flex justify-between">Eye height <span className="text-cream">{eye} mm</span></span>
              <input type="range" min={1400} max={1900} step={10} value={eye} onChange={(e) => setEye(parseInt(e.target.value, 10))} className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-cream/15 accent-[#c6a86a]" />
            </label>
            <div className="mt-5 flex gap-2">
              <Btn variant="solid" onClick={lock} className="flex-1">Click to walk</Btn>
              <Btn onClick={() => setMode("design")} className="flex-1">Back to editor</Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ServiceLegend() {
  const view = useUi((s) => s.serviceView);
  const setView = useUi((s) => s.setServiceView);
  const design = useKitchenStore((s) => s.design);
  const plan = useMemo(() => (view === "none" ? null : planRoutes(design)), [view, design]);
  if (view === "none" || !plan) return null;
  const entries = plan.legend.filter((l) => (view === "electrical" ? l.system === "electrical" : l.system !== "electrical"));
  return (
    <div className="pointer-events-auto absolute right-3 top-3 w-[270px] rounded-xl border border-gold/30 bg-ink/85 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{view === "electrical" ? "Wiring plan" : "Plumbing & gas plan"}</p>
          <p className="mt-1 text-[11px] text-grey">Flow runs from the source to each point.</p>
        </div>
        <button type="button" onClick={() => setView(view)} className="rounded-full border border-gold/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold hover:bg-gold/10">
          Exit
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {entries.length === 0 && <li className="text-[11px] text-grey">Nothing to show yet — add a sink, hob or appliance.</li>}
        {entries.map((l) => (
          <li key={l.label} className="flex gap-2.5">
            <span className="mt-1 h-2.5 w-6 shrink-0 rounded-full" style={{ background: l.color }} />
            <span>
              <span className="block text-[12px] text-cream">{l.label}</span>
              <span className="block text-[10px] leading-snug text-grey">{l.spec}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-gold/15 pt-2 text-[10px] leading-snug text-grey">Indicative layout only. Final routing, wire sizes, pipe sizes and gas work must be confirmed and carried out by licensed professionals.</p>
    </div>
  );
}

export function PresentOverlay() {
  const design = useKitchenStore((s) => s.design);
  const step = useUi((s) => s.presentStep);
  const setMode = useUi((s) => s.setMode);
  const steps = useMemo(() => presentationSteps(design), [design]);
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-display text-3xl text-cream drop-shadow-lg sm:text-5xl">
            {steps[step]?.label}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span key={i} className={cn("h-1 rounded-full transition-all", i === step ? "w-8 bg-gold" : "w-3 bg-cream/30")} />
          ))}
        </div>
      </div>
      <button type="button" onClick={() => setMode("design")} className="absolute right-4 top-4 rounded-full border border-gold/40 bg-ink/60 px-4 py-2 text-[10px] uppercase tracking-widest text-cream backdrop-blur hover:border-gold">
        Exit presentation
      </button>
    </>
  );
}
