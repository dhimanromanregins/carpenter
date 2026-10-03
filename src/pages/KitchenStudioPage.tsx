import { useEffect, useState } from "react";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";
import { KitchenScene } from "@/components/studio/kitchen/scene/KitchenScene";
import { useKitchenStore } from "@/components/studio/kitchen/store/kitchenStore";
import { useInteraction, useSelection } from "@/components/studio/kitchen/store/interactionStore";
import { useUi } from "@/components/studio/kitchen/store/uiStore";
import { TopBar } from "@/components/studio/kitchen/ui/TopBar";
import { LeftPanel } from "@/components/studio/kitchen/ui/LeftPanel";
import { RightPanel } from "@/components/studio/kitchen/ui/RightPanel";
import { FloorPlan } from "@/components/studio/kitchen/ui/FloorPlan";
import { QuoteModal } from "@/components/studio/kitchen/ui/QuoteModal";
import { ContextMenu, HoverTooltip, IssueChip, PresentOverlay, ServiceLegend, Toasts, WalkOverlay } from "@/components/studio/kitchen/ui/Overlays";

function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export function KitchenStudioPage() {
  useSeo({
    title: "Kitchen Designer — 3D Design Studio",
    description: "Design your dream modular kitchen in an interactive 3D studio — layouts, cabinets, hardware, finishes, appliances, walk-through and instant quotation.",
    path: "/design-studio/kitchen",
  });

  const mode = useUi((s) => s.mode);
  const showPlan = useUi((s) => s.showFloorPlan);
  const walkLocked = useUi((s) => s.walkLocked);
  const selectedId = useSelection((s) => s.selectedId);
  const surfaceSel = useSelection((s) => s.surface);
  const [sheet, setSheet] = useState<"left" | "right" | null>(null);

  // dev-only handle for automated checks
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __kitchen?: unknown }).__kitchen = { kitchen: useKitchenStore, interaction: useInteraction, selection: useSelection, ui: useUi };
  }, []);

  // fresh state each visit; never leave a walk / present mode dangling
  useEffect(() => {
    useUi.getState().setMode("design");
    return () => {
      useUi.getState().setMode("design");
      useInteraction.getState().closeAll();
      useSelection.getState().select(null);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const k = useKitchenStore.getState();
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? k.redo() : k.undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        k.redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && useUi.getState().mode === "design") {
        const id = useSelection.getState().selectedId;
        if (id) {
          e.preventDefault();
          k.removeModule(id);
          useSelection.getState().select(null);
        }
      } else if (e.key === "Escape") {
        useInteraction.getState().closeAll();
        useInteraction.getState().showContextMenu(null);
        if (useUi.getState().mode === "design") useSelection.getState().select(null);
        if (useUi.getState().mode === "present") useUi.getState().setMode("design");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const design = mode === "design";
  const walkPanel = mode === "walk" && !walkLocked && (!!selectedId || !!surfaceSel);

  return (
    <div className="fixed inset-0 flex flex-col bg-ink text-cream">
      {design && <TopBar />}

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {design && (
          <div className="hidden w-[330px] shrink-0 lg:block">
            <LeftPanel />
          </div>
        )}

        <main className={cn("relative min-h-0 flex-1", showPlan && design && "grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-1")}>
          {showPlan && design && (
            <div className="relative min-h-0 border-b border-gold/15 lg:border-b-0 lg:border-r">
              <FloorPlan />
            </div>
          )}
          <div className="relative h-full min-h-0 w-full">
            <KitchenScene />
            {design && (
              <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-2">
                <IssueChip />
              </div>
            )}
            {design && <ServiceLegend />}
            {mode === "walk" && <WalkOverlay />}
            {mode === "present" && <PresentOverlay />}
            {walkPanel && (
              <div className="absolute right-0 top-0 z-20 h-full w-[340px] max-w-[90vw] shadow-2xl">
                <RightPanel />
              </div>
            )}
          </div>
        </main>

        {design && (
          <div className="hidden w-[340px] shrink-0 lg:block">
            <RightPanel />
          </div>
        )}
      </div>

      {/* tablet / phone: panels live in a bottom sheet under the viewport */}
      {design && (
        <div className="shrink-0 border-t border-gold/20 bg-charcoal lg:hidden">
          <div className="flex gap-2 px-3 py-2">
            {(["left", "right"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setSheet(sheet === s ? null : s)} className={cn("flex-1 rounded-full border py-2 text-[11px] uppercase tracking-widest", sheet === s ? "border-gold bg-gold text-ink" : "border-gold/30 text-grey")}>
                {s === "left" ? "Design" : "Selected"}
              </button>
            ))}
          </div>
          {sheet && <div className="h-[42vh] border-t border-gold/15">{sheet === "left" ? <LeftPanel /> : <RightPanel />}</div>}
        </div>
      )}

      <HoverTooltip />
      <ContextMenu />
      <Toasts />
      <QuoteModal />
    </div>
  );
}
