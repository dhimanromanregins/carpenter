import { useRef } from "react";
import type * as THREE from "three";
import { useWoodTexture } from "@/hooks/useWoodTexture";

interface WoodPlaneProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  baseColor?: string;
  ringColor?: string;
  roughness?: number;
}

export function WoodPlane({
  position,
  rotation = [0, 0, 0],
  size,
  baseColor = "#5c3d24",
  ringColor = "#2c1a0e",
  roughness = 0.7,
}: WoodPlaneProps) {
  const texture = useWoodTexture({ baseColor, ringColor, repeatX: 3, repeatY: 3 });
  const ref = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={ref} position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        roughness={roughness}
        metalness={0.1}
      />
    </mesh>
  );
}
