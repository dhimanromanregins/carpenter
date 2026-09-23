import type * as THREE from "three";

export type V3 = [number, number, number];

/** A shadow-casting box with a shared material — the building block of walls and trim. */
export function Box({
  size,
  position,
  material,
  cast = true,
  rotation,
}: {
  size: V3;
  position: V3;
  material: THREE.Material;
  cast?: boolean;
  rotation?: V3;
}) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow={cast} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}
