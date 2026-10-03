/** Camera pose maths shared by the orbit rig, focus transitions and presentation mode. */
import type { KitchenDesignConfig, ModuleInstance } from "../model/types";
import { getModuleType } from "../data/modules";
import { frontDir } from "../engine/geometry";
import { mm } from "../model/units";

export type V3 = [number, number, number];
export interface Pose {
  pos: V3;
  target: V3;
}

const kindOf = (m: ModuleInstance) => getModuleType(m.typeId).kind;

export function findModule(design: KitchenDesignConfig, kinds: string[]): ModuleInstance | undefined {
  return design.modules.find((m) => kinds.includes(kindOf(m)));
}

/** Pose that looks at a module from its front. */
export function focusPose(design: KitchenDesignConfig, m: ModuleInstance, distance = 1.7): Pose {
  const [fx, fz] = frontDir(m.rot);
  const cx = mm(m.x);
  const cz = mm(m.z);
  const cy = mm(m.elevation) + mm(m.height) / 2;
  const W = mm(design.room.width);
  const D = mm(design.room.depth);
  const clampIn = (v: number, hi: number) => Math.min(hi - 0.15, Math.max(0.15, v));
  // wall units hang above eye level of a counter view — aim at the unit itself and step back a little
  const high = m.elevation > 500;
  const dist = high ? distance * 1.35 : distance;
  return {
    target: [cx, high ? cy : Math.min(cy, 1.3), cz],
    pos: [clampIn(cx + fx * (dist + mm(m.depth) / 2), W), high ? Math.min(1.75, Math.max(1.35, cy - 0.35)) : Math.max(1.15, Math.min(1.6, cy + 0.3)), clampIn(cz + fz * (dist + mm(m.depth) / 2), D)],
  };
}

export function poseFor(name: string, design: KitchenDesignConfig, ortho = false): Pose {
  const W = mm(design.room.width);
  const D = mm(design.room.depth);
  const H = mm(design.room.height);
  const dist = Math.max(W, D) * 1.45 + 2.0;
  const mid: V3 = [W / 2, 0.9, D / 2];
  const main = design.modules.find((m) => m.run === "main" && m.elevation < 100) ?? design.modules.find((m) => m.elevation < 100);

  switch (name) {
    case "front":
      return { target: [W / 2, H * 0.42, 0], pos: [W / 2, H * 0.42, D + (ortho ? 12 : dist)] };
    case "top":
      return { target: [W / 2, 0, D / 2], pos: [W / 2, H + (ortho ? 12 : dist), D / 2 + 0.001] };
    case "left":
      return { target: [W / 2, H * 0.42, D / 2], pos: [-(ortho ? 12 : dist), H * 0.42, D / 2] };
    case "right":
      return { target: [W / 2, H * 0.42, D / 2], pos: [W + (ortho ? 12 : dist), H * 0.42, D / 2] };
    case "eye": {
      const door = design.room.door;
      const x = door.enabled && door.wall === "front" ? mm(door.offset) : W / 2;
      return { target: [W / 2, 1.25, D * 0.1], pos: [x, 1.65, Math.max(D - 0.4, D * 0.9)] };
    }
    case "wide":
      return { target: [W / 2, 1.0, D / 2], pos: [W * 0.96, Math.min(H - 0.2, 2.3), D * 0.97] };
    case "cabinet": {
      // the middle of the main run, from across the aisle
      const run = design.modules.filter((m) => m.run === "main" && m.elevation < 100);
      if (!run.length) return { target: mid, pos: [W / 2, 1.3, D] };
      const cx = run.reduce((n, m) => n + m.x, 0) / run.length;
      const cz = run.reduce((n, m) => n + m.z, 0) / run.length;
      const [fx, fz] = frontDir(run[0].rot);
      const clampIn = (v: number, hi: number) => Math.min(hi - 0.2, Math.max(0.2, v));
      return { target: [mm(cx), 1.0, mm(cz)], pos: [clampIn(mm(cx) + fx * 3.0, W), 1.55, clampIn(mm(cz) + fz * 3.0, D)] };
    }
    case "countertop": {
      // a three-quarter view along the work surface, from a little way back
      const run = design.modules.filter((m) => m.run === "main" && m.elevation < 100);
      if (!run.length) return { target: mid, pos: [W / 2, 1.4, D] };
      const cx = run.reduce((n, m) => n + m.x, 0) / run.length;
      const cz = run.reduce((n, m) => n + m.z, 0) / run.length;
      const [fx, fz] = frontDir(run[0].rot);
      const clampIn = (v: number, hi: number) => Math.min(hi - 0.2, Math.max(0.2, v));
      return { target: [mm(cx), 0.95, mm(cz)], pos: [clampIn(mm(cx) + fx * 1.7 - fz * 0.8, W), 1.45, clampIn(mm(cz) + fz * 1.7 + fx * 0.8, D)] };
    }
    case "interior": {
      const m = findModule(design, ["base-drawers", "base-cutlery", "tall-pantry"]) ?? main;
      if (!m) return { target: mid, pos: [W / 2, 1.3, D] };
      const p = focusPose(design, m, 0.95);
      return { target: [mm(m.x), 0.65, mm(m.z)], pos: [p.pos[0], 1.25, p.pos[2]] };
    }
    case "island": {
      const isl = design.modules.filter((m) => m.run === "island");
      if (!isl.length) return poseFor("cabinet", design);
      const cx = isl.reduce((n, m) => n + m.x, 0) / isl.length;
      return { target: [mm(cx), 0.9, mm(isl[0].z)], pos: [mm(cx) + 1.4, 1.9, mm(isl[0].z) + 2.6] };
    }
    default: {
      // perspective: a three-quarter view from the front-right, slightly elevated
      return { target: mid, pos: [W / 2 + dist * 0.32, dist * 0.5 + 0.5, D / 2 + dist * 0.82] };
    }
  }
}

export interface PresentStep {
  label: string;
  pose: Pose;
  /** Keys to open when the step starts. */
  open?: string[];
}

export function presentationSteps(design: KitchenDesignConfig): PresentStep[] {
  const steps: PresentStep[] = [{ label: "The kitchen", pose: poseFor("wide", design) }];
  const island = design.modules.filter((m) => m.run === "island");
  if (island.length) steps.push({ label: "Island", pose: poseFor("island", design) });
  steps.push({ label: "Countertop & backsplash", pose: poseFor("countertop", design) });

  const tall = findModule(design, ["tall-fridge", "tall-storage", "tall-utility"]);
  if (tall) steps.push({ label: "Tall units", pose: focusPose(design, tall, 2.2) });
  const pantry = findModule(design, ["tall-pantry"]);
  if (pantry) steps.push({ label: "Pantry", pose: focusPose(design, pantry, 1.7), open: [`${pantry.id}:pantry`] });
  const drawers = findModule(design, ["base-drawers", "base-cutlery"]);
  if (drawers) steps.push({ label: "Drawers & organisers", pose: { target: [mm(drawers.x), 0.55, mm(drawers.z)], pos: focusPose(design, drawers, 1.1).pos }, open: [`${drawers.id}:drawer0`, `${drawers.id}:drawer1`] });
  const bottle = findModule(design, ["base-bottle", "base-corner"]);
  if (bottle) steps.push({ label: "Pull-outs & corner hardware", pose: focusPose(design, bottle, 1.5), open: [`${bottle.id}:bottle`, `${bottle.id}:corner`] });
  const sink = findModule(design, ["base-sink"]);
  if (sink) steps.push({ label: "Sink", pose: focusPose(design, sink, 1.6), open: [`${sink.id}:faucet`] });
  const oven = findModule(design, ["tall-oven"]);
  if (oven) steps.push({ label: "Built-in appliances", pose: focusPose(design, oven, 1.8), open: [`${oven.id}:oven`] });
  steps.push({ label: "The finished kitchen", pose: { ...poseFor("wide", design), pos: [mm(design.room.width) * 0.12, 2.0, mm(design.room.depth) * 0.95] } });
  return steps;
}
