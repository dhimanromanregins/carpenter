import { useContext, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BATH, BATH_DOOR, BATH_WINDOW, GROUND_Y, HALL } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { mixValue, OpeningsContext, openingState, useEveningMix } from "./bedroomState";
import { Hotspot } from "./Hotspot";
import { clickable, useEased } from "./interaction";
import { Box, type V3 } from "./primitives";
import { getBedroomTextures, withRepeat } from "./proceduralTextures";
import { TrayCeiling } from "./TrayCeiling";

// The bathroom's marble box: floor, slab-lined walls, tray ceiling, the
// door in from the hall, and a west window with a roller blind.

const W = BATH.x1 - BATH.x0;
const D = BATH.z1 - BATH.z0;
const CX = (BATH.x0 + BATH.x1) / 2;
const CZ = (BATH.z0 + BATH.z1) / 2;
const H = BATH.height;
const WALL_T = 0.2;

/** A marble slab panel, its veining scaled to a real 2.4 m slab. */
function Slab({
  size,
  position,
  rotationY = 0,
  uv,
}: {
  size: [number, number];
  position: V3;
  rotationY?: number;
  /** Where on the block this panel is cut from, so neighbours differ. */
  uv: [number, number];
}) {
  const m = getBedroomMaterials();
  const mat = useMemo(() => {
    const c = m.marbleWall.clone();
    c.map = m.marbleWall.map!.clone();
    c.map.wrapS = c.map.wrapT = THREE.RepeatWrapping;
    c.map.repeat.set(size[0] / 2.4, size[1] / 2.4);
    c.map.offset.set(uv[0], uv[1]);
    c.map.needsUpdate = true;
    return c;
  }, [m.marbleWall, size, uv]);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} material={mat} receiveShadow>
      <boxGeometry args={[size[0], size[1], 0.02]} />
    </mesh>
  );
}

function BathroomWalls() {
  const m = getBedroomMaterials();
  const wz = BATH_WINDOW;
  const sideLen = wz.z0 - BATH.z0;
  return (
    <group>
      {/* Structure: north, south, and the west wall around the window */}
      <Box size={[W + 2 * WALL_T, H, WALL_T]} position={[CX, H / 2, BATH.z0 - WALL_T / 2]} material={m.wall} />
      <Box size={[W + 2 * WALL_T, H, WALL_T]} position={[CX, H / 2, BATH.z1 + WALL_T / 2]} material={m.wall} />
      <Box size={[WALL_T, wz.y0, D]} position={[BATH.x0 - WALL_T / 2, wz.y0 / 2, CZ]} material={m.wall} />
      <Box size={[WALL_T, H - wz.y1, D]} position={[BATH.x0 - WALL_T / 2, (H + wz.y1) / 2, CZ]} material={m.wall} />
      <Box size={[WALL_T, wz.y1 - wz.y0, sideLen]} position={[BATH.x0 - WALL_T / 2, (wz.y0 + wz.y1) / 2, BATH.z0 + sideLen / 2]} material={m.wall} />
      <Box size={[WALL_T, wz.y1 - wz.y0, BATH.z1 - wz.z1]} position={[BATH.x0 - WALL_T / 2, (wz.y0 + wz.y1) / 2, (BATH.z1 + wz.z1) / 2]} material={m.wall} />
      {/* Parapet and the plinth this wing stands on */}
      <Box size={[W + 2 * WALL_T + 0.04, 0.3, WALL_T + 0.04]} position={[CX, H + 0.15, BATH.z0 - WALL_T / 2]} material={m.charcoal} />
      <Box size={[W + 2 * WALL_T + 0.04, 0.3, WALL_T + 0.04]} position={[CX, H + 0.15, BATH.z1 + WALL_T / 2]} material={m.charcoal} />
      <Box size={[WALL_T + 0.04, 0.3, D + 2 * WALL_T]} position={[BATH.x0 - WALL_T / 2, H + 0.15, CZ]} material={m.charcoal} />
      <Box size={[W + 2 * WALL_T, 0.12, D + 2 * WALL_T]} position={[CX, H + 0.06, CZ]} material={m.ceiling} cast={false} />
      <Box size={[W + 2 * WALL_T, -GROUND_Y - 0.02, D + 2 * WALL_T]} position={[CX, GROUND_Y / 2 - 0.01, CZ]} material={m.travertine} cast={false} />

      {/* Marble lining: full-height slabs on every wall */}
      <Slab size={[W, H]} position={[CX, H / 2, BATH.z0 + 0.011]} uv={[0.05, 0.1]} />
      <Slab size={[W, H]} position={[CX, H / 2, BATH.z1 - 0.011]} rotationY={Math.PI} uv={[0.4, 0.05]} />
      {/* West wall lining, cut around the window */}
      <Slab size={[D, wz.y0]} position={[BATH.x0 + 0.011, wz.y0 / 2, CZ]} rotationY={Math.PI / 2} uv={[0.7, 0.2]} />
      <Slab size={[D, H - wz.y1]} position={[BATH.x0 + 0.011, (H + wz.y1) / 2, CZ]} rotationY={Math.PI / 2} uv={[0.7, 0.75]} />
      <Slab size={[sideLen, wz.y1 - wz.y0]} position={[BATH.x0 + 0.011, (wz.y0 + wz.y1) / 2, BATH.z0 + sideLen / 2]} rotationY={Math.PI / 2} uv={[0.25, 0.45]} />
      <Slab size={[BATH.z1 - wz.z1, wz.y1 - wz.y0]} position={[BATH.x0 + 0.011, (wz.y0 + wz.y1) / 2, (BATH.z1 + wz.z1) / 2]} rotationY={Math.PI / 2} uv={[0.6, 0.45]} />
      <Slab size={[BATH_DOOR.z0 - BATH.z0, H]} position={[BATH.x1 - 0.011, H / 2, (BATH.z0 + BATH_DOOR.z0) / 2]} rotationY={-Math.PI / 2} uv={[0.2, 0.5]} />
      <Slab size={[BATH.z1 - BATH_DOOR.z1, H]} position={[BATH.x1 - 0.011, H / 2, (BATH_DOOR.z1 + BATH.z1) / 2]} rotationY={-Math.PI / 2} uv={[0.55, 0.35]} />
      <Slab size={[BATH_DOOR.z1 - BATH_DOOR.z0, H - BATH_DOOR.height]} position={[BATH.x1 - 0.011, (H + BATH_DOOR.height) / 2, (BATH_DOOR.z0 + BATH_DOOR.z1) / 2]} rotationY={-Math.PI / 2} uv={[0.1, 0.8]} />
    </group>
  );
}

function BathroomFloor() {
  const maps = useMemo(() => withRepeat(getBedroomTextures().marbleFloor, W / 1.2, D / 1.2), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0, CZ]} receiveShadow>
      <planeGeometry args={[W, D]} />
      <meshPhysicalMaterial map={maps.map} roughnessMap={maps.roughnessMap} roughness={1} clearcoat={0.9} clearcoatRoughness={0.08} />
    </mesh>
  );
}

const LEAF_W = BATH_DOOR.z1 - BATH_DOOR.z0 - 0.04;
const LEAF_H = BATH_DOOR.height - 0.02;
const DOOR_ANGLE = 1.6;

/** Walnut door from the hall, swinging back against the bathroom wall. */
function BathroomDoor() {
  const m = getBedroomMaterials();
  const { bathDoorOpen, setBathDoorOpen } = useContext(OpeningsContext);
  const open = useEased(bathDoorOpen, 2.2);
  const leaf = useRef<THREE.Group>(null);
  useFrame(() => {
    openingState.bathDoor = open.current;
    // Hinged at z0; local +z must swing toward -x (into the bathroom).
    if (leaf.current) leaf.current.rotation.y = -DOOR_ANGLE * open.current;
  });
  const toggle = () => setBathDoorOpen(!bathDoorOpen);
  const handlers = clickable(toggle);
  const midZ = (BATH_DOOR.z0 + BATH_DOOR.z1) / 2;
  const jambX = (BATH.x1 + HALL.x0) / 2;
  return (
    <group>
      {/* Lining and architraves either side */}
      <Box size={[WALL_T, BATH_DOOR.height, 0.02]} position={[jambX, BATH_DOOR.height / 2, BATH_DOOR.z0 + 0.01]} material={m.trim} />
      <Box size={[WALL_T, BATH_DOOR.height, 0.02]} position={[jambX, BATH_DOOR.height / 2, BATH_DOOR.z1 - 0.01]} material={m.trim} />
      <Box size={[WALL_T, 0.02, BATH_DOOR.z1 - BATH_DOOR.z0]} position={[jambX, BATH_DOOR.height - 0.01, midZ]} material={m.trim} />
      {[BATH.x1 - 0.011, HALL.x0 + 0.011].map((x) => (
        <group key={x}>
          <Box size={[0.022, BATH_DOOR.height + 0.06, 0.06]} position={[x, (BATH_DOOR.height + 0.06) / 2, BATH_DOOR.z0 - 0.03]} material={m.trim} />
          <Box size={[0.022, BATH_DOOR.height + 0.06, 0.06]} position={[x, (BATH_DOOR.height + 0.06) / 2, BATH_DOOR.z1 + 0.03]} material={m.trim} />
          <Box size={[0.022, 0.06, BATH_DOOR.z1 - BATH_DOOR.z0 + 0.12]} position={[x, BATH_DOOR.height + 0.03, midZ]} material={m.trim} />
        </group>
      ))}
      <group ref={leaf} position={[jambX, 0.01, BATH_DOOR.z0 + 0.02]}>
        <mesh position={[0, LEAF_H / 2, LEAF_W / 2]} material={m.walnut} castShadow receiveShadow {...handlers}>
          <boxGeometry args={[0.045, LEAF_H, LEAF_W]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.028, 1.02, LEAF_W - 0.08]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={m.brass} castShadow>
              <cylinderGeometry args={[0.026, 0.026, 0.012, 24]} />
            </mesh>
            <mesh position={[side * 0.03, 0, -0.055]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow>
              <cylinderGeometry args={[0.009, 0.009, 0.12, 12]} />
            </mesh>
          </group>
        ))}
      </group>
      <Hotspot position={[jambX, 1.4, midZ]} label={bathDoorOpen ? "Close bathroom door" : "Open bathroom door"} onActivate={toggle} spaces={[1, 4]} />
    </group>
  );
}

/** West window in a bronze frame, with a roller blind that pulls down. */
function BathWindow() {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const wz = BATH_WINDOW;
  const [blindDown, setBlindDown] = useState(false);
  const drop = useEased(blindDown, 1.4);
  const blind = useRef<THREE.Mesh>(null);
  const view = useRef<THREE.MeshBasicMaterial>(null);
  const h = wz.y1 - wz.y0;
  const w = wz.z1 - wz.z0;
  useFrame(() => {
    if (view.current) view.current.color.setScalar(mixValue(1.5, 0.35, mix.current));
    if (blind.current) {
      const d = Math.max(0.02, drop.current);
      blind.current.scale.y = d;
      blind.current.position.y = wz.y1 - (h * d) / 2;
    }
  });
  const toggle = () => setBlindDown((v) => !v);
  const fx = BATH.x0 - 0.1;
  const f = 0.05;
  return (
    <group>
      {/* Frosted pane and bronze frame */}
      <mesh position={[fx, (wz.y0 + wz.y1) / 2, (wz.z0 + wz.z1) / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial color="#eef4f5" roughness={0.55} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      <Box size={[0.07, f, w]} position={[fx, wz.y0 + f / 2, (wz.z0 + wz.z1) / 2]} material={m.frameBronze} />
      <Box size={[0.07, f, w]} position={[fx, wz.y1 - f / 2, (wz.z0 + wz.z1) / 2]} material={m.frameBronze} />
      <Box size={[0.07, h, f]} position={[fx, (wz.y0 + wz.y1) / 2, wz.z0 + f / 2]} material={m.frameBronze} />
      <Box size={[0.07, h, f]} position={[fx, (wz.y0 + wz.y1) / 2, wz.z1 - f / 2]} material={m.frameBronze} />
      {/* Daylight beyond the frosted glass */}
      <mesh position={[BATH.x0 - 0.6, (wz.y0 + wz.y1) / 2, (wz.z0 + wz.z1) / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[w + 1.4, h + 1.2]} />
        <meshBasicMaterial ref={view} color="#ffffff" toneMapped={false} />
      </mesh>
      {/* Marble sill */}
      <Box size={[0.22, 0.03, w + 0.16]} position={[BATH.x0 + 0.09, wz.y0 + 0.015, (wz.z0 + wz.z1) / 2]} material={m.stone} />
      {/* Roller blind: a linen panel that unrolls from its cassette */}
      <Box size={[0.09, 0.09, w + 0.1]} position={[BATH.x0 + 0.07, wz.y1 + 0.06, (wz.z0 + wz.z1) / 2]} material={m.blackMetal} />
      <mesh ref={blind} position={[BATH.x0 + 0.045, wz.y1, (wz.z0 + wz.z1) / 2]} rotation={[0, Math.PI / 2, 0]} material={m.upholstery} castShadow {...clickable(toggle)}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <Hotspot position={[BATH.x0 + 0.12, wz.y0 + 0.2, (wz.z0 + wz.z1) / 2]} label={blindDown ? "Raise the blind" : "Lower the blind"} onActivate={toggle} />
    </group>
  );
}

export function BathroomShell() {
  return (
    <group>
      <BathroomFloor />
      <BathroomWalls />
      <TrayCeiling
        x0={BATH.x0}
        x1={BATH.x1}
        z0={BATH.z0}
        z1={BATH.z1}
        height={H}
        bandBottom={BATH.bandBottom}
        inset={BATH.trayInset}
        downlights={[
          [BATH.x0 + 0.28, 4.1],
          [BATH.x0 + 0.28, 6.6],
          [BATH.x1 - 0.28, 4.1],
          [BATH.x1 - 0.28, 6.6],
          [-6.7, BATH.z0 + 0.28],
          [-6.7, BATH.z1 - 0.28],
        ]}
      />
      <BathroomDoor />
      <BathWindow />
    </group>
  );
}
