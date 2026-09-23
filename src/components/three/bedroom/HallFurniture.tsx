import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { HALL, PARTITION } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { mixValue, useEveningMix } from "./bedroomState";
import { rectGlowTexture } from "./glow";
import { Hotspot } from "./Hotspot";
import { clickable, useEased, useLampSwitch } from "./interaction";
import { MixedPointLight } from "./MixedLight";
import { Box, type V3 } from "./primitives";
import { getBedroomTextures } from "./proceduralTextures";
import { pillowGeometry, plantGeometry, vesselGeometry } from "./softGeometry";
import { useMixedEmissive } from "./useMixedEmissive";

// Everything that furnishes the living hall and the balcony deck.

const WALL_FACE = PARTITION.z1;

function hash(n: number) {
  const s = Math.sin(n * 91.345) * 43758.5453;
  return s - Math.floor(s);
}

// ─── TV feature wall (east) ───────────────────────────────────────────────

const TV_Z = 6.2;
const SLAB = { x: HALL.x1 - 0.05, w: 3.0, h: HALL.bandBottom };
const FLUTE_W = 1.3;

/** Vertical walnut battens filling a strip of wall facing -x. */
function FlutedPanel({ z0, z1 }: { z0: number; z1: number }) {
  const m = getBedroomMaterials();
  const ref = useRef<THREE.InstancedMesh>(null);
  const pitch = 0.058;
  const count = Math.floor((z1 - z0) / pitch);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const mat = new THREE.Matrix4();
    const c = new THREE.Color();
    const start = z0 + (z1 - z0 - (count - 1) * pitch) / 2;
    for (let i = 0; i < count; i++) {
      mat.makeTranslation(HALL.x1 - 0.006 - 0.014, SLAB.h / 2, start + i * pitch);
      mesh.setMatrixAt(i, mat);
      c.setScalar(0.88 + 0.14 * hash(i + z0 * 10));
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, z0, z1]);
  return (
    <group>
      <mesh position={[HALL.x1 - 0.003, SLAB.h / 2, (z0 + z1) / 2]} receiveShadow>
        <boxGeometry args={[0.006, SLAB.h, z1 - z0]} />
        <meshStandardMaterial color="#231a13" roughness={0.8} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={m.walnut} castShadow receiveShadow>
        <boxGeometry args={[0.028, SLAB.h, 0.045]} />
      </instancedMesh>
    </group>
  );
}

function TVWall() {
  const m = getBedroomMaterials();
  const t = getBedroomTextures();
  const mix = useEveningMix();
  const [tvOn, setTvOn] = useState(false);
  const on = useEased(tvOn, 3);
  const screen = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#050506",
        roughness: 0.12,
        metalness: 0.2,
        emissive: "#ffffff",
        emissiveMap: t.tvPicture,
        emissiveIntensity: 0,
      }),
    [t.tvPicture]
  );
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const underMat = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useMemo(() => rectGlowTexture(SLAB.w, SLAB.h, 0.35, 0.12), []);
  const under = useMemo(() => rectGlowTexture(0.42, 2.6, 0.3, 0.1), []);
  useFrame(() => {
    const e = mix.current;
    screen.emissiveIntensity = on.current * 1.15;
    if (haloMat.current) haloMat.current.opacity = mixValue(0.15, 0.9, e);
    if (underMat.current) underMat.current.opacity = mixValue(0, 0.8, e);
  });
  const toggle = () => setTvOn((v) => !v);
  const consoleX = SLAB.x - 0.23;

  return (
    <group>
      {/* Backlit halo on the wall behind the slab */}
      <mesh position={[HALL.x1 - 0.002, SLAB.h / 2, TV_Z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[SLAB.w + 0.7, SLAB.h + 0.7]} />
        <meshBasicMaterial ref={haloMat} map={halo} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Book-matched Nero Marquina slab, floating off the wall */}
      <mesh position={[SLAB.x, SLAB.h / 2, TV_Z]} material={m.neroSlab} castShadow receiveShadow>
        <boxGeometry args={[0.04, SLAB.h, SLAB.w]} />
      </mesh>
      <FlutedPanel z0={TV_Z - SLAB.w / 2 - FLUTE_W - 0.05} z1={TV_Z - SLAB.w / 2 - 0.05} />
      <FlutedPanel z0={TV_Z + SLAB.w / 2 + 0.05} z1={TV_Z + SLAB.w / 2 + FLUTE_W + 0.05} />

      {/* 65" TV */}
      <group position={[SLAB.x - 0.045, 1.45, TV_Z]} {...clickable(toggle)}>
        <RoundedBox args={[0.03, 0.86, 1.48]} radius={0.008} smoothness={2} castShadow>
          <meshStandardMaterial color="#0c0c0e" roughness={0.3} metalness={0.4} />
        </RoundedBox>
        <mesh position={[-0.0155, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={screen}>
          <planeGeometry args={[1.45, 0.82]} />
        </mesh>
      </group>
      <Hotspot position={[SLAB.x - 0.1, 1.95, TV_Z + 0.55]} label={tvOn ? "Switch off TV" : "Switch on TV"} onActivate={toggle} />

      {/* Floating walnut media console with an LED underglow */}
      <mesh position={[consoleX + 0.02, 0.002, TV_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.02, 3.2]} />
        <meshBasicMaterial ref={underMat} map={under} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <RoundedBox args={[0.42, 0.34, 2.6]} radius={0.01} smoothness={3} position={[consoleX, 0.43, TV_Z]} material={m.walnut} castShadow receiveShadow />
      {[-0.65, 0, 0.65].map((dz) => (
        <mesh key={dz} position={[consoleX - 0.211, 0.43, TV_Z + dz]}>
          <boxGeometry args={[0.002, 0.3, 0.005]} />
          <meshStandardMaterial color="#1b140e" />
        </mesh>
      ))}
      {/* Console styling: soundbar, sculptural vase, books, brass orb */}
      <mesh position={[consoleX - 0.02, 0.63, TV_Z]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.95]} />
        <meshStandardMaterial color="#1c1c1f" roughness={0.6} />
      </mesh>
      <ConsoleVase position={[consoleX, 0.6, TV_Z - 1.0]} />
      <mesh position={[consoleX, 0.62, TV_Z + 0.9]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.04, 0.28]} />
        <meshStandardMaterial color="#3a3f3a" roughness={0.8} />
      </mesh>
      <mesh position={[consoleX, 0.655, TV_Z + 0.9]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.17, 0.03, 0.24]} />
        <meshStandardMaterial color="#c9b79e" roughness={0.8} />
      </mesh>
      <mesh position={[consoleX, 0.73, TV_Z + 0.9]} material={m.brass} castShadow>
        <sphereGeometry args={[0.055, 32, 20]} />
      </mesh>
    </group>
  );
}

function ConsoleVase({ position }: { position: V3 }) {
  const m = getBedroomMaterials();
  const vase = useMemo(
    () => vesselGeometry([[0, 0], [0.07, 0], [0.11, 0.1], [0.1, 0.28], [0.05, 0.4], [0.045, 0.44], [0.038, 0.44], [0.035, 0.4]]),
    []
  );
  const branches = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        r: [(hash(i) - 0.5) * 0.6, 0, (hash(i + 9) - 0.5) * 0.6] as V3,
        len: 0.55 + hash(i + 3) * 0.35,
      })),
    []
  );
  return (
    <group position={position}>
      <mesh geometry={vase} material={m.ceramic} castShadow />
      {branches.map((b, i) => (
        <group key={i} position={[0, 0.4, 0]} rotation={b.r}>
          <mesh position={[0, b.len / 2, 0]} material={m.stem} castShadow>
            <cylinderGeometry args={[0.003, 0.005, b.len, 5]} />
          </mesh>
          {[0.45, 0.65, 0.85].map((f) => (
            <mesh key={f} position={[0.02, b.len * f, 0]} scale={[1.6, 0.7, 1]} material={m.leaf} castShadow>
              <sphereGeometry args={[0.022, 8, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── Sofa, tables, rug ────────────────────────────────────────────────────

/** Deep L-shaped sofa facing the TV, with a chaise return. */
function Sofa() {
  const m = getBedroomMaterials();
  const pillows = useMemo(
    () => ({
      back: [0, 1, 2].map((i) => pillowGeometry(0.98, 0.52, 0.22, 20 + i)),
      throwA: pillowGeometry(0.46, 0.46, 0.14, 31),
      throwB: pillowGeometry(0.46, 0.46, 0.14, 32),
      lumbar: pillowGeometry(0.55, 0.32, 0.13, 33),
    }),
    []
  );
  const seatY = 0.42;
  return (
    <group>
      {/* Recessed black plinth so the sofa seems to float */}
      <mesh position={[1.82, 0.04, 5.75]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.08, 2.2]} />
        <meshStandardMaterial color="#1a1817" roughness={0.7} />
      </mesh>
      <mesh position={[2.62, 0.04, 7.37]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.08, 0.84]} />
        <meshStandardMaterial color="#1a1817" roughness={0.7} />
      </mesh>
      {/* Bases */}
      <RoundedBox args={[1.02, 0.26, 2.32]} radius={0.05} smoothness={4} position={[1.8, 0.21, 5.74]} material={m.sofa} castShadow receiveShadow />
      <RoundedBox args={[2.66, 0.26, 0.96]} radius={0.05} smoothness={4} position={[2.62, 0.21, 7.37]} material={m.sofa} castShadow receiveShadow />
      {/* Back and arm */}
      <RoundedBox args={[0.24, 0.5, 3.26]} radius={0.08} smoothness={4} position={[1.41, 0.58, 6.22]} material={m.sofa} castShadow receiveShadow />
      <RoundedBox args={[1.02, 0.36, 0.2]} radius={0.08} smoothness={4} position={[1.8, 0.52, 4.68]} material={m.sofa} castShadow receiveShadow />
      {/* Seat cushions: two on the main run, one long chaise cushion */}
      <RoundedBox args={[0.78, 0.17, 1.04]} radius={0.07} smoothness={4} position={[1.93, seatY, 5.32]} material={m.sofa} castShadow receiveShadow />
      <RoundedBox args={[0.78, 0.17, 1.04]} radius={0.07} smoothness={4} position={[1.93, seatY, 6.38]} material={m.sofa} castShadow receiveShadow />
      <RoundedBox args={[2.42, 0.17, 0.9]} radius={0.07} smoothness={4} position={[2.73, seatY, 7.37]} material={m.sofa} castShadow receiveShadow />
      {/* Loose back cushions leaning on the frame */}
      {[5.3, 6.35, 7.35].map((z, i) => (
        <group key={z} position={[1.64, 0.76, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={pillows.back[i]} material={m.sofa} rotation={[-0.2, 0, 0]} castShadow receiveShadow />
        </group>
      ))}
      {/* Scatter cushions */}
      <group position={[1.84, 0.72, 4.98]} rotation={[0, Math.PI / 2 + 0.5, 0]}>
        <mesh geometry={pillows.throwA} material={m.rust} rotation={[-0.25, 0, 0.1]} castShadow receiveShadow />
      </group>
      <group position={[1.86, 0.72, 7.6]} rotation={[0, Math.PI / 2 - 0.4, 0]}>
        <mesh geometry={pillows.throwB} material={m.sage} rotation={[-0.25, 0, -0.08]} castShadow receiveShadow />
      </group>
      <group position={[1.82, 0.68, 6.0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={pillows.lumbar} material={m.boucle} rotation={[-0.2, 0, 0]} castShadow receiveShadow />
      </group>
    </group>
  );
}

function CoffeeTables() {
  const m = getBedroomMaterials();
  const flowers = useMemo(() => vesselGeometry([[0, 0], [0.05, 0], [0.06, 0.06], [0.03, 0.16], [0.028, 0.18], [0.022, 0.18], [0.02, 0.16]]), []);
  return (
    <group>
      {/* Large: walnut drum base, white marble top */}
      <group position={[3.4, 0, 5.8]}>
        <mesh position={[0, 0.19, 0]} material={m.walnut} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.43, 0.36, 64]} />
        </mesh>
        <mesh position={[0, 0.39, 0]} material={m.marbleTop} castShadow receiveShadow>
          <cylinderGeometry args={[0.56, 0.56, 0.035, 72]} />
        </mesh>
        {/* Styling: tray, books, bud vase, candle */}
        <mesh position={[0.1, 0.415, -0.08]} rotation={[0, 0.3, 0]} material={m.brass} receiveShadow>
          <boxGeometry args={[0.36, 0.012, 0.22]} />
        </mesh>
        <mesh position={[-0.22, 0.428, 0.12]} rotation={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.28, 0.04, 0.22]} />
          <meshStandardMaterial color="#2f3a33" roughness={0.8} />
        </mesh>
        <mesh position={[-0.22, 0.463, 0.12]} rotation={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.24, 0.03, 0.19]} />
          <meshStandardMaterial color="#d8cbb6" roughness={0.8} />
        </mesh>
        <mesh geometry={flowers} material={m.ceramicDark} position={[0.14, 0.42, -0.1]} castShadow />
        <mesh position={[0.02, 0.45, -0.04]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 20]} />
          <meshStandardMaterial color="#efe8dc" roughness={0.7} />
        </mesh>
      </group>
      {/* Small nesting table: Nero top on slim brass legs */}
      <group position={[3.98, 0, 6.48]}>
        <mesh position={[0, 0.29, 0]} material={m.neroSlab} castShadow receiveShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.03, 64]} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.4;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.25, 0.14, Math.sin(a) * 0.25]} rotation={[Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12]} material={m.brass} castShadow>
              <cylinderGeometry args={[0.012, 0.008, 0.28, 10]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function HallRug() {
  const rug = getBedroomTextures().rug;
  return (
    <mesh position={[3.3, 0.006, 6.2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <boxGeometry args={[3.3, 0.012, 3.2]} />
      <meshPhysicalMaterial
        color="#ece4d8"
        map={rug.map}
        bumpMap={rug.bumpMap}
        bumpScale={1.5}
        roughness={1}
        sheen={0.6}
        sheenRoughness={0.9}
        sheenColor="#f3ece0"
      />
    </mesh>
  );
}

// ─── Lighting pieces ──────────────────────────────────────────────────────

/** Arc floor lamp: marble base, sweeping steel arm, brass dome over the chaise. */
function ArcLamp() {
  const m = getBedroomMaterials();
  const lamp = useLampSwitch();
  const base: V3 = [0.95, 0, 8.2];
  const shadeAt: V3 = [2.62, 2.02, 7.3];
  const arm = useMemo(() => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.95, 0.08, 8.2),
      new THREE.Vector3(0.95, 2.5, 8.2),
      new THREE.Vector3(1.95, 2.75, 7.6),
      new THREE.Vector3(2.62, 2.14, 7.3)
    );
    return new THREE.TubeGeometry(curve, 80, 0.013, 10, false);
  }, []);
  const inner = useMixedEmissive(
    () => new THREE.MeshStandardMaterial({ color: "#f5efe6", emissive: "#FFD39C", side: THREE.BackSide }),
    0.05,
    2.4,
    lamp.level
  );
  return (
    <group>
      <mesh position={[base[0], 0.035, base[2]]} material={m.neroSlab} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.21, 0.07, 48]} />
      </mesh>
      <mesh geometry={arm} material={m.steel} castShadow />
      <group position={shadeAt} {...clickable(lamp.toggle)}>
        <mesh material={m.brass} castShadow>
          <sphereGeometry args={[0.22, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={inner} scale={0.98}>
          <sphereGeometry args={[0.22, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>
      <MixedPointLight position={[shadeAt[0], shadeAt[1] - 0.08, shadeAt[2]]} day={0} evening={2.8} level={lamp.level} distance={5} decay={2} color="#FFC890" alsoIn={[2]} />
      <Hotspot position={[shadeAt[0], shadeAt[1] + 0.3, shadeAt[2]]} label={lamp.isOn ? "Switch off arc lamp" : "Switch on arc lamp"} onActivate={lamp.toggle} />
    </group>
  );
}

/** Three tilted brass LED rings — the hall's statement chandelier. */
function RingChandelier() {
  const m = getBedroomMaterials();
  const lamp = useLampSwitch();
  const glow = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#FFE0B0" }), 0.4, 9, lamp.level);
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.03;
  });
  const rings = [
    { r: 0.62, y: 2.55, tilt: 0.12 },
    { r: 0.46, y: 2.4, tilt: -0.16 },
    { r: 0.3, y: 2.26, tilt: 0.22 },
  ];
  return (
    <group position={[3.3, 0, TV_Z]}>
      <mesh position={[0, HALL.height - 0.01, 0]} material={m.brass}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 40]} />
      </mesh>
      {rings.map((ring, i) =>
        [0, 1, 2].map((k) => {
          const a = (k / 3) * Math.PI * 2 + i;
          const len = HALL.height - ring.y;
          return (
            <mesh key={`${i}-${k}`} position={[Math.cos(a) * ring.r * 0.97, ring.y + len / 2, Math.sin(a) * ring.r * 0.97]} material={m.steel}>
              <cylinderGeometry args={[0.0015, 0.0015, len, 4]} />
            </mesh>
          );
        })
      )}
      <group ref={group} {...clickable(lamp.toggle)}>
        {rings.map((ring) => (
          <group key={ring.r} position={[0, ring.y, 0]} rotation={[Math.PI / 2 + ring.tilt, ring.tilt, 0]}>
            <mesh material={m.brass} castShadow>
              <torusGeometry args={[ring.r, 0.02, 16, 120]} />
            </mesh>
            <mesh material={glow} position={[0, 0, 0.012]}>
              <torusGeometry args={[ring.r - 0.004, 0.009, 8, 120]} />
            </mesh>
          </group>
        ))}
      </group>
      <MixedPointLight position={[0, 2.25, 0]} day={0} evening={4.2} level={lamp.level} distance={8} decay={1.8} color="#FFD6A6" alsoIn={[2, 3]} />
      <Hotspot position={[0, 2.05, 0]} label={lamp.isOn ? "Switch off chandelier" : "Switch on chandelier"} onActivate={lamp.toggle} />
    </group>
  );
}

// ─── Seating ──────────────────────────────────────────────────────────────

/** Cognac leather barrel chair on a walnut swivel base, facing the sofa. */
function AccentChair() {
  const m = getBedroomMaterials();
  const arc = Math.PI * 1.5;
  // Centred on local -z (theta = π), leaving the front (+z) open.
  const start = Math.PI - arc / 2;
  return (
    <group position={[4.35, 0, 8.55]} rotation={[0, -2.8, 0]}>
      <mesh position={[0, 0.05, 0]} material={m.walnut} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.1, 40]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} material={m.blackMetal}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} material={m.leather} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.38, 0.12, 48]} />
      </mesh>
      <mesh position={[0, 0.44, 0.02]} material={m.leather} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.1, 48]} />
      </mesh>
      <mesh position={[0, 0.6, 0]} material={m.leather} castShadow receiveShadow>
        <cylinderGeometry args={[0.41, 0.41, 0.44, 64, 1, true, start, arc]} />
      </mesh>
      <mesh position={[0, 0.6, 0]} material={m.leather}>
        <cylinderGeometry args={[0.36, 0.36, 0.44, 64, 1, true, start, arc]} />
      </mesh>
    </group>
  );
}

function DiningChair({ angle }: { angle: number }) {
  const m = getBedroomMaterials();
  const r = 0.74;
  return (
    <group position={[Math.sin(angle) * r, 0, Math.cos(angle) * r]} rotation={[0, angle + Math.PI, 0]}>
      {(
        [
          [-0.18, -0.17],
          [0.18, -0.17],
          [-0.18, 0.17],
          [0.18, 0.17],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.21, z]} rotation={[z * 0.3, 0, -x * 0.3]} material={m.walnut} castShadow>
          <cylinderGeometry args={[0.016, 0.011, 0.42, 10]} />
        </mesh>
      ))}
      <RoundedBox args={[0.46, 0.07, 0.44]} radius={0.03} smoothness={3} position={[0, 0.46, 0]} material={m.boucle} castShadow receiveShadow />
      {/* Curved back rest, on the far side from the table */}
      <mesh position={[0, 0.74, -0.06]} material={m.boucle} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.3, 40, 1, true, Math.PI - 0.95, 1.9]} />
      </mesh>
      <mesh position={[0, 0.555, -0.24]} material={m.walnut}>
        <boxGeometry args={[0.04, 0.12, 0.04]} />
      </mesh>
    </group>
  );
}

function PendantCluster({ x, z }: { x: number; z: number }) {
  const m = getBedroomMaterials();
  const lamp = useLampSwitch();
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#D9B892",
        roughness: 0.05,
        transparent: true,
        opacity: 0.45,
        emissive: "#FFB978",
        depthWrite: false,
      }),
    []
  );
  const bulb = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#FFD6A0" }), 0.3, 14, lamp.level);
  useFrame(() => {
    glass.emissiveIntensity = mixValue(0.02, 1.2, lamp.level.current);
  });
  const globes = [
    { a: 0, d: 0.0, y: 1.72, r: 0.13 },
    { a: 0.3, d: 0.28, y: 1.88, r: 0.1 },
    { a: 1.9, d: 0.3, y: 1.62, r: 0.11 },
    { a: 3.6, d: 0.27, y: 1.95, r: 0.09 },
    { a: 5.0, d: 0.3, y: 1.78, r: 0.1 },
  ];
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, HALL.height - 0.012, 0]} material={m.brass}>
        <cylinderGeometry args={[0.22, 0.22, 0.024, 48]} />
      </mesh>
      <group {...clickable(lamp.toggle)}>
        {globes.map((g, i) => {
          const gx = Math.cos(g.a) * g.d;
          const gz = Math.sin(g.a) * g.d;
          const len = HALL.height - g.y - g.r;
          return (
            <group key={i}>
              <mesh position={[gx, g.y + g.r + len / 2, gz]} material={m.blackMetal}>
                <cylinderGeometry args={[0.003, 0.003, len, 5]} />
              </mesh>
              <mesh position={[gx, g.y + g.r + 0.01, gz]} material={m.brass}>
                <cylinderGeometry args={[0.02, 0.025, 0.03, 16]} />
              </mesh>
              <mesh position={[gx, g.y, gz]} material={glass}>
                <sphereGeometry args={[g.r, 36, 24]} />
              </mesh>
              <mesh position={[gx, g.y, gz]} material={bulb}>
                <sphereGeometry args={[0.022, 16, 10]} />
              </mesh>
            </group>
          );
        })}
      </group>
      <MixedPointLight position={[0, 1.7, 0]} day={0} evening={3.4} level={lamp.level} distance={6} decay={2} color="#FFC58A" alsoIn={[2]} />
      <Hotspot position={[0, 1.42, 0]} label={lamp.isOn ? "Switch off dining lights" : "Switch on dining lights"} onActivate={lamp.toggle} />
    </group>
  );
}

const FRUIT: [number, number, number, string][] = [
  [0.05, 0.08, 0.02, "#d6822f"],
  [-0.06, 0.08, 0.03, "#e0a33a"],
  [0.0, 0.085, -0.07, "#8aa241"],
  [0.02, 0.13, 0.0, "#c24f2b"],
];

function Dining() {
  const m = getBedroomMaterials();
  const x = -2.4;
  const z = 6.8;
  const pedestal = useMemo(
    () => vesselGeometry([[0, 0], [0.34, 0], [0.34, 0.03], [0.22, 0.08], [0.1, 0.3], [0.08, 0.5], [0.12, 0.68], [0.2, 0.72], [0, 0.72]], 64),
    []
  );
  const bowl = useMemo(() => vesselGeometry([[0, 0], [0.08, 0], [0.16, 0.05], [0.19, 0.1], [0.18, 0.1], [0.14, 0.05], [0, 0.03]], 48), []);
  return (
    <group>
      <group position={[x, 0, z]}>
        <mesh geometry={pedestal} material={m.walnut} castShadow receiveShadow />
        <mesh position={[0, 0.74, 0]} material={m.walnut} castShadow receiveShadow>
          <cylinderGeometry args={[0.66, 0.64, 0.045, 80]} />
        </mesh>
        {/* Linen runner, fruit bowl, a pair of candles */}
        <mesh position={[0, 0.764, 0]} rotation={[0, 0.5, 0]} receiveShadow>
          <boxGeometry args={[1.0, 0.003, 0.3]} />
          <meshPhysicalMaterial color="#d8cfbf" roughness={1} sheen={0.6} />
        </mesh>
        <group position={[0, 0.765, 0]}>
          <mesh geometry={bowl} material={m.ceramic} castShadow />
          {FRUIT.map(([fx, fy, fz, c], i) => (
            <mesh key={i} position={[fx, fy, fz]} castShadow>
              <sphereGeometry args={[0.042, 20, 14]} />
              <meshStandardMaterial color={c} roughness={0.45} />
            </mesh>
          ))}
          {[-0.34, 0.34].map((dx) => (
            <group key={dx} position={[dx * Math.cos(0.5), 0, -dx * Math.sin(0.5)]}>
              <mesh position={[0, 0.02, 0]} material={m.brass}>
                <cylinderGeometry args={[0.035, 0.04, 0.04, 20]} />
              </mesh>
              <mesh position={[0, 0.14, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.2, 12]} />
                <meshStandardMaterial color="#efe6d6" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
        {[0.25, 0.25 + Math.PI / 2, 0.25 + Math.PI, 0.25 + (3 * Math.PI) / 2].map((a) => (
          <DiningChair key={a} angle={a} />
        ))}
      </group>
      <PendantCluster x={x} z={z} />
    </group>
  );
}

// ─── Joinery ──────────────────────────────────────────────────────────────

const BOOK_COLORS = ["#2F3A45", "#7B4B36", "#C9B79E", "#4F5B4A", "#A25B3C", "#1F2226", "#D8CCB6", "#6C6A73", "#8E7458", "#B2402F", "#E6DED0", "#39505A"];
const SHELF = { xBack: HALL.x0, depth: 0.4, z0: 3.4, z1: 8.6, bays: 5, ys: [1.12, 1.54, 1.96, 2.38, 2.8] };
const BAY_W = (SHELF.z1 - SHELF.z0) / SHELF.bays;

function buildBooks() {
  const out: { p: V3; s: V3; r: number; c: string }[] = [];
  let seed = 1;
  for (let b = 0; b < SHELF.bays; b++) {
    for (let s = 0; s < SHELF.ys.length - 1; s++) {
      seed++;
      // Every third shelf gets an object instead (see the bookshelf decor).
      if ((b + s) % 3 === 2) continue;
      const runLen = BAY_W * (0.45 + hash(seed) * 0.35);
      let z = SHELF.z0 + b * BAY_W + 0.05 + (hash(seed + 7) > 0.5 ? BAY_W - runLen - 0.1 : 0);
      const zEnd = z + runLen;
      let k = 0;
      while (z < zEnd) {
        const t = 0.022 + hash(seed * 13 + k) * 0.025;
        const h = 0.2 + hash(seed * 7 + k) * 0.13;
        const d = 0.15 + hash(seed * 3 + k) * 0.06;
        out.push({
          p: [SHELF.xBack + SHELF.depth - 0.04 - d / 2, SHELF.ys[s] + 0.0125 + h / 2, z + t / 2],
          s: [d, h, t],
          r: hash(seed + k) > 0.92 ? 0.12 : 0,
          c: BOOK_COLORS[Math.floor(hash(seed * 31 + k) * BOOK_COLORS.length)],
        });
        z += t + 0.002;
        k++;
      }
    }
  }
  return out;
}

/** Wall-to-wall walnut bookshelf with lit open shelves over closed cupboards. */
function Bookshelf() {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const books = useRef<THREE.InstancedMesh>(null);
  const led = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFD9A8" }), []);
  useFrame(() => {
    led.emissiveIntensity = mixValue(0.3, 4.5, mix.current);
  });
  const bookList = useMemo(buildBooks, []);

  useLayoutEffect(() => {
    const mesh = books.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    bookList.forEach((b, i) => {
      o.position.set(...b.p);
      o.rotation.set(b.r, 0, 0);
      o.scale.set(...b.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, c.set(b.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [bookList]);

  const vase = useMemo(() => vesselGeometry([[0, 0], [0.05, 0], [0.08, 0.08], [0.06, 0.2], [0.03, 0.26], [0.026, 0.26], [0.024, 0.22]]), []);
  const bowl = useMemo(() => vesselGeometry([[0, 0], [0.05, 0], [0.12, 0.05], [0.13, 0.07], [0.12, 0.07], [0.1, 0.045], [0, 0.02]]), []);
  const cx = SHELF.xBack + SHELF.depth / 2;
  const cz = (SHELF.z0 + SHELF.z1) / 2;
  const len = SHELF.z1 - SHELF.z0;
  const front = SHELF.xBack + SHELF.depth;

  return (
    <group>
      <mesh position={[SHELF.xBack + 0.006, HALL.bandBottom / 2, cz]} material={m.carcassDark} receiveShadow>
        <boxGeometry args={[0.012, HALL.bandBottom, len]} />
      </mesh>
      {Array.from({ length: SHELF.bays + 1 }, (_, i) => (
        <mesh key={i} position={[cx, HALL.bandBottom / 2, SHELF.z0 + i * BAY_W]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[SHELF.depth, HALL.bandBottom, 0.03]} />
        </mesh>
      ))}
      <mesh position={[cx, HALL.bandBottom - 0.02, cz]} material={m.walnut} castShadow>
        <boxGeometry args={[SHELF.depth, 0.04, len + 0.03]} />
      </mesh>
      {/* Closed cupboards below */}
      <mesh position={[cx, 0.38, cz]} material={m.walnut} castShadow receiveShadow>
        <boxGeometry args={[SHELF.depth + 0.02, 0.76, len + 0.03]} />
      </mesh>
      {Array.from({ length: SHELF.bays * 2 - 1 }, (_, i) => (
        <mesh key={i} position={[front + 0.011, 0.4, SHELF.z0 + (i + 1) * (BAY_W / 2)]}>
          <boxGeometry args={[0.002, 0.66, 0.005]} />
          <meshStandardMaterial color="#1b140e" />
        </mesh>
      ))}
      {Array.from({ length: SHELF.bays * 2 }, (_, i) => (
        <mesh key={i} position={[front + 0.022, 0.62, SHELF.z0 + (i + 0.5) * (BAY_W / 2) + (i % 2 ? -0.2 : 0.2)]} material={m.brass}>
          <boxGeometry args={[0.012, 0.12, 0.012]} />
        </mesh>
      ))}
      {/* Shelves, each with an LED strip under its front edge */}
      {SHELF.ys.map((y) => (
        <group key={y}>
          <mesh position={[cx, y, cz]} material={m.walnut} castShadow receiveShadow>
            <boxGeometry args={[SHELF.depth, 0.025, len]} />
          </mesh>
          <mesh position={[front - 0.03, y - 0.016, cz]} material={led}>
            <boxGeometry args={[0.008, 0.004, len - 0.04]} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={books} args={[undefined, undefined, bookList.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
      {/* Objects on the shelves without books */}
      {Array.from({ length: SHELF.bays }, (_, b) =>
        SHELF.ys.slice(0, -1).map((y, s) => {
          if ((b + s) % 3 !== 2) return null;
          const kind = (b * 3 + s) % 3;
          return (
            <group key={`${b}-${s}`} position={[cx + 0.02, y + 0.0125, SHELF.z0 + (b + 0.5) * BAY_W]}>
              {kind === 0 && <mesh geometry={vase} material={m.ceramic} castShadow />}
              {kind === 1 && <mesh geometry={bowl} material={m.ceramicDark} castShadow />}
              {kind === 2 && (
                <mesh position={[0, 0.07, 0]} material={m.brass} castShadow>
                  <torusKnotGeometry args={[0.05, 0.016, 80, 12]} />
                </mesh>
              )}
            </group>
          );
        })
      )}
    </group>
  );
}

/** Console table under a large artwork, with a switchable table lamp. */
function EntryConsole() {
  const m = getBedroomMaterials();
  const art = getBedroomTextures().hallArtwork;
  const lamp = useLampSwitch();
  const shade = useMixedEmissive(
    () => new THREE.MeshStandardMaterial({ color: "#efe4d0", emissive: "#FFC98C", roughness: 0.9, side: THREE.DoubleSide }),
    0.03,
    1.7,
    lamp.level
  );
  const base = useMemo(() => vesselGeometry([[0, 0], [0.07, 0], [0.11, 0.08], [0.11, 0.22], [0.06, 0.32], [0.02, 0.36], [0, 0.36]], 48), []);
  const cx = -2.3;
  const z = WALL_FACE + 0.22;
  const artW = 1.6;
  const artH = 1.04;
  return (
    <group>
      <group position={[cx, 0, z]}>
        {/* Brass frame legs */}
        {[-0.86, 0.86].flatMap((dx) =>
          [-0.16, 0.16].map((dz) => (
            <mesh key={`${dx}-${dz}`} position={[dx, 0.39, dz]} material={m.brass} castShadow>
              <boxGeometry args={[0.02, 0.78, 0.02]} />
            </mesh>
          ))
        )}
        <mesh position={[0, 0.25, 0]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[1.72, 0.025, 0.34]} />
        </mesh>
        <mesh position={[0, 0.8, 0]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.045, 0.4]} />
        </mesh>
        {/* Woven baskets on the lower shelf */}
        {[-0.45, 0.35].map((dx) => (
          <mesh key={dx} position={[dx, 0.36, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.16, 0.14, 0.2, 32]} />
            <meshStandardMaterial color="#b89a70" roughness={1} />
          </mesh>
        ))}
        <group position={[0.62, 0.823, 0]} {...clickable(lamp.toggle)}>
          <mesh geometry={base} material={m.ceramicDark} castShadow />
          <mesh position={[0, 0.4, 0]} material={m.brass}>
            <cylinderGeometry args={[0.006, 0.006, 0.12, 8]} />
          </mesh>
          <mesh position={[0, 0.52, 0]} material={shade} castShadow>
            <cylinderGeometry args={[0.13, 0.17, 0.22, 40, 1, true]} />
          </mesh>
        </group>
        <Hotspot position={[0.62, 1.62, 0]} label={lamp.isOn ? "Switch off lamp" : "Switch on lamp"} onActivate={lamp.toggle} />
        <ConsoleVase position={[-0.55, 0.823, -0.02]} />
        <mesh position={[0.05, 0.845, 0.02]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.26, 0.04, 0.2]} />
          <meshStandardMaterial color="#6d4a38" roughness={0.8} />
        </mesh>
      </group>
      {/* Framed artwork */}
      <group position={[cx, 1.9, WALL_FACE + 0.03]}>
        <mesh position={[0, 0, 0.013]}>
          <planeGeometry args={[artW, artH]} />
          <meshStandardMaterial map={art} roughness={0.9} />
        </mesh>
        <Box size={[artW + 0.08, artH + 0.08, 0.025]} position={[0, 0, -0.001]} material={m.walnut} />
      </group>
    </group>
  );
}

function IndoorPlant({ position, scale, seed }: { position: V3; scale: number; seed: number }) {
  const m = getBedroomMaterials();
  const pot = useMemo(() => vesselGeometry([[0, 0.02], [0.2, 0], [0.24, 0.05], [0.25, 0.5], [0.235, 0.51], [0.22, 0.48], [0, 0.48]], 56), []);
  const plant = useMemo(() => plantGeometry(seed), [seed]);
  return (
    <group position={position}>
      <mesh geometry={pot} material={m.concrete} castShadow receiveShadow />
      <mesh position={[0, 0.485, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.01, 32]} />
        <meshStandardMaterial color="#3a2c20" roughness={1} />
      </mesh>
      <group position={[0, 0.48, 0]} scale={scale}>
        <mesh geometry={plant.stems} material={m.stem} castShadow />
        <mesh geometry={plant.leaves} material={m.leaf} castShadow receiveShadow />
      </group>
    </group>
  );
}

// ─── Balcony deck ─────────────────────────────────────────────────────────

function Lounger({ x }: { x: number }) {
  const m = getBedroomMaterials();
  const cushion = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#EAE3D6", roughness: 0.95, sheen: 0.8, sheenColor: new THREE.Color("#ffffff") }),
    []
  );
  return (
    <group position={[x, 0, 12.0]}>
      {[-0.4, 0.4].map((dx) => (
        <mesh key={dx} position={[dx, 0.2, 0.1]} material={m.teak} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.06, 1.6]} />
        </mesh>
      ))}
      {(
        [
          [-0.4, -0.62],
          [0.4, -0.62],
          [-0.4, 0.82],
          [0.4, 0.82],
        ] as [number, number][]
      ).map(([dx, dz], i) => (
        <mesh key={i} position={[dx, 0.09, dz]} material={m.teak} castShadow>
          <boxGeometry args={[0.05, 0.18, 0.05]} />
        </mesh>
      ))}
      <RoundedBox args={[0.78, 0.08, 1.05]} radius={0.035} smoothness={3} position={[0, 0.27, 0.35]} material={cushion} castShadow receiveShadow />
      {/* Raised back rest at the house end */}
      <group position={[0, 0.27, -0.2]} rotation={[-0.75, 0, 0]}>
        <RoundedBox args={[0.78, 0.08, 0.62]} radius={0.035} smoothness={3} position={[0, 0.02, -0.3]} material={cushion} castShadow receiveShadow />
      </group>
    </group>
  );
}

const DECK_POSTS: V3[] = [
  [-3.5, 0, 12.7],
  [4.5, 0, 12.7],
  [-3.5, 0, 10.2],
  [4.5, 0, 10.2],
];
const DECK_SPANS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
];

function buildBulbs() {
  const out: V3[] = [];
  for (const [a, b] of DECK_SPANS) {
    const pa = DECK_POSTS[a];
    const pb = DECK_POSTS[b];
    const n = Math.round(Math.hypot(pb[0] - pa[0], pb[2] - pa[2]) / 0.45);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      out.push([pa[0] + (pb[0] - pa[0]) * t, 2.5 - Math.sin(t * Math.PI) * 0.35, pa[2] + (pb[2] - pa[2]) * t]);
    }
  }
  return out;
}

/** Warm festoon lights strung around the deck on slim black posts. */
function StringLights() {
  const m = getBedroomMaterials();
  const lamp = useLampSwitch();
  const bulbMat = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#fff4df", emissive: "#FFC477" }), 0.2, 10, lamp.level);
  const bulbs = useMemo(buildBulbs, []);
  return (
    <group>
      {DECK_POSTS.map((p, i) => (
        <mesh key={i} position={[p[0], 1.28, p[2]]} material={m.blackMetal} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 2.56, 10]} />
        </mesh>
      ))}
      <group {...clickable(lamp.toggle)}>
        {bulbs.map((b, i) => (
          <mesh key={i} position={b} material={bulbMat}>
            <sphereGeometry args={[0.028, 12, 8]} />
          </mesh>
        ))}
      </group>
      {/* The festoons' combined warm wash over the deck */}
      <MixedPointLight position={[0.5, 2.1, 11.6]} day={0} evening={2.6} level={lamp.level} distance={8} decay={1.6} color="#FFC080" />
      <Hotspot position={[0.5, 2.3, 12.7]} label={lamp.isOn ? "Switch off string lights" : "Switch on string lights"} onActivate={lamp.toggle} />
    </group>
  );
}

function PlanterFoliage({ seed }: { seed: number }) {
  const m = getBedroomMaterials();
  const plant = useMemo(() => plantGeometry(seed), [seed]);
  return (
    <group>
      <mesh geometry={plant.stems} material={m.stem} castShadow />
      <mesh geometry={plant.leaves} material={m.leaf} castShadow receiveShadow />
    </group>
  );
}

function DeckFurniture() {
  const m = getBedroomMaterials();
  return (
    <group>
      <Lounger x={0} />
      <Lounger x={2.4} />
      <group position={[1.2, 0, 12.2]}>
        <mesh position={[0, 0.2, 0]} material={m.teak} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.2, 0.4, 32]} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.03, 0.1, 20]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.02} transparent opacity={0.3} />
        </mesh>
      </group>
      {[-3.3, 4.3].map((x, i) => (
        <group key={x}>
          <Box size={[0.6, 0.55, 0.6]} position={[x, 0.275, 12.5]} material={m.concrete} />
          <group position={[x, 0.55, 12.5]} scale={1.1}>
            <PlanterFoliage seed={40 + i} />
          </group>
        </group>
      ))}
      <StringLights />
    </group>
  );
}

export function HallFurniture() {
  return (
    <group>
      <TVWall />
      <HallRug />
      <Sofa />
      <CoffeeTables />
      <ArcLamp />
      <RingChandelier />
      <AccentChair />
      <Dining />
      <Bookshelf />
      <EntryConsole />
      <IndoorPlant position={[-4.15, 0, 9.45]} scale={1.45} seed={11} />
      <IndoorPlant position={[5.0, 0, 9.45]} scale={1.3} seed={13} />
      <DeckFurniture />
    </group>
  );
}
