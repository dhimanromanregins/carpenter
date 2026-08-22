import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { useWoodTexture } from "@/hooks/useWoodTexture";

interface FloatingCabinetProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}

export function FloatingCabinet({
  position,
  scale = 1,
  speed = 1,
}: FloatingCabinetProps) {
  const texture = useWoodTexture({
    baseColor: "#8a6238",
    ringColor: "#402a15",
    repeatX: 1,
    repeatY: 1,
  });
  const group = useRef<THREE.Group>(null);
  const seed = useRef(Math.random() * 10);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() * speed + seed.current;
    group.current.position.y = position[1] + Math.sin(t * 0.6) * 0.15;
    group.current.rotation.y = Math.sin(t * 0.2) * 0.25;
    group.current.rotation.x = Math.cos(t * 0.15) * 0.05;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.8, 0.5]} />
        <meshStandardMaterial map={texture} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.26]}>
        <boxGeometry args={[1.42, 1.82, 0.02]} />
        <meshStandardMaterial
          color="#c6a86a"
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}
