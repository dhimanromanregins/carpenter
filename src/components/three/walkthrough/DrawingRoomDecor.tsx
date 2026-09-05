import * as THREE from "three";

// Procedural modern-ization pass for the open living/dining/kitchen area:
// a new feature wall + gallery of framed art behind the dining table, a
// statement artwork on the existing navy sofa-wall accent, and a rug
// tying the seating area together. Built the same way the rest of the
// scene's light decor is (simple primitives), matching
// legacyFloorSceneBuilder.ts's existing accent-wall/painting style.

function AccentPanel({
  x,
  y,
  z,
  rotationY,
  w,
  h,
  color,
}: {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  w: number;
  h: number;
  color: string;
}) {
  return (
    <mesh position={[x, y, z]} rotation={[0, rotationY, 0]} receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}

function FramedArt({
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

function Rug({ x, z, w, d, color }: { x: number; z: number; w: number; d: number; color: string }) {
  return (
    <mesh position={[x, 0.013, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function FloorLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.02, 24]} />
        <meshStandardMaterial color="#2B2B2E" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 1.4, 10]} />
        <meshStandardMaterial color="#B08D57" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.3, 24, 1, true]} />
        <meshStandardMaterial
          color="#F0E0BE"
          roughness={0.6}
          side={THREE.DoubleSide}
          emissive="#FFDFA0"
          emissiveIntensity={0.3}
        />
      </mesh>
      <pointLight position={[0, 1.45, 0]} color="#FFDFA0" intensity={2.6} distance={3.2} decay={2} />
    </group>
  );
}

export function DrawingRoomDecor() {
  return (
    <group>
      {/* New feature wall behind the dining table, on the drawing room's
          north wall (clear of the kitchen L-extension counter near x≈9.5+),
          with a small gallery of framed art. */}
      <AccentPanel x={5.75} y={1.35} z={15.72} rotationY={Math.PI} w={5.0} h={2.4} color="#A8583C" />
      <FramedArt x={4.0} y={1.55} z={15.7} rotationY={Math.PI} w={0.6} h={0.8} color="#3B6E8F" />
      <FramedArt x={5.1} y={1.75} z={15.7} rotationY={Math.PI} w={0.45} h={0.6} color="#C79A4B" />
      <FramedArt x={6.0} y={1.5} z={15.7} rotationY={Math.PI} w={0.7} h={0.5} color="#8F5A7A" />
      <FramedArt x={7.1} y={1.6} z={15.7} rotationY={Math.PI} w={0.5} h={0.65} color="#6B8F5A" />

      {/* A large statement artwork on the existing navy sofa-wall accent,
          offset from the wall's center (z≈8) so the ceiling-hung TV in
          front of the sofa doesn't sit directly in front of it. */}
      <FramedArt x={0.076} y={1.6} z={9.3} rotationY={Math.PI / 2} w={0.9} h={1.2} color="#C9A25C" />

      {/* Modern neutral rug tying the sofa + coffee table together. */}
      <Rug x={2.1} z={8.0} w={3.4} d={3.0} color="#C4B8A3" />

      {/* Floor lamp beside the sofa's south end for a warm evening glow. */}
      <FloorLamp x={2.3} z={6.55} />
    </group>
  );
}
