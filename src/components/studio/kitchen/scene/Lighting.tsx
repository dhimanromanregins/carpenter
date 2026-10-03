/**
 * Architectural lighting. Real lights are budgeted (a dozen at most) and glow is
 * mostly emissive geometry + bloom, which keeps the scene fast while still
 * transforming between day, evening and night.
 */
import { memo, useMemo } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import type { KitchenDesignConfig, ModuleInstance } from "../model/types";
import { getModuleType } from "../data/modules";
import { mm, rotToRad } from "../model/units";
import { LED_COLORS, SCENE_MOODS } from "./lightingConfig";
import { Box } from "./common";
import { getEmissive, getUtilMaterial } from "./materials";

const SCENE_GAIN = { day: 0.12, evening: 0.75, night: 1.2, presentation: 0.6 } as const;

function LocalGroup({ m, children }: { m: ModuleInstance; children: React.ReactNode }) {
  return (
    <group position={[mm(m.x), mm(m.elevation), mm(m.z)]} rotation={[0, rotToRad(m.rot), 0]}>
      {children}
    </group>
  );
}

function mixHex(a: string, b: string, t: number): string {
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((ca >> shift) & 255) * (1 - t) + ((cb >> shift) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

function pick<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.round((i * (arr.length - 1)) / Math.max(1, n - 1))]);
  return out;
}

function LightingImpl({ design }: { design: KitchenDesignConfig }) {
  const { room, lighting: L, modules } = design;
  const mood = SCENE_MOODS[L.scene];
  const W = mm(room.width);
  const D = mm(room.depth);
  const H = mm(room.height);
  // in daylight the fixtures read as neutral; warmth only shows once the room darkens
  const warm = LED_COLORS[L.temperature];
  const color = L.scene === "day" ? mixHex(warm, "#ffffff", 0.7) : L.scene === "presentation" ? mixHex(warm, "#ffffff", 0.35) : warm;
  const k = L.brightness * SCENE_GAIN[L.scene];
  const glow = getEmissive(color, 1.25 * Math.max(0.5, L.brightness));
  const steel = getUtilMaterial("steel");

  const sunPos = useMemo<[number, number, number]>(() => [W / 2 + mood.sunPos[0], mood.sunPos[1] + 0.5, D / 2 + mood.sunPos[2]], [W, D, mood.sunPos]);

  const floorMods = useMemo(() => modules.filter((m) => m.elevation < 100 && getModuleType(m.typeId).kind !== "filler"), [modules]);
  const wallMods = useMemo(() => modules.filter((m) => getModuleType(m.typeId).zone === "wall" && getModuleType(m.typeId).kind !== "wall-chimney"), [modules]);
  const islandMods = useMemo(() => modules.filter((m) => m.run === "island"), [modules]);

  // ceiling grid
  const cols = Math.max(2, Math.round(W / 1.5));
  const rows = Math.max(2, Math.round(D / 1.5));
  const ceilingPts: [number, number][] = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) ceilingPts.push([(W * (i + 0.5)) / cols, (D * (j + 0.5)) / rows]);

  // pendants over the island
  const pendants: [number, number][] = [];
  if (islandMods.length) {
    const xs = islandMods.map((m) => m.x);
    const z = islandMods[0].z;
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const n = Math.max(2, Math.min(4, Math.round((x1 - x0) / 800)));
    for (let i = 0; i < n; i++) pendants.push([mm(x0 + ((x1 - x0) * (i + 0.5)) / n), mm(z)]);
  }

  const underLights = pick(wallMods, 4);
  const spotTargets = pick(floorMods.filter((m) => m.run === "main" || m.run === "island"), 2);

  return (
    <>
      <color attach="background" args={[mood.background]} />
      <ambientLight intensity={mood.ambient} color={mood.ambientColor} />
      <directionalLight
        position={sunPos}
        target-position={[W / 2, 0, D / 2]}
        intensity={mood.sun}
        color={mood.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-Math.max(W, D)}
        shadow-camera-right={Math.max(W, D)}
        shadow-camera-top={Math.max(W, D)}
        shadow-camera-bottom={-Math.max(W, D)}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <Environment resolution={256} environmentIntensity={mood.env}>
        <Lightformer intensity={2.2} color="#fff3e0" position={[W / 2, 5, D / 2]} scale={[8, 1.2, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer intensity={1.5} color="#ffffff" position={[-4, 2, D / 2]} scale={[1.2, 5, 1]} />
        <Lightformer intensity={1.0} color="#cfe0ff" position={[W + 4, 2, D / 2]} scale={[1.2, 5, 1]} />
        <Lightformer intensity={0.9} color="#fff8ee" position={[W / 2, 2, D + 6]} scale={[12, 6, 1]} />
      </Environment>

      {/* ceiling downlights */}
      {L.ceiling && (
        <>
          {ceilingPts.map(([x, z], i) => (
            <mesh key={i} position={[x, H - 0.006, z]} rotation={[Math.PI / 2, 0, 0]} material={glow}>
              <circleGeometry args={[0.07, 20]} />
            </mesh>
          ))}
          <pointLight position={[W * 0.3, H - 0.3, D * 0.5]} intensity={26 * k} distance={9} decay={2} color={color} />
          <pointLight position={[W * 0.7, H - 0.3, D * 0.5]} intensity={26 * k} distance={9} decay={2} color={color} />
        </>
      )}

      {/* focused spots over the work surfaces */}
      {L.spots &&
        floorMods
          .filter((m, i) => i % 2 === 0 && (m.run === "main" || m.run === "island"))
          .map((m) => (
            <mesh key={m.id} position={[mm(m.x), H - 0.006, mm(m.z) + (m.rot === 0 ? 0.3 : m.rot === 180 ? -0.3 : 0)]} rotation={[Math.PI / 2, 0, 0]} material={glow}>
              <circleGeometry args={[0.04, 16]} />
            </mesh>
          ))}
      {L.spots &&
        spotTargets.map((m) => (
          <spotLight key={m.id} position={[mm(m.x), H - 0.2, mm(m.z) + 0.5]} target-position={[mm(m.x), 0.9, mm(m.z)]} angle={0.7} penumbra={0.7} intensity={34 * k} distance={6} decay={2} color={color} />
        ))}

      {/* pendants */}
      {L.pendants &&
        pendants.map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <Box size={[0.006, H - 1.65, 0.006]} position={[0, (H + 1.65) / 2, 0]} material={steel} cast={false} />
            <mesh position={[0, 1.6, 0]} material={getUtilMaterial("dark")} castShadow>
              <coneGeometry args={[0.13, 0.16, 20, 1, true]} />
            </mesh>
            <mesh position={[0, 1.55, 0]} material={glow}>
              <sphereGeometry args={[0.055, 14, 14]} />
            </mesh>
            <pointLight position={[0, 1.45, 0]} intensity={9 * k} distance={3.2} decay={2} color={color} />
          </group>
        ))}

      {/* under-cabinet LED */}
      {L.underCabinet &&
        wallMods.map((m) => (
          <LocalGroup key={m.id} m={{ ...m, elevation: m.elevation }}>
            <Box size={[mm(m.width) * 0.9, 0.008, 0.012]} position={[0, -0.004, mm(m.depth) / 2 - 0.04]} material={glow} cast={false} />
          </LocalGroup>
        ))}
      {L.underCabinet &&
        underLights.map((m) => (
          <pointLight key={m.id} position={[mm(m.x), mm(m.elevation) - 0.03, mm(m.z) + (m.rot === 0 ? 0.12 : m.rot === 180 ? -0.12 : 0)]} intensity={5 * k} distance={1.8} decay={2} color={color} />
        ))}

      {/* vertical LED profiles in the gaps between cabinet fronts */}
      {L.profile &&
        modules
          .filter((m) => getModuleType(m.typeId).kind !== "filler")
          .map((m) => {
            const zone = getModuleType(m.typeId).zone;
            const bottom = zone === "wall" ? 0 : mm(design.style.plinthHeight);
            const hh = mm(m.height) - bottom - 0.03;
            return (
              <LocalGroup key={m.id} m={m}>
                {[-1, 1].map((sx) => (
                  <Box key={sx} size={[0.006, hh, 0.006]} position={[(sx * mm(m.width)) / 2 - sx * 0.003, bottom + hh / 2 + 0.015, mm(m.depth) / 2 + 0.019]} material={glow} cast={false} />
                ))}
              </LocalGroup>
            );
          })}

      {/* cove light on cabinets that stop short of the ceiling, washing it with light */}
      {L.cove &&
        modules
          .filter((m) => ["wall", "tall"].includes(getModuleType(m.typeId).zone) && m.elevation + m.height < room.height - 120 && getModuleType(m.typeId).kind !== "wall-chimney")
          .map((m) => (
            <LocalGroup key={m.id} m={m}>
              <Box size={[mm(m.width) * 0.88, 0.008, 0.012]} position={[0, mm(m.height) + 0.004, -mm(m.depth) / 2 + 0.07]} material={glow} cast={false} />
            </LocalGroup>
          ))}

      {/* toe-kick LED */}
      {L.toeKick &&
        floorMods
          .filter((m) => getModuleType(m.typeId).zone !== "wall")
          .map((m) => (
            <LocalGroup key={m.id} m={m}>
              <Box size={[mm(m.width) * 0.9, 0.008, 0.01]} position={[0, 0.012, mm(m.depth) / 2 - 0.045]} material={glow} cast={false} />
            </LocalGroup>
          ))}
    </>
  );
}

export const KitchenLighting = memo(LightingImpl, (a, b) => a.design.lighting === b.design.lighting && a.design.modules === b.design.modules && a.design.room === b.design.room);
