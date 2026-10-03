/**
 * The room shell: floor, ceiling, four walls with real window / door openings,
 * skirting, frames. Walls are single-sided — they vanish when the camera orbits
 * outside, giving a dollhouse view without hiding anything when you're inside.
 */
import { memo, useMemo } from "react";
import * as THREE from "three";
import type { KitchenDesignConfig, Room as RoomSpec, WallSide } from "../model/types";
import { mm } from "../model/units";
import { resolveMaterial } from "../data/materials";
import { Box, surfaceHandlers } from "./common";
import { getMaterial, getUtilMaterial } from "./materials";
import { SCENE_MOODS } from "./lightingConfig";

function wallShape(len: number, height: number, holes: { u0: number; u1: number; v0: number; v1: number }[]): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(len, 0);
  s.lineTo(len, height);
  s.lineTo(0, height);
  s.closePath();
  holes.forEach((h) => {
    const p = new THREE.Path();
    p.moveTo(h.u0, h.v0);
    p.lineTo(h.u0, h.v1);
    p.lineTo(h.u1, h.v1);
    p.lineTo(h.u1, h.v0);
    p.closePath();
    s.holes.push(p);
  });
  return s;
}

interface WallSpec {
  side: WallSide;
  len: number;
  position: [number, number, number];
  rotationY: number;
  /** Which material side is visible from inside the room. */
  side3: THREE.Side;
}

function wallSpecs(room: RoomSpec): WallSpec[] {
  const W = mm(room.width);
  const D = mm(room.depth);
  return [
    { side: "back", len: W, position: [0, 0, 0], rotationY: 0, side3: THREE.FrontSide },
    { side: "front", len: W, position: [0, 0, D], rotationY: 0, side3: THREE.BackSide },
    { side: "left", len: D, position: [0, 0, 0], rotationY: -Math.PI / 2, side3: THREE.BackSide },
    { side: "right", len: D, position: [W, 0, 0], rotationY: -Math.PI / 2, side3: THREE.FrontSide },
  ];
}

/** Local frame transform for items attached to a wall at offset `u`, height `v`, depth `n` into the room. */
export function wallPoint(room: RoomSpec, side: WallSide, u: number, v: number, n = 0): [number, number, number] {
  const W = mm(room.width);
  const D = mm(room.depth);
  switch (side) {
    case "back":
      return [mm(u), mm(v), n];
    case "front":
      return [mm(u), mm(v), D - n];
    case "left":
      return [n, mm(v), mm(u)];
    default:
      return [W - n, mm(v), mm(u)];
  }
}

const wallRotation = (side: WallSide) => (side === "back" || side === "front" ? 0 : Math.PI / 2);

function Opening({ room, side, offset, width, height, sill, kind, windowColor }: { room: RoomSpec; side: WallSide; offset: number; width: number; height: number; sill: number; kind: "window" | "door"; windowColor: string }) {
  const frame = getUtilMaterial("white");
  const rot = wallRotation(side);
  const pos = wallPoint(room, side, offset, 0, 0);
  const w = mm(width);
  const h = mm(height);
  const s = mm(sill);
  const f = 0.05;
  const inward = side === "back" || side === "left" ? 1 : -1; // direction into the room (x or z)
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: windowColor, toneMapped: false }), [windowColor]);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {kind === "window" ? (
        <>
          <Box size={[w + 2 * f, f, 0.12]} position={[0, s + h + f / 2, 0]} material={frame} cast={false} />
          <Box size={[w + 2 * f, f * 1.3, 0.16]} position={[0, s - f * 0.65, 0.02 * inward]} material={frame} cast={false} />
          <Box size={[f, h, 0.12]} position={[-w / 2 - f / 2, s + h / 2, 0]} material={frame} cast={false} />
          <Box size={[f, h, 0.12]} position={[w / 2 + f / 2, s + h / 2, 0]} material={frame} cast={false} />
          <Box size={[0.03, h, 0.06]} position={[0, s + h / 2, 0]} material={frame} cast={false} />
          <mesh position={[0, s + h / 2, -0.25 * inward]} material={glow}>
            <planeGeometry args={[w + 1.2, h + 1.2]} />
          </mesh>
          <mesh position={[0, s + h / 2, 0]} rotation={[0, side === "front" || side === "left" ? Math.PI : 0, 0]}>
            <planeGeometry args={[w, h]} />
            <meshPhysicalMaterial color="#dfeef2" transparent opacity={0.1} roughness={0.02} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </>
      ) : (
        <>
          <Box size={[w + 2 * f, f, 0.12]} position={[0, h + f / 2, 0]} material={frame} cast={false} />
          <Box size={[f, h, 0.12]} position={[-w / 2 - f / 2, h / 2, 0]} material={frame} cast={false} />
          <Box size={[f, h, 0.12]} position={[w / 2 + f / 2, h / 2, 0]} material={frame} cast={false} />
          {/* the leaf stands open, swung into the room, so it never blocks the view */}
          <group position={[w / 2, 0, 0]} rotation={[0, inward * 1.45, 0]}>
            <Box size={[w, h - 0.01, 0.04]} position={[-w / 2, h / 2, 0]} material={getUtilMaterial("wood-light")} />
            <Box size={[0.03, 0.12, 0.05]} position={[-w + 0.08, h * 0.45, 0.03]} material={getUtilMaterial("steel")} />
          </group>
        </>
      )}
    </group>
  );
}

function RoomImpl({ design }: { design: KitchenDesignConfig }) {
  const { room, style, lighting } = design;
  const W = mm(room.width);
  const D = mm(room.depth);
  const H = mm(room.height);
  const mood = SCENE_MOODS[lighting.scene];

  const floorDef = resolveMaterial(style.floorMaterial);
  const floorMat = useMemo(() => getMaterial(floorDef, { repeat: floorDef.texture === "plank" ? [W / 1.1, D / 1.1] : [W / 1.2, D / 1.2] }), [floorDef, W, D]);
  const ceilMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f3f0ea", roughness: 1 }), []);

  const walls = useMemo(
    () =>
      wallSpecs(room).map((w) => {
        const holes: { u0: number; u1: number; v0: number; v1: number }[] = [];
        if (room.window.enabled && room.window.wall === w.side) {
          const o = room.window;
          holes.push({ u0: mm(o.offset - o.width / 2), u1: mm(o.offset + o.width / 2), v0: mm(o.sill), v1: mm(o.sill + o.height) });
        }
        if (room.door.enabled && room.door.wall === w.side) {
          const o = room.door;
          holes.push({ u0: mm(o.offset - o.width / 2), u1: mm(o.offset + o.width / 2), v0: 0, v1: mm(o.height) });
        }
        return { ...w, geometry: new THREE.ShapeGeometry(wallShape(w.len, H, holes)) };
      }),
    [room, H]
  );

  const skirt = getUtilMaterial("white");
  const doorGap = room.door.enabled ? { side: room.door.wall, a: room.door.offset - room.door.width / 2, b: room.door.offset + room.door.width / 2 } : null;
  const skirting = (side: WallSide, len: number, pos: [number, number, number], rot: number) => {
    const segs: [number, number][] = doorGap && doorGap.side === side ? [[0, Math.max(0, doorGap.a)], [Math.min(len * 1000, doorGap.b), len * 1000]] : [[0, len * 1000]];
    return segs
      .filter(([a, b]) => b - a > 20)
      .map(([a, b], i) => (
        <Box key={`${side}${i}`} size={[mm(b - a), 0.08, 0.014]} position={[pos[0], 0.04, pos[2]]} rotation={[0, rot, 0]} material={skirt} cast={false} />
      ));
  };

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, D / 2]} receiveShadow material={floorMat} {...surfaceHandlers("floor", "Floor")}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2, H, D / 2]} material={ceilMat}>
        <planeGeometry args={[W, D]} />
      </mesh>
      {walls.map((w) => (
        <mesh key={w.side} geometry={w.geometry} position={w.position} rotation={[0, w.rotationY, 0]} receiveShadow {...surfaceHandlers("wall", "Wall colour")}>
          <meshStandardMaterial color={style.wallColor} roughness={0.95} side={w.side3} />
        </mesh>
      ))}
      {room.window.enabled && <Opening room={room} side={room.window.wall} offset={room.window.offset} width={room.window.width} height={room.window.height} sill={room.window.sill} kind="window" windowColor={mood.window} />}
      {room.door.enabled && <Opening room={room} side={room.door.wall} offset={room.door.offset} width={room.door.width} height={room.door.height} sill={0} kind="door" windowColor={mood.window} />}
      {/* skirting (centre positions follow each wall) */}
      <group>
        {skirting("back", W, [W / 2, 0, 0.007], 0)}
        {skirting("front", W, [W / 2, 0, D - 0.007], 0)}
        {skirting("left", D, [0.007, 0, D / 2], Math.PI / 2)}
        {skirting("right", D, [W - 0.007, 0, D / 2], Math.PI / 2)}
      </group>
    </group>
  );
}

export const RoomShell = memo(RoomImpl, (a, b) => a.design.room === b.design.room && a.design.style.floorMaterial === b.design.style.floorMaterial && a.design.style.wallColor === b.design.style.wallColor && a.design.lighting.scene === b.design.lighting.scene);
