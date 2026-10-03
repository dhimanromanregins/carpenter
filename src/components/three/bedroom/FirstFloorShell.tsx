import { useMemo } from "react";
import * as THREE from "three";
import { F1, F1_DOORS } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { Box, type V3 } from "./primitives";
import { getBedroomTextures, withRepeat } from "./proceduralTextures";
import { TrayCeiling } from "./TrayCeiling";

// The first floor's shell: floors, walls and ceilings for every room. Wall
// segments mirror bedroomLayout's WALLS collider list exactly, so what you
// see always matches what you can walk through. A plain flat ceiling
// covers most rooms; the drawing room gets the house's signature tray.

const WT = 0.2;
const CEIL = F1.y + F1.height;

function MarbleFloor({ x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number }) {
  const w = x1 - x0;
  const d = z1 - z0;
  const maps = useMemo(() => withRepeat(getBedroomTextures().marbleFloor, w / 1.2, d / 1.2), [w, d]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, F1.y, (z0 + z1) / 2]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshPhysicalMaterial map={maps.map} roughnessMap={maps.roughnessMap} roughness={1} clearcoat={0.85} clearcoatRoughness={0.1} />
    </mesh>
  );
}

function WoodFloor({ x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number }) {
  const m = getBedroomMaterials();
  const w = x1 - x0;
  const d = z1 - z0;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, F1.y, (z0 + z1) / 2]} material={m.teak} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
  );
}

function FlatCeiling({ x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number }) {
  const m = getBedroomMaterials();
  return <Box size={[x1 - x0 + 0.4, 0.1, z1 - z0 + 0.4]} position={[(x0 + x1) / 2, CEIL + 0.05, (z0 + z1) / 2]} material={m.ceiling} cast={false} />;
}

/** A simple window: glass set into the wall, with a dark aluminium frame. */
function Window({ position, size, rotationY }: { position: V3; size: [number, number]; rotationY: number }) {
  const m = getBedroomMaterials();
  const [w, h] = size;
  const f = 0.05;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={m.glass}>
        <planeGeometry args={[w - f, h - f]} />
      </mesh>
      <Box size={[w, f, 0.07]} position={[0, -h / 2 + f / 2, 0]} material={m.frameBronze} />
      <Box size={[w, f, 0.07]} position={[0, h / 2 - f / 2, 0]} material={m.frameBronze} />
      <Box size={[f, h, 0.07]} position={[-w / 2 + f / 2, 0, 0]} material={m.frameBronze} />
      <Box size={[f, h, 0.07]} position={[w / 2 - f / 2, 0, 0]} material={m.frameBronze} />
    </group>
  );
}

/**
 * A plain cased opening's walnut lining, framing one wall gap.
 * `wall: "z"` is a wall at a fixed z (its opening spans x0–x1);
 * `wall: "x"` is a wall at a fixed x (its opening spans z0–z1).
 */
type LiningProps = { at: number; height: number } & ({ wall: "z"; x0: number; x1: number } | { wall: "x"; z0: number; z1: number });
function Lining(props: LiningProps) {
  const m = getBedroomMaterials();
  const { at, height } = props;
  if (props.wall === "x") {
    const { z0: a0, z1: a1 } = props;
    return (
      <group>
        <Box size={[0.22, height, 0.09]} position={[at, height / 2, a0 + 0.045]} material={m.walnut} />
        <Box size={[0.22, height, 0.09]} position={[at, height / 2, a1 - 0.045]} material={m.walnut} />
        <Box size={[0.22, 0.09, a1 - a0]} position={[at, height - 0.045, (a0 + a1) / 2]} material={m.walnut} />
      </group>
    );
  }
  const { x0: b0, x1: b1 } = props;
  return (
    <group>
      <Box size={[0.09, height, 0.22]} position={[b0 + 0.045, height / 2, at]} material={m.walnut} />
      <Box size={[0.09, height, 0.22]} position={[b1 - 0.045, height / 2, at]} material={m.walnut} />
      <Box size={[b1 - b0, 0.09, 0.22]} position={[(b0 + b1) / 2, height - 0.045, at]} material={m.walnut} />
    </group>
  );
}

function DiningShell() {
  const m = getBedroomMaterials();
  const r = F1.dining;
  return (
    <group>
      <MarbleFloor {...r} />
      <FlatCeiling {...r} />
      <Box size={[WT, F1.height, r.z1 - r.z0 + WT]} position={[r.x0 - WT / 2, CEIL - F1.height / 2, (r.z0 + r.z1) / 2]} material={m.wall} />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Window position={[r.x0 + 0.01, F1.y + 1.5, (r.z0 + r.z1) / 2]} size={[1.8, 1.6]} rotationY={Math.PI / 2} />
    </group>
  );
}

function KitchenShell() {
  const m = getBedroomMaterials();
  const r = F1.kitchen;
  return (
    <group>
      <MarbleFloor {...r} />
      <FlatCeiling {...r} />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height, r.z1 - r.z0]} position={[r.x1 + WT / 2, CEIL - F1.height / 2, (r.z0 + r.z1) / 2]} material={m.wall} />
      <Window position={[(r.x0 + r.x1) / 2, F1.y + 1.5, r.z0 + 0.01]} size={[2.2, 1.5]} rotationY={Math.PI} />
    </group>
  );
}

function PoojaShell() {
  const m = getBedroomMaterials();
  const r = F1.pooja;
  const d = F1_DOORS.drawingPooja;
  return (
    <group>
      <Box size={[r.x1 - r.x0, 0.06, r.z1 - r.z0]} position={[(r.x0 + r.x1) / 2, F1.y + 0.03, (r.z0 + r.z1) / 2]} material={m.calacattaTop} />
      <FlatCeiling {...r} />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[d.x0 - r.x0, F1.height, WT]} position={[(r.x0 + d.x0) / 2, CEIL - F1.height / 2, r.z1 + WT / 2]} material={m.wall} />
      <Box size={[r.x1 - d.x1, F1.height, WT]} position={[(d.x1 + r.x1) / 2, CEIL - F1.height / 2, r.z1 + WT / 2]} material={m.wall} />
      <Box size={[d.x1 - d.x0, F1.height - d.height, WT]} position={[(d.x0 + d.x1) / 2, CEIL - (F1.height - d.height) / 2, r.z1 + WT / 2]} material={m.wall} />
      <Lining wall="z" at={r.z1 + 0.02} x0={d.x0} x1={d.x1} height={d.height} />
      <Window position={[(r.x0 + r.x1) / 2, F1.y + 1.7, r.z0 + 0.01]} size={[1.2, 1.1]} rotationY={Math.PI} />
    </group>
  );
}

function LandingHallShell() {
  const r = F1.hall;
  return (
    <group>
      <MarbleFloor {...r} />
      <FlatCeiling {...r} />
    </group>
  );
}

function DrawingShell() {
  const r = F1.drawing;
  return (
    <group>
      <MarbleFloor {...r} />
      <TrayCeiling
        x0={r.x0}
        x1={r.x1}
        z0={r.z0}
        z1={r.z1}
        height={CEIL}
        bandBottom={F1.bandBottom}
        inset={F1.trayInset}
        downlights={[
          [r.x0 + 0.3, r.z0 + 0.3],
          [r.x0 + 0.3, (r.z0 + r.z1) / 2],
          [r.x0 + 0.3, r.z1 - 0.3],
          [r.x1 - 0.3, r.z0 + 0.3],
          [r.x1 - 0.3, (r.z0 + r.z1) / 2],
          [r.x1 - 0.3, r.z1 - 0.3],
        ]}
      />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z1 + WT / 2]} material={getBedroomMaterials().wall} />
    </group>
  );
}

function Bedroom1Shell() {
  const m = getBedroomMaterials();
  const r = F1.bedroom1;
  const d = F1_DOORS.drawingBedroom1;
  return (
    <group>
      <WoodFloor {...r} />
      <FlatCeiling {...r} />
      <Box size={[r.x0 - (-3.55), F1.height, WT]} position={[(r.x0 - 3.55) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[r.x1 - (-0.5), F1.height, WT]} position={[(-0.5 + r.x1) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height, r.z1 - F1.bath1.z0]} position={[r.x0 - WT / 2, CEIL - F1.height / 2, (F1.bath1.z0 + r.z1) / 2]} material={m.wall} />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z1 + WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height - d.height, 0.09]} position={[r.x1 + WT / 2, CEIL - (F1.height - d.height) / 2, (d.z0 + d.z1) / 2]} material={m.wall} />
      <Lining wall="x" at={r.x1 - 0.02} z0={d.z0} z1={d.z1} height={d.height} />
      <Window position={[r.x0 + 0.01, F1.y + 1.5, (r.z0 + r.z1) / 2]} size={[1.6, 1.5]} rotationY={Math.PI / 2} />
      <Window position={[(r.x0 + r.x1) / 2, F1.y + 1.5, r.z1 - 0.01]} size={[2.0, 1.5]} rotationY={0} />
    </group>
  );
}

function Bath1Shell() {
  const m = getBedroomMaterials();
  const r = F1.bath1;
  const d = F1_DOORS.bedroom1Bath1;
  const maps = useMemo(() => withRepeat(getBedroomTextures().calacatta, (r.x1 - r.x0) / 1.2, (r.z1 - r.z0) / 1.2), [r.x0, r.x1, r.z0, r.z1]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(r.x0 + r.x1) / 2, F1.y, (r.z0 + r.z1) / 2]} receiveShadow>
        <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
        <meshPhysicalMaterial map={maps.map} roughnessMap={maps.roughnessMap} roughness={0.3} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      <FlatCeiling {...r} />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height, r.z1 - r.z0 + WT]} position={[r.x0 - WT / 2, CEIL - F1.height / 2, (r.z0 + r.z1) / 2]} material={m.wall} />
      <Box size={[r.x1 - r.x0, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z1 + WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height - d.height, 0.09]} position={[r.x1 + WT / 2, CEIL - (F1.height - d.height) / 2, (d.z0 + d.z1) / 2]} material={m.wall} />
      <Window position={[r.x0 + 0.01, F1.y + 1.9, (r.z0 + r.z1) / 2]} size={[0.8, 0.7]} rotationY={Math.PI / 2} />
    </group>
  );
}

function Bedroom2Shell() {
  const m = getBedroomMaterials();
  const r = F1.bedroom2;
  const d = F1_DOORS.hallBedroom2;
  return (
    <group>
      <WoodFloor {...r} />
      <FlatCeiling {...r} />
      <Box size={[r.x1 - r.x0, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[F1.bath2.x0 - r.x1, F1.height, WT]} position={[(r.x1 + F1.bath2.x0) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z1 + WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height - d.height, 0.09]} position={[r.x0 - WT / 2, CEIL - (F1.height - d.height) / 2, (d.z0 + d.z1) / 2]} material={m.wall} />
      <Lining wall="x" at={r.x0 + 0.02} z0={d.z0} z1={d.z1} height={d.height} />
      <Window position={[(r.x0 + r.x1) / 2, F1.y + 1.5, r.z0 + 0.01]} size={[2.0, 1.5]} rotationY={Math.PI} />
      <Window position={[r.x1 + 0.01, F1.y + 1.5, (r.z0 + F1.hall.z1) / 2]} size={[1.4, 1.5]} rotationY={-Math.PI / 2} />
    </group>
  );
}

function Bath2Shell() {
  const m = getBedroomMaterials();
  const r = F1.bath2;
  const d = F1_DOORS.bedroom2Bath2;
  const maps = useMemo(() => withRepeat(getBedroomTextures().calacatta, (r.x1 - r.x0) / 1.2, (r.z1 - r.z0) / 1.2), [r.x0, r.x1, r.z0, r.z1]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(r.x0 + r.x1) / 2, F1.y, (r.z0 + r.z1) / 2]} receiveShadow>
        <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
        <meshPhysicalMaterial map={maps.map} roughnessMap={maps.roughnessMap} roughness={0.3} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      <FlatCeiling {...r} />
      <Box size={[r.x1 - r.x0 + WT, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z0 - WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height, r.z1 - r.z0]} position={[r.x1 + WT / 2, CEIL - F1.height / 2, (r.z0 + r.z1) / 2]} material={m.wall} />
      <Box size={[r.x1 - r.x0, F1.height, WT]} position={[(r.x0 + r.x1) / 2, CEIL - F1.height / 2, r.z1 + WT / 2]} material={m.wall} />
      <Box size={[WT, F1.height - d.height, 0.09]} position={[r.x0 - WT / 2, CEIL - (F1.height - d.height) / 2, (d.z0 + d.z1) / 2]} material={m.wall} />
      <Window position={[r.x1 + 0.01, F1.y + 1.9, (r.z0 + r.z1) / 2]} size={[0.8, 0.7]} rotationY={-Math.PI / 2} />
    </group>
  );
}

function BalconyShell() {
  const m = getBedroomMaterials();
  const r = F1.balcony;
  const railH = 1.0;
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({ color: "#cfe0e4", roughness: 0.05, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
    []
  );
  const runs: { from: [number, number]; to: [number, number] }[] = [
    { from: [r.x1, r.z0], to: [r.x1, r.z1] },
    { from: [r.x0, r.z1], to: [r.x1, r.z1] },
  ];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(r.x0 + r.x1) / 2, F1.y, (r.z0 + r.z1) / 2]} material={m.teak} receiveShadow>
        <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
      </mesh>
      {runs.map(({ from, to }, i) => {
        const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
        const mx = (from[0] + to[0]) / 2;
        const mz = (from[1] + to[1]) / 2;
        const rotY = Math.atan2(to[0] - from[0], to[1] - from[1]) - Math.PI / 2;
        return (
          <group key={i} position={[mx, F1.y, mz]} rotation={[0, rotY, 0]}>
            <mesh position={[0, railH / 2, 0]} material={glassMat}>
              <boxGeometry args={[len, railH, 0.012]} />
            </mesh>
            <mesh position={[0, railH + 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={m.steel} castShadow>
              <cylinderGeometry args={[0.022, 0.022, len, 16]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function FirstFloorShell() {
  return (
    <group>
      <DiningShell />
      <KitchenShell />
      <PoojaShell />
      <LandingHallShell />
      <DrawingShell />
      <Bedroom1Shell />
      <Bath1Shell />
      <Bedroom2Shell />
      <Bath2Shell />
      <BalconyShell />
    </group>
  );
}
