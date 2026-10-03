import { useContext, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { GROUND_Y, HALL, KITCHEN, KITCHEN_OPENING, KITCHEN_WINDOW_E, KITCHEN_WINDOW_S } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { CameraSpaceContext, mixValue, useEveningMix } from "./bedroomState";
import { Box } from "./primitives";
import { getBedroomTextures, withRepeat } from "./proceduralTextures";
import { TrayCeiling } from "./TrayCeiling";

// The kitchen wing: marble floor carried through from the hall, a window
// over the sink, another looking onto the deck, and a wide cased opening
// back to the dining end of the hall.

const W = KITCHEN.x1 - KITCHEN.x0;
const D = KITCHEN.z1 - KITCHEN.z0;
const CX = (KITCHEN.x0 + KITCHEN.x1) / 2;
const CZ = (KITCHEN.z0 + KITCHEN.z1) / 2;
const H = KITCHEN.height;
const WALL_T = 0.2;

/** Polished marble underfoot: a mirror-ish planar reflection while you're
 * actually standing in the kitchen to look at it, a plain clearcoat
 * elsewhere — drei's reflector re-renders the whole house every frame. */
function KitchenFloor({ reflections: allowed }: { reflections: boolean }) {
  const space = useContext(CameraSpaceContext);
  const reflections = allowed && space === 5;
  const maps = useMemo(() => withRepeat(getBedroomTextures().marbleFloor, W / 1.2, D / 1.2), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0, CZ]} receiveShadow>
      <planeGeometry args={[W, D]} />
      {reflections ? (
        <MeshReflectorMaterial
          map={maps.map}
          roughnessMap={maps.roughnessMap}
          roughness={0.35}
          metalness={0}
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={0.7}
          mixContrast={1}
          mirror={0}
          depthScale={0.6}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
        />
      ) : (
        <meshPhysicalMaterial map={maps.map} roughnessMap={maps.roughnessMap} roughness={1} clearcoat={0.85} clearcoatRoughness={0.1} />
      )}
    </mesh>
  );
}

/** Glazing with a bright daylight card behind it, as elsewhere in the house. */
function KitchenWindow({
  position,
  size,
  rotationY,
}: {
  position: [number, number, number];
  size: [number, number];
  rotationY: number;
}) {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const view = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (view.current) view.current.color.setScalar(mixValue(1.45, 0.4, mix.current));
  });
  const [w, h] = size;
  const f = 0.05;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={view} map={getBedroomTextures().viewDay} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <Box size={[w, f, 0.07]} position={[0, -h / 2 + f / 2, 0]} material={m.frameBronze} />
      <Box size={[w, f, 0.07]} position={[0, h / 2 - f / 2, 0]} material={m.frameBronze} />
      <Box size={[f, h, 0.07]} position={[-w / 2 + f / 2, 0, 0]} material={m.frameBronze} />
      <Box size={[f, h, 0.07]} position={[w / 2 - f / 2, 0, 0]} material={m.frameBronze} />
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[w - 2 * f, h - 2 * f]} />
        <meshBasicMaterial color="#dfe9ee" transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function KitchenWalls() {
  const m = getBedroomMaterials();
  const ws = KITCHEN_WINDOW_S;
  const we = KITCHEN_WINDOW_E;
  const op = KITCHEN_OPENING;
  const eastExteriorZ0 = HALL.z1 + 0.2; // south of the hall, this wall faces the garden
  return (
    <group>
      {/* West wall, and the north wall shared with the bathroom */}
      <Box size={[WALL_T, H, D + 2 * WALL_T]} position={[KITCHEN.x0 - WALL_T / 2, H / 2, CZ]} material={m.wall} />
      <Box size={[W + 2 * WALL_T, H, WALL_T]} position={[CX, H / 2, KITCHEN.z0 - WALL_T / 2]} material={m.wall} />
      {/* South wall, around the window over the sink */}
      <Box size={[W + 2 * WALL_T, ws.y0, WALL_T]} position={[CX, ws.y0 / 2, KITCHEN.z1 + WALL_T / 2]} material={m.wall} />
      <Box size={[W + 2 * WALL_T, H - ws.y1, WALL_T]} position={[CX, (H + ws.y1) / 2, KITCHEN.z1 + WALL_T / 2]} material={m.wall} />
      <Box size={[ws.x0 - KITCHEN.x0 + WALL_T, ws.y1 - ws.y0, WALL_T]} position={[(KITCHEN.x0 - WALL_T + ws.x0) / 2, (ws.y0 + ws.y1) / 2, KITCHEN.z1 + WALL_T / 2]} material={m.wall} />
      <Box size={[KITCHEN.x1 + WALL_T - ws.x1, ws.y1 - ws.y0, WALL_T]} position={[(ws.x1 + KITCHEN.x1 + WALL_T) / 2, (ws.y0 + ws.y1) / 2, KITCHEN.z1 + WALL_T / 2]} material={m.wall} />
      {/* East wall below the hall: exterior, with a window onto the deck */}
      <Box size={[WALL_T, H, we.z0 - eastExteriorZ0]} position={[KITCHEN.x1 + WALL_T / 2, H / 2, (eastExteriorZ0 + we.z0) / 2]} material={m.wall} />
      <Box size={[WALL_T, H, KITCHEN.z1 + WALL_T - we.z1]} position={[KITCHEN.x1 + WALL_T / 2, H / 2, (we.z1 + KITCHEN.z1 + WALL_T) / 2]} material={m.wall} />
      <Box size={[WALL_T, we.y0, we.z1 - we.z0]} position={[KITCHEN.x1 + WALL_T / 2, we.y0 / 2, (we.z0 + we.z1) / 2]} material={m.wall} />
      <Box size={[WALL_T, H - we.y1, we.z1 - we.z0]} position={[KITCHEN.x1 + WALL_T / 2, (H + we.y1) / 2, (we.z0 + we.z1) / 2]} material={m.wall} />

      <KitchenWindow position={[CX - 0.5, (ws.y0 + ws.y1) / 2, KITCHEN.z1 + 0.06]} size={[ws.x1 - ws.x0, ws.y1 - ws.y0]} rotationY={Math.PI} />
      <KitchenWindow position={[KITCHEN.x1 + 0.06, (we.y0 + we.y1) / 2, (we.z0 + we.z1) / 2]} size={[we.z1 - we.z0, we.y1 - we.y0]} rotationY={-Math.PI / 2} />

      {/* Walnut lining round the cased opening to the hall */}
      <Box size={[0.24, op.height, 0.09]} position={[KITCHEN.x1 + 0.1, op.height / 2, op.z0 + 0.045]} material={m.walnut} />
      <Box size={[0.24, op.height, 0.09]} position={[KITCHEN.x1 + 0.1, op.height / 2, op.z1 - 0.045]} material={m.walnut} />
      <Box size={[0.24, 0.09, op.z1 - op.z0]} position={[KITCHEN.x1 + 0.1, op.height - 0.045, (op.z0 + op.z1) / 2]} material={m.walnut} />

      {/* Skirting, parapet and the plinth this wing stands on */}
      <Box size={[0.018, 0.13, D]} position={[KITCHEN.x0 + 0.009, 0.065, CZ]} material={m.trim} cast={false} />
      <Box size={[W, 0.13, 0.018]} position={[CX, 0.065, KITCHEN.z0 + 0.009]} material={m.trim} cast={false} />
      <Box size={[W + 2 * WALL_T + 0.04, 0.3, WALL_T + 0.04]} position={[CX, H + 0.15, KITCHEN.z1 + WALL_T / 2]} material={m.charcoal} />
      <Box size={[WALL_T + 0.04, 0.3, D + 2 * WALL_T]} position={[KITCHEN.x0 - WALL_T / 2, H + 0.15, CZ]} material={m.charcoal} />
      <Box size={[WALL_T + 0.04, 0.3, KITCHEN.z1 + WALL_T - eastExteriorZ0]} position={[KITCHEN.x1 + WALL_T / 2, H + 0.15, (eastExteriorZ0 + KITCHEN.z1 + WALL_T) / 2]} material={m.charcoal} />
      <Box size={[W + 2 * WALL_T, 0.12, D + 2 * WALL_T]} position={[CX, H + 0.06, CZ]} material={m.ceiling} cast={false} />
      <Box size={[W + 2 * WALL_T, -GROUND_Y - 0.02, D + 2 * WALL_T]} position={[CX, GROUND_Y / 2 - 0.01, CZ]} material={m.travertine} cast={false} />
    </group>
  );
}

export function KitchenShell({ reflections }: { reflections: boolean }) {
  return (
    <group>
      <KitchenFloor reflections={reflections} />
      <KitchenWalls />
      <TrayCeiling
        x0={KITCHEN.x0}
        x1={KITCHEN.x1}
        z0={KITCHEN.z0}
        z1={KITCHEN.z1}
        height={H}
        bandBottom={KITCHEN.bandBottom}
        inset={KITCHEN.trayInset}
        downlights={[
          [KITCHEN.x0 + 0.28, 8.7],
          [KITCHEN.x0 + 0.28, 10.2],
          [KITCHEN.x0 + 0.28, 11.7],
          [KITCHEN.x1 - 0.28, 8.7],
          [KITCHEN.x1 - 0.28, 10.2],
          [KITCHEN.x1 - 0.28, 11.7],
          [-6.6, KITCHEN.z1 - 0.28],
        ]}
      />
    </group>
  );
}
