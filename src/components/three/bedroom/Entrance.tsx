import { useContext, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  FACADE,
  GARDEN,
  GROUND_Y,
  HALL,
  MAIN_DOOR,
  MAIN_DOOR_PIVOT_X,
  PARTITION,
  PORCH,
  ROOM,
  STEPS,
} from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { mixValue, OpeningsContext, openingState, useEveningMix } from "./bedroomState";
import { Hotspot } from "./Hotspot";
import { clickable, useEased } from "./interaction";
import { MixedPointLight } from "./MixedLight";
import { Box, type V3 } from "./primitives";
import { getBedroomTextures } from "./proceduralTextures";
import { plantGeometry, vesselGeometry } from "./softGeometry";
import { SpaceCull } from "./SpaceCull";
import { seesFrontGarden } from "./spaceRules";

// The front of the house: a travertine-clad facade with a walnut portal
// around a tall pivot door, a cantilevered canopy, brass wall lights,
// three lit stone steps up to the porch, and the front garden.

const M = MAIN_DOOR;
const WALL_Z = (PARTITION.z0 + (PARTITION.z0 + 0.2)) / 2; // centre of the 0.2 m front wall
const OUT_Z = FACADE.z; // exterior face
const H = HALL.height;

function hash(n: number) {
  const s = Math.sin(n * 71.93) * 43758.5453;
  return s - Math.floor(s);
}

/** A travertine panel on the facade with the stone scaled to real size (1.2 m slabs). */
function CladPanel({ x0, x1, y0, y1, z }: { x0: number; x1: number; y0: number; y1: number; z: number }) {
  const m = getBedroomMaterials();
  const mat = useMemo(() => {
    const c = m.travertine.clone();
    c.map = m.travertine.map!.clone();
    c.map.wrapS = c.map.wrapT = THREE.RepeatWrapping;
    c.map.repeat.set((x1 - x0) / 2.4, (y1 - y0) / 2.4);
    c.map.offset.set(x0 / 2.4, y0 / 2.4);
    c.map.needsUpdate = true;
    return c;
  }, [m.travertine, x0, x1, y0, y1]);
  return <Box size={[x1 - x0, y1 - y0, 0.03]} position={[(x0 + x1) / 2, (y0 + y1) / 2, z - 0.015]} material={mat} />;
}

/** Vertical walnut battens over a strip of facade (facing -z). */
function Battens({ x0, x1, y0, y1, z }: { x0: number; x1: number; y0: number; y1: number; z: number }) {
  const m = getBedroomMaterials();
  const ref = useRef<THREE.InstancedMesh>(null);
  const pitch = 0.07;
  const count = Math.floor((x1 - x0) / pitch);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const mat = new THREE.Matrix4();
    const c = new THREE.Color();
    const start = x0 + (x1 - x0 - (count - 1) * pitch) / 2;
    for (let i = 0; i < count; i++) {
      mat.makeTranslation(start + i * pitch, (y0 + y1) / 2, z - 0.025);
      mesh.setMatrixAt(i, mat);
      mesh.setColorAt(i, c.setScalar(0.85 + 0.2 * hash(i + 3)));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, x0, x1, y0, y1, z]);
  return (
    <group>
      <Box size={[x1 - x0, y1 - y0, 0.01]} position={[(x0 + x1) / 2, (y0 + y1) / 2, z - 0.005]} material={m.charcoal} cast={false} />
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={m.walnut} castShadow receiveShadow>
        <boxGeometry args={[0.048, y1 - y0, 0.04]} />
      </instancedMesh>
    </group>
  );
}

// ─── The house front ──────────────────────────────────────────────────────

function FrontWall() {
  const m = getBedroomMaterials();
  const x0 = FACADE.x0;
  const x1 = FACADE.x1;
  return (
    <group>
      {/* The front wall itself, around the door and sidelight */}
      <Box size={[M.x0 - x0, H, 0.2]} position={[(x0 + M.x0) / 2, H / 2, WALL_Z]} material={m.wall} />
      <Box size={[x1 - M.sideX1, H, 0.2]} position={[(M.sideX1 + x1) / 2, H / 2, WALL_Z]} material={m.wall} />
      <Box size={[M.sideX1 - M.x0, H - M.height, 0.2]} position={[(M.x0 + M.sideX1) / 2, (H + M.height) / 2, WALL_Z]} material={m.wall} />

      {/* Travertine to the left and over the door, walnut battens to the right */}
      <CladPanel x0={x0} x1={M.x0 - 0.1} y0={0} y1={H} z={OUT_Z} />
      <CladPanel x0={M.x0 - 0.1} x1={M.sideX1 + 0.1} y0={M.height + 0.1} y1={H} z={OUT_Z} />
      <Battens x0={M.sideX1 + 0.1} x1={x1} y0={0} y1={H} z={OUT_Z} />
      {/* Stone cladding carried round onto the bedroom's garden-side wall */}
      <group position={[ROOM.x1 + 0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <CladPanel x0={-PARTITION.z0} x1={-ROOM.z0 + 0.2} y0={0} y1={ROOM.height + 0.05} z={0.03} />
      </group>

      {/* Walnut portal framing door and sidelight, standing proud of the stone */}
      <Box size={[0.1, M.height + 0.1, 0.16]} position={[M.x0 - 0.05, (M.height + 0.1) / 2, OUT_Z - 0.06]} material={m.walnut} />
      <Box size={[0.1, M.height + 0.1, 0.16]} position={[M.sideX1 + 0.05, (M.height + 0.1) / 2, OUT_Z - 0.06]} material={m.walnut} />
      <Box size={[M.sideX1 - M.x0 + 0.2, 0.1, 0.16]} position={[(M.x0 + M.sideX1) / 2, M.height + 0.05, OUT_Z - 0.06]} material={m.walnut} />
      {/* Mullion between door and sidelight */}
      <Box size={[M.sideX0 - M.x1, M.height, 0.2]} position={[(M.x1 + M.sideX0) / 2, M.height / 2, WALL_Z]} material={m.walnut} />
    </group>
  );
}

/** Charcoal parapets capping the flat roofs, so the house reads finished from outside. */
function Parapets() {
  const m = getBedroomMaterials();
  const t = 0.22;
  const bh = 0.3;
  const hh = 0.32;
  const bY = ROOM.height + bh / 2;
  const hY = H + hh / 2;
  const bx0 = ROOM.x0 - 0.2;
  const bx1 = ROOM.x1 + 0.2;
  const bz0 = ROOM.z0 - 0.2;
  const hx0 = HALL.x0 - 0.2;
  const hx1 = HALL.x1 + 0.2;
  const hz0 = PARTITION.z0;
  const hz1 = HALL.z1 + 0.2;
  return (
    <group>
      <Box size={[bx1 - bx0, bh, t]} position={[0, bY, bz0 + t / 2]} material={m.charcoal} />
      <Box size={[t, bh, PARTITION.z0 - bz0]} position={[bx0 + t / 2, bY, (bz0 + PARTITION.z0) / 2]} material={m.charcoal} />
      <Box size={[t, bh, PARTITION.z0 - bz0]} position={[bx1 - t / 2, bY, (bz0 + PARTITION.z0) / 2]} material={m.charcoal} />
      <Box size={[hx1 - hx0, hh, t]} position={[(hx0 + hx1) / 2, hY, hz0 + t / 2]} material={m.charcoal} />
      <Box size={[hx1 - hx0, hh, t]} position={[(hx0 + hx1) / 2, hY, hz1 - t / 2]} material={m.charcoal} />
      <Box size={[t, hh, hz1 - hz0]} position={[hx0 + t / 2, hY, (hz0 + hz1) / 2]} material={m.charcoal} />
      <Box size={[t, hh, hz1 - hz0]} position={[hx1 - t / 2, hY, (hz0 + hz1) / 2]} material={m.charcoal} />
    </group>
  );
}

const LEAF_W = M.x1 - M.x0 - 0.02;
const LEAF_H = M.height - 0.02;
const LEAF_T = 0.07;
const OPEN_ANGLE = Math.PI / 2;

function PullBar({ x, side, length }: { x: number; side: 1 | -1; length: number }) {
  const m = getBedroomMaterials();
  // side: -1 = outside face (−z), +1 = inside face (+z), leaf-local.
  const off = side * (LEAF_T / 2);
  return (
    <group position={[x, 1.12, 0]}>
      <mesh position={[0, 0, off + side * 0.055]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.016, 0.016, length, 20]} />
      </mesh>
      {[-length / 2 + 0.12, length / 2 - 0.12].map((y) => (
        <mesh key={y} position={[0, y, off + side * 0.028]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
          <cylinderGeometry args={[0.009, 0.009, 0.056, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** A tall walnut pivot door with brass inlays and a long brass pull. */
function MainDoor() {
  const m = getBedroomMaterials();
  const { mainDoorOpen, setMainDoorOpen } = useContext(OpeningsContext);
  const open = useEased(mainDoorOpen, 1.8);
  const leaf = useRef<THREE.Group>(null);
  useFrame(() => {
    openingState.mainDoor = open.current;
    // Swings its long side into the hall about an off-centre pivot.
    if (leaf.current) leaf.current.rotation.y = -OPEN_ANGLE * open.current;
  });
  const toggle = () => setMainDoorOpen(!mainDoorOpen);
  const handlers = clickable(toggle);
  const doorZ = (PARTITION.z0 + PARTITION.z1) / 2;
  const leafCx = (M.x0 + 0.01 + LEAF_W / 2) - MAIN_DOOR_PIVOT_X;
  const frosted = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#eef1ee",
        roughness: 0.45,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );
  return (
    <group>
      <group ref={leaf} position={[MAIN_DOOR_PIVOT_X, 0.01, doorZ]}>
        <mesh position={[leafCx, LEAF_H / 2, 0]} material={m.walnut} castShadow receiveShadow {...handlers}>
          <boxGeometry args={[LEAF_W, LEAF_H, LEAF_T]} />
        </mesh>
        {/* Three vertical brass inlays on both faces */}
        {[-1, 1].flatMap((side) =>
          [-0.3, -0.18, -0.06].map((dx) => (
            <mesh key={`${side}${dx}`} position={[leafCx + dx, LEAF_H / 2 + 0.05, side * (LEAF_T / 2 + 0.001)]} material={m.brass} {...handlers}>
              <boxGeometry args={[0.012, LEAF_H - 0.5, 0.003]} />
            </mesh>
          ))
        )}
        <PullBar x={leafCx + LEAF_W / 2 - 0.14} side={-1} length={1.4} />
        <PullBar x={leafCx + LEAF_W / 2 - 0.14} side={1} length={0.9} />
      </group>
      {/* Frosted-glass sidelight */}
      <mesh position={[(M.sideX0 + M.sideX1) / 2, M.height / 2, doorZ]} material={frosted}>
        <boxGeometry args={[M.sideX1 - M.sideX0, M.height, 0.02]} />
      </mesh>
      {/* Brass threshold and inside architrave */}
      <Box size={[M.x1 - M.x0, 0.025, PARTITION.z1 - PARTITION.z0]} position={[(M.x0 + M.x1) / 2, -0.008, doorZ]} material={m.brass} cast={false} />
      {(
        [
          [[0.09, M.height + 0.09, 0.022], [M.x0 - 0.045, (M.height + 0.09) / 2]],
          [[0.09, M.height + 0.09, 0.022], [M.sideX1 + 0.045, (M.height + 0.09) / 2]],
          [[M.sideX1 - M.x0 + 0.18, 0.09, 0.022], [(M.x0 + M.sideX1) / 2, M.height + 0.045]],
        ] as [V3, [number, number]][]
      ).map(([s, [x, y]], i) => (
        <Box key={i} size={s} position={[x, y, PARTITION.z1 + 0.011]} material={m.trim} />
      ))}
      <Hotspot position={[(M.x0 + M.x1) / 2, 1.45, doorZ]} label={mainDoorOpen ? "Close main door" : "Open main door"} onActivate={toggle} spaces={[1, 3]} />
    </group>
  );
}

// ─── Porch: canopy, lights, number, landing, steps ────────────────────────

function wallWashTexture() {
  const W = 64;
  const Hh = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = Hh;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, Hh);
  for (let y = 0; y < Hh; y++) {
    for (let x = 0; x < W; x++) {
      const v = Math.abs(y / Hh - 0.5) * 2; // 0 centre → 1 ends
      const u = Math.abs(x / W - 0.5) * 2;
      // Up/down cones of light from a sconce in the middle.
      const cone = Math.max(0, 1 - u / (0.25 + v * 0.75));
      const a = cone * Math.pow(1 - v, 1.4) * (v > 0.08 ? 1 : v / 0.08);
      const i = (y * W + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 196;
      img.data[i + 2] = 130;
      img.data[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Sconce({ x, y }: { x: number; y: number }) {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const wash = useMemo(wallWashTexture, []);
  const washMat = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#FFD39C" }), []);
  useFrame(() => {
    const e = mix.current;
    glow.emissiveIntensity = mixValue(0.2, 9, e);
    if (washMat.current) washMat.current.opacity = mixValue(0, 0.9, e);
  });
  const z = OUT_Z - 0.035;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.5, 1.9]} />
        <meshBasicMaterial ref={washMat} map={wash} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.06]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.34, 32]} />
      </mesh>
      {[-0.172, 0.172].map((dy) => (
        <mesh key={dy} position={[0, dy, -0.06]} material={glow}>
          <cylinderGeometry args={[0.038, 0.038, 0.006, 24]} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.02]} material={m.brass}>
        <boxGeometry args={[0.03, 0.08, 0.05]} />
      </mesh>
    </group>
  );
}

function HouseNumber() {
  const tex = getBedroomTextures().houseNumber;
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#D2AE68", alphaMap: tex, transparent: true, metalness: 0.9, roughness: 0.3 }),
    [tex]
  );
  return (
    <mesh position={[(M.sideX1 + 0.1 + FACADE.x1) / 2, 2.35, OUT_Z - 0.075]} rotation={[0, Math.PI, 0]} material={mat}>
      <planeGeometry args={[0.36, 0.36]} />
    </mesh>
  );
}

function Canopy() {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const disc = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f4f1ea", emissive: "#FFE2B8" }), []);
  useFrame(() => {
    disc.emissiveIntensity = mixValue(0.15, 8, mix.current);
  });
  const x0 = FACADE.x0;
  const x1 = PORCH.x1 + 0.1;
  const z0 = 0.45;
  const y = 2.98;
  return (
    <group>
      <Box size={[x1 - x0, 0.12, OUT_Z - z0]} position={[(x0 + x1) / 2, y + 0.06, (z0 + OUT_Z) / 2]} material={m.charcoal} />
      {/* Walnut soffit with recessed downlights */}
      <Box size={[x1 - x0 - 0.06, 0.012, OUT_Z - z0 - 0.06]} position={[(x0 + x1) / 2, y - 0.006, (z0 + OUT_Z) / 2 + 0.03]} material={m.walnut} cast={false} />
      {[
        [3.55, 1.0],
        [4.45, 1.0],
        [3.55, 1.8],
        [4.45, 1.8],
        [5.5, 1.4],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, y - 0.013, z]} rotation={[Math.PI / 2, 0, 0]} material={disc}>
          <circleGeometry args={[0.04, 24]} />
        </mesh>
      ))}
      <MixedPointLight position={[3.95, 2.8, 1.35]} day={0} evening={3.2} distance={6} decay={1.8} color="#FFD4A0" />
      <MixedPointLight position={[3.95, 1.9, 1.9]} day={0} evening={1.4} distance={3.5} decay={2} color="#FFC890" />
    </group>
  );
}

/** Riser glow from an LED strip tucked under each step's nosing. */
let riserGlowTex: THREE.CanvasTexture | null = null;
function riserGlowTexture() {
  if (riserGlowTex) return riserGlowTex;
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, "rgba(255,200,140,1)");
  g.addColorStop(0.35, "rgba(255,190,120,0.35)");
  g.addColorStop(1, "rgba(255,190,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 64);
  riserGlowTex = new THREE.CanvasTexture(c);
  riserGlowTex.colorSpace = THREE.SRGBColorSpace;
  return riserGlowTex;
}

function PorchAndSteps() {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const led = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFC98A" }), []);
  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({ map: riserGlowTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    []
  );
  useFrame(() => {
    const e = mix.current;
    led.emissiveIntensity = mixValue(0, 7, e);
    glowMat.opacity = mixValue(0, 0.95, e);
  });
  const sw = STEPS.x1 - STEPS.x0;
  const scx = (STEPS.x0 + STEPS.x1) / 2;
  const cheekTop = 0.36;
  const stepsZ0 = PORCH.z0 - STEPS.tread * STEPS.count;
  return (
    <group>
      {/* Landing */}
      <Box size={[PORCH.x1 - PORCH.x0, -GROUND_Y, PORCH.z1 - PORCH.z0]} position={[(PORCH.x0 + PORCH.x1) / 2, GROUND_Y / 2, (PORCH.z0 + PORCH.z1) / 2]} material={m.travertine} />
      {/* Three steps, each with a slim nosing and a hidden LED under it */}
      {Array.from({ length: STEPS.count }, (_, i) => {
        const top = -STEPS.rise * (i + 1);
        const z1 = PORCH.z0 - STEPS.tread * i;
        const z0 = z1 - STEPS.tread;
        return (
          <group key={i}>
            <Box size={[sw, top - GROUND_Y - 0.03, STEPS.tread - 0.03]} position={[scx, (GROUND_Y + top - 0.03) / 2, (z0 + 0.03 + z1) / 2]} material={m.travertine} />
            <Box size={[sw, 0.03, STEPS.tread + 0.02]} position={[scx, top - 0.015, (z0 - 0.02 + z1) / 2]} material={m.travertine} />
            <mesh position={[scx, top - 0.036, z0 + 0.012]} material={led}>
              <boxGeometry args={[sw - 0.04, 0.008, 0.008]} />
            </mesh>
            {/* Glow washing down this step's riser, just proud of the stone */}
            <mesh position={[scx, top - 0.105, z0 + 0.028]} rotation={[0, Math.PI, 0]} material={glowMat}>
              <planeGeometry args={[sw - 0.02, 0.15]} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[scx, -0.075, PORCH.z0 - 0.002]} rotation={[0, Math.PI, 0]} material={glowMat}>
        <planeGeometry args={[sw - 0.02, 0.15]} />
      </mesh>
      <mesh position={[scx, -0.036, PORCH.z0 - 0.018]} material={led}>
        <boxGeometry args={[sw - 0.04, 0.008, 0.008]} />
      </mesh>
      {/* Stone cheek walls with charcoal copings */}
      {[
        [FACADE.x0, STEPS.x0],
        [STEPS.x1, STEPS.x1 + 0.2],
      ].map(([a, b]) => (
        <group key={a}>
          <Box size={[b - a, cheekTop - GROUND_Y, PORCH.z0 - stepsZ0 + 0.02]} position={[(a + b) / 2, (GROUND_Y + cheekTop) / 2, (stepsZ0 - 0.02 + PORCH.z0) / 2]} material={m.travertine} />
          <Box size={[b - a + 0.02, 0.04, PORCH.z0 - stepsZ0 + 0.04]} position={[(a + b) / 2, cheekTop + 0.02, (stepsZ0 - 0.02 + PORCH.z0) / 2]} material={m.charcoal} />
        </group>
      ))}
      {/* The landing's low edge walls */}
      <Box size={[PORCH.x1 + 0.1 - STEPS.x1, cheekTop - GROUND_Y, 0.1]} position={[(STEPS.x1 + PORCH.x1 + 0.1) / 2, (GROUND_Y + cheekTop) / 2, PORCH.z0 - 0.05]} material={m.travertine} />
      <Box size={[0.1, cheekTop - GROUND_Y, PORCH.z1 - PORCH.z0 + 0.1]} position={[PORCH.x1 + 0.05, (GROUND_Y + cheekTop) / 2, (PORCH.z0 - 0.1 + PORCH.z1) / 2]} material={m.travertine} />
      <Box size={[PORCH.x1 + 0.12 - STEPS.x1, 0.04, 0.12]} position={[(STEPS.x1 + PORCH.x1 + 0.1) / 2, cheekTop + 0.02, PORCH.z0 - 0.05]} material={m.charcoal} />
      <Box size={[0.12, 0.04, PORCH.z1 - PORCH.z0 + 0.12]} position={[PORCH.x1 + 0.05, cheekTop + 0.02, (PORCH.z0 - 0.1 + PORCH.z1) / 2]} material={m.charcoal} />
      {/* Coir doormat */}
      <mesh position={[(M.x0 + M.x1) / 2, 0.006, OUT_Z - 0.45]} receiveShadow>
        <boxGeometry args={[1.1, 0.012, 0.6]} />
        <meshStandardMaterial color="#8a6a45" roughness={1} />
      </mesh>
      {/* ...and one inside */}
      <mesh position={[(M.x0 + M.x1) / 2, 0.006, PARTITION.z1 + 0.5]} receiveShadow>
        <boxGeometry args={[1.1, 0.012, 0.6]} />
        <meshStandardMaterial color="#4a4640" roughness={1} />
      </mesh>
    </group>
  );
}

function Planter({ position, size, seed, plantScale }: { position: V3; size: V3; seed: number; plantScale: number }) {
  const m = getBedroomMaterials();
  const plant = useMemo(() => plantGeometry(seed), [seed]);
  return (
    <group position={position}>
      <RoundedBox args={size} radius={0.02} smoothness={2} position={[0, size[1] / 2, 0]} material={m.charcoal} castShadow receiveShadow />
      <mesh position={[0, size[1] - 0.01, 0]}>
        <boxGeometry args={[size[0] - 0.06, 0.01, size[2] - 0.06]} />
        <meshStandardMaterial color="#3a2c20" roughness={1} />
      </mesh>
      <group position={[0, size[1], 0]} scale={plantScale}>
        <mesh geometry={plant.stems} material={m.stem} castShadow />
        <mesh geometry={plant.leaves} material={m.leaf} castShadow receiveShadow />
      </group>
    </group>
  );
}

// ─── Front garden ─────────────────────────────────────────────────────────

const PATH_X0 = STEPS.x0 + 0.1;
const PATH_X1 = STEPS.x1 - 0.1;
const GATE_Z = GARDEN.z0 + 0.3;

function Path() {
  const m = getBedroomMaterials();
  const pavers = useMemo(() => {
    const out: number[] = [];
    for (let z = PORCH.z0 - STEPS.tread * STEPS.count - 0.08; z > GATE_Z + 0.4; z -= 0.72) out.push(z);
    return out;
  }, []);
  return (
    <group>
      {pavers.map((z, i) => (
        <mesh key={z} position={[(PATH_X0 + PATH_X1) / 2 + (hash(i) - 0.5) * 0.04, GROUND_Y + 0.012, z - 0.3]} rotation={[0, (hash(i + 5) - 0.5) * 0.02, 0]} material={m.paver} receiveShadow>
          <boxGeometry args={[PATH_X1 - PATH_X0, 0.03, 0.6]} />
        </mesh>
      ))}
    </group>
  );
}

function Bollard({ x, z }: { x: number; z: number }) {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const glow = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#FFD39C" }), []);
  useFrame(() => {
    glow.emissiveIntensity = mixValue(0.1, 7, mix.current);
  });
  return (
    <group position={[x, GROUND_Y, z]}>
      <mesh position={[0, 0.3, 0]} material={m.charcoal} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={glow}>
        <boxGeometry args={[0.125, 0.05, 0.125]} />
      </mesh>
    </group>
  );
}

function Hedge({ x0, x1, z0, z1, h = 1.15 }: { x0: number; x1: number; z0: number; z1: number; h?: number }) {
  const m = getBedroomMaterials();
  return (
    <RoundedBox
      args={[x1 - x0, h, z1 - z0]}
      radius={0.12}
      smoothness={3}
      position={[(x0 + x1) / 2, GROUND_Y + h / 2, (z0 + z1) / 2]}
      material={m.hedge}
      castShadow
      receiveShadow
    />
  );
}

function GardenTree({ x, z, seed, scale }: { x: number; z: number; seed: number; scale: number }) {
  const m = getBedroomMaterials();
  const crown = useMemo(() => plantGeometry(seed), [seed]);
  const trunk = useMemo(
    () => vesselGeometry([[0.09, 0], [0.07, 0.4], [0.055, 1.2], [0.04, 1.6], [0, 1.6]], 12),
    []
  );
  return (
    <group position={[x, GROUND_Y, z]}>
      <mesh geometry={trunk} material={m.stem} castShadow />
      <group position={[0, 1.0, 0]} scale={scale}>
        <mesh geometry={crown.stems} material={m.stem} castShadow />
        <mesh geometry={crown.leaves} material={m.leaf} castShadow receiveShadow />
      </group>
    </group>
  );
}

/** Stone gate pillars with lantern caps where the path meets the street hedge. */
function Gate() {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const lantern = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#FFD39C" }), []);
  useFrame(() => {
    lantern.emissiveIntensity = mixValue(0.1, 6, mix.current);
  });
  const slats = 9;
  return (
    <group>
      {[PATH_X0 - 0.3, PATH_X1 + 0.3].map((x) => (
        <group key={x} position={[x, GROUND_Y, GATE_Z]}>
          <Box size={[0.42, 1.45, 0.42]} position={[0, 0.725, 0]} material={m.travertine} />
          <Box size={[0.48, 0.05, 0.48]} position={[0, 1.475, 0]} material={m.charcoal} />
          <mesh position={[0, 1.62, 0]} material={lantern}>
            <boxGeometry args={[0.16, 0.24, 0.16]} />
          </mesh>
          <Box size={[0.2, 0.03, 0.2]} position={[0, 1.755, 0]} material={m.charcoal} />
        </group>
      ))}
      {/* Closed slatted gate between them */}
      {Array.from({ length: slats }, (_, i) => {
        const x = PATH_X0 - 0.09 + ((PATH_X1 - PATH_X0 + 0.18) * (i + 0.5)) / slats;
        return <Box key={i} size={[0.06, 1.1, 0.04]} position={[x, GROUND_Y + 0.6, GATE_Z]} material={m.walnut} />;
      })}
      <Box size={[PATH_X1 - PATH_X0 + 0.2, 0.05, 0.05]} position={[(PATH_X0 + PATH_X1) / 2, GROUND_Y + 1.12, GATE_Z]} material={m.charcoal} />
      <Box size={[PATH_X1 - PATH_X0 + 0.2, 0.05, 0.05]} position={[(PATH_X0 + PATH_X1) / 2, GROUND_Y + 0.12, GATE_Z]} material={m.charcoal} />
    </group>
  );
}

function FrontGarden() {
  return (
    <group>
      <Path />
      {/* Path lights along the open (east) side; the clad bedroom wall lines the other */}
      {[-1.4, -3.6, -5.8].map((z) => (
        <Bollard key={z} x={5.0} z={z} />
      ))}
      {/* Hedges round the garden, with a gap for the gate */}
      <Hedge x0={FACADE.x0 - 0.2} x1={FACADE.x0 + 0.25} z0={GARDEN.z0 - 0.3} z1={ROOM.z0 - 0.2} />
      <Hedge x0={PATH_X1 + 0.52} x1={GARDEN.x1 + 0.3} z0={GARDEN.z0 - 0.3} z1={GARDEN.z0 + 0.1} />
      <Hedge x0={GARDEN.x1 - 0.1} x1={GARDEN.x1 + 0.3} z0={GARDEN.z0 - 0.3} z1={GARDEN.z1 + 0.3} />
      <Hedge x0={HALL.x1 + 0.2} x1={GARDEN.x1 + 0.3} z0={GARDEN.z1 - 0.05} z1={GARDEN.z1 + 0.3} />
      <Gate />
      <GardenTree x={7.1} z={-3.1} seed={57} scale={2.4} />
      <GardenTree x={7.4} z={-6.4} seed={63} scale={2.0} />
      <Planter position={[6.0, GROUND_Y, -1.2]} size={[0.55, 0.7, 0.55]} seed={71} plantScale={1.1} />
      <Planter position={[5.48, 0, 1.62]} size={[0.6, 0.75, 0.6]} seed={73} plantScale={1.35} />
      {/* A soft wash down the path in the evening */}
      <MixedPointLight position={[(PATH_X0 + PATH_X1) / 2, 1.4, -4.0]} day={0} evening={1.6} distance={8} decay={1.5} color="#FFCF96" />
    </group>
  );
}

export function Entrance() {
  return (
    <group>
      <FrontWall />
      <Parapets />
      <MainDoor />
      <SpaceCull visibleWhen={seesFrontGarden}>
        <Canopy />
        <Sconce x={M.x0 - 0.32} y={1.85} />
        <Sconce x={(M.sideX1 + 0.1 + FACADE.x1) / 2} y={1.7} />
        <HouseNumber />
        <PorchAndSteps />
        <FrontGarden />
      </SpaceCull>
    </group>
  );
}
