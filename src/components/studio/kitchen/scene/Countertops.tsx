/** Countertop slabs (with cut-outs, edge profile, waterfall), backsplash and breakfast bar. */
import { memo, useMemo } from "react";
import * as THREE from "three";
import type { KitchenDesignConfig } from "../model/types";
import { buildCounterSlabs, type Slab } from "../engine/countertop";
import { resolveMaterial } from "../data/materials";
import { mm } from "../model/units";
import { Box, surfaceHandlers } from "./common";
import { getMaterial } from "./materials";

function slabGeometry(s: Slab, thickness: number, edge: string): THREE.BufferGeometry {
  const x0 = mm(s.x0);
  const x1 = mm(s.x1);
  const z0 = mm(s.z0);
  const z1 = mm(s.z1);
  const shape = new THREE.Shape();
  shape.moveTo(x0, z0);
  shape.lineTo(x1, z0);
  shape.lineTo(x1, z1);
  shape.lineTo(x0, z1);
  shape.closePath();
  s.cutouts.forEach((c) => {
    const hole = new THREE.Path();
    hole.moveTo(mm(c.x0), mm(c.z0));
    hole.lineTo(mm(c.x0), mm(c.z1));
    hole.lineTo(mm(c.x1), mm(c.z1));
    hole.lineTo(mm(c.x1), mm(c.z0));
    hole.closePath();
    shape.holes.push(hole);
  });
  const bevel = edge === "bullnose" ? { bevelEnabled: true, bevelSize: 0.007, bevelThickness: 0.007, bevelSegments: 4 } : edge === "chamfer" ? { bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1 } : { bevelEnabled: false };
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, ...bevel, curveSegments: 4 });
  // shape (x, z) → plan; extrusion runs downward from y = 0
  g.rotateX(Math.PI / 2);
  return g;
}

/** Subtracts the window span from a [a0, a1] wall interval. */
function minusWindow(a0: number, a1: number, win: { from: number; to: number } | null): [number, number][] {
  if (!win || win.to <= a0 || win.from >= a1) return [[a0, a1]];
  const out: [number, number][] = [];
  if (win.from > a0) out.push([a0, win.from]);
  if (win.to < a1) out.push([win.to, a1]);
  return out;
}

function SlabView({ s, d }: { s: Slab; d: KitchenDesignConfig }) {
  const { style, room } = d;
  const t = mm(style.counterThickness);
  const top = mm(s.top);
  const def = resolveMaterial(style.counterMaterial);
  // speckled stone needs a finer tile than veined marble, or the flecks look huge
  const tile = def.texture === "marble" ? 0.7 : def.texture === "wood" ? 1 : 2.4;
  const mat = useMemo(() => getMaterial(def, { repeat: [tile, tile] }), [def, tile]);
  const geo = useMemo(() => slabGeometry(s, t, style.counterEdge), [s, t, style.counterEdge]);
  const bsDef = resolveMaterial(style.backsplash.material === "bs-matching" ? style.counterMaterial : style.backsplash.material);
  const bsMat = useMemo(() => getMaterial(bsDef, { repeat: style.backsplash.material === "bs-matching" ? [0.9, 0.9] : [2.2, 1.2] }), [bsDef, style.backsplash.material]);
  const bsH = mm(style.backsplash.height);
  const win = room.window.enabled ? room.window : null;

  // backsplash segments: one per wall the slab touches, minus the window
  const segments: { pos: [number, number, number]; size: [number, number, number] }[] = [];
  if (style.backsplash.enabled && s.wallBack && !s.bar) {
    const T = 30;
    const winSpan = (wall: string) => (win && win.wall === wall && win.sill < s.top + style.backsplash.height ? { from: win.offset - win.width / 2, to: win.offset + win.width / 2 } : null);
    if (s.z0 <= T) minusWindow(s.x0 + s.overhang.nx * 0, s.x1, winSpan("back")).forEach(([a, b]) => segments.push({ pos: [mm((a + b) / 2), top + bsH / 2, 0.006], size: [mm(b - a), bsH, 0.012] }));
    if (s.z1 >= room.depth - T) minusWindow(s.x0, s.x1, winSpan("front")).forEach(([a, b]) => segments.push({ pos: [mm((a + b) / 2), top + bsH / 2, mm(room.depth) - 0.006], size: [mm(b - a), bsH, 0.012] }));
    if (s.x0 <= T) minusWindow(s.z0, s.z1, winSpan("left")).forEach(([a, b]) => segments.push({ pos: [0.006, top + bsH / 2, mm((a + b) / 2)], size: [0.012, bsH, mm(b - a)] }));
    if (s.x1 >= room.width - T) minusWindow(s.z0, s.z1, winSpan("right")).forEach(([a, b]) => segments.push({ pos: [mm(room.width) - 0.006, top + bsH / 2, mm((a + b) / 2)], size: [0.012, bsH, mm(b - a)] }));
  }

  const waterfall = style.counterEdge === "waterfall" && s.moduleIds.length > 0 && !s.bar && s.overhang.px + s.overhang.nx + s.overhang.pz + s.overhang.nz > 100;
  const horizontal = s.front[1] !== 0;

  return (
    <group>
      <mesh geometry={geo} material={mat} position={[0, top, 0]} castShadow receiveShadow {...surfaceHandlers("counter", "Countertop")} />
      {segments.map((seg, i) => (
        <group key={i} {...surfaceHandlers("backsplash", "Backsplash")}>
          <Box size={seg.size} position={seg.pos} material={bsMat} cast={false} />
        </group>
      ))}
      {waterfall && (
        <>
          <Box size={horizontal ? [t, top, mm(s.z1 - s.z0)] : [mm(s.x1 - s.x0), top, t]} position={horizontal ? [mm(s.x0) + t / 2, top / 2, mm((s.z0 + s.z1) / 2)] : [mm((s.x0 + s.x1) / 2), top / 2, mm(s.z0) + t / 2]} material={mat} />
          <Box size={horizontal ? [t, top, mm(s.z1 - s.z0)] : [mm(s.x1 - s.x0), top, t]} position={horizontal ? [mm(s.x1) - t / 2, top / 2, mm((s.z0 + s.z1) / 2)] : [mm((s.x0 + s.x1) / 2), top / 2, mm(s.z1) - t / 2]} material={mat} />
        </>
      )}
      {s.bar &&
        [s.x0 + 80, s.x1 - 80].map((x, i) => (
          <Box key={i} size={[0.05, top, 0.05]} position={[mm(x), top / 2, mm((s.z0 + s.z1) / 2)]} material={mat} />
        ))}
    </group>
  );
}

function CountertopsImpl({ design }: { design: KitchenDesignConfig }) {
  const slabs = useMemo(() => buildCounterSlabs(design), [design.modules, design.style, design.room]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      {slabs.map((s) => (
        <SlabView key={s.id} s={s} d={design} />
      ))}
    </group>
  );
}

export const Countertops = memo(CountertopsImpl, (a, b) => a.design.modules === b.design.modules && a.design.style === b.design.style && a.design.room === b.design.room);
