import { useContext, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BATH, SHOWER as SHOWER_BOUNDS } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { BathroomShell } from "./BathroomShell";
import { CameraSpaceContext, openingState } from "./bedroomState";
import { Drawer } from "./Drawer";
import { rectGlowTexture } from "./glow";
import { Hotspot } from "./Hotspot";
import { clickable, useEased, useLampSwitch } from "./interaction";
import { MixedPointLight } from "./MixedLight";
import { Box, type V3 } from "./primitives";
import { getBedroomTextures } from "./proceduralTextures";
import { plantGeometry, vesselGeometry } from "./softGeometry";
import { useMixedEmissive } from "./useMixedEmissive";

// A luxury en-suite: double vanity with running taps, a freestanding tub
// that fills, a walk-in rain shower with steam, and a wall-hung WC.

const WALL_N = BATH.z0 + 0.021; // face of the marble lining
const WALL_E = BATH.x1 - 0.021;
const WALL_S = BATH.z1 - 0.021;

function waterMaterial(opacity: number) {
  return new THREE.MeshPhysicalMaterial({
    color: "#bcdde8",
    roughness: 0.04,
    transmission: 0,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
  });
}

// ─── Vanity ───────────────────────────────────────────────────────────────

const VANITY = { x0: -8.3, x1: -5.9, top: 0.87, depth: 0.52 };
const BASIN_X = [-7.7, -6.5];

/** A tap's stream: it grows down into the basin while the tap is running. */
function Stream({ from, length, on, radius = 0.0085 }: { from: V3; length: number; on: { current: number }; radius?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => waterMaterial(0.5), []);
  useFrame(({ clock }) => {
    const mesh3 = mesh.current;
    if (!mesh3) return;
    const v = on.current;
    mesh3.visible = v > 0.02;
    if (!mesh3.visible) return;
    mesh3.scale.y = v;
    mesh3.scale.x = mesh3.scale.z = 1 + Math.sin(clock.elapsedTime * 22) * 0.06;
    mesh3.position.set(from[0], from[1] - (length * v) / 2, from[2]);
  });
  return (
    <mesh ref={mesh} material={mat} visible={false}>
      <cylinderGeometry args={[radius, radius * 1.25, length, 10, 1, true]} />
    </mesh>
  );
}

/** Water dancing in the basin while the tap runs. */
function BasinRipple({ position, on }: { position: V3; on: { current: number } }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => waterMaterial(0.5), []);
  useFrame(({ clock }) => {
    const r = ref.current;
    if (!r) return;
    r.visible = on.current > 0.05;
    if (!r.visible) return;
    const t = (clock.elapsedTime * 1.6) % 1;
    const s = 0.4 + t * 1.3;
    r.scale.set(s, s, s);
    mat.opacity = 0.5 * (1 - t) * on.current;
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]} material={mat} visible={false}>
      <ringGeometry args={[0.03, 0.055, 28]} />
    </mesh>
  );
}

function Tap({ x, running, toggle }: { x: number; running: { current: number }; toggle: () => void }) {
  const m = getBedroomMaterials();
  const spoutZ = WALL_N + 0.19;
  const y = 1.26;
  return (
    <group {...clickable(toggle)}>
      {/* Wall plate, spout and lever */}
      <mesh position={[x, y, WALL_N + 0.015]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 24]} />
      </mesh>
      <mesh position={[x, y, (WALL_N + spoutZ) / 2]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.017, 0.017, spoutZ - WALL_N, 16]} />
      </mesh>
      <mesh position={[x, y + 0.02, spoutZ]} material={m.brass}>
        <sphereGeometry args={[0.017, 12, 8]} />
      </mesh>
      <mesh position={[x + 0.11, y + 0.06, WALL_N + 0.035]} rotation={[0, 0, -0.5]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.11, 12]} />
      </mesh>
      <Stream from={[x, y - 0.02, spoutZ]} length={y - 0.02 - 1.0} on={running} />
      <BasinRipple position={[x, 0.95, spoutZ]} on={running} />
    </group>
  );
}

function Vanity({ reflections }: { reflections: boolean }) {
  const m = getBedroomMaterials();
  // A real mirror, but only rendered while someone is in here to see it.
  const space = useContext(CameraSpaceContext);
  const mirrors = reflections && space === 4;
  const mirrorLight = useLampSwitch();
  const [tapA, setTapA] = useState(false);
  const [tapB, setTapB] = useState(false);
  const runA = useEased(tapA, 8);
  const runB = useEased(tapB, 8);
  const basin = useMemo(
    () =>
      vesselGeometry(
        [
          [0, 0],
          [0.15, 0],
          [0.19, 0.035],
          [0.2, 0.12],
          [0.198, 0.135],
          [0.176, 0.125],
          [0.155, 0.04],
          [0.05, 0.022],
          [0.03, 0.016],
          [0, 0.018],
        ],
        48
      ),
    []
  );
  const soap = useMemo(() => vesselGeometry([[0, 0], [0.035, 0], [0.042, 0.03], [0.038, 0.1], [0.018, 0.12], [0.014, 0.13]]), []);
  const glowTex = useMemo(() => rectGlowTexture(2.2, 1.15, 0.36, 0.13, [255, 236, 210]), []);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (glowMat.current) glowMat.current.opacity = 0.15 + 0.85 * mirrorLight.level.current;
  });

  const cx = (VANITY.x0 + VANITY.x1) / 2;
  const w = VANITY.x1 - VANITY.x0;
  const frontZ = BATH.z0 + VANITY.depth;
  const drawerW = w / 2 - 0.02;

  return (
    <group>
      {/* Floating cabinet with two drawers */}
      <mesh position={[cx, 0.65, BATH.z0 + VANITY.depth / 2]} material={m.walnut} castShadow receiveShadow>
        <boxGeometry args={[w, 0.4, VANITY.depth]} />
      </mesh>
      {[-1, 1].map((s) => (
        <Drawer
          key={s}
          w={drawerW}
          h={0.34}
          d={0.42}
          position={[cx + s * (drawerW / 2 + 0.01), 0.65, frontZ]}
          front={m.walnut}
          handle="bar"
          travel={0.3}
          hint={s === 1 ? "Open drawer" : undefined}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[-0.3 + i * 0.15, 0.03, (i % 2) * 0.1 - 0.05]} rotation={[0, i * 0.4, 0]} castShadow>
              <boxGeometry args={[0.09, 0.05, 0.12]} />
              <meshStandardMaterial color={["#E6DED0", "#C9B79E", "#8E9B8E", "#D8CCB6"][i % 4]} roughness={0.8} />
            </mesh>
          ))}
        </Drawer>
      ))}
      {/* Marble counter with two vessel basins */}
      <Box size={[w + 0.08, 0.045, VANITY.depth + 0.04]} position={[cx, VANITY.top + 0.022, BATH.z0 + (VANITY.depth + 0.04) / 2]} material={m.marbleTop} />
      {BASIN_X.map((x) => (
        <group key={x}>
          <mesh geometry={basin} material={m.porcelain} position={[x, VANITY.top + 0.045, WALL_N + 0.19]} castShadow receiveShadow />
          <mesh position={[x, VANITY.top + 0.062, WALL_N + 0.19]} material={m.chrome}>
            <cylinderGeometry args={[0.022, 0.022, 0.006, 20]} />
          </mesh>
        </group>
      ))}
      <Tap x={BASIN_X[0]} running={runA} toggle={() => setTapA((v) => !v)} />
      <Tap x={BASIN_X[1]} running={runB} toggle={() => setTapB((v) => !v)} />

      {/* Backlit mirror */}
      <mesh position={[cx, 1.95, WALL_N + 0.008]}>
        <planeGeometry args={[2.2 + 0.7, 1.15 + 0.7]} />
        <meshBasicMaterial ref={glowMat} map={glowTex} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[cx, 1.95, WALL_N + 0.03]} {...clickable(mirrorLight.toggle)}>
        <planeGeometry args={[2.2, 1.15]} />
        {mirrors ? (
          <MeshReflectorMaterial mirror={1} resolution={768} blur={[0, 0]} mixBlur={0} mixStrength={1} color="#9c9c9c" metalness={0} roughness={1} />
        ) : (
          <meshStandardMaterial color="#b9c3c7" metalness={0.9} roughness={0.15} />
        )}
      </mesh>
      <Box size={[2.26, 1.21, 0.02]} position={[cx, 1.95, WALL_N + 0.018]} material={m.brass} cast={false} />
      <MixedPointLight position={[cx, 1.95, WALL_N + 0.5]} day={0.2} evening={2.2} level={mirrorLight.level} distance={4} decay={2} color="#FFE9CC" />
      <Hotspot position={[cx + 1.25, 1.95, WALL_N + 0.1]} label={mirrorLight.isOn ? "Switch off mirror light" : "Switch on mirror light"} onActivate={mirrorLight.toggle} />

      {/* Counter styling */}
      <mesh geometry={soap} material={m.ceramicDark} position={[-8.05, VANITY.top + 0.045, WALL_N + 0.2]} castShadow />
      <Box size={[0.3, 0.012, 0.18]} position={[-6.0, VANITY.top + 0.05, WALL_N + 0.22]} material={m.brass} />
      {[0, 1].map((i) => (
        <mesh key={i} position={[-6.06 + i * 0.1, VANITY.top + 0.1, WALL_N + 0.22]} castShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.1, 18]} />
          <meshPhysicalMaterial color={i ? "#D7E1E6" : "#E9D9C4"} roughness={0.05} transparent opacity={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <RoundedBox key={i} args={[0.26, 0.05, 0.2]} radius={0.02} smoothness={2} position={[-7.1, VANITY.top + 0.07 + i * 0.052, WALL_N + 0.2]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#F2EFE9" roughness={0.95} sheen={0.8} sheenColor="#ffffff" />
        </RoundedBox>
      ))}
    </group>
  );
}

// ─── Bathtub ──────────────────────────────────────────────────────────────

const TUB = { x: -7.95, z: 5.2, scaleX: 0.95, scaleZ: 2.05, rim: 0.56 };
// Beside the tub at its widest, with the spout reaching over the middle.
const FILLER_X = TUB.x + 0.62;
const FILLER_Z = TUB.z;
const SPOUT_X = TUB.x + 0.02;

function Bathtub() {
  const m = getBedroomMaterials();
  const [filled, setFilled] = useState(false);
  const [running, setRunning] = useState(false);
  const fill = useEased(filled, 0.42);
  const flow = useEased(running, 6);
  const shell = useMemo(
    () =>
      vesselGeometry(
        [
          [0, 0.02],
          [0.28, 0],
          [0.38, 0.05],
          [0.42, 0.22],
          [0.42, 0.52],
          [0.405, TUB.rim],
          [0.375, 0.55],
          [0.36, 0.2],
          [0.3, 0.08],
          [0.12, 0.06],
          [0, 0.07],
        ],
        56
      ),
    []
  );
  const water = useRef<THREE.Mesh>(null);
  const waterMat = useMemo(() => waterMaterial(0.72), []);
  const base = useMemo(() => {
    const g = new THREE.CircleGeometry(0.362, 56);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useFrame(({ clock }) => {
    const w = water.current;
    if (!w) return;
    const level = fill.current;
    w.visible = level > 0.01;
    if (!w.visible) return;
    w.position.y = 0.1 + level * 0.36;
    // Gentle surface motion while it's filling.
    const wobble = flow.current * 0.004 * Math.sin(clock.elapsedTime * 6);
    w.position.y += wobble;
    // Keep the tap running only until it's full.
    if (level > 0.995 && running) setRunning(false);
  });
  const toggle = () => {
    setFilled((v) => {
      setRunning(!v);
      return !v;
    });
  };
  return (
    <group>
      <group position={[TUB.x, 0, TUB.z]} scale={[TUB.scaleX, 1, TUB.scaleZ]}>
        <mesh geometry={shell} material={m.porcelain} castShadow receiveShadow {...clickable(toggle)} />
        <mesh ref={water} geometry={base} material={waterMat} position={[0, 0.1, 0]} visible={false} />
      </group>
      {/* Floor-standing filler, beside the tub with the spout over the water */}
      <mesh position={[FILLER_X, 0.01, FILLER_Z]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 0.02, 24]} />
      </mesh>
      <mesh position={[FILLER_X, 0.55, FILLER_Z]} material={m.brass} castShadow {...clickable(toggle)}>
        <cylinderGeometry args={[0.028, 0.028, 1.06, 20]} />
      </mesh>
      <mesh position={[(FILLER_X + SPOUT_X) / 2, 1.07, FILLER_Z]} rotation={[0, 0, Math.PI / 2]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.024, 0.024, FILLER_X - SPOUT_X, 20]} />
      </mesh>
      <mesh position={[SPOUT_X, 1.05, FILLER_Z]} material={m.brass}>
        <sphereGeometry args={[0.024, 14, 10]} />
      </mesh>
      {/* Lever, and the hand shower on its cradle */}
      <mesh position={[FILLER_X + 0.07, 0.94, FILLER_Z]} rotation={[0, 0, -0.6]} material={m.brass} castShadow {...clickable(toggle)}>
        <cylinderGeometry args={[0.012, 0.012, 0.15, 12]} />
      </mesh>
      <mesh position={[FILLER_X, 0.78, FILLER_Z - 0.05]} rotation={[0.4, 0, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.016, 0.02, 0.2, 14]} />
      </mesh>
      <Stream from={[SPOUT_X, 1.03, FILLER_Z]} length={0.5} on={flow} radius={0.013} />
      {/* Oak caddy across the rim */}
      <group position={[TUB.x, TUB.rim + 0.01, TUB.z + 0.38]}>
        <Box size={[0.86, 0.03, 0.22]} position={[0, 0, 0]} material={m.oak} />
        <mesh position={[-0.2, 0.045, 0]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.035, 0.14]} />
          <meshStandardMaterial color="#6d4a38" roughness={0.8} />
        </mesh>
        <mesh position={[0.22, 0.055, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.08, 20]} />
          <meshStandardMaterial color="#F1EADD" roughness={0.7} />
        </mesh>
      </group>
      <Hotspot position={[TUB.x, TUB.rim + 0.3, TUB.z - 0.6]} label={filled ? "Drain the bath" : "Fill the bath"} onActivate={toggle} />
    </group>
  );
}

// ─── Walk-in shower ───────────────────────────────────────────────────────

const SHOWER = { ...SHOWER_BOUNDS, headX: -7.9, headZ: 7.0, headY: 2.52 };

function ShowerWater({ on }: { on: { current: number } }) {
  const t = getBedroomTextures();
  const fall = useMemo(() => {
    const tex = t.waterStreaks.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1.6);
    tex.needsUpdate = true;
    return tex;
  }, [t.waterStreaks]);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: fall,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [fall]
  );
  const splash = useRef<THREE.Mesh>(null);
  const splashMat = useMemo(() => waterMaterial(0.4), []);
  const steamMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: t.steam, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
    [t.steam]
  );
  const puffs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock, camera }, delta) => {
    const v = on.current;
    fall.offset.y -= delta * 1.9;
    mat.opacity = 0.75 * v;
    if (splash.current) {
      splash.current.visible = v > 0.05;
      const t2 = (clock.elapsedTime * 2) % 1;
      const s = 0.5 + t2 * 1.6;
      splash.current.scale.set(s, s, s);
      splashMat.opacity = 0.4 * (1 - t2) * v;
    }
    steamMat.opacity = 0.16 * v;
    puffs.current.forEach((p, i) => {
      if (!p) return;
      const life = ((clock.elapsedTime * 0.22 + i * 0.33) % 1);
      p.position.y = 0.6 + life * 1.7;
      p.scale.setScalar(0.7 + life * 1.5);
      p.lookAt(camera.position);
    });
  });
  return (
    <group>
      <mesh position={[SHOWER.headX, (SHOWER.headY - 0.06) / 2 + 0.03, SHOWER.headZ]} material={mat}>
        <cylinderGeometry args={[0.2, 0.235, SHOWER.headY - 0.06, 24, 1, true]} />
      </mesh>
      <mesh ref={splash} position={[SHOWER.headX, 0.02, SHOWER.headZ]} rotation={[-Math.PI / 2, 0, 0]} material={splashMat} visible={false}>
        <ringGeometry args={[0.12, 0.2, 32]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) puffs.current[i] = el;
          }}
          position={[SHOWER.headX + (i - 1) * 0.3, 1, SHOWER.headZ + (i % 2 ? 0.25 : -0.2)]}
          material={steamMat}
        >
          <planeGeometry args={[1.1, 1.1]} />
        </mesh>
      ))}
    </group>
  );
}

const GLASS_H = 2.15;
const DOOR_H = 2.08;
const SHOWER_DOOR_W = SHOWER.x1 - SHOWER.doorX0;

/** The hinged glass door of the cabin, swinging out into the room. */
function ShowerDoor({ open, onToggle }: { open: { current: number }; onToggle: () => void }) {
  const m = getBedroomMaterials();
  const leaf = useRef<THREE.Group>(null);
  useFrame(() => {
    openingState.showerDoor = open.current;
    // Hinged on the corner post; the leaf runs -x, so a negative turn
    // swings its free edge out of the cabin (-z).
    if (leaf.current) leaf.current.rotation.y = -1.55 * open.current;
  });
  const handlers = clickable(onToggle);
  return (
    <group ref={leaf} position={[SHOWER.x1, 0.04, SHOWER.z0]}>
      <mesh position={[-SHOWER_DOOR_W / 2, DOOR_H / 2, 0]} material={m.showerGlass} {...handlers}>
        <boxGeometry args={[SHOWER_DOOR_W - 0.02, DOOR_H, 0.01]} />
      </mesh>
      {/* Brass rails top and bottom, hinges, and a bar handle */}
      {[0.03, DOOR_H - 0.03].map((y) => (
        <mesh key={y} position={[-SHOWER_DOOR_W / 2, y, 0]} material={m.brass} castShadow {...handlers}>
          <boxGeometry args={[SHOWER_DOOR_W - 0.02, 0.035, 0.026]} />
        </mesh>
      ))}
      {[0.42, DOOR_H - 0.42].map((y) => (
        <mesh key={y} position={[-0.03, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.07, 16]} />
        </mesh>
      ))}
      <group position={[-SHOWER_DOOR_W + 0.08, 1.05, 0]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[0, 0, side * 0.055]} material={m.brass} castShadow {...handlers}>
              <cylinderGeometry args={[0.014, 0.014, 0.42, 16]} />
            </mesh>
            {[-0.16, 0.16].map((dy) => (
              <mesh key={dy} position={[0, dy, side * 0.03]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
                <cylinderGeometry args={[0.008, 0.008, 0.05, 10]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

function Shower() {
  const m = getBedroomMaterials();
  const [on, setOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const flow = useEased(on, 3);
  const door = useEased(doorOpen, 2.2);
  const toggle = () => setOn((v) => !v);
  const toggleDoor = () => setDoorOpen((v) => !v);
  const handlers = clickable(toggle);
  const fixedW = SHOWER.doorX0 - SHOWER.x0;
  const returnD = SHOWER.z1 - SHOWER.z0;
  return (
    <group>
      {/* Tiled tray with a linear drain */}
      <mesh position={[(SHOWER.x0 + SHOWER.x1) / 2, 0.004, (SHOWER.z0 + SHOWER.z1) / 2]} material={m.stone} receiveShadow>
        <boxGeometry args={[SHOWER.x1 - SHOWER.x0, 0.008, returnD]} />
      </mesh>
      <Box size={[SHOWER.x1 - SHOWER.x0 - 0.3, 0.012, 0.05]} position={[(SHOWER.x0 + SHOWER.x1) / 2, 0.009, SHOWER.z0 + 0.22]} material={m.brass} cast={false} />

      {/* Cabin: fixed screen, return panel, corner post and door */}
      <mesh position={[SHOWER.x0 + fixedW / 2, GLASS_H / 2 + 0.04, SHOWER.z0]} material={m.showerGlass}>
        <boxGeometry args={[fixedW, GLASS_H, 0.012]} />
      </mesh>
      <mesh position={[SHOWER.x1, GLASS_H / 2 + 0.04, (SHOWER.z0 + SHOWER.z1) / 2]} material={m.showerGlass}>
        <boxGeometry args={[0.012, GLASS_H, returnD]} />
      </mesh>
      <mesh position={[SHOWER.x1, GLASS_H / 2 + 0.04, SHOWER.z0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.024, 0.024, GLASS_H + 0.08, 20]} />
      </mesh>
      {/* Brass channels where the glass meets floor and walls */}
      <Box size={[fixedW, 0.045, 0.05]} position={[SHOWER.x0 + fixedW / 2, 0.022, SHOWER.z0]} material={m.brass} cast={false} />
      <Box size={[0.05, 0.045, returnD]} position={[SHOWER.x1, 0.022, (SHOWER.z0 + SHOWER.z1) / 2]} material={m.brass} cast={false} />
      <Box size={[0.05, GLASS_H, 0.05]} position={[SHOWER.x0 + 0.025, GLASS_H / 2 + 0.04, SHOWER.z0]} material={m.brass} />
      <Box size={[0.05, GLASS_H, 0.05]} position={[SHOWER.x1, GLASS_H / 2 + 0.04, SHOWER.z1 - 0.025]} material={m.brass} />
      <Box size={[fixedW + 0.05, 0.04, 0.04]} position={[SHOWER.x0 + fixedW / 2, GLASS_H + 0.04, SHOWER.z0]} material={m.brass} />
      <Box size={[0.04, 0.04, returnD]} position={[SHOWER.x1, GLASS_H + 0.04, (SHOWER.z0 + SHOWER.z1) / 2]} material={m.brass} />
      <ShowerDoor open={door} onToggle={toggleDoor} />

      {/* Ceiling rain head */}
      <mesh position={[SHOWER.headX, SHOWER.headY + 0.12, SHOWER.headZ]} material={m.brass}>
        <cylinderGeometry args={[0.016, 0.016, 0.24, 12]} />
      </mesh>
      <mesh position={[SHOWER.headX, SHOWER.headY, SHOWER.headZ]} material={m.brass} castShadow {...handlers}>
        <cylinderGeometry args={[0.22, 0.225, 0.035, 40]} />
      </mesh>
      {/* Thermostatic control plate on the wall */}
      <group position={[SHOWER.headX, 1.15, WALL_S - 0.02]} {...handlers}>
        <RoundedBox args={[0.17, 0.3, 0.03]} radius={0.015} smoothness={3} material={m.brass} castShadow />
        <mesh position={[0, 0.07, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
          <cylinderGeometry args={[0.032, 0.032, 0.04, 20]} />
        </mesh>
        <mesh position={[0, -0.07, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
          <cylinderGeometry args={[0.028, 0.028, 0.04, 20]} />
        </mesh>
      </group>
      {/* Stone shelf with bottles */}
      <Box size={[0.46, 0.035, 0.2]} position={[SHOWER.x0 + 0.25, 1.3, SHOWER.z1 - 0.18]} material={m.stone} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[SHOWER.x0 + 0.12 + i * 0.11, 1.4, SHOWER.z1 - 0.18]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.16, 16]} />
          <meshPhysicalMaterial color={["#3F4B45", "#D9CFC0", "#8C5635"][i]} roughness={0.35} />
        </mesh>
      ))}
      <ShowerWater on={flow} />
      <Hotspot position={[SHOWER.headX, 1.75, SHOWER.headZ - 0.5]} label={on ? "Turn off the shower" : "Turn on the shower"} onActivate={toggle} />
      <Hotspot
        position={[(SHOWER.doorX0 + SHOWER.x1) / 2, 1.45, SHOWER.z0 - 0.12]}
        label={doorOpen ? "Close the shower door" : "Open the shower door"}
        onActivate={toggleDoor}
      />
    </group>
  );
}

// ─── WC, towels and the rest ──────────────────────────────────────────────

function WC() {
  const m = getBedroomMaterials();
  const [lidUp, setLidUp] = useState(false);
  const open = useEased(lidUp, 3);
  const lid = useRef<THREE.Group>(null);
  useFrame(() => {
    if (lid.current) lid.current.rotation.z = -1.75 * open.current;
  });
  const toggle = () => setLidUp((v) => !v);
  const z = 6.8;
  const back = WALL_E - 0.01;
  return (
    <group>
      <RoundedBox args={[0.5, 0.36, 0.38]} radius={0.09} smoothness={4} position={[back - 0.27, 0.58, z]} material={m.porcelain} castShadow receiveShadow {...clickable(toggle)} />
      <mesh position={[back - 0.02, 0.58, z]} material={m.porcelain} castShadow>
        <boxGeometry args={[0.06, 0.4, 0.36]} />
      </mesh>
      {/* Seat ring and the lid that lifts */}
      <mesh position={[back - 0.28, 0.775, z]} rotation={[Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]} material={m.porcelain} castShadow>
        <torusGeometry args={[0.155, 0.028, 12, 40]} />
      </mesh>
      <group ref={lid} position={[back - 0.05, 0.8, z]}>
        <RoundedBox args={[0.44, 0.028, 0.37]} radius={0.014} smoothness={3} position={[-0.23, 0.015, 0]} material={m.porcelain} castShadow {...clickable(toggle)} />
      </group>
      {/* Brass flush plate */}
      <RoundedBox args={[0.03, 0.15, 0.22]} radius={0.01} smoothness={3} position={[back - 0.005, 1.15, z]} material={m.brass} castShadow {...clickable(toggle)} />
      <Hotspot position={[back - 0.3, 1.05, z]} label={lidUp ? "Close the lid" : "Open the lid"} onActivate={toggle} />
    </group>
  );
}

function TowelRail() {
  const m = getBedroomMaterials();
  const z = 5.35;
  const x = WALL_E - 0.05;
  return (
    <group>
      {[-0.26, 0.26].map((dz) => (
        <mesh key={dz} position={[x, 1.32, z + dz]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.9, 16]} />
        </mesh>
      ))}
      {[0.95, 1.14, 1.33, 1.52, 1.71].map((y) => (
        <mesh key={y} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.011, 0.011, 0.52, 12]} />
        </mesh>
      ))}
      {/* Two towels over the rails */}
      {[
        [1.52, 0.42, "#F2EFE9"],
        [1.14, 0.36, "#DCD3C4"],
      ].map(([y, h, c], i) => (
        <group key={i} position={[x - 0.03, y as number, z + (i ? 0.16 : -0.14)]}>
          <RoundedBox args={[0.06, h as number, 0.3]} radius={0.028} smoothness={3} position={[0, -(h as number) / 2, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={c as string} roughness={0.95} sheen={0.9} sheenColor="#ffffff" />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

function BathAccessories() {
  const m = getBedroomMaterials();
  const rug = getBedroomTextures().rug;
  const plant = useMemo(() => plantGeometry(31), []);
  const pot = useMemo(() => vesselGeometry([[0, 0.02], [0.17, 0], [0.2, 0.05], [0.21, 0.42], [0.195, 0.43], [0.18, 0.4], [0, 0.4]], 40), []);
  return (
    <group>
      {/* Bath mat */}
      <mesh position={[-7.1, 0.008, 4.25]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[0.75, 0.016, 1.15]} />
        <meshPhysicalMaterial color="#EDE7DC" map={rug.map} bumpMap={rug.bumpMap} bumpScale={1.4} roughness={1} sheen={0.7} sheenColor="#ffffff" />
      </mesh>
      {/* Teak stool with a folded towel */}
      <group position={[-5.05, 0, 5.05]}>
        {(
          [
            [-0.14, -0.14],
            [0.14, -0.14],
            [-0.14, 0.14],
            [0.14, 0.14],
          ] as [number, number][]
        ).map(([dx, dz], i) => (
          <mesh key={i} position={[dx, 0.2, dz]} material={m.teak} castShadow>
            <cylinderGeometry args={[0.02, 0.016, 0.4, 10]} />
          </mesh>
        ))}
        <Box size={[0.38, 0.035, 0.38]} position={[0, 0.42, 0]} material={m.teak} />
        <RoundedBox args={[0.3, 0.07, 0.26]} radius={0.025} smoothness={3} position={[0, 0.47, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#F2EFE9" roughness={0.95} sheen={0.9} sheenColor="#ffffff" />
        </RoundedBox>
      </group>
      {/* Plant in the corner by the window */}
      <group position={[-8.25, 0, 4.05]}>
        <mesh geometry={pot} material={m.concrete} castShadow receiveShadow />
        <group position={[0, 0.4, 0]} scale={1.15}>
          <mesh geometry={plant.stems} material={m.stem} castShadow />
          <mesh geometry={plant.leaves} material={m.leaf} castShadow receiveShadow />
        </group>
      </group>
      {/* Robe hooks by the door */}
      {[4.75, 4.95].map((z) => (
        <mesh key={z} position={[WALL_E - 0.04, 1.7, z]} rotation={[0, 0, Math.PI / 2]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.08, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** Ceiling downlights and the daylight that comes through the west window. */
function BathroomLights() {
  const ceiling = useLampSwitch();
  const spots = useMixedEmissive(
    () => new THREE.MeshStandardMaterial({ color: "#f4f1ea", emissive: "#FFE7C8", side: THREE.DoubleSide }),
    0.2,
    9,
    ceiling.level
  );
  const cx = (BATH.x0 + BATH.x1) / 2;
  const cz = (BATH.z0 + BATH.z1) / 2;
  return (
    <group>
      {/* A pair of pendant-free ceiling discs over the room's centre */}
      {[
        [cx - 0.7, cz - 0.6],
        [cx + 0.7, cz + 0.7],
      ].map(([x, z]) => (
        <mesh key={x} position={[x, BATH.bandBottom - 0.002, z]} rotation={[Math.PI / 2, 0, 0]} material={spots} {...clickable(ceiling.toggle)}>
          <circleGeometry args={[0.055, 24]} />
        </mesh>
      ))}
      <MixedPointLight position={[cx, BATH.height - 0.5, cz]} day={0.3} evening={2.8} level={ceiling.level} distance={7} decay={1.8} color="#FFE3C0" />
      {/* Daylight spilling in through the frosted window */}
      <MixedPointLight position={[BATH.x0 + 0.5, 1.9, 5.55]} day={2.4} evening={0.05} distance={6} decay={1.7} color="#E8F0F8" />
      <Hotspot position={[cx, 2.5, cz]} label={ceiling.isOn ? "Switch off ceiling lights" : "Switch on ceiling lights"} onActivate={ceiling.toggle} />
    </group>
  );
}

export function Bathroom({ reflections }: { reflections: boolean }) {
  return (
    <group>
      <BathroomShell />
      <Vanity reflections={reflections} />
      <Bathtub />
      <Shower />
      <WC />
      <TowelRail />
      <BathAccessories />
      <BathroomLights />
    </group>
  );
}
