/**
 * Services engine: where the switches & sockets go, and how the wiring,
 * plumbing and gas run.
 *
 *  - planElectrical(design)  → ElectricalPoint[]   (the placements; stored in the design, editable)
 *  - planRoutes(design)      → ServiceRoutes       (derived every time; drawn in the wiring / plumbing views)
 *
 * Routes follow the room perimeter — the way conduit and pipes really run: along
 * the wall/ceiling junction (electrical), or low along the walls (plumbing, gas) —
 * then drop or rise to each point. Everything here is INDICATIVE; the legend says so.
 */
import type { ElectricalPoint, KitchenDesignConfig, ModuleInstance, Room, WallSide } from "../model/types";
import { getModuleType } from "../data/modules";
import { frontDir } from "./geometry";
import { uid } from "../model/units";

export type Vec3 = [number, number, number];

export interface Route {
  id: string;
  system: "electrical" | "plumbing" | "gas";
  sub: "lighting" | "power" | "heavy" | "cold" | "hot" | "drain" | "gas";
  color: string;
  label: string;
  spec: string;
  /** Metres. Drawn in order, so animated flow runs from the first point to the last. */
  points: Vec3[];
  width: number;
}

export interface RouteMarker {
  id: string;
  pos: Vec3;
  label: string;
  color: string;
}

export interface LegendEntry {
  system: Route["system"];
  color: string;
  label: string;
  spec: string;
}

export interface ServiceRoutes {
  routes: Route[];
  markers: RouteMarker[];
  legend: LegendEntry[];
}

export const SERVICE_COLORS = {
  lighting: "#ffd84a",
  power: "#ff4d4d",
  heavy: "#ff8a3c",
  cold: "#4aa3ff",
  hot: "#ff7ab8",
  drain: "#9aa3ad",
  gas: "#7ddc6b",
} as const;

const mm = (v: number) => v / 1000;

/* ───────────────────────── wall maths ───────────────────────── */

export const wallLength = (room: Room, wall: WallSide) => (wall === "back" || wall === "front" ? room.width : room.depth);

/** Plan position (mm) of a point on a wall. */
export function wallXZ(room: Room, wall: WallSide, offset: number): [number, number] {
  switch (wall) {
    case "back":
      return [offset, 0];
    case "front":
      return [offset, room.depth];
    case "left":
      return [0, offset];
    default:
      return [room.width, offset];
  }
}

export function wallNormal(wall: WallSide): [number, number] {
  switch (wall) {
    case "back":
      return [0, 1];
    case "front":
      return [0, -1];
    case "left":
      return [1, 0];
    default:
      return [-1, 0];
  }
}

/** Which wall a floor-standing module's back is against (and where along it), or null. */
export function moduleWall(m: ModuleInstance, room: Room): { wall: WallSide; offset: number } | null {
  const T = 40;
  if (m.rot === 0 && m.z - m.depth / 2 <= T) return { wall: "back", offset: m.x };
  if (m.rot === 180 && m.z + m.depth / 2 >= room.depth - T) return { wall: "front", offset: m.x };
  if (m.rot === 90 && m.x - m.depth / 2 <= T) return { wall: "left", offset: m.z };
  if (m.rot === 270 && m.x + m.depth / 2 >= room.width - T) return { wall: "right", offset: m.z };
  return null;
}

/* ───────────────────────── perimeter routing ───────────────────────── */

/** Distance along the room perimeter, starting at the back-left corner and running clockwise. */
function toS(room: Room, wall: WallSide, offset: number): number {
  const W = room.width;
  const D = room.depth;
  switch (wall) {
    case "back":
      return offset;
    case "right":
      return W + offset;
    case "front":
      return W + D + (W - offset);
    default:
      return 2 * W + D + (D - offset);
  }
}

function fromS(room: Room, s: number): [number, number] {
  const W = room.width;
  const D = room.depth;
  const P = 2 * (W + D);
  const t = ((s % P) + P) % P;
  if (t <= W) return [t, 0];
  if (t <= W + D) return [W, t - W];
  if (t <= 2 * W + D) return [W - (t - W - D), D];
  return [0, D - (t - 2 * W - D)];
}

/** Corner points between two perimeter positions, going whichever way round is shorter. */
function perimeterPath(room: Room, s0: number, s1: number): [number, number][] {
  const W = room.width;
  const D = room.depth;
  const P = 2 * (W + D);
  const corners = [0, W, W + D, 2 * W + D];
  const fwd = (((s1 - s0) % P) + P) % P;
  const goForward = fwd <= P / 2;
  const out: [number, number][] = [fromS(room, s0)];
  const dist = goForward ? fwd : P - fwd;
  const stepCorners = corners
    .map((c) => ({ c, d: goForward ? (((c - s0) % P) + P) % P : (((s0 - c) % P) + P) % P }))
    .filter((x) => x.d > 1 && x.d < dist - 1)
    .sort((a, b) => a.d - b.d);
  stepCorners.forEach((x) => out.push(fromS(room, x.c)));
  out.push(fromS(room, s1));
  return out;
}

/** Shift a perimeter point `inset` metres into the room so lines sit just off the wall. */
function inset(room: Room, x: number, z: number, d: number): [number, number] {
  let nx = x;
  let nz = z;
  if (x <= 1) nx = x + d * 1000;
  else if (x >= room.width - 1) nx = x - d * 1000;
  if (z <= 1) nz = z + d * 1000;
  else if (z >= room.depth - 1) nz = z - d * 1000;
  return [nx, nz];
}

interface Anchor {
  wall: WallSide;
  offset: number;
  /** metres */
  height: number;
}

const dedupe = (pts: Vec3[]): Vec3[] => pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) > 0.002);

/** Wall point → up/down to the run height → around the perimeter → up/down to the target. */
function route(room: Room, from: Anchor, to: Anchor, runHeight: number, ins: number): Vec3[] {
  const [fx, fz] = wallXZ(room, from.wall, from.offset);
  const [tx, tz] = wallXZ(room, to.wall, to.offset);
  const path = perimeterPath(room, toS(room, from.wall, from.offset), toS(room, to.wall, to.offset));
  const pts: Vec3[] = [];
  const first = inset(room, fx, fz, ins);
  pts.push([mm(first[0]), from.height, mm(first[1])]);
  path.forEach(([x, z]) => {
    const [ix, iz] = inset(room, x, z, ins);
    pts.push([mm(ix), runHeight, mm(iz)]);
  });
  const last = inset(room, tx, tz, ins);
  pts.push([mm(last[0]), to.height, mm(last[1])]);
  return dedupe(pts);
}

/** As `route`, but ending at a free-standing point (island) reached straight across the floor / ceiling. */
function routeToFree(room: Room, from: Anchor, x: number, z: number, runHeight: number, endHeight: number, ins: number): Vec3[] {
  const [fx, fz] = wallXZ(room, from.wall, from.offset);
  const a = inset(room, fx, fz, ins);
  return dedupe([
    [mm(a[0]), from.height, mm(a[1])],
    [mm(a[0]), runHeight, mm(a[1])],
    [mm(x), runHeight, mm(a[1])],
    [mm(x), runHeight, mm(z)],
    [mm(x), endHeight, mm(z)],
  ]);
}

/* ───────────────────────── electrical placements ───────────────────────── */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Wire size / MCB for a load, shown in the legend. Indicative only. */
export function wireSpec(amps: number): string {
  if (amps >= 25) return `${amps} A MCB · 6 mm² copper`;
  if (amps >= 16) return `${amps} A MCB · 2.5 mm² copper`;
  return `${amps} A MCB · 1.5 mm² copper`;
}

export function planElectrical(design: KitchenDesignConfig): ElectricalPoint[] {
  const { room, modules, lighting: L, style } = design;
  const pts: ElectricalPoint[] = [];
  const add = (p: Omit<ElectricalPoint, "id">) => pts.push({ id: uid("e"), ...p });

  // distribution board and switch board flank the door
  const door = room.door.enabled ? room.door : null;
  const dbWall: WallSide = door?.wall ?? "front";
  const len = wallLength(room, dbWall);
  const dbOffset = door ? clamp(door.offset + door.width / 2 + 230, 180, len - 180) : clamp(len - 400, 180, len - 180);
  const swOffset = door ? clamp(door.offset - door.width / 2 - 200, 180, len - 180) : clamp(400, 180, len - 180);
  add({ kind: "db", wall: dbWall, offset: dbOffset, height: 1800, label: "Distribution board", circuit: "power" });
  const switches = Math.min(8, 2 + (L.ceiling ? 1 : 0) + (L.spots ? 1 : 0) + (L.pendants ? 1 : 0) + (L.underCabinet ? 1 : 0) + (L.toeKick ? 1 : 0));
  add({ kind: "switchboard", wall: dbWall, offset: swOffset, height: 1200, label: "Switch board", circuit: "lighting", switches });

  // counter sockets, spaced along every wall run (not behind the hob / sink / tall units)
  const floor = modules.filter((m) => m.elevation < 100);
  const byWall = new Map<WallSide, { m: ModuleInstance; offset: number }[]>();
  floor.forEach((m) => {
    const t = getModuleType(m.typeId);
    if (t.zone === "tall") return;
    const w = moduleWall(m, room);
    if (!w) return;
    byWall.set(w.wall, [...(byWall.get(w.wall) ?? []), { m, offset: w.offset }]);
  });
  byWall.forEach((list, wall) => {
    list.sort((a, b) => a.offset - b.offset);
    let last = -Infinity;
    list.forEach(({ m, offset }) => {
      const kind = getModuleType(m.typeId).kind;
      if (["base-hob", "base-sink", "base-dishwasher", "base-washer", "filler", "base-bottle", "base-dustbin"].includes(kind)) return;
      if (offset - last < 900) return;
      last = offset;
      add({ kind: "socket", wall, offset, height: 1150, label: "Counter socket", circuit: "power", amps: 16 });
    });
  });

  // dedicated appliance points
  modules.forEach((m) => {
    const t = getModuleType(m.typeId);
    const w = moduleWall(m, room);
    const make = (label: string, height: number, amps: number, circuit: ElectricalPoint["circuit"] = "heavy", dx = 0) => {
      if (!w) return;
      add({ kind: "appliance", wall: w.wall, offset: w.offset + dx, height, label, circuit, amps, moduleId: m.id });
    };
    switch (t.kind) {
      case "base-hob":
        if (style.hobType === "hob-induction") make("Induction hob", 300, 32);
        else make("Hob ignition", 1000, 5, "power");
        break;
      case "wall-chimney": {
        if (!w) break;
        add({ kind: "appliance", wall: w.wall, offset: w.offset, height: Math.min(room.height - 150, m.elevation + m.height - 100), label: "Chimney", circuit: "heavy", amps: 5, moduleId: m.id });
        break;
      }
      case "tall-fridge":
        make("Refrigerator", 350, 16);
        break;
      case "tall-oven":
        make(m.typeId === "tall-oven" ? "Built-in oven" : "Microwave", 850, 16);
        break;
      case "wall-microwave":
        if (w) add({ kind: "appliance", wall: w.wall, offset: w.offset, height: m.elevation + 250, label: "Microwave", circuit: "heavy", amps: 16, moduleId: m.id });
        break;
      case "base-dishwasher":
        make("Dishwasher", 300, 16);
        break;
      case "base-washer":
        make("Washing machine", 300, 16);
        break;
      case "base-sink":
        make("Water purifier", 1300, 5, "power", w && w.offset > 600 ? -420 : 420);
        break;
      default:
        break;
    }
  });

  // pop-up socket on the island
  const island = modules.filter((m) => m.run === "island");
  if (island.length) {
    const cx = island.reduce((n, m) => n + m.x, 0) / island.length;
    const cz = island[0].z;
    add({ kind: "popup", wall: "free", offset: 0, x: cx, z: cz, height: 880, label: "Island pop-up socket", circuit: "power", amps: 16 });
  }
  return pts;
}

/* ───────────────────────── routes ───────────────────────── */

const anchorOf = (p: ElectricalPoint): Anchor | null => (p.wall === "free" ? null : { wall: p.wall, offset: p.offset, height: mm(p.height) });

export function planRoutes(design: KitchenDesignConfig): ServiceRoutes {
  const { room, modules, style, lighting: L } = design;
  const H = mm(room.height);
  const W = room.width;
  const D = room.depth;
  const routes: Route[] = [];
  const markers: RouteMarker[] = [];
  const legend: LegendEntry[] = [];
  const pts = design.electrical;
  const db = pts.find((p) => p.kind === "db");
  const board = pts.find((p) => p.kind === "switchboard");
  const addLegend = (system: Route["system"], color: string, label: string, spec: string) => {
    if (!legend.some((l) => l.label === label)) legend.push({ system, color, label, spec });
  };

  /* ── electrical ── */
  if (db) {
    const dbA = anchorOf(db)!;
    markers.push({ id: "m-db", pos: wallPos(room, dbA, 0.04), label: "Distribution board", color: SERVICE_COLORS.heavy });

    // lighting: DB → switch board, then up and around the ceiling lights
    if (board) {
      const bA = anchorOf(board)!;
      routes.push({ id: "r-light-feed", system: "electrical", sub: "lighting", color: SERVICE_COLORS.lighting, label: "Lighting circuit", spec: wireSpec(6), width: 3, points: route(room, dbA, bA, H - 0.07, 0.025) });
      const ceilY = H - 0.04;
      const cols = Math.max(2, Math.round(W / 1500));
      const rows = Math.max(2, Math.round(D / 1500));
      const chain: Vec3[] = [];
      for (let j = 0; j < rows; j++) {
        const order = j % 2 === 0 ? [...Array(cols).keys()] : [...Array(cols).keys()].reverse();
        order.forEach((i) => chain.push([mm((W * (i + 0.5)) / cols), ceilY, mm((D * (j + 0.5)) / rows)]));
      }
      const [bx, bz] = wallXZ(room, bA.wall, bA.offset);
      const bi = inset(room, bx, bz, 0.025);
      const drop: Vec3[] = [[mm(bi[0]), bA.height, mm(bi[1])], [mm(bi[0]), H - 0.07, mm(bi[1])], [mm(bi[0]), ceilY, mm(bi[1])]];
      if (L.ceiling || L.spots) routes.push({ id: "r-light-ceil", system: "electrical", sub: "lighting", color: SERVICE_COLORS.lighting, label: "Lighting circuit", spec: wireSpec(6), width: 3, points: dedupe([...drop, ...chain]) });
      else routes.push({ id: "r-light-drop", system: "electrical", sub: "lighting", color: SERVICE_COLORS.lighting, label: "Lighting circuit", spec: wireSpec(6), width: 3, points: dedupe(drop) });
      addLegend("electrical", SERVICE_COLORS.lighting, "Lighting circuit", wireSpec(6));

      // under-cabinet / cove LED drivers: a spur along the wall cabinets
      const wallRun = modules.filter((m) => getModuleType(m.typeId).zone === "wall" && getModuleType(m.typeId).kind !== "wall-loft");
      if ((L.underCabinet || L.cove) && wallRun.length) {
        const m0 = wallRun[Math.floor(wallRun.length / 2)];
        const w = moduleWall(m0, room) ?? moduleWallFromWallUnit(m0, room);
        if (w) {
          const a = route(room, bA, { wall: w.wall, offset: w.offset, height: mm(m0.elevation) - 0.05 }, H - 0.1, 0.045);
          routes.push({ id: "r-led", system: "electrical", sub: "lighting", color: SERVICE_COLORS.lighting, label: "LED driver feed", spec: "Low-voltage LED drivers on the lighting circuit", width: 2, points: a });
          markers.push({ id: "m-led", pos: a[a.length - 1], label: "LED driver", color: SERVICE_COLORS.lighting });
          addLegend("electrical", SERVICE_COLORS.lighting, "LED driver feed", "From the lighting circuit");
        }
      }
      // pendants over the island
      const island = modules.filter((m) => m.run === "island");
      if (island.length && L.pendants) {
        const cx = island.reduce((n, m) => n + m.x, 0) / island.length;
        const p = routeToFree(room, bA, cx, island[0].z, H - 0.07, H - 0.02, 0.025);
        routes.push({ id: "r-pend", system: "electrical", sub: "lighting", color: SERVICE_COLORS.lighting, label: "Lighting circuit", spec: wireSpec(6), width: 3, points: p });
      }
    }

    // power: ring through every counter socket
    const sockets = pts
      .filter((p) => p.kind === "socket" || p.kind === "popup")
      .map((p) => ({ p, s: p.wall === "free" ? Infinity : toS(room, p.wall, p.offset) }))
      .sort((a, b) => a.s - b.s);
    if (sockets.length) {
      let acc: Vec3[] = [];
      let prev: Anchor = dbA;
      sockets.forEach(({ p }) => {
        const a = anchorOf(p);
        const leg = a ? route(room, prev, a, H - 0.16, 0.035) : routeToFree(room, prev, p.x ?? W / 2, p.z ?? D / 2, H - 0.16, mm(p.height), 0.035);
        acc = dedupe([...acc, ...leg]);
        if (a) prev = a;
      });
      routes.push({ id: "r-power", system: "electrical", sub: "power", color: SERVICE_COLORS.power, label: "Power circuit — counter sockets", spec: wireSpec(16) + " + RCCB", width: 3, points: acc });
      addLegend("electrical", SERVICE_COLORS.power, "Power circuit — counter sockets", wireSpec(16) + " + RCCB");
    }

    // heavy / dedicated appliance circuits, each on its own route
    let idx = 0;
    pts
      .filter((p) => p.kind === "appliance")
      .forEach((p) => {
        const a = anchorOf(p);
        if (!a) return;
        const amps = p.amps ?? 16;
        const color = amps >= 25 ? SERVICE_COLORS.heavy : p.circuit === "heavy" ? SERVICE_COLORS.heavy : SERVICE_COLORS.power;
        routes.push({ id: `r-${p.id}`, system: "electrical", sub: "heavy", color, label: `${p.label} circuit`, spec: wireSpec(amps), width: 3, points: route(room, dbA, a, H - 0.2 - idx * 0.025, 0.05 + idx * 0.012) });
        addLegend("electrical", color, `${p.label} circuit`, wireSpec(amps));
        markers.push({ id: `m-${p.id}`, pos: wallPos(room, a, 0.03), label: p.label, color });
        idx++;
      });
  }

  /* ── plumbing & gas ── */
  const source = design.room.points.find((p) => p.kind === "plumbing") ?? { wall: "back" as WallSide, offset: Math.min(1500, W - 300), height: 500 };
  const drainPt = design.room.points.find((p) => p.kind === "drain") ?? source;
  const gasPt = design.room.points.find((p) => p.kind === "gas");
  const src: Anchor = { wall: source.wall, offset: source.offset, height: 0.3 };
  markers.push({ id: "m-water", pos: wallPos(room, { ...src, height: 0.3 }, 0.04), label: "Water inlet", color: SERVICE_COLORS.cold });
  const drainA: Anchor = { wall: drainPt.wall, offset: drainPt.offset, height: 0.1 };
  markers.push({ id: "m-drain", pos: wallPos(room, drainA, 0.05), label: "Drain / waste stack", color: SERVICE_COLORS.drain });

  const consumers = modules.filter((m) => ["base-sink", "base-dishwasher", "base-washer"].includes(getModuleType(m.typeId).kind));
  consumers.forEach((m, i) => {
    const kind = getModuleType(m.typeId).kind;
    const name = kind === "base-sink" ? "Sink" : kind === "base-dishwasher" ? "Dishwasher" : "Washing machine";
    const w = moduleWall(m, room);
    const targetH = (h: number) => (w ? { wall: w.wall, offset: w.offset, height: h } : null);
    const cold = targetH(0.42);
    const hot = targetH(0.48);
    const drain = targetH(0.2);
    const free = (h: number) => routeToFree(room, { ...src, height: 0.3 }, m.x, m.z, h, h, 0.03 + i * 0.01);
    routes.push({
      id: `r-cold-${m.id}`,
      system: "plumbing",
      sub: "cold",
      color: SERVICE_COLORS.cold,
      label: `Cold water — ${name}`,
      spec: "15 mm CPVC / PEX with isolation valve",
      width: 3,
      points: cold ? route(room, { ...src, height: 0.3 }, cold, 0.3, 0.03 + i * 0.01) : free(0.25),
    });
    addLegend("plumbing", SERVICE_COLORS.cold, "Cold water supply", "15 mm CPVC / PEX with isolation valve");
    if (kind === "base-sink") {
      routes.push({
        id: `r-hot-${m.id}`,
        system: "plumbing",
        sub: "hot",
        color: SERVICE_COLORS.hot,
        label: "Hot water — Sink",
        spec: "15 mm CPVC, insulated",
        width: 3,
        points: hot ? route(room, { ...src, height: 0.36 }, hot, 0.36, 0.055) : free(0.36),
      });
      addLegend("plumbing", SERVICE_COLORS.hot, "Hot water supply", "15 mm CPVC, insulated");
    }
    const dr = drain ? route(room, drain, drainA, 0.14 - i * 0.01, 0.07 + i * 0.012) : routeToFree(room, drainA, m.x, m.z, 0.1, 0.1, 0.07).reverse();
    routes.push({ id: `r-drain-${m.id}`, system: "plumbing", sub: "drain", color: SERVICE_COLORS.drain, label: `Waste — ${name}`, spec: "40 mm PVC, 1:40 fall towards the stack", width: 4, points: dr });
    addLegend("plumbing", SERVICE_COLORS.drain, "Waste / drain", "40 mm PVC, 1:40 fall towards the stack");
    markers.push({ id: `m-tap-${m.id}`, pos: [mm(m.x), 0.5, mm(m.z)], label: `${name} connection`, color: SERVICE_COLORS.cold });
  });

  const hob = modules.find((m) => getModuleType(m.typeId).kind === "base-hob");
  if (hob && style.hobType !== "hob-induction") {
    const w = moduleWall(hob, room);
    const gs: Anchor = gasPt ? { wall: gasPt.wall, offset: gasPt.offset, height: 0.55 } : { wall: source.wall, offset: Math.min(W - 300, source.offset + 500), height: 0.55 };
    routes.push({
      id: "r-gas",
      system: "gas",
      sub: "gas",
      color: SERVICE_COLORS.gas,
      label: "Gas supply — Hob",
      spec: "15 mm copper / GI pipe with isolation cock — fit only by a licensed gas fitter",
      width: 3,
      points: w ? route(room, gs, { wall: w.wall, offset: w.offset, height: 0.78 }, 0.55, 0.02) : routeToFree(room, gs, hob.x, hob.z, 0.55, 0.78, 0.02),
    });
    addLegend("gas", SERVICE_COLORS.gas, "Gas supply", "15 mm copper / GI, isolation cock — licensed fitter only");
    markers.push({ id: "m-gas", pos: wallPos(room, gs, 0.03), label: "Gas shut-off", color: SERVICE_COLORS.gas });
  }

  void frontDir;
  return { routes, markers, legend };
}

function wallPos(room: Room, a: Anchor, d: number): Vec3 {
  const [x, z] = wallXZ(room, a.wall, a.offset);
  const [nx, nz] = wallNormal(a.wall);
  return [mm(x) + nx * d, a.height, mm(z) + nz * d];
}

/** A wall cabinet's position along the wall it hangs on. */
function moduleWallFromWallUnit(m: ModuleInstance, room: Room): { wall: WallSide; offset: number } | null {
  return moduleWall({ ...m, elevation: 0 }, room);
}
