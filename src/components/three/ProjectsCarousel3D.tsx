import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, useTexture } from "@react-three/drei";
import type * as THREE from "three";
import type { Project } from "@/data/projects";

const CARD_W = 2.4;
const CARD_H = 3.2;
const STEP = 0.62; // radians between cards
const RADIUS = 5.2;

interface CardProps {
  project: Project;
  index: number;
  progress: React.MutableRefObject<number>;
  onPick: (index: number) => void;
}

function Card({ project, index, progress, onPick }: CardProps) {
  const group = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(project.image as string);
  const hoverAmt = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const offset = index - progress.current;
    const a = offset * STEP;
    const near = Math.max(0, 1 - Math.abs(offset)); // 1 when centred

    hoverAmt.current += ((hovered ? 1 : 0) - hoverAmt.current) * Math.min(1, delta * 8);
    const lift = near * 0.55 + hoverAmt.current * 0.18;

    g.position.x = Math.sin(a) * RADIUS;
    g.position.z = Math.cos(a) * RADIUS - RADIUS + lift;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.05 * near;
    g.rotation.y = -a * 0.9 + state.pointer.x * 0.12 * near;
    g.rotation.x = -state.pointer.y * 0.08 * near;
    const s = 0.82 + near * 0.18 + hoverAmt.current * 0.03;
    g.scale.setScalar(s);

    const mat = frame.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) mat.opacity = 0.25 + near * 0.75;
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        onPick(index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh ref={frame} position={[0, 0, -0.02]}>
        <planeGeometry args={[CARD_W + 0.1, CARD_H + 0.1]} />
        <meshBasicMaterial color="#c6a86a" transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({
  items,
  target,
  onPick,
}: {
  items: Project[];
  target: React.MutableRefObject<number>;
  onPick: (index: number) => void;
}) {
  const progress = useRef(target.current);
  useFrame((_, delta) => {
    progress.current += (target.current - progress.current) * Math.min(1, delta * 4.5);
  });
  return (
    <>
      {items.map((p, i) => (
        <Card key={p.id} project={p} index={i} progress={progress} onPick={onPick} />
      ))}
    </>
  );
}

interface Props {
  items: Project[];
  target: React.MutableRefObject<number>;
  onPick: (index: number) => void;
}

export function ProjectsCarousel3D({ items, target, onPick }: Props) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 6.2], fov: 42 }} className="!absolute inset-0">
      <Sparkles count={60} scale={[16, 7, 6]} size={2.2} speed={0.2} opacity={0.6} color="#e2cd9a" />
      <Suspense fallback={null}>
        <Rig items={items} target={target} onPick={onPick} />
      </Suspense>
    </Canvas>
  );
}
