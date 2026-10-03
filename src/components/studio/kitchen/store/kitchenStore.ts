/**
 * Kitchen design store: the single source of truth (`design`) plus undo/redo.
 *
 * The design is immutable JSON. Every edit goes through `commit`, which pushes
 * the previous design onto the history stack (coalescing rapid slider drags),
 * so undo/redo is just swapping snapshots — no scene rebuild logic anywhere.
 */
import { create } from "zustand";
import type { ElectricalPoint, KitchenDesignConfig, KitchenStyle, LayoutId, LightingConfig, ModuleInstance, Room } from "../model/types";
import { buildLofts, generateLayout, makeModule } from "../engine/layouts";
import { planElectrical } from "../engine/services";
import { canPlace } from "../engine/validation";
import { footprint } from "../engine/geometry";
import { defaultParams, getModuleType } from "../data/modules";
import { PRESETS } from "../data/presets";
import { clamp, snap, uid } from "../model/units";

// bumped so everyone starts from the new, calmer default kitchen
const STORAGE_KEY = "kraftspace-kitchen-design-v2";
const HISTORY_LIMIT = 80;

/* ───────────────────────── defaults ───────────────────────── */

export function defaultRoom(): Room {
  return {
    width: 4200,
    depth: 3600,
    height: 3000,
    wallThickness: 150,
    window: { enabled: true, wall: "right", offset: 1800, width: 1200, height: 1200, sill: 1000 },
    door: { enabled: true, wall: "front", offset: 3500, width: 900, height: 2100 },
    points: [
      { id: "pt-plumb", kind: "plumbing", wall: "back", offset: 1500, height: 500 },
      { id: "pt-gas", kind: "gas", wall: "back", offset: 2500, height: 1000 },
      { id: "pt-elec", kind: "electrical", wall: "back", offset: 3000, height: 1100 },
    ],
  };
}

export function defaultStyle(): KitchenStyle {
  return {
    // handleless G-profile fronts: no handle clutter, so the cabinetry reads as calm planes
    shutterStyle: "handleless-g",
    shutterMaterial: "matte-white",
    bodyMaterial: "matte-white",
    handleStyle: "none",
    handleFinish: "brushed-steel",
    counterMaterial: "ct-quartz-white",
    counterThickness: 30,
    counterEdge: "straight",
    counterOverhang: 20,
    backsplash: { enabled: true, material: "bs-marble", height: 600 },
    plinthHeight: 100,
    wallCabinetBottom: 1450,
    floorMaterial: "fl-oak",
    wallColor: "#ece6da",
    toCeiling: true,
    glassMaterial: "gl-smoked",
    sinkType: "sink-double-ss",
    faucetType: "faucet-pullout-chrome",
    hobType: "hob-gas-4",
    chimneyType: "chimney-wall",
  };
}

export function defaultLighting(): LightingConfig {
  return {
    scene: "day",
    ceiling: true,
    underCabinet: true,
    insideCabinet: true,
    toeKick: true,
    profile: false,
    cove: true,
    shelfLeds: true,
    pendants: true,
    spots: true,
    temperature: 3000,
    brightness: 1,
  };
}

/** Build a complete design for a layout (the "automatically generate the initial kitchen" step). */
/** The starting look: warm oak base cabinets under white wall, loft and tall units. */
export function twoTone(mods: ModuleInstance[]): ModuleInstance[] {
  return mods.map((m) => (getModuleType(m.typeId).zone === "base" && getModuleType(m.typeId).kind !== "filler" ? { ...m, overrides: { ...m.overrides, shutterMaterial: "oak-lam" } } : m));
}

/**
 * Starting glass: two wall cabinets become lit glass units (one frosted, one bronze), so the
 * kitchen opens with glass cabinets already in it. Picks mid-sized wall units that are not
 * lifts, spaced apart.
 */
export function addStarterGlass(mods: ModuleInstance[]): ModuleInstance[] {
  const candidates = mods
    .filter((m) => m.elevation >= 1000 && !m.run.endsWith("-loft") && ["wall-single", "wall-double"].includes(m.typeId) && m.width >= 450 && m.width <= 900)
    .sort((a, b) => a.x - b.x || a.z - b.z);
  if (!candidates.length) return mods;
  const chosen = new Map<string, string>();
  chosen.set(candidates[0].id, "gl-frosted");
  if (candidates.length >= 2) chosen.set(candidates[candidates.length - 1].id, "gl-bronze");
  return mods.map((m) =>
    chosen.has(m.id)
      ? { ...m, typeId: "wall-glass", params: defaultParams("wall-glass"), overrides: { ...m.overrides, glassMaterial: chosen.get(m.id), shutterStyle: "glass-alu" as const } }
      : m
  );
}

export function createDesign(layout: LayoutId = "l-shape", room: Room = defaultRoom(), style: KitchenStyle = defaultStyle(), lighting: LightingConfig = defaultLighting()): KitchenDesignConfig {
  const modules = addStarterGlass(twoTone(finishLayout(generateLayout(layout, room, style), room, style)));
  const design: KitchenDesignConfig = { version: 1, name: "My kitchen", room, layout, style, lighting, showContents: true, modules, electrical: [] };
  return { ...design, electrical: planElectrical(design) };
}

/** Rebuilds modules for a layout and re-plans the switches & sockets to match. */
function rebuilt(d: KitchenDesignConfig, layout: LayoutId, room: Room): KitchenDesignConfig {
  let modules = finishLayout(generateLayout(layout, room, d.style), room, d.style);
  // keep the current look when the layout or room changes: two-tone and starter glass carry over
  if (d.modules.some((m) => m.overrides.shutterMaterial === "oak-lam")) modules = twoTone(modules);
  if (d.modules.some((m) => m.typeId === "wall-glass")) modules = addStarterGlass(modules);
  const next = { ...d, layout, room, modules };
  return { ...next, electrical: planElectrical(next) };
}

/** Post-process generated modules: keep cabinets off the door opening and wall cabinets off the window. */
function finishLayout(input: ModuleInstance[], room: Room, style: KitchenStyle): ModuleInstance[] {
  return filterOpenings(style.toCeiling ? [...input, ...buildLofts(input, room, style)] : input, room);
}

/** Drops cabinets that would block the door, and wall cabinets that would cover the window. */
function filterOpenings(input: ModuleInstance[], room: Room): ModuleInstance[] {
  const T = 30;
  const alongWall = (wall: string, f: ReturnType<typeof footprint>): [number, number] | null => {
    switch (wall) {
      case "back":
        return f.z0 < T ? [f.x0, f.x1] : null;
      case "front":
        return f.z1 > room.depth - T ? [f.x0, f.x1] : null;
      case "left":
        return f.x0 < T ? [f.z0, f.z1] : null;
      default:
        return f.x1 > room.width - T ? [f.z0, f.z1] : null;
    }
  };
  let mods = input;
  if (room.door.enabled) {
    const d = room.door;
    mods = mods.filter((m) => {
      const a = alongWall(d.wall, footprint(m));
      if (!a) return true;
      return !(Math.min(a[1], d.offset + d.width / 2 + 100) - Math.max(a[0], d.offset - d.width / 2 - 100) > 50 && m.elevation < d.height);
    });
  }
  if (!room.window.enabled) return mods;
  const w = room.window;
  const along = (f: ReturnType<typeof footprint>): [number, number] | null => {
    switch (w.wall) {
      case "back":
        return f.z0 < T ? [f.x0, f.x1] : null;
      case "front":
        return f.z1 > room.depth - T ? [f.x0, f.x1] : null;
      case "left":
        return f.x0 < T ? [f.z0, f.z1] : null;
      default:
        return f.x1 > room.width - T ? [f.z0, f.z1] : null;
    }
  };
  return mods.filter((m) => {
    if (m.elevation < 100) return true;
    const a = along(footprint(m));
    if (!a) return true;
    const overlap = Math.min(a[1], w.offset + w.width / 2) - Math.max(a[0], w.offset - w.width / 2);
    return !(overlap > 50 && m.elevation < w.sill + w.height && m.elevation + m.height > w.sill);
  });
}

/* ───────────────────────── persistence ───────────────────────── */

function loadSaved(): KitchenDesignConfig | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return coerceDesign(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Validates & fills a loaded design so a stale/corrupt file never crashes the scene. */
export function coerceDesign(raw: unknown): KitchenDesignConfig | null {
  const d = raw as Partial<KitchenDesignConfig> | null;
  if (!d || d.version !== 1 || !Array.isArray(d.modules) || !d.room || !d.style) return null;
  const base = createDesign(d.layout ?? "l-shape");
  return {
    ...base,
    ...d,
    room: { ...base.room, ...d.room, window: { ...base.room.window, ...d.room.window }, door: { ...base.room.door, ...d.room.door } },
    style: { ...base.style, ...d.style, backsplash: { ...base.style.backsplash, ...d.style.backsplash } },
    lighting: { ...base.lighting, ...(d.lighting ?? {}) },
    electrical: Array.isArray((d as { electrical?: unknown }).electrical) ? (d as { electrical: ElectricalPoint[] }).electrical : base.electrical,
    modules: d.modules.filter((m) => m && typeof m.typeId === "string" && getModuleType(m.typeId)).map((m) => ({ ...m, params: m.params ?? {}, overrides: m.overrides ?? {} })),
  } as KitchenDesignConfig;
}

/* ───────────────────────── store ───────────────────────── */

interface KitchenState {
  design: KitchenDesignConfig;
  past: KitchenDesignConfig[];
  future: KitchenDesignConfig[];
  /** Last placement error, shown as a toast by the UI. */
  notice: string | null;

  commit: (updater: (d: KitchenDesignConfig) => KitchenDesignConfig, coalesceKey?: string) => void;
  replaceDesign: (d: KitchenDesignConfig) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  clearNotice: () => void;

  setLayout: (layout: LayoutId) => void;
  regenerate: () => void;
  updateRoom: (patch: Partial<Room>) => void;
  updateStyle: (patch: Partial<KitchenStyle>) => void;
  /** Add / remove the loft cabinets that fill the gap up to the ceiling. */
  setToCeiling: (on: boolean) => void;
  /** Re-plan the switches and sockets from the current cabinets and appliances. */
  replanElectrical: () => void;
  updateElectrical: (id: string, patch: Partial<ElectricalPoint>) => void;
  addElectrical: (p: Omit<ElectricalPoint, "id">) => void;
  removeElectrical: (id: string) => void;
  updateLighting: (patch: Partial<LightingConfig>) => void;
  applyPreset: (id: string) => void;

  updateModule: (id: string, patch: Partial<ModuleInstance>, coalesceKey?: string) => void;
  patchModule: (id: string, fn: (m: ModuleInstance) => ModuleInstance) => void;
  addModule: (typeId: string, at?: { x: number; z: number; rot?: ModuleInstance["rot"] }) => string | null;
  removeModule: (id: string) => void;
  duplicateModule: (id: string) => string | null;
  replaceModuleType: (id: string, typeId: string) => void;
  moveModule: (id: string, x: number, z: number) => boolean;
  /** Move and turn a cabinet / appliance in one undoable step (used by 3D drag-and-drop). */
  placeModule: (id: string, x: number, z: number, rot: ModuleInstance["rot"]) => boolean;
  /** Move a counter-top item (coffee machine…) onto another cabinet. */
  moveTopItem: (fromId: string, itemId: string, toId: string) => void;
  resizeModule: (id: string, patch: { width?: number; height?: number; depth?: number }) => void;
}

let lastKey = "";
let lastTime = 0;

export const useKitchenStore = create<KitchenState>((set, get) => ({
  design: loadSaved() ?? createDesign("l-shape"),
  past: [],
  future: [],
  notice: null,

  commit: (updater, coalesceKey) => {
    const { design, past } = get();
    const next = updater(design);
    if (next === design) return;
    const now = Date.now();
    const coalesce = coalesceKey && coalesceKey === lastKey && now - lastTime < 600;
    lastKey = coalesceKey ?? "";
    lastTime = now;
    set({
      design: next,
      past: coalesce ? past : [...past.slice(-(HISTORY_LIMIT - 1)), design],
      future: [],
    });
    persist(next);
  },

  replaceDesign: (d) => {
    const { design, past } = get();
    set({ design: d, past: [...past.slice(-(HISTORY_LIMIT - 1)), design], future: [] });
    persist(d);
  },

  undo: () => {
    const { past, design, future } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    set({ design: prev, past: past.slice(0, -1), future: [design, ...future] });
    persist(prev);
  },
  redo: () => {
    const { past, design, future } = get();
    if (!future.length) return;
    const next = future[0];
    set({ design: next, past: [...past, design], future: future.slice(1) });
    persist(next);
  },
  reset: () => get().replaceDesign(createDesign(get().design.layout)),
  clearNotice: () => set({ notice: null }),

  setLayout: (layout) => get().commit((d) => rebuilt(d, layout, d.room)),
  regenerate: () => get().commit((d) => rebuilt(d, d.layout, d.room)),

  updateRoom: (patch) => {
    // changing the room re-flows the layout so cabinets always fit the walls
    get().commit(
      (d) => {
        const room = { ...d.room, ...patch };
        return rebuilt(d, d.layout, room);
      },
      "room"
    );
  },
  updateStyle: (patch) => get().commit((d) => ({ ...d, style: { ...d.style, ...patch } }), `style-${Object.keys(patch).join()}`),
  setToCeiling: (on) =>
    get().commit((d) => {
      const style = { ...d.style, toCeiling: on };
      const without = d.modules.filter((m) => !m.run.endsWith("-loft"));
      const modules = on ? [...without, ...filterOpenings(buildLofts(without, d.room, style), d.room)] : without;
      return { ...d, style, modules };
    }),
  replanElectrical: () => get().commit((d) => ({ ...d, electrical: planElectrical(d) })),
  updateElectrical: (id, patch) => get().commit((d) => ({ ...d, electrical: d.electrical.map((p) => (p.id === id ? { ...p, ...patch } : p)) }), `el-${id}`),
  addElectrical: (p) => get().commit((d) => ({ ...d, electrical: [...d.electrical, { ...p, id: uid("e") }] })),
  removeElectrical: (id) => get().commit((d) => ({ ...d, electrical: d.electrical.filter((p) => p.id !== id) })),
  updateLighting: (patch) => get().commit((d) => ({ ...d, lighting: { ...d.lighting, ...patch } }), `light-${Object.keys(patch).join()}`),
  applyPreset: (id) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    get().commit((d) => ({
      ...d,
      // presets restyle the whole kitchen, so per-module overrides are cleared
      style: { ...d.style, ...p.style, backsplash: { ...d.style.backsplash, ...(p.style.backsplash ?? {}) } },
      lighting: { ...d.lighting, ...(p.lighting ?? {}) },
      modules: d.modules.map((m) => ({ ...m, overrides: {} })),
    }));
  },

  updateModule: (id, patch, coalesceKey) =>
    get().commit((d) => ({ ...d, modules: d.modules.map((m) => (m.id === id ? { ...m, ...patch } : m)) }), coalesceKey ? `${id}-${coalesceKey}` : undefined),
  patchModule: (id, fn) => get().commit((d) => ({ ...d, modules: d.modules.map((m) => (m.id === id ? fn(m) : m)) })),

  addModule: (typeId, at) => {
    const { design } = get();
    const t = getModuleType(typeId);
    // default position: continue the nearest run, else the room centre
    const m = makeModule(typeId, { ...(at ?? {}) }, design.style);
    if (!at) {
      const spot = findFreeSpot(design, m);
      if (!spot) {
        set({ notice: "There is no free space for this module along the existing runs." });
        return null;
      }
      Object.assign(m, spot);
    }
    const check = canPlace(m, design.modules, design.room);
    if (!check.ok) {
      set({ notice: check.reason ?? "That module can't be placed there." });
      return null;
    }
    void t;
    get().commit((d) => ({ ...d, modules: [...d.modules, m] }));
    return m.id;
  },

  removeModule: (id) => get().commit((d) => ({ ...d, modules: d.modules.filter((m) => m.id !== id) })),

  duplicateModule: (id) => {
    const { design } = get();
    const src = design.modules.find((m) => m.id === id);
    if (!src) return null;
    const copy: ModuleInstance = { ...src, id: uid(), params: { ...src.params }, overrides: { ...src.overrides } };
    const spot = findFreeSpot(design, copy, src);
    if (!spot) {
      set({ notice: "There is no free space beside this module to duplicate it." });
      return null;
    }
    Object.assign(copy, spot);
    get().commit((d) => ({ ...d, modules: [...d.modules, copy] }));
    return copy.id;
  },

  replaceModuleType: (id, typeId) => {
    const t = getModuleType(typeId);
    get().commit((d) => ({
      ...d,
      modules: d.modules.map((m) => {
        if (m.id !== id) return m;
        const fresh = makeModule(typeId, {}, d.style);
        return {
          ...m,
          typeId,
          width: clamp(m.width, t.width.min, t.width.max),
          height: clamp(m.height, t.height.min, t.height.max),
          depth: clamp(m.depth, t.depth.min, t.depth.max),
          params: fresh.params,
        };
      }),
    }));
  },

  moveModule: (id, x, z) => {
    const { design } = get();
    const m = design.modules.find((v) => v.id === id);
    if (!m) return false;
    const next = { ...m, x: snap(x, 5), z: snap(z, 5) };
    const check = canPlace(next, design.modules, design.room);
    if (!check.ok) {
      set({ notice: check.reason ?? "Invalid position." });
      return false;
    }
    get().commit((d) => ({ ...d, modules: d.modules.map((v) => (v.id === id ? next : v)) }), `${id}-move`);
    return true;
  },

  placeModule: (id, x, z, rot) => {
    const { design } = get();
    const m = design.modules.find((v) => v.id === id);
    if (!m) return false;
    const next = { ...m, x: snap(x, 5), z: snap(z, 5), rot };
    const check = canPlace(next, design.modules, design.room);
    if (!check.ok) {
      set({ notice: check.reason ?? "Invalid position." });
      return false;
    }
    get().commit((d) => ({ ...d, modules: d.modules.map((v) => (v.id === id ? next : v)) }));
    return true;
  },

  moveTopItem: (fromId, itemId, toId) => {
    if (fromId === toId) return;
    get().commit((d) => ({
      ...d,
      modules: d.modules.map((m) => {
        if (m.id === fromId) return { ...m, params: { ...m.params, topItems: (m.params.topItems ?? []).filter((i) => i !== itemId) } };
        if (m.id === toId) {
          const cur = m.params.topItems ?? [];
          return cur.includes(itemId) ? m : { ...m, params: { ...m.params, topItems: [...cur, itemId] } };
        }
        return m;
      }),
    }));
  },

  resizeModule: (id, patch) => {
    const { design } = get();
    const m = design.modules.find((v) => v.id === id);
    if (!m) return;
    const t = getModuleType(m.typeId);
    const next = {
      ...m,
      width: patch.width !== undefined ? clamp(patch.width, t.width.min, t.width.max) : m.width,
      height: patch.height !== undefined ? clamp(patch.height, t.height.min, t.height.max) : m.height,
      depth: patch.depth !== undefined ? clamp(patch.depth, t.depth.min, t.depth.max) : m.depth,
    };
    // keep the back edge / run-start fixed when the width changes along a run
    if (next.width !== m.width) {
      const along = m.rot === 0 || m.rot === 180 ? "x" : "z";
      const delta = (next.width - m.width) / 2;
      if (along === "x") next.x = m.x + delta;
      else next.z = m.z + delta;
    }
    if (next.depth !== m.depth) {
      const d2 = (next.depth - m.depth) / 2;
      // grow away from the wall (towards the front)
      const [fx, fz] = m.rot === 0 ? [0, 1] : m.rot === 90 ? [1, 0] : m.rot === 180 ? [0, -1] : [-1, 0];
      next.x = m.x + fx * d2;
      next.z = m.z + fz * d2;
    }
    const check = canPlace(next, design.modules, design.room);
    if (!check.ok) {
      set({ notice: check.reason === "This cabinet overlaps another module." ? "Resizing would make this cabinet overlap another module." : check.reason ?? "Invalid size." });
      return;
    }
    get().commit((d) => ({ ...d, modules: d.modules.map((v) => (v.id === id ? next : v)) }), `${id}-size`);
  },
}));

function persist(d: KitchenDesignConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Find a free spot for a new module: first try to sit it directly after another
 * module of the same zone, scanning along each run; fall back to scanning the floor.
 */
function findFreeSpot(design: KitchenDesignConfig, m: ModuleInstance, near?: ModuleInstance): { x: number; z: number; rot: ModuleInstance["rot"]; run: string } | null {
  const { room } = design;
  const t = getModuleType(m.typeId);
  const sameZone = design.modules.filter((o) => getModuleType(o.typeId).zone === t.zone);
  const anchors = near ? [near, ...sameZone] : sameZone;

  const candidates: { x: number; z: number; rot: ModuleInstance["rot"]; run: string }[] = [];
  anchors.forEach((a) => {
    const f = footprint(a);
    const along: [number, number][] =
      a.rot === 0 || a.rot === 180
        ? [
            [f.x1 + m.width / 2, a.z],
            [f.x0 - m.width / 2, a.z],
          ]
        : [
            [a.x, f.z1 + m.width / 2],
            [a.x, f.z0 - m.width / 2],
          ];
    along.forEach(([x, z]) => {
      // keep depth alignment with the wall: reuse the anchor's back edge
      const adjusted = alignDepth(a, m, x, z);
      candidates.push({ x: adjusted.x, z: adjusted.z, rot: a.rot, run: a.run });
    });
  });

  for (const c of candidates) {
    const probe = { ...m, ...c, elevation: t.zone === "wall" ? m.elevation : 0 };
    if (canPlace(probe, design.modules, room).ok) return c;
  }
  // free floor scan, snapped to walls
  const step = 100;
  for (let z = m.depth / 2; z <= room.depth - m.depth / 2; z += step) {
    for (let x = m.width / 2; x <= room.width - m.width / 2; x += step) {
      const probe = { ...m, x, z, rot: 0 as const };
      if (canPlace(probe, design.modules, room).ok) return { x, z, rot: 0, run: "main" };
    }
  }
  return null;
}

/** Re-centre a new module so its back edge lines up with the anchor's back edge. */
function alignDepth(a: ModuleInstance, m: ModuleInstance, x: number, z: number): { x: number; z: number } {
  const back = (v: ModuleInstance) => {
    switch (v.rot) {
      case 0:
        return v.z - v.depth / 2;
      case 180:
        return v.z + v.depth / 2;
      case 90:
        return v.x - v.depth / 2;
      default:
        return v.x + v.depth / 2;
    }
  };
  const b = back(a);
  switch (a.rot) {
    case 0:
      return { x, z: b + m.depth / 2 };
    case 180:
      return { x, z: b - m.depth / 2 };
    case 90:
      return { x: b + m.depth / 2, z };
    default:
      return { x: b - m.depth / 2, z };
  }
}
