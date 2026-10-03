/**
 * Layout engine.
 *
 * A layout is not a component — it is a *recipe*: a list of runs (a stretch of
 * wall or a free-standing line) and, for each, a program of module types. The
 * engine fits each program to its run's real length (stretching / shrinking /
 * dropping modules and adding fillers), places the modules in plan, then derives
 * wall cabinets and tall units. Adding a layout means adding one entry to
 * `LAYOUT_BUILDERS`; nothing else changes.
 */
import type { KitchenStyle, LayoutId, ModuleInstance, Room, Rotation, WallSide } from "../model/types";
import { defaultParams, getModuleType } from "../data/modules";
import { clamp, uid } from "../model/units";

export interface LayoutInfo {
  id: LayoutId;
  name: string;
  blurb: string;
  /** Minimum recommended room size (mm). */
  minWidth: number;
  minDepth: number;
  hasIsland?: boolean;
}

export const LAYOUTS: LayoutInfo[] = [
  { id: "straight", name: "Straight", blurb: "Everything along one wall", minWidth: 2400, minDepth: 1800 },
  { id: "parallel", name: "Parallel / Galley", blurb: "Two facing runs", minWidth: 2400, minDepth: 2400 },
  { id: "l-shape", name: "L-shaped", blurb: "Two adjoining walls", minWidth: 2400, minDepth: 2400 },
  { id: "u-shape", name: "U-shaped", blurb: "Three walls", minWidth: 2700, minDepth: 2700 },
  { id: "g-shape", name: "G-shaped", blurb: "U-shape with a partial fourth side", minWidth: 3000, minDepth: 3000 },
  { id: "island", name: "Island", blurb: "Straight run with a central island", minWidth: 3000, minDepth: 3400, hasIsland: true },
  { id: "peninsula", name: "Peninsula", blurb: "Run with a protruding peninsula", minWidth: 3200, minDepth: 2800 },
  { id: "l-island", name: "L + island", blurb: "L-shape with an island", minWidth: 3400, minDepth: 3600, hasIsland: true },
  { id: "u-island", name: "U + island", blurb: "U-shape with an island", minWidth: 3800, minDepth: 4200, hasIsland: true },
  { id: "parallel-island", name: "Parallel + island", blurb: "Two runs with a central island", minWidth: 3200, minDepth: 4200, hasIsland: true },
  { id: "open-plan", name: "Open plan", blurb: "Open kitchen with a seating island", minWidth: 3600, minDepth: 3800, hasIsland: true },
  { id: "breakfast", name: "Breakfast counter", blurb: "Run with a raised breakfast bar", minWidth: 3200, minDepth: 2800 },
  { id: "tall-wall", name: "Tall-unit wall", blurb: "A wall of pantry, fridge & oven towers", minWidth: 3600, minDepth: 2400 },
];

export const LAYOUT_BY_ID: Record<LayoutId, LayoutInfo> = Object.fromEntries(LAYOUTS.map((l) => [l.id, l])) as Record<LayoutId, LayoutInfo>;

/* ───────────────────────── constants ───────────────────────── */

const BD = 560; // base-unit depth
const TD = 600; // tall-unit depth
const WD = 350; // wall-unit depth
const ISLAND_D = 600;
const WALL_H = 700;

/* ───────────────────────── module factory ───────────────────────── */

export function makeModule(typeId: string, partial: Partial<ModuleInstance> = {}, style?: KitchenStyle): ModuleInstance {
  const t = getModuleType(typeId);
  const elevation = t.zone === "wall" ? style?.wallCabinetBottom ?? 1450 : 0;
  return {
    id: uid(),
    typeId,
    x: 0,
    z: 0,
    rot: 0,
    width: t.width.default,
    height: t.height.default,
    depth: t.depth.default,
    elevation,
    run: "main",
    params: defaultParams(typeId),
    overrides: {},
    ...partial,
  };
}

/* ───────────────────────── run fitting ───────────────────────── */

interface Slot {
  typeId: string;
  /** Preferred width (mm); defaults to the type's default. */
  w?: number;
  /** Never dropped while it can still fit (sink, hob, corner). */
  must?: boolean;
}
interface Fitted {
  typeId: string;
  width: number;
}

const round5 = (v: number) => Math.round(v / 5) * 5;

/** Fit a program of slots exactly into `length` mm. */
export function fitRun(slots: Slot[], length: number): Fitted[] {
  let items = slots.map((s) => {
    const t = getModuleType(s.typeId);
    return { ...s, t, width: s.w ?? t.width.default };
  });
  const sumMin = () => items.reduce((n, i) => n + i.t.width.min, 0);

  // drop optional items from the end until the minimum widths fit
  while (sumMin() > length && items.some((i) => !i.must)) {
    const idx = [...items].map((i, k) => (!i.must ? k : -1)).filter((k) => k >= 0).pop() as number;
    items.splice(idx, 1);
  }
  if (!items.length) return [];

  let total = items.reduce((n, i) => n + i.width, 0);

  // too long → shrink flexible items toward their minimum
  let guard = 0;
  while (total > length + 0.5 && guard++ < 400) {
    const flex = items.filter((i) => i.width > i.t.width.min);
    if (!flex.length) break;
    const step = Math.min(25, total - length);
    flex.forEach((i) => {
      const cut = Math.min(step / flex.length + 0.01, i.width - i.t.width.min);
      i.width -= cut;
    });
    total = items.reduce((n, i) => n + i.width, 0);
  }

  // too short → stretch flexible items toward their maximum
  guard = 0;
  while (total < length - 0.5 && guard++ < 400) {
    const flex = items.filter((i) => i.width < i.t.width.max);
    if (!flex.length) break;
    const step = Math.min(25, length - total);
    flex.forEach((i) => {
      const add = Math.min(step / flex.length + 0.01, i.t.width.max - i.width);
      i.width += add;
    });
    total = items.reduce((n, i) => n + i.width, 0);
  }

  const out: Fitted[] = items.map((i) => ({ typeId: i.typeId, width: round5(i.width) }));

  // anything left over: add real cabinets while there is room, then a filler panel
  let rest = length - out.reduce((n, i) => n + i.width, 0);
  guard = 0;
  while (rest >= 300 && guard++ < 10) {
    const w = round5(Math.min(rest, 800));
    out.push({ typeId: w >= 600 ? "base-double" : "base-single", width: w });
    rest -= w;
  }
  if (rest >= 20) out.push({ typeId: "filler", width: round5(rest) });
  // absorb rounding drift so the run is exactly `length` long
  const drift = length - out.reduce((n, i) => n + i.width, 0);
  if (Math.abs(drift) > 0.001 && out.length) {
    // give the drift to the module with the most slack in that direction (never below min / above max)
    let best = out.length - 1;
    let bestSlack = -Infinity;
    out.forEach((o, k) => {
      const t = getModuleType(o.typeId);
      const slack = drift > 0 ? t.width.max - o.width : o.width - t.width.min;
      if (o.typeId !== "filler" && slack > bestSlack) {
        bestSlack = slack;
        best = k;
      }
    });
    out[best].width += drift;
  }
  return out;
}

/* ───────────────────────── run placement ───────────────────────── */

type Placer = (offset: number, width: number, depth: number) => { x: number; z: number; rot: Rotation };

/** Builds a placer for a run along a wall (or a free line). `line` is the wall coordinate. */
function wallPlacer(room: Room, side: WallSide, start: number): Placer {
  switch (side) {
    case "back":
      return (o, w, d) => ({ x: start + o + w / 2, z: d / 2, rot: 0 });
    case "left":
      return (o, w, d) => ({ x: d / 2, z: start + o + w / 2, rot: 90 });
    case "right":
      return (o, w, d) => ({ x: room.width - d / 2, z: start + o + w / 2, rot: 270 });
    default:
      return (o, w, d) => ({ x: start + o + w / 2, z: room.depth - d / 2, rot: 180 });
  }
}

/** Free-standing run along x at plan z (centre), facing `rot`. */
function freeXPlacer(zCentre: number, start: number, rot: Rotation): Placer {
  return (o, w) => ({ x: start + o + w / 2, z: zCentre, rot });
}
/** Free-standing run along z at plan x (centre), facing `rot`. */
function freeZPlacer(xCentre: number, start: number, rot: Rotation): Placer {
  return (o, w) => ({ x: xCentre, z: start + o + w / 2, rot });
}

function placeProgram(slots: Slot[], length: number, placer: Placer, run: string, style: KitchenStyle, depthOf?: (typeId: string) => number): ModuleInstance[] {
  const fitted = fitRun(slots, length);
  let offset = 0;
  return fitted.map((f) => {
    const t = getModuleType(f.typeId);
    const d = depthOf?.(f.typeId) ?? t.depth.default;
    const pos = placer(offset, f.width, d);
    offset += f.width;
    return makeModule(f.typeId, { ...pos, width: f.width, depth: d, run }, style);
  });
}

/* ───────────────────────── programs ───────────────────────── */

/*
 * Starting programs are deliberately short: a few wide, calm units stretch to fill
 * each run. Extras (dishwasher, bottle pull-out, bins, cutlery unit…) are one click
 * away in the Cabinets tab but are not forced on a first-time kitchen.
 */
const PRIMARY: Slot[] = [
  { typeId: "base-drawers-3", w: 900 },
  { typeId: "base-sink", w: 1000, must: true },
  { typeId: "base-drawers-3", w: 900, must: true },
  { typeId: "base-hob", w: 750, must: true },
  { typeId: "base-double", w: 900 },
];

const SECONDARY: Slot[] = [
  { typeId: "base-drawers-3", w: 1000 },
  { typeId: "base-double", w: 1000 },
  { typeId: "base-drawers-3", w: 900 },
];

const ISLAND_PROGRAM: Slot[] = [
  { typeId: "base-drawers-3", w: 900 },
  { typeId: "base-double", w: 1000 },
  { typeId: "base-drawers-3", w: 900 },
];

function tallSet(roomWidth: number, wall = false): Slot[] {
  if (wall) {
    if (roomWidth >= 5200) {
      return [
        { typeId: "tall-pantry-full", w: 600 },
        { typeId: "tall-fridge", w: 750, must: true },
        { typeId: "tall-oven", w: 600 },
        { typeId: "tall-pantry-full", w: 600 },
      ];
    }
    if (roomWidth >= 4200) {
      return [
        { typeId: "tall-fridge", w: 750, must: true },
        { typeId: "tall-oven", w: 600 },
        { typeId: "tall-pantry-full", w: 600 },
      ];
    }
    if (roomWidth >= 3400) {
      return [
        { typeId: "tall-fridge", w: 750, must: true },
        { typeId: "tall-oven", w: 600 },
      ];
    }
    return [{ typeId: "tall-fridge", w: 750, must: true }];
  }
  if (roomWidth >= 5200) {
    return [
      { typeId: "tall-fridge", w: 750, must: true },
      { typeId: "tall-pantry-full", w: 600 },
      { typeId: "tall-oven", w: 600 },
    ];
  }
  if (roomWidth >= 3400) {
    return [
      { typeId: "tall-fridge", w: 750, must: true },
      { typeId: "tall-oven", w: 600 },
    ];
  }
  return [{ typeId: "tall-fridge", w: 750, must: true }];
}

const slotWidth = (slots: Slot[]) => slots.reduce((n, s) => n + (s.w ?? getModuleType(s.typeId).width.default), 0);

/* ───────────────────────── wall cabinets & tall units ───────────────────────── */

/** Derives wall cabinets for a base run: merges neighbours, chimney above the hob. */
function wallUnitsFor(base: ModuleInstance[], run: string, style: KitchenStyle, roomHeight: number): ModuleInstance[] {
  const out: ModuleInstance[] = [];
  // with cabinets-to-ceiling on, size the wall units so ONE loft fills the rest (fewer seams, calmer look)
  const target = style.toCeiling ? roomHeight - style.wallCabinetBottom - 550 : WALL_H;
  const height = clamp(target, 500, Math.max(500, Math.min(1200, roomHeight - style.wallCabinetBottom - 150)));
  let pending: ModuleInstance[] = [];
  let liftNext = true;

  const flush = () => {
    if (!pending.length) return;
    const first = pending[0];
    const width = pending.reduce((n, m) => n + m.width, 0);
    let remaining = width;
    let consumed = 0;
    // split anything wider than 1200
    while (remaining > 0.5) {
      const w = remaining > 1200 ? round5(remaining / Math.ceil(remaining / 1200)) : remaining;
      const typeId = w < 600 ? "wall-single" : liftNext && w >= 800 ? "wall-lift" : "wall-double";
      if (typeId === "wall-lift") liftNext = false;
      else liftNext = true;
      // position by interpolating along the base modules' axis
      const firstFoot = first;
      const f = frontOf(firstFoot);
      const offsetFromFirstEdge = consumed + w / 2 - first.width / 2;
      const x = first.x + f.ax * offsetFromFirstEdge;
      const z = first.z + f.az * offsetFromFirstEdge;
      const [dx, dz] = f.front;
      // wall units are shallower: pull their centre toward the wall
      const shift = (BD - WD) / 2 - (first.depth - BD) / 2;
      out.push(
        makeModule(typeId, {
          x: x - dx * shift,
          z: z - dz * shift,
          rot: first.rot,
          width: round5(w),
          height: typeId === "wall-lift" ? Math.min(height, 700) : height,
          depth: WD,
          run: `${run}-wall`,
          elevation: style.wallCabinetBottom,
        }, style)
      );
      consumed += w;
      remaining -= w;
    }
    pending = [];
  };

  base.forEach((m) => {
    const kind = getModuleType(m.typeId).kind;
    if (kind === "filler") {
      flush();
      return;
    }
    if (kind === "base-hob") {
      flush();
      out.push(
        makeModule("wall-chimney", {
          x: m.x,
          z: m.z + frontOf(m).front[1] * -((BD - 400) / 2),
          rot: m.rot,
          width: Math.min(900, Math.max(600, m.width)),
          height: 700,
          depth: 400,
          run: `${run}-wall`,
          elevation: style.wallCabinetBottom + 0,
        }, style)
      );
      // fix x too for side runs
      const last = out[out.length - 1];
      const f = frontOf(m);
      last.x = m.x - f.front[0] * ((BD - 400) / 2);
      last.z = m.z - f.front[1] * ((BD - 400) / 2);
      return;
    }
    pending.push(m);
    if (pending.reduce((n, p) => n + p.width, 0) >= 800) flush();
  });
  flush();
  return out;
}

/** Axis along the run (ax, az) and the front direction of a module. */
function frontOf(m: ModuleInstance): { ax: number; az: number; front: [number, number] } {
  switch (m.rot) {
    case 0:
      return { ax: 1, az: 0, front: [0, 1] };
    case 90:
      return { ax: 0, az: 1, front: [1, 0] };
    case 180:
      return { ax: 1, az: 0, front: [0, -1] };
    default:
      return { ax: 0, az: 1, front: [-1, 0] };
  }
}

/* ───────────────────────── layout builders ───────────────────────── */

interface Ctx {
  room: Room;
  style: KitchenStyle;
}

const CORNER: Slot = { typeId: "base-corner-magic", w: 1000, must: true };
const TALL_H = (room: Room) => clamp(room.height - 150, 1800, 2400);

function tallRun(ctx: Ctx, side: WallSide, start: number, slots: Slot[], run: string): ModuleInstance[] {
  const placer = wallPlacer(ctx.room, side, start);
  const mods = placeProgram(slots, slotWidth(slots), placer, run, ctx.style, () => TD);
  mods.forEach((m) => {
    m.height = getModuleType(m.typeId).kind === "tall-pantry" && m.typeId === "tall-pantry-half" ? m.height : TALL_H(ctx.room);
  });
  return mods;
}

function island(ctx: Ctx, zCentre: number, length: number, rot: Rotation, run = "island"): ModuleInstance[] {
  const startX = (ctx.room.width - length) / 2;
  const mods = placeProgram(ISLAND_PROGRAM, length, freeXPlacer(zCentre, startX, rot), run, ctx.style, () => ISLAND_D);
  return mods;
}

function aisleFor(room: Room, runs: number, islandOverhang = 0): number {
  // space left for an aisle between a back run and the island
  const avail = room.depth - BD * runs - ISLAND_D - islandOverhang - 900;
  return clamp(avail, 900, 1200);
}

type Builder = (ctx: Ctx) => ModuleInstance[];

const LAYOUT_BUILDERS: Record<LayoutId, Builder> = {
  straight: (ctx) => {
    const tall = tallSet(ctx.room.width);
    const tw = slotWidth(tall);
    const baseLen = ctx.room.width - tw;
    const base = placeProgram(PRIMARY, baseLen, wallPlacer(ctx.room, "back", 0), "main", ctx.style);
    return [...base, ...wallUnitsFor(base, "main", ctx.style, ctx.room.height), ...tallRun(ctx, "back", baseLen, tall, "tall")];
  },

  parallel: (ctx) => {
    const tall = tallSet(ctx.room.width);
    const tw = slotWidth(tall);
    const baseLen = ctx.room.width - tw;
    const main = placeProgram(PRIMARY, baseLen, wallPlacer(ctx.room, "back", 0), "main", ctx.style);
    const front = placeProgram(SECONDARY, ctx.room.width, wallPlacer(ctx.room, "front", 0), "front", ctx.style);
    return [
      ...main,
      ...wallUnitsFor(main, "main", ctx.style, ctx.room.height),
      ...tallRun(ctx, "back", baseLen, tall, "tall"),
      ...front,
      ...wallUnitsFor(front, "front", ctx.style, ctx.room.height),
    ];
  },

  "l-shape": (ctx) => {
    const tall = tallSet(ctx.room.width);
    const tw = slotWidth(tall);
    const baseLen = ctx.room.width - tw;
    const main = placeProgram([CORNER, ...PRIMARY], baseLen, wallPlacer(ctx.room, "back", 0), "main", ctx.style);
    const left = placeProgram(SECONDARY, ctx.room.depth - BD, wallPlacer(ctx.room, "left", BD), "left", ctx.style);
    return [
      ...main,
      ...wallUnitsFor(main, "main", ctx.style, ctx.room.height),
      ...left,
      ...wallUnitsFor(left, "left", ctx.style, ctx.room.height).filter((m) => (m.rot === 90 ? m.z - m.width / 2 >= WD - 1 : true)),
      ...tallRun(ctx, "back", baseLen, tall, "tall"),
    ];
  },

  "u-shape": (ctx) => {
    const tall = tallSet(ctx.room.width < 4200 ? 3000 : ctx.room.width);
    const tw = Math.min(slotWidth(tall), 1400);
    const trimmed = tall.slice(0, tw >= 1350 ? 2 : 1);
    const baseLen = ctx.room.width;
    const main = placeProgram([CORNER, ...PRIMARY.slice(0, 7), { ...CORNER, typeId: "base-corner-blind" }], baseLen, wallPlacer(ctx.room, "back", 0), "main", ctx.style);
    const left = placeProgram(SECONDARY, ctx.room.depth - BD, wallPlacer(ctx.room, "left", BD), "left", ctx.style);
    const tallLen = slotWidth(trimmed);
    const right = placeProgram(SECONDARY.slice().reverse(), ctx.room.depth - BD - tallLen, wallPlacer(ctx.room, "right", BD), "right", ctx.style);
    const tallMods = placeProgram(trimmed, tallLen, wallPlacer(ctx.room, "right", ctx.room.depth - tallLen), "tall", ctx.style, () => TD);
    tallMods.forEach((m) => (m.height = TALL_H(ctx.room)));
    return [
      ...main,
      ...wallUnitsFor(main, "main", ctx.style, ctx.room.height),
      ...left,
      ...wallUnitsFor(left, "left", ctx.style, ctx.room.height).filter((m) => m.z - m.width / 2 >= WD - 1),
      ...right,
      ...wallUnitsFor(right, "right", ctx.style, ctx.room.height).filter((m) => m.z - m.width / 2 >= WD - 1),
      ...tallMods,
    ];
  },

  "g-shape": (ctx) => {
    const u = LAYOUT_BUILDERS["u-shape"](ctx);
    // a partial fourth side on the front wall, from the left corner
    const frontLen = Math.min(1800, Math.max(900, ctx.room.width * 0.28));
    const front = placeProgram(
      [{ typeId: "base-corner-blind", w: 1000, must: true }, { typeId: "base-drawers-3", w: 600 }],
      frontLen,
      wallPlacer(ctx.room, "front", 0),
      "front",
      ctx.style
    );
    // the left run must stop short of the front run
    const trimmed = u.filter((m) => !(m.run === "left" && m.z + m.width / 2 > ctx.room.depth - BD + 0.5) && !(m.run === "left-wall" && m.z + m.width / 2 > ctx.room.depth - WD + 0.5));
    return [...trimmed, ...front];
  },

  island: (ctx) => {
    const straight = LAYOUT_BUILDERS.straight(ctx);
    const len = clamp(Math.round((ctx.room.width - 1800) / 50) * 50, 1500, 3000);
    const z = BD + aisleFor(ctx.room, 1, 300) + ISLAND_D / 2;
    return [...straight, ...island(ctx, z, len, 180)];
  },

  peninsula: (ctx) => {
    const tall = tallSet(ctx.room.width);
    const tw = slotWidth(tall);
    // tall units at the LEFT of the back wall, main run to the right, peninsula leg from its right end
    const runEnd = ctx.room.width - 600;
    const baseLen = runEnd - tw;
    const tallMods = placeProgram(tall, tw, wallPlacer(ctx.room, "back", 0), "tall", ctx.style, () => TD);
    tallMods.forEach((m) => (m.height = TALL_H(ctx.room)));
    const main = placeProgram(PRIMARY, baseLen, wallPlacer(ctx.room, "back", tw), "main", ctx.style);
    const legLen = clamp(ctx.room.depth - BD - 900, 1200, 2400);
    const leg = placeProgram(SECONDARY, legLen, freeZPlacer(runEnd - BD / 2 + (BD - 560) / 2, BD, 270), "peninsula", ctx.style);
    return [...tallMods, ...main, ...wallUnitsFor(main, "main", ctx.style, ctx.room.height), ...leg];
  },

  "l-island": (ctx) => {
    const l = LAYOUT_BUILDERS["l-shape"](ctx);
    const len = clamp(Math.round((ctx.room.width - 2600) / 50) * 50, 1400, 2800);
    const z = BD + aisleFor(ctx.room, 1, 300) + ISLAND_D / 2;
    const room2 = { ...ctx.room };
    const startX = Math.max(BD + 900, (room2.width - len) / 2);
    const mods = placeProgram(ISLAND_PROGRAM, len, freeXPlacer(z, startX, 180), "island", ctx.style, () => ISLAND_D);
    return [...l, ...mods];
  },

  "u-island": (ctx) => {
    const u = LAYOUT_BUILDERS["u-shape"](ctx);
    const len = clamp(Math.round((ctx.room.width - 2 * BD - 2 * 1000) / 50) * 50, 1200, 2600);
    const z = BD + clamp(ctx.room.depth - BD - ISLAND_D - 1000, 900, 1200) + ISLAND_D / 2;
    return [...u, ...island(ctx, z, len, 180)];
  },

  "parallel-island": (ctx) => {
    const p = LAYOUT_BUILDERS.parallel(ctx);
    const len = clamp(Math.round((ctx.room.width - 2000) / 50) * 50, 1400, 2800);
    const z = ctx.room.depth / 2;
    return [...p, ...island(ctx, z, len, 180)];
  },

  "open-plan": (ctx) => {
    const straight = LAYOUT_BUILDERS.straight(ctx);
    const len = clamp(Math.round((ctx.room.width - 1400) / 50) * 50, 1800, 3400);
    const z = BD + aisleFor(ctx.room, 1, 300) + ISLAND_D / 2;
    return [...straight, ...island(ctx, z, len, 180, "island")];
  },

  breakfast: (ctx) => {
    const tall = tallSet(ctx.room.width);
    const tw = slotWidth(tall);
    const baseLen = ctx.room.width - tw;
    const main = placeProgram([CORNER, ...PRIMARY], baseLen, wallPlacer(ctx.room, "back", 0), "main", ctx.style);
    // a leg at the left end, with a raised breakfast bar on its far side
    const legLen = clamp(ctx.room.depth - BD - 1100, 1000, 2000);
    const leg = placeProgram(SECONDARY, legLen, freeZPlacer(BD / 2, BD, 90), "breakfast", ctx.style);
    return [...main, ...wallUnitsFor(main, "main", ctx.style, ctx.room.height), ...leg, ...tallRun(ctx, "back", baseLen, tall, "tall")];
  },

  "tall-wall": (ctx) => {
    const tall = tallSet(ctx.room.width, true);
    const tw = slotWidth(tall);
    const tallMods = placeProgram(tall, tw, wallPlacer(ctx.room, "back", 0), "tall", ctx.style, () => TD);
    tallMods.forEach((m) => (m.height = TALL_H(ctx.room)));
    const baseLen = ctx.room.width - tw;
    const main = placeProgram(PRIMARY, baseLen, wallPlacer(ctx.room, "back", tw), "main", ctx.style);
    const out = [...tallMods, ...main, ...wallUnitsFor(main, "main", ctx.style, ctx.room.height)];
    if (ctx.room.depth >= 3800) {
      const len = clamp(Math.round((ctx.room.width - 1800) / 50) * 50, 1500, 2800);
      const z = TD + aisleFor(ctx.room, 1, 300) + ISLAND_D / 2;
      out.push(...island(ctx, z, len, 180));
    }
    return out;
  },
};

/**
 * Lofts: fills the gap between wall / tall units and the ceiling so the cabinets
 * touch the ceiling. A gap taller than one loft (700 mm) is split into equal tiers.
 */
export function buildLofts(mods: ModuleInstance[], room: Room, style: KitchenStyle): ModuleInstance[] {
  const lofts: ModuleInstance[] = [];
  mods.forEach((m) => {
    const t = getModuleType(m.typeId);
    if (t.kind === "wall-chimney" || t.kind === "filler" || t.kind === "wall-loft") return;
    if (t.zone !== "wall" && t.zone !== "tall") return;
    const top = m.elevation + m.height;
    const gap = room.height - top;
    if (gap < 150) return;
    const tiers = Math.max(1, Math.ceil(gap / 900));
    const h = gap / tiers;
    for (let i = 0; i < tiers; i++) {
      lofts.push(
        makeModule(
          "wall-loft",
          {
            x: m.x,
            z: m.z,
            rot: m.rot,
            width: m.width,
            depth: Math.min(m.depth, 600),
            height: Math.round(h),
            elevation: Math.round(top + i * h),
            run: `${m.run}-loft`,
            // lofts open upward on a flap: easier to reach than a hinged door over your head
            params: { shelves: 1 },
          },
          style
        )
      );
    }
  });
  return lofts;
}

/** Generate a complete set of modules for a layout. */
export function generateLayout(layout: LayoutId, room: Room, style: KitchenStyle): ModuleInstance[] {
  const mods = LAYOUT_BUILDERS[layout]({ room, style });
  // every module inherits the global look unless overridden later
  return mods;
}
