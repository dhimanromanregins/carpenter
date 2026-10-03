import { useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { coerceDesign, useKitchenStore } from "../store/kitchenStore";
import { useUi, type CameraPreset, type ViewPreset } from "../store/uiStore";
import { useInteraction } from "../store/interactionStore";
import { capturePng, downloadDataUrl } from "../scene/capture";

function TB({ children, onClick, active, title, disabled, className }: { children: React.ReactNode; onClick?: () => void; active?: boolean; title?: string; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors disabled:opacity-30", active ? "border-gold bg-gold text-ink" : "border-gold/25 text-grey hover:border-gold/60 hover:text-cream", className)}
    >
      {children}
    </button>
  );
}

const VIEWS: { id: ViewPreset; label: string }[] = [
  { id: "perspective", label: "3D" },
  { id: "front", label: "Front" },
  { id: "top", label: "Top" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
];

const PRESETS: { id: CameraPreset; label: string }[] = [
  { id: "eye", label: "Eye level" },
  { id: "wide", label: "Wide room" },
  { id: "cabinet", label: "Cabinet" },
  { id: "countertop", label: "Countertop" },
  { id: "interior", label: "Inside cabinet" },
  { id: "island", label: "Island" },
];

export function TopBar() {
  const ui = useUi();
  const name = useKitchenStore((s) => s.design.name);
  const canUndo = useKitchenStore((s) => s.past.length > 0);
  const canRedo = useKitchenStore((s) => s.future.length > 0);
  const fileRef = useRef<HTMLInputElement>(null);
  const anyOpen = useInteraction((s) => Object.values(s.open).some(Boolean));
  const store = useKitchenStore.getState();

  const save = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(useKitchenStore.getState().design, null, 2)], { type: "application/json" }));
    downloadDataUrl(url, `${name.replace(/\s+/g, "-").toLowerCase() || "kitchen"}.json`);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    ui.setToast("Design saved to your downloads");
  };
  const load = async (file: File) => {
    try {
      const d = coerceDesign(JSON.parse(await file.text()));
      if (!d) throw new Error("not a kitchen design");
      store.replaceDesign(d);
      ui.setToast("Design loaded");
    } catch {
      ui.setToast("That file isn't a valid kitchen design.");
    }
  };

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-gold/15 bg-charcoal px-3 py-2.5">
      <Link to="/design-studio" className="shrink-0 rounded-full border border-gold/30 px-3 py-1.5 text-[10px] uppercase tracking-widest text-cream hover:border-gold hover:text-gold">
        ← Studio
      </Link>
      <input
        aria-label="Design name"
        value={name}
        onChange={(e) => store.commit((d) => ({ ...d, name: e.target.value }), "name")}
        className="w-36 rounded-md bg-transparent px-2 py-1 font-display text-base text-cream outline-none focus:bg-ink/60"
      />

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {VIEWS.map((v) => (
          <TB key={v.id} active={ui.mode === "design" && ui.view === v.id} onClick={() => ui.setView(v.id)} disabled={ui.mode !== "design"}>
            {v.label}
          </TB>
        ))}
        <TB active={ui.ortho} onClick={() => ui.setOrtho(!ui.ortho)} disabled={ui.mode !== "design"} title="Orthographic camera">
          Ortho
        </TB>
        <select
          aria-label="Camera presets"
          value=""
          disabled={ui.mode !== "design"}
          onChange={(e) => e.target.value && ui.command({ kind: "preset", name: e.target.value })}
          className="shrink-0 rounded-full border border-gold/25 bg-transparent px-3 py-1.5 text-[10px] uppercase tracking-wider text-grey outline-none disabled:opacity-30"
        >
          <option value="" className="bg-charcoal">
            Camera…
          </option>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id} className="bg-charcoal">
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ml-auto flex items-center gap-1.5 overflow-x-auto">
        <TB onClick={store.undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          Undo
        </TB>
        <TB onClick={store.redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          Redo
        </TB>
        <TB active={ui.showMeasurements} onClick={() => ui.toggle("showMeasurements")}>
          Measure
        </TB>
        <TB active={ui.showClearances} onClick={() => ui.toggle("showClearances")}>
          Clearances
        </TB>
        <TB active={ui.showPoints} onClick={() => ui.toggle("showPoints")}>
          Markers
        </TB>
        <TB active={ui.serviceView === "electrical"} onClick={() => ui.setServiceView("electrical")} title="Show the wiring plan">
          Wiring
        </TB>
        <TB active={ui.serviceView === "plumbing"} onClick={() => ui.setServiceView("plumbing")} title="Show the plumbing and gas plan">
          Plumbing
        </TB>
        <TB active={ui.showFloorPlan} onClick={() => ui.toggle("showFloorPlan")}>
          Floor plan
        </TB>
        <TB
          active={anyOpen}
          onClick={() => (anyOpen ? useInteraction.getState().closeAll() : useInteraction.getState().openAll())}
          title="Open every door, drawer and appliance (O)"
          className={anyOpen ? "" : "!border-gold !text-gold"}
        >
          {anyOpen ? "Close kitchen" : "Open kitchen"}
        </TB>
        <TB
          onClick={() => {
            const png = capturePng(1.5);
            if (png) downloadDataUrl(png, "kitchen.png");
          }}
        >
          Photo
        </TB>
        <TB onClick={save}>Save</TB>
        <TB onClick={() => fileRef.current?.click()}>Load</TB>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
        <TB onClick={() => { if (window.confirm("Reset to a fresh kitchen? You can undo this.")) store.reset(); }}>Reset</TB>
        <TB active={ui.mode === "walk"} onClick={() => ui.setMode(ui.mode === "walk" ? "design" : "walk")} className="!border-gold !text-gold">
          Walk inside
        </TB>
        <TB active={ui.mode === "present"} onClick={() => ui.setMode(ui.mode === "present" ? "design" : "present")}>
          Present
        </TB>
        <TB onClick={() => ui.toggle("quoteOpen")} className="!bg-gold !text-ink hover:!bg-gold-light">
          Quote
        </TB>
      </div>
    </header>
  );
}
