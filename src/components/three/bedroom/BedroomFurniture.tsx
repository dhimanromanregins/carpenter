import { useContext, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ROOM } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { getBedroomTextures } from "./proceduralTextures";
import { coverGeometry, pillowGeometry, plantGeometry, vesselGeometry } from "./softGeometry";
import { CameraSpaceContext, mixValue, useEveningMix } from "./bedroomState";
import { MixedPointLight } from "./MixedLight";
import { useMixedEmissive } from "./useMixedEmissive";
import { Drawer } from "./Drawer";
import { clickable, useLampSwitch } from "./interaction";
import { Hotspot } from "./Hotspot";

const SLAT_FRONT = ROOM.z0 + 0.034;
const MATTRESS_TOP = 0.62;

type V3 = [number, number, number];

// ─── Bed ──────────────────────────────────────────────────────────────────

/** Soft floor glow for the "floating" bed plinth, strongest right at its edge. */
function underglowTexture(w: number, d: number, pad: number) {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const tw = w + 2 * pad;
  const td = d + 2 * pad;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = (x / S - 0.5) * tw;
      const pz = (y / S - 0.5) * td;
      const ox = Math.max(0, Math.abs(px) - w / 2);
      const oz = Math.max(0, Math.abs(pz) - d / 2);
      const dist = Math.hypot(ox, oz);
      const a = Math.exp(-dist / 0.09);
      const i = (y * S + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 190;
      img.data[i + 2] = 120;
      img.data[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Bed() {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const baseZ0 = -2.16;
  const baseZ1 = -0.14;
  const baseLen = baseZ1 - baseZ0;
  const baseZ = (baseZ0 + baseZ1) / 2;

  const duvet = useMemo(
    () =>
      coverGeometry({
        width: 1.86,
        length: 1.43,
        drop: 0.3,
        footDrop: 0.3,
        top: MATTRESS_TOP + 0.005,
        radius: 0.06,
        puff: 0.022,
        quiltPitch: 0.3,
        folds: 0.018,
        seed: 3,
      }),
    []
  );
  const throwGeo = useMemo(
    () =>
      coverGeometry({
        width: 1.9,
        length: 0.5,
        drop: 0.36,
        footDrop: 0.33,
        top: MATTRESS_TOP + 0.037,
        radius: 0.075,
        puff: 0.004,
        quiltPitch: 1,
        folds: 0.03,
        seed: 9,
        segments: [120, 60],
      }),
    []
  );
  const pillows = useMemo(
    () => ({
      sleep: pillowGeometry(0.72, 0.5, 0.2, 1),
      sleep2: pillowGeometry(0.72, 0.5, 0.2, 2),
      euro: pillowGeometry(0.52, 0.48, 0.17, 3),
      euro2: pillowGeometry(0.52, 0.48, 0.17, 4),
      lumbar: pillowGeometry(0.62, 0.3, 0.14, 5),
    }),
    []
  );
  const glowTex = useMemo(() => underglowTexture(1.8, 1.85, 0.3), []);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (glowMat.current) glowMat.current.opacity = mixValue(0, 0.85, mix.current);
  });

  const channels = 9;
  const chW = 2.16 / channels;

  return (
    <group>
      {/* Channel-tufted upholstered headboard */}
      <mesh position={[0, 0.74, SLAT_FRONT + 0.012]} material={m.walnut} castShadow receiveShadow>
        <boxGeometry args={[2.22, 1.36, 0.024]} />
      </mesh>
      {Array.from({ length: channels }, (_, i) => (
        <RoundedBox
          key={i}
          args={[chW - 0.006, 1.3, 0.1]}
          radius={0.045}
          smoothness={4}
          position={[-1.08 + chW * (i + 0.5), 0.74, SLAT_FRONT + 0.075]}
          material={m.upholstery}
          castShadow
          receiveShadow
        />
      ))}

      {/* Floating plinth, upholstered base and mattress */}
      <mesh position={[0, 0.04, baseZ]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 1.85]} />
        <meshStandardMaterial color="#1E1A17" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, baseZ]}>
        <planeGeometry args={[2.4, 2.45]} />
        <meshBasicMaterial
          ref={glowMat}
          map={glowTex}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <RoundedBox args={[1.98, 0.3, baseLen]} radius={0.04} smoothness={4} position={[0, 0.23, baseZ]} material={m.upholstery} castShadow receiveShadow />
      <RoundedBox args={[1.84, 0.24, 1.98]} radius={0.06} smoothness={5} position={[0, 0.5, baseZ + 0.01]} material={m.linenWhite} castShadow receiveShadow />

      {/* Duvet with its turned-down top, and a knit throw across the foot */}
      <mesh geometry={duvet} material={m.linenDuvet} position={[0, 0, -1.58]} castShadow receiveShadow />
      <RoundedBox args={[1.9, 0.05, 0.22]} radius={0.024} smoothness={4} position={[0, MATTRESS_TOP + 0.035, -1.5]} material={m.linenDuvet} castShadow receiveShadow />
      <mesh geometry={throwGeo} material={m.rust} position={[0, 0, -0.64]} castShadow receiveShadow />

      {/* Pillows: two sleeping, two euro shams, one lumbar */}
      <mesh geometry={pillows.sleep} material={m.linenWhite} position={[-0.46, MATTRESS_TOP + 0.23, -1.99]} rotation={[-0.32, 0.03, 0.02]} castShadow receiveShadow />
      <mesh geometry={pillows.sleep2} material={m.linenWhite} position={[0.46, MATTRESS_TOP + 0.23, -1.99]} rotation={[-0.32, -0.03, -0.02]} castShadow receiveShadow />
      <mesh geometry={pillows.euro} material={m.sage} position={[-0.38, MATTRESS_TOP + 0.22, -1.83]} rotation={[-0.24, 0.06, 0.03]} castShadow receiveShadow />
      <mesh geometry={pillows.euro2} material={m.sage} position={[0.38, MATTRESS_TOP + 0.22, -1.83]} rotation={[-0.24, -0.06, -0.03]} castShadow receiveShadow />
      <mesh geometry={pillows.lumbar} material={m.rust} position={[0, MATTRESS_TOP + 0.15, -1.7]} rotation={[-0.2, 0, 0]} castShadow receiveShadow />
    </group>
  );
}

// ─── Bedside ──────────────────────────────────────────────────────────────

function TaperedLegs({ w, d, h, inset, material }: { w: number; d: number; h: number; inset: number; material: THREE.Material }) {
  const pts: [number, number][] = [
    [-w / 2 + inset, -d / 2 + inset],
    [w / 2 - inset, -d / 2 + inset],
    [-w / 2 + inset, d / 2 - inset],
    [w / 2 - inset, d / 2 - inset],
  ];
  return (
    <>
      {pts.map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]} material={material} castShadow>
          <cylinderGeometry args={[0.016, 0.011, h, 12]} />
        </mesh>
      ))}
    </>
  );
}

/**
 * An open-fronted cabinet shell (top, bottom, sides, back) so drawers
 * pulled out of it reveal a real cavity. Local origin: floor-centre of the
 * footprint; front face at +d/2.
 */
function Carcass({ w, h, d, y0, material }: { w: number; h: number; d: number; y0: number; material: THREE.Material }) {
  const m = getBedroomMaterials();
  const P = 0.018;
  const cy = y0 + h / 2;
  return (
    <group>
      <RoundedBox args={[w, 0.024, d]} radius={0.008} smoothness={3} position={[0, y0 + h - 0.012, 0]} material={material} castShadow receiveShadow />
      <mesh position={[0, y0 + P / 2, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[w, P, d]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - P / 2), cy, 0]} material={material} castShadow receiveShadow>
          <boxGeometry args={[P, h - 0.024, d]} />
        </mesh>
      ))}
      <mesh position={[0, cy, -d / 2 + 0.005]} material={m.carcassDark} receiveShadow>
        <boxGeometry args={[w - 2 * P, h - 0.03, 0.01]} />
      </mesh>
    </group>
  );
}

function Book({ w, t, d, color, position, rotY = 0 }: { w: number; t: number; d: number; color: string; position: V3; rotY?: number }) {
  return (
    <mesh position={position} rotation={[0, rotY, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, t, d]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Folded({ w, d, count, colors, position }: { w: number; d: number; count: number; colors: string[]; position: V3 }) {
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <RoundedBox key={i} args={[w, 0.028, d]} radius={0.01} smoothness={2} position={[0, 0.014 + i * 0.029, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={colors[i % colors.length]} roughness={0.95} sheen={0.7} sheenColor="#ffffff" />
        </RoundedBox>
      ))}
    </group>
  );
}

function Nightstand({ x, side }: { x: number; side: -1 | 1 }) {
  const m = getBedroomMaterials();
  const vase = useMemo(
    () => vesselGeometry([[0, 0], [0.045, 0], [0.06, 0.05], [0.05, 0.13], [0.025, 0.17], [0.028, 0.19], [0.022, 0.19], [0.02, 0.17]]),
    []
  );
  const candle = useLampSwitch();
  const flame = useMixedEmissive(
    () => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFB45E" }),
    0,
    14,
    candle.level
  );
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const f = flameRef.current;
    if (!f) return;
    const lvl = candle.level.current;
    const flicker = 1 + Math.sin(clock.elapsedTime * 17) * 0.06 + Math.sin(clock.elapsedTime * 29) * 0.04;
    f.visible = lvl > 0.02;
    f.scale.set(lvl, 1.8 * lvl * flicker, lvl);
  });

  const W = 0.52;
  const H = 0.4;
  const D = 0.42;
  const Y0 = 0.14;
  const front = D / 2 + 0.018;
  const drawerH = (H - 0.024 - 0.018) / 2;
  const z = -2.07;
  return (
    <group position={[x, 0, z]}>
      <TaperedLegs w={W} d={D} h={Y0} inset={0.05} material={m.blackMetal} />
      <Carcass w={W} h={H} d={D} y0={Y0} material={m.walnut} />
      {/* Top drawer: reading glasses, a paperback, a phone charger */}
      <Drawer w={W - 0.004} h={drawerH} d={0.36} position={[0, Y0 + 0.018 + drawerH * 1.5, front]} front={m.walnut} handle="knob" travel={0.26} hint="Open drawer">
        <Book w={0.13} t={0.022} d={0.19} color={side < 0 ? "#6E4E3A" : "#324A5F"} position={[-0.1, 0.011, 0.02]} rotY={0.1} />
        <mesh position={[0.1, 0.012, -0.05]} rotation={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.15, 0.024, 0.055]} />
          <meshStandardMaterial color="#1f2326" roughness={0.5} />
        </mesh>
        <mesh position={[0.08, 0.004, 0.09]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.035, 0.003, 6, 24]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.6} />
        </mesh>
      </Drawer>
      {/* Bottom drawer: a folded spare throw */}
      <Drawer w={W - 0.004} h={drawerH} d={0.36} position={[0, Y0 + 0.018 + drawerH * 0.5, front]} front={m.walnut} handle="knob" travel={0.26}>
        <Folded w={0.4} d={0.28} count={3} colors={["#CDBFA8", "#B7A58B", "#E1D6C4"]} position={[0, 0, 0]} />
      </Drawer>

      {side < 0 ? (
        <group position={[0, Y0 + H, 0]}>
          <Book w={0.22} t={0.03} d={0.16} color="#6B5D4F" position={[-0.07, 0.015, 0.02]} rotY={0.12} />
          <Book w={0.19} t={0.03} d={0.14} color="#C8BBA5" position={[-0.07, 0.045, 0.02]} rotY={-0.05} />
          <mesh geometry={vase} material={m.ceramic} position={[0.14, 0, -0.06]} castShadow />
        </group>
      ) : (
        <group position={[0, Y0 + H, 0]}>
          <mesh position={[-0.05, 0.004, 0.02]} material={m.brass} receiveShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.008, 40]} />
          </mesh>
          <mesh position={[-0.05, 0.05, 0.02]} castShadow {...clickable(candle.toggle)}>
            <cylinderGeometry args={[0.035, 0.035, 0.085, 24]} />
            <meshStandardMaterial color="#F1EADD" roughness={0.7} />
          </mesh>
          <mesh ref={flameRef} position={[-0.05, 0.105, 0.02]} material={flame} scale={[1, 1.8, 1]}>
            <sphereGeometry args={[0.007, 12, 8]} />
          </mesh>
          <Hotspot position={[-0.05, 0.16, 0.02]} label={candle.isOn ? "Blow out candle" : "Light candle"} onActivate={candle.toggle} />
          <mesh position={[0.14, 0.05, -0.08]} castShadow>
            <cylinderGeometry args={[0.03, 0.028, 0.1, 24]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.02} transparent opacity={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Pendant({ x, z }: { x: number; z: number }) {
  const m = getBedroomMaterials();
  const lamp = useLampSwitch();
  const globeY = 1.26;
  const cordTop = ROOM.bandBottom;
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#E9CBA2",
        roughness: 0.08,
        transparent: true,
        opacity: 0.5,
        emissive: "#FFB978",
        depthWrite: false,
      }),
    []
  );
  const bulb = useMixedEmissive(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#FFD6A0" }),
    0.3,
    16,
    lamp.level
  );
  useFrame(() => {
    glass.emissiveIntensity = mixValue(0.02, 1.4, lamp.level.current);
  });
  const handlers = clickable(lamp.toggle);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, cordTop - 0.012, 0]} material={m.brass}>
        <cylinderGeometry args={[0.05, 0.05, 0.024, 32]} />
      </mesh>
      <mesh position={[0, (cordTop + globeY) / 2, 0]} material={m.blackMetal}>
        <cylinderGeometry args={[0.003, 0.003, cordTop - globeY, 6]} />
      </mesh>
      <mesh position={[0, globeY + 0.115, 0]} material={m.brass}>
        <cylinderGeometry args={[0.022, 0.028, 0.03, 20]} />
      </mesh>
      <mesh position={[0, globeY, 0]} material={glass} {...handlers}>
        <sphereGeometry args={[0.12, 40, 28]} />
      </mesh>
      <mesh position={[0, globeY, 0]} material={bulb}>
        <sphereGeometry args={[0.026, 20, 14]} />
      </mesh>
      <MixedPointLight position={[0, globeY, 0]} day={0} evening={2.6} level={lamp.level} distance={4.5} decay={2} color="#FFC58A" />
      <Hotspot position={[0, globeY - 0.17, 0]} label={lamp.isOn ? "Switch off pendant" : "Switch on pendant"} onActivate={lamp.toggle} />
    </group>
  );
}

function Artwork() {
  const m = getBedroomMaterials();
  const art = getBedroomTextures().artwork;
  const w = 1.3;
  const h = 0.8;
  const f = 0.028;
  const z = SLAT_FRONT + 0.022;
  const y = 1.98;
  return (
    <group position={[0, y, z]}>
      <mesh position={[0, 0, 0.0075]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={art} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, -0.004]} castShadow>
        <boxGeometry args={[w, h, 0.02]} />
        <meshStandardMaterial color="#e9e1d3" />
      </mesh>
      {(
        [
          [[w + 2 * f, f, 0.04], [0, h / 2 + f / 2, 0]],
          [[w + 2 * f, f, 0.04], [0, -h / 2 - f / 2, 0]],
          [[f, h, 0.04], [-w / 2 - f / 2, 0, 0]],
          [[f, h, 0.04], [w / 2 + f / 2, 0, 0]],
        ] as [V3, V3][]
      ).map(([s, p], i) => (
        <mesh key={i} position={p} material={m.oak} castShadow receiveShadow>
          <boxGeometry args={s} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Foot of bed ──────────────────────────────────────────────────────────

function Bench() {
  const m = getBedroomMaterials();
  return (
    <group position={[0, 0, 0.25]}>
      <TaperedLegs w={1.26} d={0.36} h={0.34} inset={0.04} material={m.walnut} />
      <mesh position={[0, 0.355, 0]} material={m.walnut} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.035, 0.4]} />
      </mesh>
      <RoundedBox args={[1.3, 0.1, 0.4]} radius={0.04} smoothness={4} position={[0, 0.42, 0]} material={m.velvetSage} castShadow receiveShadow />
    </group>
  );
}

function Rug() {
  const rug = getBedroomTextures().rug;
  return (
    <mesh position={[0, 0.006, -0.6]} receiveShadow>
      <boxGeometry args={[3.0, 0.012, 2.2]} />
      <meshPhysicalMaterial
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

// ─── Dresser wall ─────────────────────────────────────────────────────────

const DRESSER_CONTENTS: ReactNode[] = [
  <Folded key="a" w={0.36} d={0.3} count={3} colors={["#3F4A56", "#6A7B8C", "#2E343B"]} position={[0, 0, 0]} />,
  <group key="b">
    <mesh position={[0, 0.006, 0]} receiveShadow>
      <boxGeometry args={[0.34, 0.012, 0.24]} />
      <meshStandardMaterial color="#5C3A36" roughness={0.9} />
    </mesh>
    {[-0.1, -0.03, 0.05, 0.12].map((x, i) => (
      <mesh key={x} position={[x, 0.016, (i % 2) * 0.05 - 0.03]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.012, 0.003, 8, 20]} />
        <meshStandardMaterial color={i % 2 ? "#D9D9D9" : "#D4AF6A"} metalness={1} roughness={0.2} />
      </mesh>
    ))}
    <mesh position={[0.05, 0.02, 0.07]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 0.008, 24]} />
      <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
    </mesh>
  </group>,
  <group key="c">
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[-0.15 + (i % 4) * 0.1, 0.03, -0.08 + Math.floor(i / 4) * 0.12]} scale={[1, 0.8, 1.3]} castShadow receiveShadow>
        <sphereGeometry args={[0.035, 14, 10]} />
        <meshPhysicalMaterial color={["#C9B8A0", "#4A5568", "#E8E4DC", "#7C5A46"][i % 4]} roughness={0.95} sheen={0.7} />
      </mesh>
    ))}
  </group>,
  <Folded key="d" w={0.38} d={0.3} count={5} colors={["#D9CFC0", "#B89F84", "#E8E4DC"]} position={[0, 0, 0]} />,
  <Folded key="e" w={0.38} d={0.3} count={4} colors={["#2F3A33", "#8B967E", "#5F6B58"]} position={[0, 0, 0]} />,
  <Folded key="f" w={0.38} d={0.3} count={5} colors={["#A5643C", "#C9B8A0", "#7C5A46"]} position={[0, 0, 0]} />,
];

function Dresser({ reflections: allowed }: { reflections: boolean }) {
  const space = useContext(CameraSpaceContext);
  const reflections = allowed && space === 0;
  const m = getBedroomMaterials();
  const x = -0.5;
  const z = 2.07;
  const W = 1.5;
  const H = 0.62;
  const D = 0.44;
  const Y0 = 0.16;
  const vase = useMemo(
    () => vesselGeometry([[0, 0], [0.06, 0], [0.09, 0.08], [0.085, 0.2], [0.04, 0.3], [0.035, 0.34], [0.03, 0.34], [0.028, 0.3]]),
    []
  );
  const stems = useMemo(() => {
    const out: { r: V3; len: number }[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const lean = 0.18 + (i % 3) * 0.07;
      out.push({ r: [Math.cos(a) * lean, 0, Math.sin(a) * lean], len: 0.5 + (i % 4) * 0.08 });
    }
    return out;
  }, []);

  const colW = W / 3;
  const rowH = (H - 0.024 - 0.018) / 2;
  const front = D / 2 + 0.018;

  return (
    <group>
      {/* Built facing local +z, then turned to face into the room (-z). */}
      <group position={[x, 0, z - 0.01]} rotation={[0, Math.PI, 0]}>
        <TaperedLegs w={W} d={D} h={Y0} inset={0.05} material={m.walnut} />
        <Carcass w={W} h={H} d={D} y0={Y0} material={m.walnut} />
        {[1, 0].flatMap((row) =>
          [-1, 0, 1].map((col) => {
            const i = (1 - row) * 3 + (col + 1);
            return (
              <Drawer
                key={`${row}-${col}`}
                w={colW - 0.004}
                h={rowH}
                d={0.38}
                position={[col * colW, Y0 + 0.018 + rowH * (row + 0.5), front]}
                front={m.walnut}
                handle="bar"
                travel={0.28}
                hint={row === 1 && col === 0 ? "Open drawer" : undefined}
              >
                {DRESSER_CONTENTS[i]}
              </Drawer>
            );
          })
        )}

        {/* Dresser-top styling (local x is mirrored by the half-turn) */}
        <group position={[0, Y0 + H, 0]}>
          <mesh geometry={vase} material={m.ceramicDark} position={[0.5, 0, -0.03]} castShadow />
          {stems.map((s, i) => (
            <group key={i} position={[0.5, 0.32, -0.03]} rotation={[s.r[2], 0, -s.r[0]]}>
              <mesh position={[0, s.len / 2, 0]} castShadow>
                <cylinderGeometry args={[0.002, 0.003, s.len, 4]} />
                <meshStandardMaterial color="#B49A74" roughness={0.9} />
              </mesh>
              <mesh position={[0, s.len, 0]} scale={[1, 2.6, 1]} castShadow>
                <sphereGeometry args={[0.03, 10, 8]} />
                <meshStandardMaterial color="#E4D6BC" roughness={1} />
              </mesh>
            </group>
          ))}
          <mesh position={[-0.25, 0.005, -0.02]} material={m.brass} receiveShadow>
            <boxGeometry args={[0.34, 0.01, 0.2]} />
          </mesh>
          {(
            [
              [-0.18, 0.06, "#E9D9C4"],
              [-0.3, 0.045, "#D7E1E6"],
            ] as [number, number, string][]
          ).map(([dx, h, c]) => (
            <group key={dx} position={[dx, 0.01, -0.02]}>
              <mesh position={[0, h / 2, 0]} castShadow>
                <boxGeometry args={[0.05, h, 0.035]} />
                <meshPhysicalMaterial color={c} roughness={0.05} transparent opacity={0.55} />
              </mesh>
              <mesh position={[0, h + 0.012, 0]} material={m.brass}>
                <cylinderGeometry args={[0.012, 0.012, 0.024, 12]} />
              </mesh>
            </group>
          ))}
          <Book w={0.24} t={0.04} d={0.18} color="#3E4A42" position={[-0.52, 0.02, 0]} rotY={0.2} />
        </group>
      </group>

      {/* Round mirror in a slim brass frame */}
      <group position={[x, 1.58, ROOM.z1 - 0.025]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <circleGeometry args={[0.48, 64]} />
          {reflections ? (
            <MeshReflectorMaterial
              mirror={1}
              resolution={768}
              blur={[0, 0]}
              mixBlur={0}
              mixStrength={1}
              color="#9a9a9a"
              metalness={0}
              roughness={1}
            />
          ) : (
            <meshStandardMaterial color="#cfd3d6" metalness={1} roughness={0.06} />
          )}
        </mesh>
        <mesh material={m.brass} castShadow>
          <torusGeometry args={[0.49, 0.016, 16, 96]} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Reading nook ─────────────────────────────────────────────────────────

function Armchair() {
  const m = getBedroomMaterials();
  const cushion = useMemo(() => pillowGeometry(0.42, 0.36, 0.13, 8), []);
  return (
    <group position={[-1.86, 0, 1.33]} rotation={[0, 2.3, 0]}>
      {(
        [
          [-0.3, -0.28],
          [0.3, -0.28],
          [-0.3, 0.28],
          [0.3, 0.28],
        ] as [number, number][]
      ).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.1, lz]} rotation={[lz * 0.25, 0, -lx * 0.25]} material={m.walnut} castShadow>
          <cylinderGeometry args={[0.022, 0.014, 0.2, 12]} />
        </mesh>
      ))}
      <RoundedBox args={[0.78, 0.16, 0.74]} radius={0.06} smoothness={4} position={[0, 0.28, 0]} material={m.boucle} castShadow receiveShadow />
      <RoundedBox args={[0.56, 0.12, 0.6]} radius={0.055} smoothness={4} position={[0, 0.41, 0.05]} material={m.boucle} castShadow receiveShadow />
      <RoundedBox args={[0.78, 0.6, 0.17]} radius={0.075} smoothness={4} position={[0, 0.63, -0.3]} rotation={[-0.16, 0, 0]} material={m.boucle} castShadow receiveShadow />
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.13, 0.27, 0.7]} radius={0.06} smoothness={4} position={[s * 0.325, 0.47, 0.0]} material={m.boucle} castShadow receiveShadow />
      ))}
      <mesh geometry={cushion} material={m.rust} position={[0, 0.62, -0.17]} rotation={[-0.3, 0, 0.05]} castShadow receiveShadow />
    </group>
  );
}

function FloorLamp() {
  const m = getBedroomMaterials();
  const lamp = useLampSwitch();
  const shade = useMixedEmissive(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#EFE4D0",
        emissive: "#FFC98C",
        roughness: 0.9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94,
      }),
    0.02,
    1.6,
    lamp.level
  );
  const p: V3 = [-2.24, 0, 1.95];
  return (
    <group position={p}>
      <mesh position={[0, 0.012, 0]} material={m.blackMetal} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.16, 0.024, 40]} />
      </mesh>
      <mesh position={[0, 0.76, 0]} material={m.blackMetal} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 1.5, 10]} />
      </mesh>
      <mesh position={[0, 1.55, 0]} material={shade} castShadow {...clickable(lamp.toggle)}>
        <cylinderGeometry args={[0.18, 0.22, 0.32, 48, 1, true]} />
      </mesh>
      <MixedPointLight position={[0, 1.5, 0]} day={0} evening={2.8} level={lamp.level} distance={4.5} decay={2} color="#FFC48A" />
      <Hotspot position={[0, 1.78, 0]} label={lamp.isOn ? "Switch off floor lamp" : "Switch on floor lamp"} onActivate={lamp.toggle} />
    </group>
  );
}

function Plant() {
  const m = getBedroomMaterials();
  const pot = useMemo(
    () => vesselGeometry([[0, 0.02], [0.16, 0.0], [0.2, 0.04], [0.21, 0.4], [0.195, 0.41], [0.185, 0.38], [0.0, 0.38]], 56),
    []
  );
  const plant = useMemo(() => plantGeometry(7), []);
  return (
    <group position={[-2.22, 0, -1.92]}>
      <mesh geometry={pot} material={m.ceramicDark} castShadow receiveShadow />
      <mesh position={[0, 0.385, 0]} receiveShadow>
        <cylinderGeometry args={[0.185, 0.185, 0.01, 32]} />
        <meshStandardMaterial color="#3a2c20" roughness={1} />
      </mesh>
      <group position={[0, 0.38, 0]}>
        <mesh geometry={plant.stems} material={m.stem} castShadow />
        <mesh geometry={plant.leaves} material={m.leaf} castShadow receiveShadow />
      </group>
    </group>
  );
}

export function BedroomFurniture({ reflections }: { reflections: boolean }) {
  return (
    <group>
      <Rug />
      <Bed />
      <Nightstand x={-1.36} side={-1} />
      <Nightstand x={1.36} side={1} />
      <Pendant x={-1.36} z={-2.0} />
      <Pendant x={1.36} z={-2.0} />
      <Artwork />
      <Bench />
      <Dresser reflections={reflections} />
      <Armchair />
      <FloorLamp />
      <Plant />
    </group>
  );
}
