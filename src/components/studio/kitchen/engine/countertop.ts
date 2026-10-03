/**
 * Countertop generator. Floor-standing base modules that touch each other form
 * continuous slabs; each slab is a plan rectangle with sink / hob cut-outs.
 */
import type { KitchenDesignConfig, ModuleInstance } from "../model/types";
import { getModuleType } from "../data/modules";
import { SINKS } from "../data/products";
import { footprint, frontDir, localToPlan, type Rect } from "./geometry";

export interface Cutout {
  kind: "sink" | "hob";
  /** Plan rectangle (mm). */
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  moduleId: string;
}

export interface Slab extends Rect {
  id: string;
  /** Overhang beyond the module fronts (mm), per side that has one. */
  overhang: { px: number; nx: number; pz: number; nz: number };
  cutouts: Cutout[];
  moduleIds: string[];
  /** True when the slab backs against a wall (gets a backsplash). */
  wallBack: boolean;
  /** Direction the fronts face. */
  front: [number, number];
  /** Raised breakfast-bar slab? */
  bar?: boolean;
  /** Top height above the floor (mm). */
  top: number;
}

const touching = (a: Rect, b: Rect) => {
  const gapX = Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1);
  const gapZ = Math.max(a.z0, b.z0) - Math.min(a.z1, b.z1);
  const overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const overlapZ = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0);
  return (gapX <= 12 && overlapZ > 100) || (gapZ <= 12 && overlapX > 100);
};

const isCounterModule = (m: ModuleInstance) => {
  if (m.elevation > 50) return false;
  const t = getModuleType(m.typeId);
  return t.zone === "base" || t.zone === "island";
};

export function buildCounterSlabs(design: KitchenDesignConfig): Slab[] {
  const { room, style } = design;
  const mods = design.modules.filter(isCounterModule);
  // union-find by touching + same facing axis
  const parent = mods.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const rects = mods.map(footprint);
  for (let i = 0; i < mods.length; i++) {
    for (let j = i + 1; j < mods.length; j++) {
      if (touching(rects[i], rects[j]) && mods[i].run === mods[j].run) parent[find(i)] = find(j);
    }
  }
  const groups = new Map<number, number[]>();
  mods.forEach((_, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), i]));

  const slabs: Slab[] = [];
  let n = 0;
  groups.forEach((idx) => {
    const group = idx.map((i) => mods[i]);
    const rs = idx.map((i) => rects[i]);
    const x0 = Math.min(...rs.map((r) => r.x0));
    const x1 = Math.max(...rs.map((r) => r.x1));
    const z0 = Math.min(...rs.map((r) => r.z0));
    const z1 = Math.max(...rs.map((r) => r.z1));
    const first = group[0];
    const front = frontDir(first.rot);
    const isIsland = group.some((m) => m.run === "island");
    const isBreakfastLeg = group.some((m) => m.run === "breakfast" || m.run === "peninsula");
    const baseOverhang = style.counterOverhang;
    const seatOverhang = isIsland || isBreakfastLeg ? 300 : 0;

    // overhang on the front, plus a seating overhang on the *back* of free-standing runs
    const overhang = { px: 0, nx: 0, pz: 0, nz: 0 };
    const addOverhang = (dx: number, dz: number, v: number) => {
      if (dx > 0) overhang.px = Math.max(overhang.px, v);
      if (dx < 0) overhang.nx = Math.max(overhang.nx, v);
      if (dz > 0) overhang.pz = Math.max(overhang.pz, v);
      if (dz < 0) overhang.nz = Math.max(overhang.nz, v);
    };
    addOverhang(front[0], front[1], baseOverhang);
    if (seatOverhang) addOverhang(-front[0], -front[1], seatOverhang);

    // wall contact → no overhang on that side; back wall backsplash
    const touchBack = z0 <= 30;
    const touchLeft = x0 <= 30;
    const touchRight = x1 >= room.width - 30;
    const touchFront = z1 >= room.depth - 30;
    if (touchBack) overhang.nz = 0;
    if (touchFront) overhang.pz = 0;
    if (touchLeft) overhang.nx = 0;
    if (touchRight) overhang.px = 0;

    const cutouts: Cutout[] = [];
    group.forEach((m) => {
      const k = getModuleType(m.typeId).kind;
      if (k === "base-sink") {
        const sink = SINKS.find((s) => s.id === style.sinkType) ?? SINKS[0];
        const [cw, cd] = sink.cutout;
        const w = Math.min(cw, m.width - 60);
        const [cx, cz] = localToPlan(m, 0, -(m.depth - 460) / 2 + 20);
        cutouts.push(rectAround(cx, cz, w, cd, m.rot, "sink", m.id));
      } else if (k === "base-hob") {
        const w = Math.min(560, m.width - 60);
        const [cx, cz] = localToPlan(m, 0, -(m.depth - 500) / 2 + 20);
        cutouts.push(rectAround(cx, cz, w, 490, m.rot, "hob", m.id));
      }
    });

    slabs.push({
      id: `slab-${n++}`,
      x0: x0 - overhang.nx,
      x1: x1 + overhang.px,
      z0: z0 - overhang.nz,
      z1: z1 + overhang.pz,
      overhang,
      cutouts,
      moduleIds: group.map((m) => m.id),
      wallBack: touchBack || touchLeft || touchRight || touchFront,
      front,
      top: Math.max(...group.map((m) => m.height)) + style.counterThickness,
    });
  });

  // breakfast bar: a raised slab along the far side of the breakfast leg
  slabs
    .filter((s) => design.modules.some((m) => s.moduleIds.includes(m.id) && m.run === "breakfast"))
    .forEach((s) => {
      const horizontal = s.front[1] !== 0;
      const bar: Slab = {
        ...s,
        id: `${s.id}-bar`,
        bar: true,
        cutouts: [],
        top: 1050 + style.counterThickness,
        x0: horizontal ? s.x0 : s.x1 - 350 + (s.front[0] > 0 ? 0 : 0),
        x1: horizontal ? s.x1 : s.x1 + 20,
        z0: horizontal ? s.z0 : s.z0,
        z1: horizontal ? s.z0 + 350 : s.z1,
        wallBack: false,
      };
      // the bar sits on the side facing away from the cooking zone
      const [fx] = s.front;
      if (!horizontal) {
        if (fx > 0) {
          bar.x0 = s.x0 - 380;
          bar.x1 = s.x0 + 20;
        } else {
          bar.x0 = s.x1 - 20;
          bar.x1 = s.x1 + 380;
        }
      }
      slabs.push(bar);
    });

  return slabs;
}

function rectAround(cx: number, cz: number, w: number, d: number, rot: number, kind: Cutout["kind"], moduleId: string): Cutout {
  const swap = rot === 90 || rot === 270;
  const hw = (swap ? d : w) / 2;
  const hd = (swap ? w : d) / 2;
  return { kind, moduleId, x0: cx - hw, x1: cx + hw, z0: cz - hd, z1: cz + hd };
}

/** Counter area in m² (excluding cut-outs). */
export function slabAreaSqm(slabs: Slab[], _overhang: number): number {
  void _overhang;
  return slabs.reduce((n, s) => {
    const a = ((s.x1 - s.x0) * (s.z1 - s.z0)) / 1e6;
    const cut = s.cutouts.reduce((c, k) => c + ((k.x1 - k.x0) * (k.z1 - k.z0)) / 1e6, 0);
    return n + a - cut;
  }, 0);
}
