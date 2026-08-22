import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWoodTexture } from "@/hooks/useWoodTexture";

const CYCLE = 1.35;
const LIFT_PORTION = 0.7;
const IMPACT_DURATION = 0.26;
const REST_ANGLE = -0.15;
const RAISED_ANGLE = 2.05;

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeInQuad(t: number) {
  return t * t;
}

function hammerLift(t: number) {
  if (t < LIFT_PORTION) {
    return easeInOutSine(t / LIFT_PORTION);
  }
  const p = Math.min((t - LIFT_PORTION) / (1 - LIFT_PORTION), 1);
  return 1 - easeInQuad(p);
}

function useSparkTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(230,190,120,0.9)");
    gradient.addColorStop(1, "rgba(230,190,120,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

interface CarpenterFigureProps {
  position?: [number, number, number];
  scale?: number;
}

export function CarpenterFigure({
  position = [0, 0, 0],
  scale = 1,
}: CarpenterFigureProps) {
  const shoulder = useRef<THREE.Group>(null);
  const panel = useRef<THREE.Group>(null);
  const flash = useRef<THREE.PointLight>(null);
  const spark = useRef<THREE.Mesh>(null);
  const impactTimeRef = useRef(-10);
  const prevLiftRef = useRef(0);

  const panelTex = useWoodTexture({
    baseColor: "#6b4a2a",
    ringColor: "#2c1a0e",
    repeatX: 1,
    repeatY: 2,
  });
  const sparkTex = useSparkTexture();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const t = (elapsed % CYCLE) / CYCLE;
    const lift = hammerLift(t);

    if (shoulder.current) {
      shoulder.current.rotation.z = THREE.MathUtils.lerp(
        REST_ANGLE,
        RAISED_ANGLE,
        lift
      );
    }

    if (prevLiftRef.current > 0.08 && lift <= 0.08 && t > LIFT_PORTION) {
      impactTimeRef.current = elapsed;
    }
    prevLiftRef.current = lift;

    const sinceImpact = elapsed - impactTimeRef.current;
    const impactActive = sinceImpact >= 0 && sinceImpact < IMPACT_DURATION;
    const impactP = impactActive ? sinceImpact / IMPACT_DURATION : 1;

    if (flash.current) {
      flash.current.intensity = impactActive
        ? THREE.MathUtils.lerp(4, 0, impactP)
        : 0;
    }

    if (spark.current) {
      const mat = spark.current.material as THREE.MeshBasicMaterial;
      spark.current.visible = impactActive;
      if (impactActive) {
        spark.current.scale.setScalar(THREE.MathUtils.lerp(0.08, 1, impactP));
        mat.opacity = 1 - impactP;
      }
    }

    if (panel.current) {
      const jitter = impactActive ? (1 - impactP) * 0.015 : 0;
      panel.current.position.x = THREE.MathUtils.lerp(
        panel.current.position.x,
        0.86 + jitter,
        0.5
      );
    }
  });

  const bodyColor = "#241a10";
  const skinColor = "#a97b52";
  const metalColor = "#d8d2c4";

  return (
    <group position={position} scale={scale}>
      {/* legs */}
      <mesh position={[-0.13, 0.34, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0.13, 0.34, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.5, 6, 12]} />
        <meshStandardMaterial color="#332417" roughness={0.55} metalness={0.15} />
      </mesh>

      {/* head */}
      <mesh position={[0, 1.98, 0.02]} castShadow>
        <sphereGeometry args={[0.19, 20, 20]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* static supporting arm, holding the panel steady */}
      <mesh position={[-0.32, 1.35, 0.32]} rotation={[0.7, -0.2, 0.5]} castShadow>
        <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* hammer arm: pivots at shoulder, swinging across to strike sideways */}
      <group ref={shoulder} position={[0.28, 1.5, 0]} rotation={[0, 0, REST_ANGLE]}>
        <mesh position={[0.26, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.075, 0.46, 4, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.1} />
        </mesh>
        <group position={[0.56, -0.02, 0]} rotation={[0, 0, -0.5]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.4, 8]} />
            <meshStandardMaterial color="#241407" roughness={0.6} />
          </mesh>
          <mesh position={[0.2, 0.02, 0]}>
            <boxGeometry args={[0.12, 0.18, 0.11]} />
            <meshStandardMaterial color="#c6a86a" roughness={0.25} metalness={0.75} />
          </mesh>
        </group>
      </group>

      {/* vertical wood panel being nailed */}
      <group ref={panel} position={[0.86, 1.15, 0.1]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.55, 1.9, 0.08]} />
          <meshStandardMaterial map={panelTex} roughness={0.75} metalness={0.05} />
        </mesh>
        <mesh position={[-0.05, 0.36, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.09, 8]} />
          <meshStandardMaterial color={metalColor} metalness={0.85} roughness={0.25} />
        </mesh>
        <pointLight
          ref={flash}
          position={[-0.05, 0.36, 0.2]}
          color="#ffd79a"
          distance={2.6}
          intensity={0}
        />
        <mesh ref={spark} position={[-0.05, 0.36, 0.16]} visible={false}>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial
            map={sparkTex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0}
          />
        </mesh>
      </group>
    </group>
  );
}
