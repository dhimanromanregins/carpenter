import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import type * as THREE from "three";

/** Wireframe door-frame + gold slab motif echoing the Kraftspace mark. */
function ArchitecturalFrame({
  position,
  scale,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * speed;
    // pointer parallax
    g.position.x += (position[0] + state.pointer.x * 0.6 - g.position.x) * 0.04;
    g.position.y += (position[1] + state.pointer.y * 0.4 - g.position.y) * 0.04;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.9}>
      <group ref={group} position={position} scale={scale}>
        <mesh>
          <boxGeometry args={[1, 2.2, 0.12]} />
          <meshBasicMaterial color="#c6a86a" wireframe transparent opacity={0.35} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.7, 1.8, 0.12]} />
          <meshBasicMaterial color="#c6a86a" wireframe transparent opacity={0.2} />
        </mesh>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[0.06, 2.2, 0.3]} />
          <meshStandardMaterial
            color="#e2cd9a"
            metalness={1}
            roughness={0.25}
            emissive="#c6a86a"
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function HeroAmbient() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      className="!absolute inset-0"
      gl={{ alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 4]} intensity={30} color="#ffe6b0" />
      <Sparkles count={70} scale={[14, 8, 6]} size={2.5} speed={0.25} opacity={0.7} color="#e2cd9a" />
      <ArchitecturalFrame position={[-4.6, 1.2, -2]} scale={0.9} speed={0.18} />
      <ArchitecturalFrame position={[4.8, -1.6, -3]} scale={1.2} speed={-0.12} />
    </Canvas>
  );
}
