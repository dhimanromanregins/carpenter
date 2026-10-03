/**
 * Snapping & docking, shared by the floor plan and by dragging in the 3D view.
 *
 *  - snapPosition: nudges a module's edges onto walls / neighbouring modules (45 mm), else a 5 mm grid.
 *  - dockModule:   turns a free pointer position into a valid resting place — base units dock to a
 *                  nearby wall (and turn to face the room), wall and tall units always sit on a wall.
 */
import type { ModuleInstance, Room, Rotation } from "../model/types";
import { getModuleType } from "../data/modules";
import { footprint } from "./geometry";
import { clamp, snap } from "../model/units";

const TOL = 45;

export function snapPosition(m: ModuleInstance, x: number, z: number, others: ModuleInstance[], room: { width: number; depth: number }): { x: number; z: number } {
  const f = footprint({ ...m, x, z });
  const w = f.x1 - f.x0;
  const d = f.z1 - f.z0;
  let nx = snap(x, 5);
  let nz = snap(z, 5);
  const xEdges: number[] = [0, room.width];
  const zEdges: number[] = [0, room.depth];
  others.forEach((o) => {
    if (o.id === m.id) return;
    const r = footprint(o);
    xEdges.push(r.x0, r.x1);
    zEdges.push(r.z0, r.z1);
  });
  let bestX = TOL;
  xEdges.forEach((e) => {
    const a = Math.abs(f.x0 - e);
    const b = Math.abs(f.x1 - e);
    if (a < bestX) {
      bestX = a;
      nx = e + w / 2;
    }
    if (b < bestX) {
      bestX = b;
      nx = e - w / 2;
    }
  });
  let bestZ = TOL;
  zEdges.forEach((e) => {
    const a = Math.abs(f.z0 - e);
    const b = Math.abs(f.z1 - e);
    if (a < bestZ) {
      bestZ = a;
      nz = e + d / 2;
    }
    if (b < bestZ) {
      bestZ = b;
      nz = e - d / 2;
    }
  });
  return { x: nx, z: nz };
}

export interface Placement {
  x: number;
  z: number;
  rot: Rotation;
  /** Wall it docked to, or null when free-standing. */
  wall: "back" | "front" | "left" | "right" | null;
}

/** Where a module dropped / dragged to (x, z) actually rests. `freeRot` is used when it stays free-standing. */
export function dockModule(m: ModuleInstance, x: number, z: number, room: Room, others: ModuleInstance[], freeRot: Rotation = m.rot): Placement {
  const zone = getModuleType(m.typeId).zone;
  const mustDock = zone === "wall" || zone === "tall";
  const d = m.depth;
  const walls = [
    { wall: "back" as const, v: z, rot: 0 as Rotation },
    { wall: "front" as const, v: room.depth - z, rot: 180 as Rotation },
    { wall: "left" as const, v: x, rot: 90 as Rotation },
    { wall: "right" as const, v: room.width - x, rot: 270 as Rotation },
  ].sort((a, b) => a.v - b.v);
  const near = walls[0];

  if (mustDock || near.v < d / 2 + 260) {
    const probe = { ...m, rot: near.rot };
    const hw = m.width / 2;
    let px = x;
    let pz = z;
    if (near.wall === "back" || near.wall === "front") {
      px = clamp(x, hw, room.width - hw);
      pz = near.wall === "back" ? d / 2 : room.depth - d / 2;
    } else {
      pz = clamp(z, hw, room.depth - hw);
      px = near.wall === "left" ? d / 2 : room.width - d / 2;
    }
    const s = snapPosition({ ...probe, x: px, z: pz }, px, pz, others, room);
    // keep the docked axis fixed; only the along-wall axis snaps to neighbours
    if (near.wall === "back" || near.wall === "front") return { x: s.x, z: pz, rot: near.rot, wall: near.wall };
    return { x: px, z: s.z, rot: near.rot, wall: near.wall };
  }

  const swap = freeRot === 90 || freeRot === 270;
  const hx = (swap ? d : m.width) / 2;
  const hz = (swap ? m.width : d) / 2;
  const cx = clamp(x, hx, room.width - hx);
  const cz = clamp(z, hz, room.depth - hz);
  const s = snapPosition({ ...m, rot: freeRot, x: cx, z: cz }, cx, cz, others, room);
  return { x: s.x, z: s.z, rot: freeRot, wall: null };
}
