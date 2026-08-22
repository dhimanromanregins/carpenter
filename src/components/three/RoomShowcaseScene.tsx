import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { useWoodTexture } from "@/hooks/useWoodTexture";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { FINISHES } from "@/data/finishes";

interface FinishProps {
  finish: { base: string; ring: string };
}

function Wardrobe({ finish, onSelect, selected }: FinishProps & {
  onSelect: () => void;
  selected: boolean;
}) {
  const texture = useWoodTexture({ baseColor: finish.base, ringColor: finish.ring });
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const target = selected ? 1.04 : 1;
    const next = THREE.MathUtils.lerp(group.current.scale.x, target, 0.1);
    group.current.scale.setScalar(next);
  });

  return (
    <group
      ref={group}
      position={[-2.6, -0.4, -0.6]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.6, 0.7]} />
        <meshStandardMaterial map={texture} roughness={0.55} metalness={0.15} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0, 0.36]}>
          <planeGeometry args={[0.75, 2.5]} />
          <meshStandardMaterial
            color="#c6a86a"
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={selected ? 0.35 : 0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

function KitchenCounter({ finish, onSelect, selected }: FinishProps & {
  onSelect: () => void;
  selected: boolean;
}) {
  const texture = useWoodTexture({ baseColor: finish.base, ringColor: finish.ring });

  return (
    <group
      position={[1.6, -1.35, 0.4]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 0.8]} />
        <meshStandardMaterial map={texture} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <boxGeometry args={[2.3, 0.06, 0.9]} />
        <meshStandardMaterial
          color={selected ? "#e2cd9a" : "#1a1a1a"}
          roughness={0.15}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

function TVPanel({ finish, onSelect, selected }: FinishProps & {
  onSelect: () => void;
  selected: boolean;
}) {
  const texture = useWoodTexture({ baseColor: finish.base, ringColor: finish.ring });

  return (
    <group
      position={[0, 0.6, -1.6]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh receiveShadow>
        <boxGeometry args={[3, 1.8, 0.15]} />
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#050505"
          roughness={0.2}
          metalness={0.4}
          emissive={selected ? "#c6a86a" : "#000000"}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
}

function RoomShell({ finish }: FinishProps) {
  const floor = useWoodTexture({ baseColor: "#2c1c0f", ringColor: "#120a04", repeatX: 4, repeatY: 4 });
  const wall = useWoodTexture({ baseColor: finish.base, ringColor: finish.ring, repeatX: 2, repeatY: 1 });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial map={floor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, -2]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
    </>
  );
}

export function RoomShowcaseScene({
  finishId,
  selected,
  onSelect,
}: {
  finishId: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0];

  return (
    <Canvas
      shadows
      dpr={[1, isMobile ? 1.5 : 2]}
      className="!absolute inset-0"
      onPointerMissed={() => onSelect("")}
    >
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 6, 16]} />
      <PerspectiveCamera makeDefault fov={42} position={[3.5, 1.4, 5.5]} />

      <ambientLight intensity={0.4} color="#c6a86a" />
      <directionalLight
        position={[4, 5, 3]}
        intensity={1.3}
        color="#ffe6b0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight position={[-4, 3, 2]} angle={0.5} penumbra={1} intensity={1.2} color="#c6a86a" />

      <Suspense fallback={null}>
        <RoomShell finish={finish} />
        <Wardrobe finish={finish} selected={selected === "wardrobe"} onSelect={() => onSelect("wardrobe")} />
        <KitchenCounter finish={finish} selected={selected === "kitchen"} onSelect={() => onSelect("kitchen")} />
        <TVPanel finish={finish} selected={selected === "tv"} onSelect={() => onSelect("tv")} />

        <ContactShadows position={[0, -1.79, 0]} opacity={0.55} scale={10} blur={2.2} far={4} />

        <Environment resolution={200}>
          <Lightformer intensity={2} color="#c6a86a" position={[0, 4, -4]} scale={[8, 1, 1]} />
          <Lightformer intensity={1} color="#ffffff" position={[-5, 2, 3]} scale={[1, 6, 1]} />
        </Environment>
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={8}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
