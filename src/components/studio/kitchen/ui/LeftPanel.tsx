import { GlassFinishPicker } from "@/components/ui/GlassFinishPicker";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useKitchenStore } from "../store/kitchenStore";
import { useSelection } from "../store/interactionStore";
import { useUi, type LeftTab } from "../store/uiStore";
import { LAYOUTS } from "../engine/layouts";
import { PRESETS } from "../data/presets";
import { MODULE_TYPES } from "../data/modules";
import { APPLIANCES, FAUCETS, HARDWARE, SINKS, getProduct, hardwareBySubcategory } from "../data/products";
import { HANDLE_FINISHES, HANDLE_STYLES, SHUTTER_STYLES } from "../data/handles";
import { applianceRole, hardwareTarget, suggestedModule } from "../data/hardwareRules";
import { getModuleType } from "../data/modules";
import { inr } from "../model/units";
import { wireSpec } from "../engine/services";
import type { ColourTemp, CounterEdge, ElectricalPoint, HandleFinishId, HandleStyle, ModuleInstance, Room, ServicePointKind, ShutterStyle, TimeOfDay, WallSide, Zone } from "../model/types";
import { Btn, Chip, NumField, RangeField, Section, SelectBox, Seg, Swatch, Toggle } from "./atoms";
import { MaterialPicker } from "./MaterialPicker";

const TABS: { id: LeftTab; label: string }[] = [
  { id: "layout", label: "Layout" },
  { id: "room", label: "Room" },
  { id: "modules", label: "Cabinets" },
  { id: "hardware", label: "Hardware" },
  { id: "style", label: "Style" },
  { id: "counter", label: "Counter" },
  { id: "appliances", label: "Appliances" },
  { id: "lighting", label: "Lighting" },
  { id: "services", label: "Services" },
];

const WALLS: { id: WallSide; label: string }[] = [
  { id: "back", label: "Back" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "front", label: "Front" },
];

/* ───────────────────────── layout ───────────────────────── */

function LayoutTab() {
  const design = useKitchenStore((s) => s.design);
  const { setLayout, regenerate, applyPreset, commit } = useKitchenStore.getState();
  return (
    <>
      <Section title="Kitchen layout" hint={`${design.modules.length} modules`}>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map((l) => {
            const tooSmall = design.room.width < l.minWidth || design.room.depth < l.minDepth;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLayout(l.id)}
                aria-pressed={design.layout === l.id}
                className={cn("rounded-lg border p-2.5 text-left transition-colors", design.layout === l.id ? "border-gold bg-gold/10" : "border-gold/10 bg-ink/40 hover:border-gold/40")}
              >
                <span className={cn("block text-[12px]", design.layout === l.id ? "text-gold" : "text-cream")}>{l.name}</span>
                <span className="block text-[10px] leading-snug text-grey">{l.blurb}</span>
                {tooSmall && <span className="mt-1 block text-[10px] text-amber-300">Needs {l.minWidth}×{l.minDepth} mm</span>}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <Btn onClick={regenerate} className="flex-1">
            Regenerate
          </Btn>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-grey">Changing the layout or room size rebuilds the cabinets to fit the walls. Use Undo to go back.</p>
      </Section>

      <Section title="Style presets">
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => applyPreset(p.id)} className="rounded-lg border border-gold/10 bg-ink/40 p-2.5 text-left transition-colors hover:border-gold">
              <span className="mb-1.5 flex gap-1">
                {p.swatches.map((c) => (
                  <span key={c} className="h-3.5 w-3.5 rounded-full border border-cream/20" style={{ background: c }} />
                ))}
              </span>
              <span className="block text-[12px] text-cream">{p.name}</span>
              <span className="block text-[10px] leading-snug text-grey">{p.blurb}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Height">
        <Toggle checked={design.style.toCeiling} onChange={(v) => useKitchenStore.getState().setToCeiling(v)} label="Cabinets to the ceiling" sub="Loft cabinets fill the gap above wall and tall units" />
      </Section>

      <Section title="Realism">
        <Toggle checked={design.showContents} onChange={(v) => commit((d) => ({ ...d, showContents: v }))} label="Show contents" sub="Cutlery, pots, jars & bottles inside opened units" />
      </Section>
    </>
  );
}

/* ───────────────────────── room ───────────────────────── */

function OpeningFields({ title, spec, onChange, showSill }: { title: string; spec: { enabled: boolean; wall: WallSide; offset: number; width: number; height: number; sill?: number }; onChange: (patch: Record<string, unknown>) => void; showSill?: boolean }) {
  return (
    <Section title={title} hint={spec.enabled ? spec.wall : "off"}>
      <div className="space-y-3">
        <Toggle checked={spec.enabled} onChange={(enabled) => onChange({ enabled })} label={`${title} enabled`} />
        {spec.enabled && (
          <>
            <Seg<WallSide> value={spec.wall} options={WALLS} onChange={(wall) => onChange({ wall })} small />
            <div className="grid grid-cols-2 gap-2">
              <NumField label="Position" value={spec.offset} min={200} max={9000} step={50} onCommit={(offset) => onChange({ offset })} />
              <NumField label="Width" value={spec.width} min={500} max={3000} step={50} onCommit={(width) => onChange({ width })} />
              <NumField label="Height" value={spec.height} min={600} max={2600} step={50} onCommit={(height) => onChange({ height })} />
              {showSill && <NumField label="Sill height" value={spec.sill ?? 0} min={0} max={2000} step={50} onCommit={(sill) => onChange({ sill })} />}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

function RoomTab() {
  const room = useKitchenStore((s) => s.design.room);
  const update = useKitchenStore.getState().updateRoom;
  const setPoints = (points: Room["points"]) => update({ points });
  return (
    <>
      <Section title="Room dimensions" hint="millimetres">
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Width" value={room.width} min={2200} max={10000} step={50} onCommit={(width) => update({ width })} />
          <NumField label="Depth" value={room.depth} min={2200} max={9000} step={50} onCommit={(depth) => update({ depth })} />
          <NumField label="Height" value={room.height} min={2400} max={4000} step={50} onCommit={(height) => update({ height })} />
          <NumField label="Wall thickness" value={room.wallThickness} min={100} max={300} step={10} onCommit={(wallThickness) => update({ wallThickness })} />
        </div>
      </Section>
      <OpeningFields title="Window" spec={room.window} showSill onChange={(p) => update({ window: { ...room.window, ...p } })} />
      <OpeningFields title="Door" spec={room.door} onChange={(p) => update({ door: { ...room.door, ...p } })} />
      <Section title="Services" hint="plumbing · gas · electrical">
        <div className="space-y-2">
          {room.points.map((p) => (
            <div key={p.id} className="rounded-lg border border-gold/10 bg-ink/40 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs capitalize text-cream">{p.kind}</span>
                <button type="button" aria-label={`Remove ${p.kind} point`} onClick={() => setPoints(room.points.filter((x) => x.id !== p.id))} className="text-[11px] text-grey hover:text-red-300">
                  Remove
                </button>
              </div>
              <Seg<WallSide> value={p.wall} options={WALLS} small onChange={(wall) => setPoints(room.points.map((x) => (x.id === p.id ? { ...x, wall } : x)))} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <NumField label="Position" value={p.offset} min={0} max={9000} step={50} onCommit={(offset) => setPoints(room.points.map((x) => (x.id === p.id ? { ...x, offset } : x)))} />
                <NumField label="Height" value={p.height} min={0} max={3000} step={50} onCommit={(height) => setPoints(room.points.map((x) => (x.id === p.id ? { ...x, height } : x)))} />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            {(["plumbing", "drain", "gas"] as ServicePointKind[]).map((k) => (
              <Btn key={k} onClick={() => setPoints([...room.points, { id: `pt-${Date.now().toString(36)}`, kind: k, wall: "back", offset: room.width / 2, height: k === "plumbing" ? 500 : 1100 }])} className="flex-1 !px-2 !text-[10px]">
                + {k}
              </Btn>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

/* ───────────────────────── modules ───────────────────────── */

const GLASS_TYPES: { id: string; label: string; zone: Zone }[] = [
  { id: "wall-glass", label: "Wall · hinged", zone: "wall" },
  { id: "wall-glass-sliding", label: "Wall · sliding", zone: "wall" },
  { id: "wall-glass-lift", label: "Wall · lift-up", zone: "wall" },
  { id: "wall-glass-frameless", label: "Wall · frameless", zone: "wall" },
  { id: "base-glass", label: "Base display", zone: "base" },
  { id: "tall-glass", label: "Tall display", zone: "tall" },
];

/** Pick a glass type, frame and light once, then add it — or swap the selected cabinet for it. */
function GlassBuilder() {
  const [tint, setTint] = useState("gl-bronze");
  const [frame, setFrame] = useState<ShutterStyle>("glass-alu");
  const [light, setLight] = useState(true);
  const selectedId = useSelection((s) => s.selectedId);
  const design = useKitchenStore((s) => s.design);
  const selected = design.modules.find((m) => m.id === selectedId) ?? null;
  const selZone = selected ? getModuleType(selected.typeId).zone : null;

  const apply = (typeId: string, zone: Zone) => {
    const K = useKitchenStore.getState();
    let id: string | null;
    if (selected && selZone === zone && getModuleType(selected.typeId).kind !== "filler") {
      K.replaceModuleType(selected.id, typeId);
      id = selected.id;
    } else {
      id = K.addModule(typeId);
    }
    if (!id) return;
    K.patchModule(id, (m) => ({ ...m, overrides: { ...m.overrides, glassMaterial: tint, shutterStyle: frame }, params: { ...m.params, led: light } }));
    useSelection.getState().select(id);
  };

  return (
    <Section title="Glass cabinets" hint="pick a look, then add">
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-[11px] text-grey">Glass</p>
          <GlassFinishPicker value={tint.replace("gl-", "")} onChange={(id) => setTint(`gl-${id}`)} />
</div>
        <div>
          <p className="mb-1.5 text-[11px] text-grey">Frame</p>
          <Seg<ShutterStyle> value={frame} small options={[{ id: "glass-alu", label: "Alu" }, { id: "glass-black", label: "Black" }, { id: "glass-wood", label: "Wood" }, { id: "glass-frameless", label: "None" }]} onChange={setFrame} />
        </div>
        <Toggle checked={light} onChange={setLight} label="Light inside" sub="LED strips inside the cabinet" />
        <div className="grid grid-cols-2 gap-2">
          {GLASS_TYPES.map((g) => (
            <Btn key={g.id} onClick={() => apply(g.id, g.zone)} className="!px-2 !text-[10px]">
              {selected && selZone === g.zone ? "Swap → " : "+ "}
              {g.label}
            </Btn>
          ))}
        </div>
        <p className="text-[10px] leading-snug text-grey">
          {selected ? "With a cabinet selected, a matching glass type replaces it; otherwise a new one is added where there is room." : "Select a cabinet first to swap it for glass, or just add one where there is room."} You can change the glass, frame and light on any cabinet later in the right panel.
        </p>
      </div>
    </Section>
  );
}

function ModulesTab() {
  const [zone, setZone] = useState<Zone>("base");
  const { addModule } = useKitchenStore.getState();
  const select = useSelection.getState().select;
  const list = MODULE_TYPES.filter((m) => m.zone === zone || (zone === "base" && m.kind === "filler"));
  const groups = useMemo(() => {
    const map = new Map<string, typeof list>();
    list.forEach((m) => map.set(m.subcategory, [...(map.get(m.subcategory) ?? []), m]));
    return [...map.entries()];
  }, [list]);
  return (
    <>
      <GlassBuilder />
      <Section title="Cabinet library" hint="drag onto the plan, or Add">
        <Seg<Zone> value={zone} onChange={setZone} options={[{ id: "base", label: "Base" }, { id: "wall", label: "Wall" }, { id: "tall", label: "Tall" }]} />
      </Section>
      {groups.map(([sub, items]) => (
        <Section key={sub} title={sub}>
          <div className="space-y-1.5">
            {items.map((t) => (
              <div
                key={t.id}
                draggable
                data-module-type={t.id}
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-kitchen-module", t.id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="flex cursor-grab items-center justify-between gap-2 rounded-lg border border-gold/10 bg-ink/40 px-3 py-2 hover:border-gold/40 active:cursor-grabbing"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-cream">{t.name}</p>
                  <p className="text-[10px] text-grey">
                    {t.width.min === t.width.max ? `${t.width.default}` : `${t.width.min}–${t.width.max}`} mm wide · {t.height.default} high
                  </p>
                </div>
                <Btn
                  onClick={() => {
                    const id = addModule(t.id);
                    if (id) select(id);
                  }}
                  className="shrink-0 !px-2.5 !py-1.5"
                >
                  Add
                </Btn>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

/* ───────────────────────── hardware ───────────────────────── */

function HardwareTab() {
  const selectedId = useSelection((s) => s.selectedId);
  const design = useKitchenStore((s) => s.design);
  const selected = design.modules.find((m) => m.id === selectedId);
  const [inspect, setInspect] = useState<string>("corner-magic");
  const groups = useMemo(() => [...hardwareBySubcategory().entries()], []);
  const product = getProduct(inspect);
  const target = hardwareTarget(inspect);
  const suggested = suggestedModule(inspect);
  const kind = selected ? getModuleType(selected.typeId).kind : null;
  const fits = !!(target && kind && target.kinds.includes(kind));
  const { patchModule, addModule } = useKitchenStore.getState();

  const install = () => {
    if (!selected || !target) return;
    patchModule(selected.id, (m) => ({ ...m, params: { ...m.params, [target.param]: inspect } }));
  };

  return (
    <>
      <Section title="Hardware inspection" hint="click any item">
        {product && (
          <div className="rounded-xl border border-gold/20 bg-ink/50 p-4">
            <p className="font-display text-lg text-cream">{product.name}</p>
            <p className="text-[11px] uppercase tracking-widest text-gold">{product.subcategory}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
              {product.dims && (
                <>
                  <dt className="text-grey">Size</dt>
                  <dd className="text-cream">{product.dims.join(" × ")} mm</dd>
                </>
              )}
              {product.loadKg && (
                <>
                  <dt className="text-grey">Load capacity</dt>
                  <dd className="text-cream">{product.loadKg} kg</dd>
                </>
              )}
              <dt className="text-grey">Manufacturer</dt>
              <dd className="text-cream">{product.manufacturer}</dd>
              <dt className="text-grey">SKU</dt>
              <dd className="text-cream">{product.sku}</dd>
              <dt className="text-grey">Estimated price</dt>
              <dd className="text-gold">{inr(product.price)}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {target && <Btn variant="solid" disabled={!fits} title={fits ? "" : "Select a compatible module first"} onClick={install}>{fits ? "Install in selected" : "Select compatible unit"}</Btn>}
              {suggested && (
                <Btn
                  onClick={() => {
                    const id = addModule(suggested);
                    if (id) useSelection.getState().select(id);
                  }}
                >
                  Add module
                </Btn>
              )}
            </div>
            {target && !fits && <p className="mt-2 text-[10px] text-grey">Fits: {target.kinds.map((k) => k.replace("-", " ")).join(", ")}.</p>}
          </div>
        )}
      </Section>
      {groups.map(([sub, items]) => (
        <Section key={sub} title={sub}>
          <div className="space-y-1">
            {items.map((h) => (
              <button key={h.id} type="button" onClick={() => setInspect(h.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors", inspect === h.id ? "border-gold bg-gold/10" : "border-gold/10 bg-ink/40 hover:border-gold/40")}>
                <span className="truncate text-[12px] text-cream">{h.name}</span>
                <span className="shrink-0 text-[11px] text-gold">{inr(h.price)}</span>
              </button>
            ))}
          </div>
        </Section>
      ))}
      <p className="pb-4 pt-3 text-[10px] text-grey">{HARDWARE.length} hardware products. Add your own in data/products.ts — they appear here automatically.</p>
    </>
  );
}

/* ───────────────────────── style ───────────────────────── */

function StyleTab() {
  const style = useKitchenStore((s) => s.design.style);
  const update = useKitchenStore.getState().updateStyle;
  return (
    <>
      <Section title="Shutter style" hint={SHUTTER_STYLES.find((s) => s.id === style.shutterStyle)?.name}>
        <div className="grid grid-cols-2 gap-2">
          {SHUTTER_STYLES.map((s) => (
            <button key={s.id} type="button" onClick={() => update({ shutterStyle: s.id as ShutterStyle })} aria-pressed={style.shutterStyle === s.id} className={cn("rounded-lg border p-2.5 text-left transition-colors", style.shutterStyle === s.id ? "border-gold bg-gold/10" : "border-gold/10 bg-ink/40 hover:border-gold/40")}>
              <span className={cn("block text-[12px]", style.shutterStyle === s.id ? "text-gold" : "text-cream")}>{s.name}</span>
              <span className="block text-[10px] leading-snug text-grey">{s.hint}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Shutter finish">
        <MaterialPicker value={style.shutterMaterial} onChange={(shutterMaterial) => update({ shutterMaterial })} categories={["laminate", "acrylic", "pu", "veneer"]} allowCustom />
      </Section>
      <Section title="Cabinet body">
        <MaterialPicker value={style.bodyMaterial} onChange={(bodyMaterial) => update({ bodyMaterial })} categories={["laminate", "acrylic", "pu", "veneer"]} />
      </Section>
      <Section title="Handles" hint={style.handleStyle === "none" ? "none / handleless" : ""}>
        <div className="grid grid-cols-3 gap-1.5">
          {HANDLE_STYLES.map((h) => (
            <Chip key={h.id} active={style.handleStyle === h.id} onClick={() => update({ handleStyle: h.id as HandleStyle })}>
              {h.name.replace(" handle", "")}
            </Chip>
          ))}
        </div>
        {style.handleStyle !== "none" && (
          <div className="mt-3 flex gap-2">
            {HANDLE_FINISHES.map((f) => (
              <Swatch key={f.id} title={f.name} color={f.color} active={style.handleFinish === f.id} onClick={() => update({ handleFinish: f.id as HandleFinishId })} size="h-8 w-8" />
            ))}
          </div>
        )}
        <p className="mt-2 text-[10px] text-grey">Handleless shutter styles (J, G, C, push-to-open) carry their own opening profile.</p>
      </Section>
      <Section title="Glass cabinets" hint="default glass tint">
        <GlassFinishPicker value={style.glassMaterial.replace("gl-", "")} onChange={(id) => update({ glassMaterial: `gl-${id}` })} />
        <p className="mt-2 text-[10px] text-grey">Choose a glass shutter style above, or add a glass cabinet from the Cabinets tab. Each cabinet can override the tint and frame.</p>
      </Section>
      <Section title="Heights">
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Plinth" value={style.plinthHeight} min={60} max={200} step={10} onCommit={(plinthHeight) => update({ plinthHeight })} />
          <NumField label="Wall cabinet bottom" value={style.wallCabinetBottom} min={1300} max={1700} step={10} onCommit={(wallCabinetBottom) => update({ wallCabinetBottom })} />
        </div>
      </Section>
    </>
  );
}

/* ───────────────────────── counter ───────────────────────── */

function CounterTab() {
  const style = useKitchenStore((s) => s.design.style);
  const update = useKitchenStore.getState().updateStyle;
  return (
    <>
      <Section title="Countertop material">
        <MaterialPicker value={style.counterMaterial} onChange={(counterMaterial) => update({ counterMaterial })} categories={["countertop"]} />
      </Section>
      <Section title="Thickness & edge">
        <div className="space-y-3">
          <Seg<number> value={style.counterThickness} options={[{ id: 20, label: "20 mm" }, { id: 30, label: "30 mm" }, { id: 40, label: "40 mm" }]} onChange={(counterThickness) => update({ counterThickness })} />
          <Seg<CounterEdge> value={style.counterEdge} small options={[{ id: "straight", label: "Straight" }, { id: "bullnose", label: "Bullnose" }, { id: "chamfer", label: "Chamfer" }, { id: "waterfall", label: "Waterfall" }]} onChange={(counterEdge) => update({ counterEdge })} />
          <NumField label="Front overhang" value={style.counterOverhang} min={0} max={100} step={5} onCommit={(counterOverhang) => update({ counterOverhang })} />
        </div>
      </Section>
      <Section title="Backsplash">
        <div className="space-y-3">
          <Toggle checked={style.backsplash.enabled} onChange={(enabled) => update({ backsplash: { ...style.backsplash, enabled } })} label="Backsplash" />
          {style.backsplash.enabled && (
            <>
              <MaterialPicker value={style.backsplash.material} onChange={(material) => update({ backsplash: { ...style.backsplash, material } })} categories={["backsplash"]} />
              <NumField label="Height" value={style.backsplash.height} min={100} max={1000} step={50} onCommit={(height) => update({ backsplash: { ...style.backsplash, height } })} />
            </>
          )}
        </div>
      </Section>
      <Section title="Sink & fixtures">
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-[11px] text-grey">Sink</p>
            <SelectBox value={style.sinkType} onChange={(sinkType) => update({ sinkType })} options={SINKS.map((s) => ({ id: s.id, label: `${s.name} · ${inr(s.price)}` }))} />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-grey">Faucet</p>
            <SelectBox value={style.faucetType} onChange={(faucetType) => update({ faucetType })} options={FAUCETS.map((s) => ({ id: s.id, label: `${s.name} · ${inr(s.price)}` }))} />
          </div>
        </div>
      </Section>
      <Section title="Floor & walls">
        <div className="space-y-3">
          <MaterialPicker value={style.floorMaterial} onChange={(floorMaterial) => update({ floorMaterial })} categories={["floor"]} />
          <div className="flex gap-2">
            {["#f1efe9", "#e6e2d8", "#d9d4cb", "#c9d0c4", "#2c2f35"].map((c) => (
              <Swatch key={c} title={c} color={c} active={style.wallColor === c} onClick={() => update({ wallColor: c })} size="h-8 w-8" />
            ))}
            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gold/40 text-gold" title="Custom wall colour">
              +
              <input type="color" value={style.wallColor} onChange={(e) => update({ wallColor: e.target.value })} className="sr-only" />
            </label>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ───────────────────────── appliances ───────────────────────── */

function AppliancesTab() {
  const style = useKitchenStore((s) => s.design.style);
  const design = useKitchenStore((s) => s.design);
  const selectedId = useSelection((s) => s.selectedId);
  const selected = design.modules.find((m) => m.id === selectedId);
  const { updateStyle, addModule, patchModule } = useKitchenStore.getState();

  const addAndSelect = (typeId: string, patch?: (m: ModuleInstance) => ModuleInstance) => {
    const id = addModule(typeId);
    if (!id) return;
    if (patch) patchModule(id, patch);
    useSelection.getState().select(id);
  };

  const apply = (id: string) => {
    const role = applianceRole(id).kind;
    const k = selected ? getModuleType(selected.typeId).kind : null;
    switch (role) {
      case "fridge":
        if (selected && k === "tall-fridge") patchModule(selected.id, (m) => ({ ...m, params: { ...m.params, appliance: id } }));
        else addAndSelect("tall-fridge", (m) => ({ ...m, params: { ...m.params, appliance: id } }));
        break;
      case "oven":
        addAndSelect("tall-oven");
        break;
      case "microwave":
        addAndSelect("tall-microwave");
        break;
      case "dishwasher":
        addAndSelect("base-dishwasher");
        break;
      case "washer":
        addAndSelect("base-washer");
        break;
      case "hob":
        updateStyle({ hobType: id });
        break;
      case "chimney":
        updateStyle({ chimneyType: id });
        break;
      default:
        if (selected && getModuleType(selected.typeId).zone === "base") {
          patchModule(selected.id, (m) => {
            const cur = m.params.topItems ?? [];
            return { ...m, params: { ...m.params, topItems: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
          });
        }
    }
  };

  const status = (id: string) => {
    const role = applianceRole(id).kind;
    if (role === "hob") return style.hobType === id ? "In use" : "Use";
    if (role === "chimney") return style.chimneyType === id ? "In use" : "Use";
    if (role === "top") return selected?.params.topItems?.includes(id) ? "Remove" : "Place on counter";
    return "Add";
  };

  const groups = useMemo(() => {
    const map = new Map<string, typeof APPLIANCES>();
    APPLIANCES.forEach((a) => map.set(a.subcategory ?? "Other", [...(map.get(a.subcategory ?? "Other") ?? []), a]));
    return [...map.entries()];
  }, []);

  return (
    <>
      {groups.map(([sub, items]) => (
        <Section key={sub} title={sub}>
          <div className="space-y-1.5">
            {items.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-gold/10 bg-ink/40 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-cream">{a.name}</p>
                  <p className="text-[10px] text-grey">
                    {a.dims?.join(" × ")} mm · <span className="text-gold">{inr(a.price)}</span>
                  </p>
                </div>
                <Btn onClick={() => apply(a.id)} className="shrink-0 !px-2.5 !py-1.5" variant={status(a.id) === "In use" ? "solid" : "outline"}>
                  {status(a.id)}
                </Btn>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

/* ───────────────────────── lighting ───────────────────────── */

function LightingTab() {
  const l = useKitchenStore((s) => s.design.lighting);
  const update = useKitchenStore.getState().updateLighting;
  return (
    <>
      <Section title="Time of day">
        <Seg<TimeOfDay> value={l.scene} onChange={(scene) => update({ scene })} options={[{ id: "day", label: "Day" }, { id: "evening", label: "Evening" }, { id: "night", label: "Night" }, { id: "presentation", label: "Studio" }]} small />
      </Section>
      <Section title="Lights">
        <div className="space-y-2">
          <Toggle checked={l.ceiling} onChange={(ceiling) => update({ ceiling })} label="Ceiling lights" />
          <Toggle checked={l.spots} onChange={(spots) => update({ spots })} label="Spotlights" sub="Focused light over the counters" />
          <Toggle checked={l.underCabinet} onChange={(underCabinet) => update({ underCabinet })} label="Under-cabinet LED" />
          <Toggle checked={l.insideCabinet} onChange={(insideCabinet) => update({ insideCabinet })} label="Inside-cabinet LED" sub="Glass & open wall units" />
          <Toggle checked={l.toeKick} onChange={(toeKick) => update({ toeKick })} label="Toe-kick LED" />
          <Toggle checked={l.profile} onChange={(profile) => update({ profile })} label="Profile lights" sub="Vertical LED profiles between cabinet fronts" />
          <Toggle checked={l.cove} onChange={(cove) => update({ cove })} label="Cove light" sub="Glow on top of cabinets, washing the ceiling" />
          <Toggle checked={l.shelfLeds} onChange={(shelfLeds) => update({ shelfLeds })} label="Shelf LEDs" sub="Under every shelf in glass & open units" />
          <Toggle checked={l.pendants} onChange={(pendants) => update({ pendants })} label="Pendant lights" sub="Over the island" />
        </div>
      </Section>
      <Section title="Colour temperature">
        <Seg<ColourTemp> value={l.temperature} onChange={(temperature) => update({ temperature })} options={[{ id: 2700, label: "2700K" }, { id: 3000, label: "3000K" }, { id: 4000, label: "4000K" }, { id: 5000, label: "5000K" }]} small />
        <div className="mt-4">
          <RangeField label="Brightness" value={l.brightness} min={0.2} max={2} step={0.1} onChange={(brightness) => update({ brightness })} format={(v) => `${v.toFixed(1)}×`} />
        </div>
      </Section>
    </>
  );
}

/* ───────────────────────── services ───────────────────────── */

function ServicesTab() {
  const design = useKitchenStore((s) => s.design);
  const view = useUi((s) => s.serviceView);
  const selId = useUi((s) => s.selectedElectrical);
  const setSel = useUi((s) => s.setSelectedElectrical);
  const setView = useUi((s) => s.setServiceView);
  const { replanElectrical, updateElectrical, addElectrical, removeElectrical } = useKitchenStore.getState();
  const sel = design.electrical.find((p) => p.id === selId) ?? null;
  const KIND_NAME: Record<string, string> = { db: "Distribution board", switchboard: "Switch board", socket: "Socket", appliance: "Appliance point", popup: "Pop-up socket" };
  const wallLen = (w: string) => (w === "back" || w === "front" ? design.room.width : design.room.depth);

  return (
    <>
      <Section title="See how it is done" hint="faded cabinets, routes & flow">
        <div className="grid grid-cols-2 gap-2">
          <Btn variant={view === "electrical" ? "solid" : "outline"} onClick={() => setView("electrical")}>
            Wiring plan
          </Btn>
          <Btn variant={view === "plumbing" ? "solid" : "outline"} onClick={() => setView("plumbing")}>
            Plumbing &amp; gas
          </Btn>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-grey">
          Cabinets fade so you can see where conduit and pipes run and in which direction the current or water flows. Routes follow the walls, the way they really run. They are indicative — your electrician and plumber confirm the final routing.
        </p>
      </Section>

      <Section title="Switches & sockets" hint={`${design.electrical.length} points`}>
        <Btn variant="solid" onClick={replanElectrical} className="w-full">
          Auto-place from my kitchen
        </Btn>
        <p className="mt-2 text-[11px] leading-snug text-grey">Puts the distribution board and switch board beside the door, counter sockets about every 900 mm, and a dedicated point behind every appliance.</p>

        <div className="mt-3 space-y-1.5">
          {design.electrical.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSel(p.id === selId ? null : p.id)}
              className={cn("flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors", p.id === selId ? "border-gold bg-gold/10" : "border-gold/10 bg-ink/40 hover:border-gold/40")}
            >
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-cream">{p.label}</span>
                <span className="block text-[10px] text-grey">
                  {p.wall === "free" ? "island" : `${p.wall} wall`} · {Math.round(p.offset || p.x || 0)} mm · {p.height} high
                </span>
              </span>
              <span className="shrink-0 text-[10px] text-gold">{p.amps ? `${p.amps}A` : p.kind === "switchboard" ? `${p.switches} sw` : ""}</span>
            </button>
          ))}
        </div>

        {sel && (
          <div className="mt-3 space-y-3 rounded-xl border border-gold/20 bg-ink/50 p-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{KIND_NAME[sel.kind]}</p>
            {sel.wall !== "free" && (
              <Seg<ElectricalPoint["wall"]>
                value={sel.wall}
                small
                options={[{ id: "back", label: "Back" }, { id: "left", label: "Left" }, { id: "right", label: "Right" }, { id: "front", label: "Front" }]}
                onChange={(wall) => updateElectrical(sel.id, { wall })}
              />
            )}
            <div className="grid grid-cols-2 gap-2">
              {sel.wall !== "free" && <NumField label="Along wall" value={sel.offset} min={100} max={wallLen(sel.wall) - 100} step={50} onCommit={(offset) => updateElectrical(sel.id, { offset })} />}
              <NumField label="Height" value={sel.height} min={100} max={design.room.height - 200} step={50} onCommit={(height) => updateElectrical(sel.id, { height })} />
              {(sel.kind === "socket" || sel.kind === "appliance" || sel.kind === "popup") && <NumField label="Amps" value={sel.amps ?? 16} min={5} max={32} step={1} unit="A" onCommit={(amps) => updateElectrical(sel.id, { amps })} />}
              {sel.kind === "switchboard" && <NumField label="Switches" value={sel.switches ?? 4} min={2} max={12} step={1} unit="" onCommit={(switches) => updateElectrical(sel.id, { switches })} />}
            </div>
            {sel.amps && <p className="text-[10px] text-grey">{wireSpec(sel.amps)} — indicative.</p>}
            <Btn variant="danger" onClick={() => { removeElectrical(sel.id); setSel(null); }} className="w-full">
              Remove
            </Btn>
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Btn onClick={() => addElectrical({ kind: "socket", wall: "back", offset: design.room.width / 2, height: 1150, label: "Counter socket", circuit: "power", amps: 16 })} className="!px-1 !text-[10px]">
            + Socket
          </Btn>
          <Btn onClick={() => addElectrical({ kind: "appliance", wall: "back", offset: design.room.width / 2, height: 300, label: "Appliance point", circuit: "heavy", amps: 16 })} className="!px-1 !text-[10px]">
            + Appliance
          </Btn>
          <Btn onClick={() => addElectrical({ kind: "switchboard", wall: "back", offset: design.room.width / 2, height: 1200, label: "Switch board", circuit: "lighting", switches: 4 })} className="!px-1 !text-[10px]">
            + Switches
          </Btn>
        </div>
      </Section>

      <Section title="Plumbing & gas points" hint="edit in the Room tab">
        <p className="text-[11px] leading-snug text-grey">The water inlet, drain and gas points are set in the <b>Room</b> tab. The plumbing view routes cold, hot and waste lines from them to the sink, dishwasher and washing machine, and gas to the hob.</p>
      </Section>
    </>
  );
}

/* ───────────────────────── panel ───────────────────────── */

export function LeftPanel() {
  const tab = useUi((s) => s.leftTab);
  const setTab = useUi((s) => s.setLeftTab);
  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-gold/15 bg-charcoal">
      <div className="flex gap-1 overflow-x-auto border-b border-gold/15 px-3 py-3" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors", tab === t.id ? "bg-gold text-ink" : "text-grey hover:text-cream")}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6" data-lenis-prevent>
        {tab === "layout" && <LayoutTab />}
        {tab === "room" && <RoomTab />}
        {tab === "modules" && <ModulesTab />}
        {tab === "hardware" && <HardwareTab />}
        {tab === "style" && <StyleTab />}
        {tab === "counter" && <CounterTab />}
        {tab === "appliances" && <AppliancesTab />}
        {tab === "lighting" && <LightingTab />}
        {tab === "services" && <ServicesTab />}
      </div>
    </aside>
  );
}
