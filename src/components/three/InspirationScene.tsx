import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, useTexture } from "@react-three/drei";
import type * as THREE from "three";

interface FloatingPlaneProps {
  src: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  speed: number;
  phase: number;
  tilt: number;
}

const SPAN = 9; // vertical loop height

function FloatingPlane({ src, x, y, z, w, h, speed, phase, tilt }: FloatingPlaneProps) {
  const ref = useRef<THREE.Group>(null);
  const texture = useTexture(src);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // endless upward drift, wrapped around the visible span
    const yy = ((((y + t * speed) % SPAN) + SPAN) % SPAN) - SPAN / 2;
    g.position.y = yy;
    g.position.x = x + state.pointer.x * (0.25 + z * -0.08);
    g.position.z = z;
    g.rotation.y = Math.sin(t * 0.3 + phase) * 0.25 + state.pointer.x * 0.15 + tilt;
    g.rotation.x = Math.cos(t * 0.25 + phase) * 0.06 - state.pointer.y * 0.08;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w + 0.06, h + 0.06]} />
        <meshBasicMaterial color="#c6a86a" transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function InspirationScene({ images }: { images: string[] }) {
  const planes = useMemo(
    () =>
      images.map((src, i) => {
        const col = i % 6;
        const side = (col - 2.5) * 2.6;
        const depth = -((i * 7) % 5) * 0.9;
        const w = 1.5 + ((i * 3) % 3) * 0.25;
        return {
          src,
          x: side,
          y: (i / images.length) * SPAN,
          z: depth,
          w,
          h: w * (i % 2 ? 1.3 : 0.8),
          speed: 0.12 + ((i * 5) % 4) * 0.03,
          phase: i * 1.7,
          tilt: (col - 2.5) * 0.08,
        };
      }),
    [images]
  );

  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7], fov: 50 }} className="!absolute inset-0">
      <Sparkles count={80} scale={[16, 9, 6]} size={2.4} speed={0.25} opacity={0.65} color="#e2cd9a" />
      <Suspense fallback={null}>
        {planes.map((p) => (
          <FloatingPlane key={p.src} {...p} />
        ))}
      </Suspense>
    </Canvas>
  );
}
