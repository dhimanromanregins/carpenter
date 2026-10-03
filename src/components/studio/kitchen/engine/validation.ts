/**
 * Design-rule engine. It never mutates the design — it reports issues the UI
 * can show ("This cabinet overlaps another module", "Insufficient clearance").
 * Silent failure is deliberately avoided: impossible configurations are surfaced.
 */
import type { KitchenDesignConfig, ModuleInstance, ValidationIssue } from "../model/types";
import { getModuleType } from "../data/modules";
import { footprint, footprintWithFront, overlapArea, overlapsVertically, frontDir, type Rect } from "./geometry";

const MIN_AISLE = 900; // clear walkway between facing runs / island
const WORK_AISLE = 1000; // comfortable working aisle
const DOOR_REACH = 400; // how far an open drawer/door reaches in front of a module

let issueCounter = 0;
const issue = (severity: ValidationIssue["severity"], message: string, moduleIds: string[]): ValidationIssue => ({
  id: `v${issueCounter++}`,
  severity,
  message,
  moduleIds,
});

const isAppliance = (m: ModuleInstance) => {
  const k = getModuleType(m.typeId).kind;
  return k === "tall-fridge" || k === "tall-oven" || k === "base-hob" || k === "base-sink" || k === "base-dishwasher" || k === "base-washer" || k === "wall-chimney";
};

/** Distance (mm) between two rectangles along the axis where they face each other, or null when they don't. */
export function gapBetween(a: Rect, b: Rect): number | null {
  const overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const overlapZ = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0);
  if (overlapX > 100 && overlapZ <= 0) return -overlapZ;
  if (overlapZ > 100 && overlapX <= 0) return -overlapX;
  return null;
}

export function validateDesign(design: KitchenDesignConfig): ValidationIssue[] {
  issueCounter = 0;
  const { room, modules, style } = design;
  const issues: ValidationIssue[] = [];

  /* 1. room bounds & dimension limits */
  modules.forEach((m) => {
    const t = getModuleType(m.typeId);
    const f = footprint(m);
    if (f.x0 < -1 || f.z0 < -1 || f.x1 > room.width + 1 || f.z1 > room.depth + 1) {
      issues.push(issue("error", `${t.name} extends outside the room.`, [m.id]));
    }
    if (m.width < t.width.min - 10 || m.width > t.width.max + 10) {
      issues.push(issue("warning", `${t.name}: width ${Math.round(m.width)} mm is outside the ${t.width.min}–${t.width.max} mm range.`, [m.id]));
    }
    if (m.depth < t.depth.min - 10 || m.depth > t.depth.max + 10) {
      issues.push(issue("warning", `${t.name}: depth ${Math.round(m.depth)} mm is outside the ${t.depth.min}–${t.depth.max} mm range.`, [m.id]));
    }
    if (m.elevation + m.height > room.height + 0.5) {
      issues.push(issue("error", `${t.name} is taller than the room.`, [m.id]));
    }
    if (t.zone === "wall" && m.elevation < style.counterThickness + 450 + 400) {
      // wall cabinets need ≥ 450 mm above the counter for working space
    }
  });

  /* 2. overlaps (same vertical band) */
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const a = modules[i];
      const b = modules[j];
      if (!overlapsVertically(a, b)) continue;
      if (overlapArea(footprint(a), footprint(b)) > 400) {
        issues.push(issue("error", `${getModuleType(a.typeId).name} overlaps ${getModuleType(b.typeId).name}.`, [a.id, b.id]));
      }
    }
  }

  /* 3. clearance in front of floor-standing modules */
  const floor = modules.filter((m) => m.elevation < 100);
  floor.forEach((m) => {
    const reach = footprintWithFront(m, MIN_AISLE);
    const f = footprint(m);
    // only the strip in front of the module counts
    const [dx, dz] = frontDir(m.rot);
    const strip: Rect = dx > 0 ? { x0: f.x1, x1: reach.x1, z0: f.z0, z1: f.z1 } : dx < 0 ? { x0: reach.x0, x1: f.x0, z0: f.z0, z1: f.z1 } : dz > 0 ? { x0: f.x0, x1: f.x1, z0: f.z1, z1: reach.z1 } : { x0: f.x0, x1: f.x1, z0: reach.z0, z1: f.z0 };
    floor.forEach((o) => {
      if (o.id === m.id) return;
      const of = footprint(o);
      const w = Math.min(strip.x1, of.x1) - Math.max(strip.x0, of.x0);
      const d = Math.min(strip.z1, of.z1) - Math.max(strip.z0, of.z0);
      if (w > 150 && d > 150) {
        // only runs that face each other form an aisle; perpendicular neighbours are corners
        const [mx, mz] = frontDir(m.rot);
        const [ox, oz] = frontDir(o.rot);
        const facing = mx * ox + mz * oz === -1;
        if (facing && m.id < o.id) {
          const gap = gapBetween(f, of);
          if (gap !== null && gap > 1 && gap < MIN_AISLE) {
            issues.push(issue("error", `Insufficient clearance (${Math.round(gap)} mm) between facing cabinets — allow at least ${MIN_AISLE} mm.`, [m.id, o.id]));
          } else if (gap !== null && gap >= MIN_AISLE && gap < WORK_AISLE) {
            issues.push(issue("warning", `Tight walkway (${Math.round(gap)} mm). ${WORK_AISLE} mm is more comfortable.`, [m.id, o.id]));
          }
        }
      }
    });
    // blocked by a wall
    const wallGap =
      dx > 0 ? room.width - f.x1 : dx < 0 ? f.x0 : dz > 0 ? room.depth - f.z1 : f.z0;
    if (wallGap < 600 && m.run !== "tall" && !m.run.startsWith("tall")) {
      issues.push(issue("warning", `Only ${Math.round(wallGap)} mm in front of a ${getModuleType(m.typeId).name} — doors may not open fully.`, [m.id]));
    }
  });

  /* 4. appliance & work-triangle rules */
  const sink = modules.find((m) => getModuleType(m.typeId).kind === "base-sink");
  const hob = modules.find((m) => getModuleType(m.typeId).kind === "base-hob");
  const fridge = modules.find((m) => getModuleType(m.typeId).kind === "tall-fridge");
  if (!sink) issues.push(issue("warning", "There is no sink in this kitchen.", []));
  if (!hob) issues.push(issue("warning", "There is no hob in this kitchen.", []));
  if (!fridge) issues.push(issue("info", "No refrigerator enclosure has been placed.", []));
  if (sink && hob && fridge) {
    const c = (m: ModuleInstance): [number, number] => [m.x, m.z];
    const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]) / 1000;
    const total = dist(c(sink), c(hob)) + dist(c(hob), c(fridge)) + dist(c(fridge), c(sink));
    if (total > 7.9) issues.push(issue("warning", `Work triangle is ${total.toFixed(1)} m — keep it under 7.9 m for an efficient kitchen.`, [sink.id, hob.id, fridge.id]));
    else if (total < 2.4) issues.push(issue("warning", `Work triangle is only ${total.toFixed(1)} m — it may feel cramped.`, [sink.id, hob.id, fridge.id]));
  }
  if (sink && hob) {
    const fs = footprint(sink);
    const fh = footprint(hob);
    const gx = Math.max(fs.x0, fh.x0) - Math.min(fs.x1, fh.x1);
    const gz = Math.max(fs.z0, fh.z0) - Math.min(fs.z1, fh.z1);
    const gap = Math.max(gx, gz, 0);
    if (gap < 300) issues.push(issue("warning", "Sink and hob are very close — leave a prep area between them.", [sink.id, hob.id]));
  }

  // chimney must sit above a hob
  modules
    .filter((m) => getModuleType(m.typeId).kind === "wall-chimney")
    .forEach((c) => {
      const under = modules.find((m) => getModuleType(m.typeId).kind === "base-hob" && Math.abs(m.x - c.x) < 350 && Math.abs(m.z - c.z) < 350);
      if (!under) issues.push(issue("warning", "This chimney is not positioned above a hob.", [c.id]));
    });

  // appliances against service points
  const plumbing = room.points.filter((p) => p.kind === "plumbing");
  if (sink && plumbing.length) {
    const near = plumbing.some((p) => {
      const [px, pz] = pointPlan(p, room);
      return Math.hypot(px - sink.x, pz - sink.z) < 1800;
    });
    if (!near) issues.push(issue("info", "The sink is far from the plumbing point — extra pipework may be needed.", [sink.id]));
  }

  /* 5. heights */
  const topOfBase = style.plinthHeight + 720 + style.counterThickness;
  if (topOfBase < 800 || topOfBase > 950) {
    issues.push(issue("info", `Countertop height is ${Math.round(topOfBase)} mm; 850–950 mm is the usual working height.`, []));
  }
  if (style.wallCabinetBottom - topOfBase < 450) {
    issues.push(issue("warning", "Wall cabinets sit less than 450 mm above the counter — it will feel low to work under.", []));
  }

  /* 6. doors & windows vs cabinets */
  if (room.window.enabled) {
    const w = room.window;
    modules
      .filter((m) => m.elevation > 0)
      .forEach((m) => {
        const f = footprint(m);
        const along = wallAlong(w.wall, f, room);
        if (!along) return;
        const [a0, a1] = along;
        const overlapsWin = Math.min(a1, w.offset + w.width / 2) - Math.max(a0, w.offset - w.width / 2) > 50;
        if (overlapsWin && m.elevation < w.sill + w.height && m.elevation + m.height > w.sill) {
          issues.push(issue("warning", "A wall cabinet covers the window.", [m.id]));
        }
      });
  }

  // doors
  if (room.door.enabled) {
    const d = room.door;
    modules.forEach((m) => {
      const f = footprint(m);
      const along = wallAlong(d.wall, f, room);
      if (!along) return;
      const [a0, a1] = along;
      if (Math.min(a1, d.offset + d.width / 2) - Math.max(a0, d.offset - d.width / 2) > 50 && m.elevation < d.height) {
        issues.push(issue("error", "A cabinet blocks the door opening.", [m.id]));
      }
    });
  }

  // appliance doors (fridge) – swing clearance
  modules
    .filter((m) => getModuleType(m.typeId).kind === "tall-fridge")
    .forEach((m) => {
      const [dx, dz] = frontDir(m.rot);
      const f = footprint(m);
      const swing: Rect = dx > 0 ? { x0: f.x1, x1: f.x1 + 600, z0: f.z0, z1: f.z1 } : dx < 0 ? { x0: f.x0 - 600, x1: f.x0, z0: f.z0, z1: f.z1 } : dz > 0 ? { x0: f.x0, x1: f.x1, z0: f.z1, z1: f.z1 + 600 } : { x0: f.x0, x1: f.x1, z0: f.z0 - 600, z1: f.z0 };
      if (modules.some((o) => o.id !== m.id && o.elevation < 100 && overlapArea(swing, footprint(o)) > 20000)) {
        issues.push(issue("warning", "Insufficient clearance to open the refrigerator doors.", [m.id]));
      }
    });

  // unused appliance helper keeps the linter honest
  void DOOR_REACH;
  void isAppliance;
  return issues;
}

/** Plan position of a service point on its wall. */
export function pointPlan(p: { wall: string; offset: number }, room: { width: number; depth: number }): [number, number] {
  switch (p.wall) {
    case "back":
      return [p.offset, 0];
    case "front":
      return [p.offset, room.depth];
    case "left":
      return [0, p.offset];
    default:
      return [room.width, p.offset];
  }
}

/** Interval a footprint covers along a wall (null when it doesn't touch that wall). */
function wallAlong(wall: string, f: Rect, room: { width: number; depth: number }): [number, number] | null {
  const T = 30;
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
}

/** Clearance visualisation data: gaps between facing runs, for the "Show clearances" overlay. */
export interface ClearanceSpan {
  from: [number, number];
  to: [number, number];
  gap: number;
  ok: boolean;
}

export function clearanceSpans(design: KitchenDesignConfig): ClearanceSpan[] {
  const out: ClearanceSpan[] = [];
  const floor = design.modules.filter((m) => m.elevation < 100);
  for (let i = 0; i < floor.length; i++) {
    for (let j = i + 1; j < floor.length; j++) {
      // an aisle exists only between runs that face each other
      const [ax, az] = frontDir(floor[i].rot);
      const [bx, bz] = frontDir(floor[j].rot);
      if (ax * bx + az * bz !== -1) continue;
      const a = footprint(floor[i]);
      const b = footprint(floor[j]);
      const gap = gapBetween(a, b);
      if (gap === null || gap > 1800 || gap < 1) continue;
      const overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      if (overlapX > 100) {
        const x = (Math.max(a.x0, b.x0) + Math.min(a.x1, b.x1)) / 2;
        const z0 = a.z1 <= b.z0 ? a.z1 : b.z1;
        const z1 = a.z1 <= b.z0 ? b.z0 : a.z0;
        out.push({ from: [x, Math.min(z0, z1)], to: [x, Math.max(z0, z1)], gap, ok: gap >= MIN_AISLE });
      } else {
        const z = (Math.max(a.z0, b.z0) + Math.min(a.z1, b.z1)) / 2;
        const x0 = a.x1 <= b.x0 ? a.x1 : b.x1;
        const x1 = a.x1 <= b.x0 ? b.x0 : a.x0;
        out.push({ from: [Math.min(x0, x1), z], to: [Math.max(x0, x1), z], gap, ok: gap >= MIN_AISLE });
      }
    }
  }
  // de-duplicate near-identical spans
  const seen = new Set<string>();
  return out.filter((s) => {
    const key = `${Math.round(s.from[0] / 100)}-${Math.round(s.from[1] / 100)}-${Math.round(s.gap / 50)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Whether `candidate` can be placed without colliding. Used by drag / add / resize. */
export function canPlace(candidate: ModuleInstance, others: ModuleInstance[], room: { width: number; depth: number; height: number }): { ok: boolean; reason?: string } {
  const f = footprint(candidate);
  if (f.x0 < -1 || f.z0 < -1 || f.x1 > room.width + 1 || f.z1 > room.depth + 1) return { ok: false, reason: "That position is outside the room." };
  for (const o of others) {
    if (o.id === candidate.id) continue;
    if (!overlapsVertically(candidate, o)) continue;
    if (overlapArea(f, footprint(o)) > 400) return { ok: false, reason: "This cabinet overlaps another module." };
  }
  return { ok: true };
}
