/**
 * Procedural appliance models. Each takes the real product dimensions (metres)
 * and an interaction key. If a product defines a `modelUrl`, `ApplianceModel`
 * loads that GLB instead and falls back to these primitives when loading fails
 * — so a missing asset can never crash the scene.
 */
import { Component, Suspense, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Box, Cyl, Interactive, RBox, useOpenProgress } from "./common";
import { getEmissive, getUtilMaterial } from "./materials";
import { useIsOpen } from "../store/interactionStore";

type V3 = [number, number, number];

/* ───────────────────────── asset fallback ───────────────────────── */

class AssetBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Glb({ url, size }: { url: string; size: V3 }) {
  const gltf = useGLTF(url);
  const scene = gltf.scene.clone(true);
  const box = new THREE.Box3().setFromObject(scene);
  const dim = box.getSize(new THREE.Vector3());
  const s = Math.min(size[0] / dim.x, size[1] / dim.y, size[2] / dim.z);
  scene.scale.setScalar(s);
  return <primitive object={scene} />;
}

/** Loads `url` (GLB, optionally Draco-compressed) with a procedural fallback. */
export function ApplianceModel({ url, size, children }: { url?: string; size: V3; children: ReactNode }) {
  if (!url) return <>{children}</>;
  return (
    <AssetBoundary fallback={<>{children}</>}>
      <Suspense fallback={<>{children}</>}>
        <Glb url={url} size={size} />
      </Suspense>
    </AssetBoundary>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

/** A door hinged on its bottom edge that drops open (oven, dishwasher, microwave drop-down). */
function DropDoor({ id, moduleId, noun, w, h, position, maxAngle = 1.45, children }: { id: string; moduleId: string; noun: string; w: number; h: number; position: V3; maxAngle?: number; children?: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { step } = useOpenProgress(id);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.x = step(dt) * maxAngle;
  });
  return (
    <Interactive id={id} moduleId={moduleId} noun={noun}>
      <group position={position}>
        <group ref={ref}>
          <group position={[0, h / 2, 0.01]}>{children ?? <Box size={[w, h, 0.02]} position={[0, 0, 0]} material={getUtilMaterial("steel")} />}</group>
        </group>
      </group>
    </Interactive>
  );
}

/** A door hinged on a vertical edge. */
function SideDoor({ id, moduleId, noun, w, h, position, side, maxAngle = 1.75, children }: { id: string; moduleId: string; noun: string; w: number; h: number; position: V3; side: "left" | "right"; maxAngle?: number; children?: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { step } = useOpenProgress(id);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y = (side === "left" ? -1 : 1) * step(dt) * maxAngle;
  });
  return (
    <Interactive id={id} moduleId={moduleId} noun={noun}>
      <group position={position}>
        <group ref={ref}>
          <group position={[side === "left" ? w / 2 : -w / 2, 0, 0.01]}>{children ?? <Box size={[w, h, 0.02]} position={[0, 0, 0]} material={getUtilMaterial("steel")} />}</group>
        </group>
      </group>
    </Interactive>
  );
}

/* ───────────────────────── refrigerator ───────────────────────── */

export function Fridge({ moduleId, w, h, d, doubleDoor = true, position }: { moduleId: string; w: number; h: number; d: number; doubleDoor?: boolean; position: V3 }) {
  const steel = getUtilMaterial("steel");
  const dark = getUtilMaterial("dark");
  const white = getUtilMaterial("white");
  const leafW = doubleDoor ? w / 2 - 0.002 : w - 0.004;
  return (
    <group position={position}>
      <Box size={[w, h, d - 0.04]} position={[0, h / 2, -0.02]} material={white} />
      {/* freezer / fridge split on single-door models */}
      {doubleDoor ? (
        <>
          <SideDoor id={`${moduleId}:fridgeL`} moduleId={moduleId} noun="Refrigerator Door" position={[-w / 2 + 0.002, h / 2, d / 2 - 0.02]} w={leafW} h={h - 0.01} side="left" maxAngle={1.7}>
            <RBox size={[leafW, h - 0.01, 0.04]} position={[0, 0, 0]} material={steel} radius={0.004} />
            <Box size={[0.014, h * 0.32, 0.028]} position={[leafW / 2 - 0.03, 0, 0.034]} material={dark} />
          </SideDoor>
          <SideDoor id={`${moduleId}:fridgeR`} moduleId={moduleId} noun="Refrigerator Door" position={[w / 2 - 0.002, h / 2, d / 2 - 0.02]} w={leafW} h={h - 0.01} side="right" maxAngle={1.7}>
            <RBox size={[leafW, h - 0.01, 0.04]} position={[0, 0, 0]} material={steel} radius={0.004} />
            <Box size={[0.014, h * 0.32, 0.028]} position={[-leafW / 2 + 0.03, 0, 0.034]} material={dark} />
          </SideDoor>
        </>
      ) : (
        <SideDoor id={`${moduleId}:fridgeL`} moduleId={moduleId} noun="Refrigerator Door" position={[-w / 2 + 0.002, h / 2, d / 2 - 0.02]} w={leafW} h={h - 0.01} side="left" maxAngle={1.7}>
          <RBox size={[leafW, h - 0.01, 0.04]} position={[0, 0, 0]} material={steel} radius={0.004} />
          <Box size={[0.014, h * 0.4, 0.028]} position={[leafW / 2 - 0.03, 0, 0.034]} material={dark} />
        </SideDoor>
      )}
      <FridgeInterior w={w} h={h} d={d} moduleId={moduleId} />
    </group>
  );
}

function FridgeInterior({ w, h, d, moduleId }: { w: number; h: number; d: number; moduleId: string }) {
  // both hooks must always run — never short-circuit a hook call
  const leftOpen = useIsOpen(`${moduleId}:fridgeL`);
  const rightOpen = useIsOpen(`${moduleId}:fridgeR`);
  const open = leftOpen || rightOpen;
  const shelf = getUtilMaterial("glass-dark");
  const led = getEmissive("#f4f8ff", 1.6);
  if (!open) return null;
  return (
    <group>
      <Box size={[w - 0.05, h - 0.06, 0.004]} position={[0, h / 2, -d / 2 + 0.04]} material={getUtilMaterial("white")} cast={false} />
      {[0.3, 0.5, 0.7].map((k) => (
        <Box key={k} size={[w - 0.06, 0.006, d - 0.12]} position={[0, h * k, -0.02]} material={shelf} cast={false} />
      ))}
      <Box size={[w - 0.12, 0.006, 0.006]} position={[0, h - 0.08, d / 2 - 0.1]} material={led} cast={false} />
    </group>
  );
}

/* ───────────────────────── oven & microwave ───────────────────────── */

export function Oven({ moduleId, position, w = 0.595, h = 0.595, d = 0.55 }: { moduleId: string; position: V3; w?: number; h?: number; d?: number }) {
  const steel = getUtilMaterial("steel");
  const glass = getUtilMaterial("black-glass");
  const dark = getUtilMaterial("dark");
  const open = useIsOpen(`${moduleId}:oven`);
  const glow = getEmissive("#ff8a3a", 1.2);
  return (
    <group position={position}>
      <Box size={[w, h, d]} position={[0, h / 2, -0.01]} material={steel} />
      <Box size={[w - 0.04, 0.07, 0.01]} position={[0, h - 0.04, d / 2 + 0.005]} material={dark} />
      {[-0.18, -0.06, 0.06, 0.18].map((x) => (
        <Cyl key={x} r={0.014} h={0.02} position={[x, h - 0.04, d / 2 + 0.018]} rotation={[Math.PI / 2, 0, 0]} material={steel} segments={14} />
      ))}
      {open && <Box size={[w - 0.1, h - 0.18, 0.004]} position={[0, h / 2 - 0.05, -d / 2 + 0.02]} material={glow} cast={false} />}
      <DropDoor id={`${moduleId}:oven`} moduleId={moduleId} noun="Oven" w={w} h={h - 0.09} position={[0, 0, d / 2]}>
        <RBox size={[w, h - 0.09, 0.03]} position={[0, 0, 0]} material={steel} radius={0.003} />
        <Box size={[w - 0.1, h - 0.2, 0.012]} position={[0, -0.01, 0.018]} material={glass} />
        <Box size={[w - 0.08, 0.018, 0.03]} position={[0, (h - 0.09) / 2 - 0.03, 0.03]} material={steel} />
      </DropDoor>
    </group>
  );
}

export function Microwave({ moduleId, position, w = 0.595, h = 0.39, d = 0.45 }: { moduleId: string; position: V3; w?: number; h?: number; d?: number }) {
  const steel = getUtilMaterial("steel");
  const glass = getUtilMaterial("black-glass");
  const dark = getUtilMaterial("dark");
  return (
    <group position={position}>
      <Box size={[w, h, d]} position={[0, h / 2, -0.01]} material={steel} />
      <Box size={[0.12, h - 0.04, 0.012]} position={[w / 2 - 0.08, h / 2, d / 2 + 0.006]} material={dark} />
      <SideDoor id={`${moduleId}:micro`} moduleId={moduleId} noun="Microwave" position={[-w / 2 + 0.002, h / 2, d / 2]} w={w - 0.15} h={h - 0.02} side="left" maxAngle={1.75}>
        <RBox size={[w - 0.15, h - 0.02, 0.026]} position={[0, 0, 0]} material={steel} radius={0.003} />
        <Box size={[w - 0.22, h - 0.1, 0.01]} position={[0, 0, 0.016]} material={glass} />
      </SideDoor>
    </group>
  );
}

/* ───────────────────────── hob, chimney ───────────────────────── */

export function Hob({ moduleId, position, induction = false, w = 0.58, d = 0.5 }: { moduleId: string; position: V3; induction?: boolean; w?: number; d?: number }) {
  const glass = getUtilMaterial("black-glass");
  const steel = getUtilMaterial("steel");
  const dark = getUtilMaterial("dark");
  const on = useIsOpen(`${moduleId}:hob`);
  const flame = getEmissive("#5aa7ff", 1.6);
  const ring = getEmissive("#ff5a2a", 1.4);
  const burners: [number, number, number][] = [
    [-w * 0.24, -d * 0.2, 0.05],
    [w * 0.24, -d * 0.22, 0.04],
    [-w * 0.24, d * 0.22, 0.04],
    [w * 0.24, d * 0.2, 0.06],
  ];
  return (
    <Interactive id={`${moduleId}:hob`} moduleId={moduleId} noun="Hob" openVerb="Turn on" closeVerb="Turn off" position={position}>
      <Box size={[w, 0.008, d]} position={[0, 0.004, 0]} material={glass} />
      {burners.map(([x, z, r], i) => (
        <group key={i} position={[x, 0.008, z]}>
          {induction ? (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} material={on ? ring : steel}>
              <ringGeometry args={[r * 1.2, r * 1.32, 28]} />
            </mesh>
          ) : (
            <>
              <Cyl r={r} h={0.012} position={[0, 0.006, 0]} material={dark} segments={16} />
              <Cyl r={r * 0.55} h={0.016} position={[0, 0.008, 0]} material={steel} segments={16} />
              {on && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} material={flame}>
                  <ringGeometry args={[r * 0.62, r * 0.9, 24]} />
                </mesh>
              )}
            </>
          )}
        </group>
      ))}
      {!induction && (
        <>
          <Box size={[w - 0.04, 0.012, 0.012]} position={[0, 0.016, 0]} material={dark} />
          <Box size={[0.012, 0.012, d - 0.04]} position={[0, 0.016, 0]} material={dark} />
        </>
      )}
      {[-0.18, -0.06, 0.06, 0.18].map((x) => (
        <Cyl key={x} r={0.014} h={0.016} position={[x, 0.014, d / 2 - 0.03]} material={steel} segments={12} />
      ))}
    </Interactive>
  );
}

export function Chimney({ moduleId, w, roomHeight, bottom, depth, cover, position }: { moduleId: string; w: number; roomHeight: number; bottom: number; depth: number; cover: THREE.Material; position: V3 }) {
  const steel = getUtilMaterial("steel");
  const glass = getUtilMaterial("black-glass");
  const on = useIsOpen(`${moduleId}:chimney`);
  const light = getEmissive("#fff1d6", on ? 2 : 0.25);
  // hood and duct are boxed in with the cabinet finish and run up to the ceiling
  const hoodH = 0.2;
  const hoodD = Math.max(depth, 0.42);
  const back = -depth / 2;
  const ductW = Math.min(w, Math.max(0.3, w * 0.6));
  const ductH = Math.max(0.1, roomHeight - bottom - hoodH);
  return (
    <Interactive id={`${moduleId}:chimney`} moduleId={moduleId} noun="Chimney" openVerb="Turn on" closeVerb="Turn off" position={position}>
      {/* hood canopy: a casing in the kitchen finish with the filter and lamps underneath */}
      <Box size={[w, hoodH, hoodD]} position={[0, hoodH / 2 + 0.012, back + hoodD / 2]} material={cover} />
      <Box size={[w - 0.04, 0.045, 0.006]} position={[0, 0.055, back + hoodD + 0.002]} material={glass} cast={false} />
      <Box size={[w - 0.06, 0.012, hoodD - 0.06]} position={[0, 0.006, back + hoodD / 2]} material={steel} />
      <Box size={[w - 0.14, 0.006, 0.12]} position={[0, -0.002, back + hoodD / 2 + 0.05]} material={light} cast={false} />
      {/* duct cover up to the ceiling */}
      <Box size={[ductW, ductH, 0.28]} position={[0, hoodH + 0.012 + ductH / 2, back + 0.14]} material={cover} />
      <Box size={[ductW + 0.012, 0.012, 0.292]} position={[0, hoodH + 0.018, back + 0.146]} material={steel} cast={false} />
    </Interactive>
  );
}

/* ───────────────────────── counter-top items ───────────────────────── */

export function CounterItem({ id, position }: { id: string; position: V3 }) {
  const steel = getUtilMaterial("steel");
  const dark = getUtilMaterial("dark");
  const white = getUtilMaterial("white");
  if (id === "coffee-machine")
    return (
      <group position={position}>
        <Box size={[0.3, 0.4, 0.38]} position={[0, 0.2, 0]} material={dark} />
        <Box size={[0.3, 0.05, 0.38]} position={[0, 0.375, 0]} material={steel} />
        <Box size={[0.12, 0.1, 0.1]} position={[0, 0.09, 0.12]} material={steel} />
        <Cyl r={0.025} h={0.06} position={[0, 0.2, 0.17]} material={steel} segments={12} />
      </group>
    );
  if (id === "air-fryer")
    return (
      <group position={position}>
        <RBox size={[0.3, 0.32, 0.36]} position={[0, 0.16, 0]} material={dark} radius={0.03} />
        <Box size={[0.2, 0.05, 0.01]} position={[0, 0.27, 0.185]} material={steel} />
      </group>
    );
  return (
    <group position={position}>
      <RBox size={[0.3, 0.4, 0.25]} position={[0, 0.2, 0]} material={white} radius={0.02} />
      <Box size={[0.22, 0.12, 0.01]} position={[0, 0.22, 0.13]} material={getUtilMaterial("black-glass")} />
      <Cyl r={0.012} h={0.08} position={[0, 0.06, 0.15]} material={steel} segments={10} />
    </group>
  );
}

/* ───────────────────────── dishwasher ───────────────────────── */

export function DishwasherInterior({ w, h, d, moduleId }: { w: number; h: number; d: number; moduleId: string }) {
  const open = useIsOpen(`${moduleId}:door`);
  const wire = getUtilMaterial("steel");
  const inner = getUtilMaterial("white");
  if (!open) return null;
  return (
    <group>
      <Box size={[w - 0.03, h - 0.1, d - 0.12]} position={[0, h / 2, -0.04]} material={inner} cast={false} />
      {[0.25, 0.55].map((k) => (
        <group key={k} position={[0, h * k, 0.02]}>
          <Box size={[w - 0.08, 0.008, d - 0.16]} position={[0, 0, 0]} material={wire} cast={false} />
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} size={[0.004, 0.09, d - 0.18]} position={[-w / 2 + 0.08 + i * ((w - 0.16) / 7), 0.045, 0]} material={wire} cast={false} />
          ))}
        </group>
      ))}
    </group>
  );
}
