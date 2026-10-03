import { GlassFinishPicker } from "@/components/ui/GlassFinishPicker";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useKitchenStore } from "../store/kitchenStore";
import { useInteraction, useSelection } from "../store/interactionStore";
import { useUi } from "../store/uiStore";
import { getModuleType, MODULE_TYPES } from "../data/modules";
import { HANDLE_FINISHES, HANDLE_STYLES, SHUTTER_STYLES } from "../data/handles";
import { getProduct } from "../data/products";
import { validateDesign, canPlace } from "../engine/validation";
import { costOfModule, priceDesign } from "../engine/pricing";
import { inr } from "../model/units";
import type { HandleFinishId, HandleStyle, ModuleInstance, ShutterStyle } from "../model/types";
import { Btn, NumField, Section, SelectBox, Stepper, Swatch, Seg, Toggle } from "./atoms";
import { MaterialPicker } from "./MaterialPicker";

function IssuesList() {
  const design = useKitchenStore((s) => s.design);
  const issues = useMemo(() => validateDesign(design), [design]);
  const select = useSelection.getState().select;
  const order = { error: 0, warning: 1, info: 2 } as const;
  const sorted = [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
  if (!sorted.length) return <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-3 py-2.5 text-xs text-emerald-200">No problems found — this design passes all checks.</p>;
  return (
    <ul className="space-y-1.5">
      {sorted.slice(0, 14).map((i) => (
        <li key={i.id}>
          <button
            type="button"
            onClick={() => i.moduleIds[0] && select(i.moduleIds[0])}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left text-[11px] leading-snug",
              i.severity === "error" ? "border-red-400/40 bg-red-400/5 text-red-200" : i.severity === "warning" ? "border-amber-400/40 bg-amber-400/5 text-amber-200" : "border-gold/15 bg-ink/40 text-grey"
            )}
          >
            {i.message}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Summary() {
  const design = useKitchenStore((s) => s.design);
  const q = useMemo(() => priceDesign(design), [design]);
  const toggle = useUi((s) => s.toggle);
  return (
    <>
      <Section title="Your kitchen" hint={design.layout}>
        <div className="rounded-xl border border-gold/20 bg-ink/50 p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-grey">Estimated total (incl. GST)</p>
          <p className="mt-1 font-display text-3xl text-gradient-gold">{inr(q.breakdown.total)}</p>
          <p className="mt-1 text-[11px] text-grey">
            {design.modules.length} modules · {q.areaSqft} sq ft of fronts
          </p>
          <Btn variant="solid" onClick={() => toggle("quoteOpen")} className="mt-3 w-full">
            View quotation & BOQ
          </Btn>
        </div>
      </Section>
      <Section title="Select something">
        <p className="text-xs leading-relaxed text-grey">
          Click a door, drawer or appliance to open it and edit that unit. Click the countertop, backsplash, floor or walls to change them. Right-click for more options. Use <b>Open kitchen</b> in the top bar to open everything at once.
        </p>
      </Section>
      <Section title="Design checks">
        <IssuesList />
      </Section>
    </>
  );
}

function SurfaceView() {
  const surface = useSelection((s) => s.surface);
  const style = useKitchenStore((s) => s.design.style);
  const update = useKitchenStore.getState().updateStyle;
  const back = () => useSelection.getState().selectSurface(null);
  const titles = { counter: "Countertop", backsplash: "Backsplash", floor: "Floor", wall: "Wall colour" } as const;
  if (!surface) return null;
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-gold/15 bg-charcoal">
      <div className="border-b border-gold/15 px-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Surface</p>
        <p className="mt-1 font-display text-xl text-cream">{titles[surface]}</p>
        <button type="button" onClick={back} className="mt-2 text-[11px] text-gold underline">
          ← Back to kitchen
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6" data-lenis-prevent>
        {surface === "counter" && (
          <>
            <Section title="Material">
              <MaterialPicker value={style.counterMaterial} onChange={(counterMaterial) => update({ counterMaterial })} categories={["countertop"]} />
            </Section>
            <Section title="Thickness & edge">
              <div className="space-y-3">
                <Seg<number> value={style.counterThickness} options={[{ id: 20, label: "20 mm" }, { id: 30, label: "30 mm" }, { id: 40, label: "40 mm" }]} onChange={(counterThickness) => update({ counterThickness })} />
                <Seg value={style.counterEdge} small options={[{ id: "straight", label: "Straight" }, { id: "bullnose", label: "Bullnose" }, { id: "chamfer", label: "Chamfer" }, { id: "waterfall", label: "Waterfall" }]} onChange={(counterEdge) => update({ counterEdge })} />
              </div>
            </Section>
          </>
        )}
        {surface === "backsplash" && (
          <Section title="Backsplash">
            <div className="space-y-3">
              <MaterialPicker value={style.backsplash.material} onChange={(material) => update({ backsplash: { ...style.backsplash, material, enabled: true } })} categories={["backsplash"]} />
              <NumField label="Height" value={style.backsplash.height} min={100} max={1000} step={50} onCommit={(height) => update({ backsplash: { ...style.backsplash, height } })} />
            </div>
          </Section>
        )}
        {surface === "floor" && (
          <Section title="Floor material">
            <MaterialPicker value={style.floorMaterial} onChange={(floorMaterial) => update({ floorMaterial })} categories={["floor"]} />
          </Section>
        )}
        {surface === "wall" && (
          <Section title="Wall colour">
            <div className="flex flex-wrap gap-2">
              {["#f1efe9", "#e6e2d8", "#d9d4cb", "#c9d0c4", "#bfc9d6", "#d8c3b0", "#2c2f35"].map((c) => (
                <Swatch key={c} title={c} color={c} active={style.wallColor === c} onClick={() => update({ wallColor: c })} size="h-9 w-9" />
              ))}
              <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gold/40 text-gold" title="Custom colour">
                +
                <input type="color" value={style.wallColor} onChange={(e) => update({ wallColor: e.target.value })} className="sr-only" />
              </label>
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
}

export function RightPanel() {
  const surface = useSelection((s) => s.surface);
  const selectedId = useSelection((s) => s.selectedId);
  const design = useKitchenStore((s) => s.design);
  const m = design.modules.find((x) => x.id === selectedId) ?? null;
  const store = useKitchenStore.getState();
  const command = useUi((s) => s.command);
  const setGroup = useInteraction.getState().setGroup;

  const cost = useMemo(() => (m ? costOfModule(design, m) : null), [m, design]);

  if (surface && !m) return <SurfaceView />;
  if (!m) {
    return (
      <aside className="flex h-full min-h-0 flex-col border-l border-gold/15 bg-charcoal">
        <div className="border-b border-gold/15 px-4 py-4">
          <p className="font-display text-xl text-cream">Properties</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6" data-lenis-prevent>
          <Summary />
        </div>
      </aside>
    );
  }

  const t = getModuleType(m.typeId);
  const sameZone = MODULE_TYPES.filter((x) => x.zone === t.zone && x.kind !== "filler");
  const setParams = (p: Partial<ModuleInstance["params"]>) => store.patchModule(m.id, (v) => ({ ...v, params: { ...v.params, ...p } }));
  const setOverride = (p: Partial<ModuleInstance["overrides"]>) => store.patchModule(m.id, (v) => ({ ...v, overrides: { ...v.overrides, ...p } }));
  const clearOverride = (k: keyof ModuleInstance["overrides"]) => store.patchModule(m.id, (v) => ({ ...v, overrides: { ...v.overrides, [k]: undefined } }));
  const nudge = (dx: number, dz: number) => store.moveModule(m.id, m.x + dx, m.z + dz);
  const rotate = () => {
    const rot = (((m.rot + 90) % 360) as ModuleInstance["rot"]);
    const next = { ...m, rot };
    const check = canPlace(next, design.modules, design.room);
    if (!check.ok) {
      useKitchenStore.setState({ notice: check.reason ?? "That rotation doesn't fit." });
      return;
    }
    store.updateModule(m.id, { rot });
  };
  const kind = t.kind;
  const isGlassKind = ["wall-glass", "base-glass", "tall-glass"].includes(kind);
  const isGlassStyle = (m.overrides.shutterStyle ?? design.style.shutterStyle).startsWith("glass");
  const isGlass = isGlassKind || isGlassStyle;
  const hasInterior = ["base-doors", "wall-doors", "wall-glass", "wall-open", "wall-lift", "wall-loft", "wall-corner", "tall-storage", "tall-utility", "tall-pantry", "base-glass", "tall-glass", "base-open"].includes(kind);
  const hasDoors = ["base-doors", "wall-doors", "wall-glass", "wall-open", "tall-storage", "tall-utility", "tall-pantry"].includes(kind);
  const info = [t.includes, m.params.hardware ? [m.params.hardware] : [], m.params.organiser ? [m.params.organiser] : [], m.params.appliance ? [m.params.appliance] : []].flat().filter((id): id is string => !!id);

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-gold/15 bg-charcoal">
      <div className="border-b border-gold/15 px-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{t.zone} · {t.subcategory}</p>
        <p className="mt-1 font-display text-xl leading-tight text-cream">{t.name}</p>
        <p className="mt-0.5 text-[10px] text-grey">{t.manufacturer} · {t.sku}</p>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <Btn onClick={() => command({ kind: "focus", name: "focus", moduleId: m.id })} className="!px-1 !text-[10px]">Focus</Btn>
          <Btn onClick={() => store.duplicateModule(m.id)} className="!px-1 !text-[10px]">Copy</Btn>
          <Btn onClick={rotate} className="!px-1 !text-[10px]">Rotate</Btn>
          <Btn variant="danger" onClick={() => { store.removeModule(m.id); useSelection.getState().select(null); }} className="!px-1 !text-[10px]">Delete</Btn>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6" data-lenis-prevent>
        <Section title="Dimensions" hint="millimetres">
          <div className="grid grid-cols-3 gap-2">
            <NumField label="Width" value={m.width} min={t.width.min} max={t.width.max} step={10} onCommit={(width) => store.resizeModule(m.id, { width })} disabled={t.width.min === t.width.max} />
            <NumField label="Height" value={m.height} min={t.height.min} max={t.height.max} step={10} onCommit={(height) => store.resizeModule(m.id, { height })} />
            <NumField label="Depth" value={m.depth} min={t.depth.min} max={t.depth.max} step={10} onCommit={(depth) => store.resizeModule(m.id, { depth })} />
          </div>
          {t.standardWidths.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {t.standardWidths.map((w) => (
                <button key={w} type="button" onClick={() => store.resizeModule(m.id, { width: w })} className={cn("rounded-full border px-2.5 py-1 text-[10px]", Math.round(m.width) === w ? "border-gold bg-gold/15 text-gold" : "border-gold/20 text-grey hover:border-gold/50")}>
                  {w}
                </button>
              ))}
            </div>
          )}
          {t.zone === "wall" && <div className="mt-3"><NumField label="Mounting height (underside)" value={m.elevation} min={900} max={2200} step={10} onCommit={(elevation) => store.updateModule(m.id, { elevation }, "elev")} /></div>}
        </Section>

        <Section title="Position" hint="centre, from back-left corner">
          <div className="grid grid-cols-2 gap-2">
            <NumField label="X" value={m.x} min={0} max={design.room.width} step={5} onCommit={(x) => store.moveModule(m.id, x, m.z)} />
            <NumField label="Z" value={m.z} min={0} max={design.room.depth} step={5} onCommit={(z) => store.moveModule(m.id, m.x, z)} />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[["←", -50, 0], ["→", 50, 0], ["↑", 0, -50], ["↓", 0, 50]].map(([l, dx, dz]) => (
              <Btn key={String(l)} onClick={() => nudge(dx as number, dz as number)} className="!py-1.5">{l}</Btn>
            ))}
          </div>
        </Section>

        <Section title="Interaction">
          <div className="flex gap-2">
            <Btn onClick={() => setGroup(`${m.id}:`, true)} className="flex-1">Open this unit</Btn>
            <Btn onClick={() => { useInteraction.getState().closeAll(); }} className="flex-1">Close all</Btn>
          </div>
          <p className="mt-2 text-[10px] text-grey">Or just click a door, drawer or appliance in the 3D view.</p>
        </Section>

        <Section title="Configuration">
          <div className="space-y-3">
            {(kind === "base-drawers") && <Stepper label="Drawers" value={m.params.drawers ?? 3} min={1} max={6} onChange={(drawers) => setParams({ drawers })} />}
            {hasDoors && kind !== "tall-pantry" && <Stepper label="Shelves" value={m.params.shelves ?? 2} min={0} max={7} onChange={(shelves) => setParams({ shelves })} />}
            {kind === "tall-pantry" && <Stepper label="Pantry shelves" value={m.params.shelves ?? 5} min={2} max={8} onChange={(shelves) => setParams({ shelves })} />}
            {(kind === "base-bottle") && <Stepper label="Bottle trays" value={m.params.count ?? 3} min={2} max={5} onChange={(count) => setParams({ count })} />}
            {(kind === "base-dustbin") && <Stepper label="Bins" value={m.params.count ?? 1} min={1} max={3} onChange={(count) => setParams({ count })} />}
            {kind === "base-doors" && m.width < 600 && <Seg<"left" | "right"> value={m.params.hinge ?? "left"} onChange={(hinge) => setParams({ hinge })} options={[{ id: "left", label: "Hinge left" }, { id: "right", label: "Hinge right" }]} small />}
            <div>
              <p className="mb-1 text-[11px] text-grey">Replace with another {t.zone} unit</p>
              <SelectBox value={m.typeId} onChange={(id) => store.replaceModuleType(m.id, id)} options={sameZone.map((x) => ({ id: x.id, label: x.name }))} />
            </div>
          </div>
        </Section>

        {t.kind !== "filler" && !["wall-chimney", "base-sink", "base-hob"].includes(t.kind) && (
          <Section title="Finish" hint={m.overrides.shutterMaterial ? "custom for this unit" : "follows kitchen"}>
            <MaterialPicker value={m.overrides.shutterMaterial ?? design.style.shutterMaterial} onChange={(shutterMaterial) => setOverride({ shutterMaterial })} categories={["laminate", "acrylic", "pu", "veneer"]} allowCustom onClearOverride={m.overrides.shutterMaterial ? () => clearOverride("shutterMaterial") : undefined} />
          </Section>
        )}
        {t.kind !== "filler" && (
          <Section title="Shutter & handle" hint={m.overrides.shutterStyle || m.overrides.handleStyle ? "custom for this unit" : "follows kitchen"}>
            <div className="space-y-3">
              <SelectBox value={m.overrides.shutterStyle ?? design.style.shutterStyle} onChange={(v) => setOverride({ shutterStyle: v as ShutterStyle })} options={SHUTTER_STYLES.map((s) => ({ id: s.id, label: s.name }))} />
              <SelectBox value={m.overrides.handleStyle ?? design.style.handleStyle} onChange={(v) => setOverride({ handleStyle: v as HandleStyle })} options={HANDLE_STYLES.map((s) => ({ id: s.id, label: s.name }))} />
              <div className="flex gap-2">
                {HANDLE_FINISHES.map((f) => (
                  <Swatch key={f.id} title={f.name} color={f.color} active={(m.overrides.handleFinish ?? design.style.handleFinish) === f.id} onClick={() => setOverride({ handleFinish: f.id as HandleFinishId })} size="h-7 w-7" />
                ))}
              </div>
              {(m.overrides.shutterStyle || m.overrides.handleStyle || m.overrides.handleFinish) && (
                <button type="button" className="text-[11px] text-gold underline" onClick={() => store.patchModule(m.id, (v) => ({ ...v, overrides: { shutterMaterial: v.overrides.shutterMaterial, bodyMaterial: v.overrides.bodyMaterial } }))}>
                  Use kitchen defaults
                </button>
              )}
            </div>
          </Section>
        )}

        {hasInterior && (
          <Section title="Glass & light" hint={isGlass ? "glass cabinet" : "optional"}>
            <div className="space-y-3">
              {!isGlassKind && (
                <Toggle
                  checked={isGlassStyle}
                  onChange={(on) => (on ? setOverride({ shutterStyle: "glass-alu" as ShutterStyle }) : clearOverride("shutterStyle"))}
                  label="Glass doors"
                  sub="Turn these doors into glass"
                />
              )}
              {isGlass && (
                <>
                  <div>
                    <p className="mb-1.5 text-[11px] text-grey">Glass type</p>
                    <GlassFinishPicker value={(m.overrides.glassMaterial ?? design.style.glassMaterial).replace("gl-", "")} onChange={(id) => setOverride({ glassMaterial: `gl-${id}` })} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-[11px] text-grey">Frame</p>
                    <Seg<string>
                      value={isGlassStyle ? (m.overrides.shutterStyle ?? design.style.shutterStyle) : "glass-alu"}
                      small
                      options={[{ id: "glass-alu", label: "Alu" }, { id: "glass-black", label: "Black" }, { id: "glass-wood", label: "Wood" }, { id: "glass-frameless", label: "None" }]}
                      onChange={(v) => setOverride({ shutterStyle: v as ShutterStyle })}
                    />
                  </div>
                  {isGlassKind && (
                    <>
                      <div>
                        <p className="mb-1.5 text-[11px] text-grey">Doors</p>
                        <Seg<string>
                          value={m.params.glassMode ?? "hinged"}
                          small
                          options={[{ id: "hinged", label: "Hinged" }, { id: "sliding", label: "Sliding" }, ...(kind === "wall-glass" ? [{ id: "lift", label: "Lift-up" }] : [])]}
                          onChange={(v) => setParams({ glassMode: v as "hinged" | "sliding" | "lift" })}
                        />
                      </div>
                      <Stepper label="Shelves" value={m.params.shelves ?? 2} min={0} max={7} onChange={(shelves) => setParams({ shelves })} />
                      <Toggle checked={m.params.glassShelves ?? false} onChange={(glassShelves) => setParams({ glassShelves })} label="Glass shelves" />
                      <Toggle checked={m.params.mirrorBack ?? false} onChange={(mirrorBack) => setParams({ mirrorBack })} label="Mirrored back" />
                    </>
                  )}
                </>
              )}
              <Toggle
                checked={m.params.led ?? (isGlassKind ? design.lighting.insideCabinet : false)}
                onChange={(led) => setParams({ led })}
                label="Light inside"
                sub="LED strips inside this cabinet"
              />
            </div>
          </Section>
        )}

        <Section title="Includes" hint={cost ? `${inr(cost.total)}` : ""}>
          <ul className="space-y-1">
            {info.length === 0 && <li className="text-[11px] text-grey">Standard carcass and shutters.</li>}
            {info.map((id, i) => {
              const p = getProduct(id);
              return p ? (
                <li key={`${id}${i}`} className="flex justify-between gap-2 text-[11px]">
                  <span className="text-cream">{p.name}</span>
                  <span className="text-gold">{inr(p.price)}</span>
                </li>
              ) : null;
            })}
          </ul>
          {cost && (
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-gold/10 pt-3 text-[11px]">
              <dt className="text-grey">Carcass & shutters</dt>
              <dd className="text-right text-cream">{inr(cost.material)}</dd>
              <dt className="text-grey">Hardware</dt>
              <dd className="text-right text-cream">{inr(cost.hardware)}</dd>
              <dt className="text-grey">Handles & accessories</dt>
              <dd className="text-right text-cream">{inr(cost.accessories)}</dd>
              <dt className="text-grey">Appliances</dt>
              <dd className="text-right text-cream">{inr(cost.appliances)}</dd>
            </dl>
          )}
        </Section>

        <Section title="Design checks">
          <IssuesList />
        </Section>
      </div>
    </aside>
  );
}
