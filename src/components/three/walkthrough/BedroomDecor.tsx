import * as THREE from "three";

// Procedural cozy-bedroom dressing — nightstands, bedside lamps, wall
// sconces, a rug, a potted plant and a couple of extra framed paintings —
// built the same way the rest of the legacy scene's light furniture is
// (simple primitives), since no model was supplied for these pieces.
// Sized around the real glTF bed placed at x≈6.9, z≈3.24 (see
// FloorWalkthroughPage.tsx) against the bedroom's west wall (x0=5.5).

const WOOD = "#7A5C3C";
const WOOD_DARK = "#5A4530";
const SHADE_WARM = "#F0E0BE";
const BULB_WARM = "#FFDFA0";
const LEAF = "#4A6B4A";
const LEAF_DARK = "#3A5A3A";
const POT = "#B5714A";
const RUG = "#C9856A";

function Nightstand({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.5, 0.42]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.32, 0.19]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.02]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.51, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.02, 0.46]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.4} />
      </mesh>
    </group>
  );
}

function BedsideLamp({ x, z, y = 0.52 }: { x: number; z: number; y?: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.04, 16]} />
        <meshStandardMaterial color="#3B3B3E" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.24, 8]} />
        <meshStandardMaterial color="#B08D57" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.18, 20, 1, true]} />
        <meshStandardMaterial
          color={SHADE_WARM}
          roughness={0.6}
          side={THREE.DoubleSide}
          emissive={BULB_WARM}
          emissiveIntensity={0.35}
        />
      </mesh>
      <pointLight position={[0, 0.3, 0]} color={BULB_WARM} intensity={2.2} distance={2.6} decay={2} />
    </group>
  );
}

function WallSconce({ x, y, z, rotationY }: { x: number; y: number; z: number; rotationY: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[0.09, 0.14, 0.03]} />
        <meshStandardMaterial color="#B08D57" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.08]} castShadow>
        <coneGeometry args={[0.09, 0.15, 16, 1, true]} />
        <meshStandardMaterial
          color={SHADE_WARM}
          roughness={0.6}
          side={THREE.DoubleSide}
          emissive={BULB_WARM}
          emissiveIntensity={0.4}
        />
      </mesh>
      <pointLight position={[0, -0.03, 0.14]} color={BULB_WARM} intensity={1.6} distance={2.2} decay={2} />
    </group>
  );
}

function PottedPlant({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  const fronds = [
    [0, 0.55, 0, 0, 0, 0],
    [0.12, 0.5, 0.05, 0, 0, 0.5],
    [-0.13, 0.48, -0.04, 0, 0, -0.55],
    [0.05, 0.46, -0.12, 0.6, 0, 0.15],
    [-0.06, 0.44, 0.13, -0.6, 0, -0.1],
  ] as const;
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.13, 0.26, 20]} />
        <meshStandardMaterial color={POT} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 20]} />
        <meshStandardMaterial color="#3A2E22" roughness={0.9} />
      </mesh>
      {fronds.map(([fx, fy, fz, rx, ry, rz], i) => (
        <mesh key={i} position={[fx, fy, fz]} rotation={[rx, ry, rz]} castShadow>
          <coneGeometry args={[0.05, 0.5, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? LEAF : LEAF_DARK} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function FramedPainting({
  x,
  y,
  z,
  rotationY,
  w = 0.55,
  h = 0.72,
  color,
}: {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  w?: number;
  h?: number;
  color: string;
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.02]} />
        <meshStandardMaterial color="#2B2620" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <boxGeometry args={[w - 0.05, h - 0.05, 0.015]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Rug({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  return (
    <mesh position={[x, 0.014, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={RUG} roughness={0.95} />
    </mesh>
  );
}

export function BedroomDecor() {
  return (
    <group>
      {/* Nightstands flanking the headboard (bed head is at the west wall,
          x≈5.5-5.9) with a bedside lamp on each. */}
      <Nightstand x={5.78} z={1.95} />
      <BedsideLamp x={5.78} z={1.95} />
      <Nightstand x={5.78} z={4.5} />
      <BedsideLamp x={5.78} z={4.5} />

      {/* Wall sconces on the same wall, above the nightstands, for
          layered/cozy lighting alongside the table lamps. */}
      <WallSconce x={5.56} y={1.55} z={1.95} rotationY={Math.PI / 2} />
      <WallSconce x={5.56} y={1.55} z={4.5} rotationY={Math.PI / 2} />

      {/* Area rug in front of/around the bed. */}
      <Rug x={7.4} z={3.2375} w={2.6} d={2.6} />

      {/* Potted plant in the south-east corner, clear of traffic. */}
      <PottedPlant x={10.6} z={1.7} scale={1.15} />

      {/* A small gallery of framed paintings on the east wall, clear of
          the TV feature wall (which sits centered on that wall, roughly
          z 2.34-4.14) and the legacy scene's existing painting (z≈2.25). */}
      <FramedPainting x={11.22} y={1.65} z={1.65} rotationY={-Math.PI / 2} w={0.4} h={0.55} color="#6B8F5A" />
      <FramedPainting x={11.22} y={1.65} z={4.6} rotationY={-Math.PI / 2} w={0.45} h={0.6} color="#C79A4B" />
    </group>
  );
}
