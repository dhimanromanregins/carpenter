import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float, PerspectiveCamera, Sparkles } from "@react-three/drei";
import type * as THREE from "three";

/** Brushed-gold slabs arranged like the Kraftspace "K" mark. */
function GoldMark() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, delta * 2);
    g.rotation.y += (state.pointer.x * 0.9 - g.rotation.y) * k;
    g.rotation.x += (-state.pointer.y * 0.4 - g.rotation.x) * k;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.7}>
      <group ref={group}>
        <mesh position={[-0.9, 0, 0]}>
          <boxGeometry args={[0.7, 3.2, 0.4]} />
          <meshStandardMaterial color="#d9b872" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[-0.15, 0.1, -0.1]}>
          <boxGeometry args={[0.7, 2.6, 0.2]} />
          <meshStandardMaterial color="#8a6d3b" metalness={1} roughness={0.4} />
        </mesh>
        <mesh position={[0.75, 0.85, 0]} rotation={[0, 0, -0.75]}>
          <boxGeometry args={[0.55, 1.9, 0.35]} />
          <meshStandardMaterial color="#d9b872" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0.75, -0.85, 0]} rotation={[0, 0, 0.75]}>
          <boxGeometry args={[0.55, 1.9, 0.35]} />
          <meshStandardMaterial color="#d9b872" metalness={1} roughness={0.28} />
        </mesh>
      </group>
    </Float>
  );
}

export function AboutCube() {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true }} className="!absolute inset-0">
      <PerspectiveCamera makeDefault fov={38} position={[0, 0, 8]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 3]} intensity={1.6} color="#ffe6b0" />
      <Sparkles count={40} scale={[7, 6, 4]} size={2} speed={0.2} color="#e2cd9a" />
      <Suspense fallback={null}>
        <GoldMark />
        <Environment resolution={128}>
          <Lightformer intensity={3} color="#ffe6b0" position={[0, 3, -3]} scale={[8, 1, 1]} />
          <Lightformer intensity={2} color="#ffffff" position={[-4, 1, 3]} scale={[1, 6, 1]} />
          <Lightformer intensity={1.5} color="#c6a86a" position={[4, -1, 2]} scale={[1, 5, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
