import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float, PerspectiveCamera } from "@react-three/drei";
import type * as THREE from "three";
import { useWoodTexture } from "@/hooks/useWoodTexture";

function Cube() {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useWoodTexture({
    baseColor: "#8a6238",
    ringColor: "#3d2712",
    repeatX: 1,
    repeatY: 1,
  });

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.35;
    mesh.current.rotation.x += delta * 0.08;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial map={texture} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh scale={1.003}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#c6a86a" wireframe transparent opacity={0.15} />
      </mesh>
    </Float>
  );
}

export function AboutCube() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      className="!absolute inset-0"
    >
      <PerspectiveCamera
        makeDefault
        fov={40}
        position={[3, 1.5, 4]}
        onUpdate={(self) => self.lookAt(0, 0, 0)}
      />
      <ambientLight intensity={0.4} color="#c6a86a" />
      <directionalLight position={[3, 4, 2]} intensity={1.4} color="#ffe6b0" castShadow />
      <Suspense fallback={null}>
        <Cube />
        <Environment resolution={128}>
          <Lightformer intensity={2} color="#c6a86a" position={[0, 3, -3]} scale={[6, 1, 1]} />
          <Lightformer intensity={1} color="#ffffff" position={[-4, 1, 2]} scale={[1, 5, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
