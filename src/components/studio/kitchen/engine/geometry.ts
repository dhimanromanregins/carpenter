import type { ModuleInstance, Rotation } from "../model/types";
import { rotToRad } from "../model/units";

export interface Rect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/** Plan-view direction the module's front points to (rot 0 faces +z). */
export function frontDir(rot: Rotation): [number, number] {
  const a = rotToRad(rot);
  return [Math.round(Math.sin(a)), Math.round(Math.cos(a))];
}

/** Axis-aligned footprint of a module in plan (mm). */
export function footprint(m: Pick<ModuleInstance, "x" | "z" | "rot" | "width" | "depth">): Rect {
  const swap = m.rot === 90 || m.rot === 270;
  const hw = (swap ? m.depth : m.width) / 2;
  const hd = (swap ? m.width : m.depth) / 2;
  return { x0: m.x - hw, x1: m.x + hw, z0: m.z - hd, z1: m.z + hd };
}

/** Footprint extended in front by `reach` mm (door / drawer swing). */
export function footprintWithFront(m: ModuleInstance, reach: number): Rect {
  const f = footprint(m);
  const [dx, dz] = frontDir(m.rot);
  if (dx > 0) return { ...f, x1: f.x1 + reach };
  if (dx < 0) return { ...f, x0: f.x0 - reach };
  if (dz > 0) return { ...f, z1: f.z1 + reach };
  return { ...f, z0: f.z0 - reach };
}

export function overlapArea(a: Rect, b: Rect): number {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const d = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0);
  return w > 0 && d > 0 ? w * d : 0;
}

/** Vertical extent [bottom, top] of a module (mm). */
export function verticalSpan(m: ModuleInstance): [number, number] {
  return [m.elevation, m.elevation + m.height];
}

export function overlapsVertically(a: ModuleInstance, b: ModuleInstance): boolean {
  const [a0, a1] = verticalSpan(a);
  const [b0, b1] = verticalSpan(b);
  return Math.min(a1, b1) - Math.max(a0, b0) > 1;
}

/** Convert a point in a module's local frame (x right, z front) to plan coordinates. */
export function localToPlan(m: Pick<ModuleInstance, "x" | "z" | "rot">, lx: number, lz: number): [number, number] {
  const a = rotToRad(m.rot);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [m.x + lx * c + lz * s, m.z - lx * s + lz * c];
}

export const centre = (r: Rect): [number, number] => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
export const sizeOf = (r: Rect): [number, number] => [r.x1 - r.x0, r.z1 - r.z0];
