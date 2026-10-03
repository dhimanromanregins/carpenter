/**
 * Optional demo contents shown inside opened units (cutlery, jars, bottles, pots…).
 * Deliberately cheap: a handful of primitives, no textures, created only while
 * the host part is open so they never cost anything when everything is closed.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl } from "./common";
import { getUtilMaterial } from "./materials";

type V3 = [number, number, number];

const palette = (colors: string[]) => colors.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 }));

const JAR_COLORS = palette(["#c9a86a", "#8a5a30", "#d8d3c4", "#a14a2f", "#6b7a3f", "#e6c76a"]);
const BOTTLE_COLORS = palette(["#2e5d3a", "#c9a24a", "#7a1f1f", "#d9d3c2", "#3b3f46", "#8a5a30"]);

function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A row of jars standing on a shelf at `position` (shelf top). */
export function Jars({ width, position, count, depth = 0.3 }: { width: number; position: V3; count?: number; depth?: number }) {
  const items = useMemo(() => {
    const n = count ?? Math.max(2, Math.floor(width / 0.1));
    const r = seeded(Math.round(width * 1000) + n);
    return Array.from({ length: n }).map((_, i) => ({
      x: -width / 2 + (width / n) * (i + 0.5),
      z: (r() - 0.5) * (depth * 0.4),
      rad: Math.min(0.04, (width / n) * 0.4),
      h: 0.1 + r() * 0.09,
      mat: JAR_COLORS[i % JAR_COLORS.length],
    }));
  }, [width, count, depth]);
  const lid = getUtilMaterial("steel");
  return (
    <group position={position}>
      {items.map((j, i) => (
        <group key={i} position={[j.x, 0, j.z]}>
          <Cyl r={j.rad} h={j.h} position={[0, j.h / 2, 0]} material={j.mat} segments={14} />
          <Cyl r={j.rad * 1.02} h={0.012} position={[0, j.h + 0.006, 0]} material={lid} segments={14} cast={false} />
        </group>
      ))}
    </group>
  );
}

export function Bottles({ width, position, count }: { width: number; position: V3; count?: number }) {
  const items = useMemo(() => {
    const n = count ?? Math.max(1, Math.floor(width / 0.08));
    const r = seeded(n * 31 + Math.round(width * 100));
    return Array.from({ length: n }).map((_, i) => ({
      x: -width / 2 + (width / n) * (i + 0.5),
      rad: Math.min(0.032, (width / n) * 0.42),
      h: 0.22 + r() * 0.09,
      mat: BOTTLE_COLORS[i % BOTTLE_COLORS.length],
    }));
  }, [width, count]);
  const cap = getUtilMaterial("dark");
  return (
    <group position={position}>
      {items.map((b, i) => (
        <group key={i} position={[b.x, 0, 0]}>
          <Cyl r={b.rad} h={b.h * 0.7} position={[0, (b.h * 0.7) / 2, 0]} material={b.mat} segments={14} />
          <Cyl r={b.rad * 0.4} h={b.h * 0.3} position={[0, b.h * 0.7 + (b.h * 0.3) / 2, 0]} material={b.mat} segments={10} />
          <Cyl r={b.rad * 0.45} h={0.012} position={[0, b.h + 0.006, 0]} material={cap} segments={10} cast={false} />
        </group>
      ))}
    </group>
  );
}

export function PlateStack({ position, r = 0.13, n = 8 }: { position: V3; r?: number; n?: number }) {
  const m = getUtilMaterial("ceramic");
  return (
    <group position={position}>
      {Array.from({ length: n }).map((_, i) => (
        <Cyl key={i} r={r} h={0.012} position={[0, 0.006 + i * 0.016, 0]} material={m} segments={22} />
      ))}
    </group>
  );
}

export function Pot({ position, r = 0.1, h = 0.12 }: { position: V3; r?: number; h?: number }) {
  const steel = getUtilMaterial("steel");
  const dark = getUtilMaterial("dark");
  return (
    <group position={position}>
      <Cyl r={r} h={h} position={[0, h / 2, 0]} material={steel} segments={22} />
      <Cyl r={r * 1.01} h={0.008} position={[0, h + 0.004, 0]} material={steel} segments={22} cast={false} />
      <Box size={[0.07, 0.014, 0.02]} position={[r + 0.03, h * 0.75, 0]} material={dark} />
      <Box size={[0.07, 0.014, 0.02]} position={[-r - 0.03, h * 0.75, 0]} material={dark} />
    </group>
  );
}

export function Pan({ position, r = 0.12 }: { position: V3; r?: number }) {
  const dark = getUtilMaterial("dark");
  return (
    <group position={position}>
      <Cyl r={r} h={0.035} position={[0, 0.0175, 0]} material={dark} segments={22} />
      <Box size={[0.2, 0.014, 0.026]} position={[r + 0.1, 0.03, 0]} material={dark} />
    </group>
  );
}

/** Cutlery tray with compartments: spoons, forks, knives. */
export function CutleryTray({ w, d, position, compartments = 3 }: { w: number; d: number; position: V3; compartments?: number }) {
  const wood = getUtilMaterial("wood-light");
  const steel = getUtilMaterial("steel");
  const cw = (w - 0.02) / compartments;
  return (
    <group position={position}>
      <Box size={[w, 0.006, d]} position={[0, 0.003, 0]} material={wood} />
      {Array.from({ length: compartments + 1 }).map((_, i) => (
        <Box key={i} size={[0.006, 0.04, d]} position={[-w / 2 + 0.003 + i * ((w - 0.006) / compartments), 0.02, 0]} material={wood} />
      ))}
      <Box size={[w, 0.04, 0.006]} position={[0, 0.02, d / 2 - 0.003]} material={wood} />
      <Box size={[w, 0.04, 0.006]} position={[0, 0.02, -d / 2 + 0.003]} material={wood} />
      {Array.from({ length: compartments }).map((_, c) => (
        <group key={c} position={[-w / 2 + 0.01 + cw * (c + 0.5), 0.011, 0]}>
          {Array.from({ length: 3 }).map((__, k) => (
            <group key={k} position={[(k - 1) * Math.min(0.02, cw / 4), 0, 0]}>
              <Box size={[0.012, 0.004, d * 0.62]} position={[0, 0, 0]} material={steel} />
              {c === 0 && <Cyl r={0.017} h={0.003} position={[0, 0.001, d * 0.31]} material={steel} segments={10} cast={false} />}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

export function Glasses({ width, position, count = 4 }: { width: number; position: V3; count?: number }) {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: "#dfeef2", transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0 }), []);
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <Cyl key={i} r={0.032} h={0.1} position={[-width / 2 + (width / count) * (i + 0.5), 0.05, 0]} material={m} segments={14} cast={false} />
      ))}
    </group>
  );
}

export function Bowls({ position, n = 4 }: { position: V3; n?: number }) {
  const m = getUtilMaterial("ceramic");
  return (
    <group position={position}>
      {Array.from({ length: n }).map((_, i) => (
        <Cyl key={i} r={0.07 - i * 0.004} h={0.05} position={[0, 0.025 + i * 0.045, 0]} material={m} segments={18} />
      ))}
    </group>
  );
}

export function Dustbin({ r, h, position }: { r: number; h: number; position: V3 }) {
  const body = getUtilMaterial("plastic");
  const lid = getUtilMaterial("steel");
  return (
    <group position={position}>
      <Cyl r={r} h={h} position={[0, h / 2, 0]} material={body} segments={18} />
      <Cyl r={r * 1.04} h={0.012} position={[0, h + 0.006, 0]} material={lid} segments={18} cast={false} />
    </group>
  );
}
