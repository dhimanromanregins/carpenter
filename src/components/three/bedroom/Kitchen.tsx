import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { KITCHEN, KITCHEN_WINDOW_S } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { useEveningMix } from "./bedroomState";
import { Drawer } from "./Drawer";
import { Hotspot } from "./Hotspot";
import { clickable, useEased, useLampSwitch } from "./interaction";
import { KitchenShell } from "./KitchenShell";
import { MixedPointLight } from "./MixedLight";
import { Box, type V3 } from "./primitives";
import { vesselGeometry } from "./softGeometry";
import { useMixedEmissive } from "./useMixedEmissive";

// The kitchen: a tall run of walnut units with fridge and oven, a sink run
// under the window, and a marble island with the hob and breakfast seating.

const TALL = { x0: KITCHEN.x0, depth: 0.65, z0: 8.2, z1: 11.2, height: 2.4 };
const TALL_FRONT = TALL.x0 + TALL.depth;
const RUN = { z1: KITCHEN.z1, depth: 0.65, x0: KITCHEN.x0, x1: -5.5, top: 0.9 };
const RUN_FRONT = RUN.z1 - RUN.depth;
// Shifted east of centre to leave a 0.9 m walkway in front of the tall run.
const ISLAND = { x0: -7.05, x1: -6.05, z0: 9.6, z1: 11.8, top: 0.9, overhang: -5.8 };
const HOB = { x: -6.55, z: 10.2 };

/** Handleless doors: a shadow gap and a slim brass finger-pull. */
function CabinetFront({
  size,
  position,
  rotationY = 0,
  material,
  onClick,
}: {
  size: [number, number];
  position: V3;
  rotationY?: number;
  material: THREE.Material;
  onClick?: () => void;
}) {
  const m = getBedroomMaterials();
  const handlers = onClick ? clickable(onClick) : {};
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={material} castShadow receiveShadow {...handlers}>
        <boxGeometry args={[size[0] - 0.008, size[1] - 0.008, 0.02]} />
      </mesh>
      <mesh position={[0, size[1] / 2 - 0.03, 0.013]} material={m.brass} {...handlers}>
        <boxGeometry args={[size[0] * 0.5, 0.012, 0.01]} />
      </mesh>
    </group>
  );
}

// ─── Tall run: fridge, pantry, ovens ──────────────────────────────────────

function Fridge() {
  const m = getBedroomMaterials();
  const [open, setOpen] = useState(false);
  const swing = useEased(open, 2.4);
  const door = useRef<THREE.Group>(null);
  const glow = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#EAF2FF" }), 0, 0);
  const light = useRef<THREE.PointLight>(null);
  const z0 = TALL.z0;
  const z1 = TALL.z0 + 0.75;
  const h = TALL.height;
  useFrame(() => {
    // Hinged on its south edge; the leaf runs -z, so a negative turn opens it out.
    if (door.current) door.current.rotation.y = -1.45 * swing.current;
    glow.emissiveIntensity = swing.current * 2.4;
    if (light.current) light.current.intensity = swing.current * 0.5;
  });
  const toggle = () => setOpen((v) => !v);
  const cz = (z0 + z1) / 2;
  return (
    <group>
      {/* Lining: back, sides, top and bottom — hollow, so the shelves show */}
      <mesh position={[TALL.x0 + 0.03, h / 2, cz]} material={m.carcassInterior} receiveShadow>
        <boxGeometry args={[0.03, h - 0.1, z1 - z0 - 0.04]} />
      </mesh>
      {[z0 + 0.03, z1 - 0.03].map((z) => (
        <mesh key={z} position={[TALL.x0 + TALL.depth / 2, h / 2, z]} material={m.carcassInterior} receiveShadow>
          <boxGeometry args={[TALL.depth - 0.06, h - 0.1, 0.03]} />
        </mesh>
      ))}
      {[0.08, h - 0.07].map((y) => (
        <mesh key={y} position={[TALL.x0 + TALL.depth / 2, y, cz]} material={m.carcassInterior} receiveShadow>
          <boxGeometry args={[TALL.depth - 0.06, 0.03, z1 - z0 - 0.04]} />
        </mesh>
      ))}
      {[0.5, 0.95, 1.4, 1.85].map((y) => (
        <mesh key={y} position={[TALL.x0 + TALL.depth / 2, y, cz]}>
          <boxGeometry args={[TALL.depth - 0.1, 0.012, z1 - z0 - 0.12]} />
          <meshPhysicalMaterial color="#dfe9ee" roughness={0.1} transparent opacity={0.5} />
        </mesh>
      ))}
      {[
        [0.56, -0.2, "#C94F3A"],
        [0.56, 0.05, "#E8B54A"],
        [1.01, -0.1, "#5E8A4A"],
        [1.46, 0.12, "#D9CFC0"],
        [1.46, -0.16, "#8C5635"],
      ].map(([y, dz, c], i) => (
        <mesh key={i} position={[TALL.x0 + 0.3, y as number, cz + (dz as number)]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.14, 14]} />
          <meshStandardMaterial color={c as string} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[TALL.x0 + 0.12, h - 0.18, cz]} material={glow}>
        <boxGeometry args={[0.16, 0.012, 0.2]} />
      </mesh>
      <pointLight ref={light} position={[TALL.x0 + 0.3, h - 0.3, cz]} intensity={0} distance={1.6} decay={2} color="#EAF2FF" />

      {/* The door, hinged on its south edge */}
      <group ref={door} position={[TALL_FRONT, 0.06, z1 - 0.01]}>
        <mesh position={[0.011, h / 2 - 0.06, -(z1 - z0) / 2]} material={m.walnut} castShadow receiveShadow {...clickable(toggle)}>
          <boxGeometry args={[0.022, h - 0.12, z1 - z0 - 0.02]} />
        </mesh>
        <mesh position={[0.03, h / 2 - 0.06, -(z1 - z0) + 0.08]} material={m.brass} castShadow {...clickable(toggle)}>
          <cylinderGeometry args={[0.014, 0.014, 1.1, 14]} />
        </mesh>
        {/* Door bin */}
        <mesh position={[-0.06, 0.9, -(z1 - z0) / 2]} receiveShadow>
          <boxGeometry args={[0.12, 0.22, z1 - z0 - 0.14]} />
          <meshPhysicalMaterial color="#e6eef2" roughness={0.2} transparent opacity={0.45} />
        </mesh>
      </group>
      <Hotspot position={[TALL_FRONT + 0.15, 1.5, cz]} label={open ? "Close the fridge" : "Open the fridge"} onActivate={toggle} />
    </group>
  );
}

function OvenTower() {
  const m = getBedroomMaterials();
  const [open, setOpen] = useState(false);
  const swing = useEased(open, 2.6);
  const door = useRef<THREE.Group>(null);
  const inner = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#2a1c10", emissive: "#FF9A3C" }), 0, 0);
  const z0 = 9.85;
  const z1 = 10.65;
  const cz = (z0 + z1) / 2;
  const ovenY0 = 0.78;
  const ovenY1 = 1.38;
  useFrame(() => {
    // Drops forward about its bottom edge.
    if (door.current) door.current.rotation.z = -1.5 * swing.current;
    inner.emissiveIntensity = 0.4 + swing.current * 2.2;
  });
  const toggle = () => setOpen((v) => !v);
  return (
    <group>
      {/* Oven cavity: a lining around the racks, glowing when it's open */}
      <mesh position={[TALL.x0 + 0.06, (ovenY0 + ovenY1) / 2, cz]} material={inner} receiveShadow>
        <boxGeometry args={[0.03, ovenY1 - ovenY0 - 0.04, z1 - z0 - 0.08]} />
      </mesh>
      {[z0 + 0.06, z1 - 0.06].map((z) => (
        <mesh key={z} position={[TALL.x0 + TALL.depth / 2, (ovenY0 + ovenY1) / 2, z]} material={inner} receiveShadow>
          <boxGeometry args={[TALL.depth - 0.1, ovenY1 - ovenY0 - 0.04, 0.03]} />
        </mesh>
      ))}
      {[ovenY0 + 0.03, ovenY1 - 0.03].map((y) => (
        <mesh key={y} position={[TALL.x0 + TALL.depth / 2, y, cz]} material={inner} receiveShadow>
          <boxGeometry args={[TALL.depth - 0.1, 0.03, z1 - z0 - 0.08]} />
        </mesh>
      ))}
      {[0.95, 1.16].map((y) => (
        <mesh key={y} position={[TALL.x0 + TALL.depth / 2, y, cz]} material={m.steel}>
          <boxGeometry args={[TALL.depth - 0.16, 0.012, z1 - z0 - 0.16]} />
        </mesh>
      ))}
      <group ref={door} position={[TALL_FRONT, ovenY0 + 0.02, cz]}>
        <mesh position={[0.012, (ovenY1 - ovenY0) / 2 - 0.02, 0]} castShadow receiveShadow {...clickable(toggle)}>
          <boxGeometry args={[0.024, ovenY1 - ovenY0 - 0.04, z1 - z0 - 0.04]} />
          <meshPhysicalMaterial color="#111114" roughness={0.18} metalness={0.5} clearcoat={1} />
        </mesh>
        <mesh position={[0.03, ovenY1 - ovenY0 - 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.steel} castShadow {...clickable(toggle)}>
          <cylinderGeometry args={[0.016, 0.016, z1 - z0 - 0.12, 14]} />
        </mesh>
      </group>
      {/* Combi oven above, and storage over that */}
      <mesh position={[TALL_FRONT - 0.012, 1.65, cz]} castShadow>
        <boxGeometry args={[0.024, 0.46, z1 - z0 - 0.04]} />
        <meshPhysicalMaterial color="#15161a" roughness={0.2} metalness={0.5} clearcoat={1} />
      </mesh>
      <mesh position={[TALL_FRONT - 0.005, 1.65, cz]} material={m.steel}>
        <boxGeometry args={[0.012, 0.06, z1 - z0 - 0.2]} />
      </mesh>
      <CabinetFront size={[z1 - z0 - 0.02, 0.5]} position={[TALL_FRONT - 0.01, 2.14, cz]} rotationY={Math.PI / 2} material={m.walnut} />
      <Hotspot position={[TALL_FRONT + 0.15, 1.1, cz]} label={open ? "Close the oven" : "Open the oven"} onActivate={toggle} />
    </group>
  );
}

function TallRun() {
  const m = getBedroomMaterials();
  const h = TALL.height;
  const cx = TALL.x0 + TALL.depth / 2;
  return (
    <group>
      {/* Carcass and recessed plinth */}
      <mesh position={[cx, h / 2, (TALL.z0 + TALL.z1) / 2]} material={m.carcassInterior} receiveShadow>
        <boxGeometry args={[TALL.depth, h, TALL.z1 - TALL.z0]} />
      </mesh>
      <mesh position={[cx + 0.04, 0.05, (TALL.z0 + TALL.z1) / 2]} material={m.charcoal}>
        <boxGeometry args={[TALL.depth - 0.08, 0.1, TALL.z1 - TALL.z0]} />
      </mesh>
      <Fridge />
      {/* Pantry, in two tall doors */}
      {[
        [8.95, 9.4],
        [9.4, 9.85],
      ].map(([a, b]) => (
        <CabinetFront key={a} size={[b - a - 0.01, h - 0.14]} position={[TALL_FRONT - 0.01, h / 2 + 0.02, (a + b) / 2]} rotationY={Math.PI / 2} material={m.walnut} />
      ))}
      <OvenTower />
      {/* Drawer under the ovens, and a tall cupboard at the end */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <Drawer
          w={0.76}
          h={0.6}
          d={0.5}
          position={[10.25, 0.4, -TALL_FRONT]}
          front={m.walnut}
          handle="bar"
          travel={0.34}
          hint="Open drawer"
        >
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.2 + i * 0.2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} material={m.steel} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.26, 14]} />
            </mesh>
          ))}
        </Drawer>
      </group>
      <CabinetFront size={[0.53, h - 0.14]} position={[TALL_FRONT - 0.01, h / 2 + 0.02, 10.93]} rotationY={Math.PI / 2} material={m.walnut} />
    </group>
  );
}

// ─── Sink run under the window ────────────────────────────────────────────

function KitchenTap({ running, toggle }: { running: { current: number }; toggle: () => void }) {
  const m = getBedroomMaterials();
  const x = -7.2;
  const z = RUN.z1 - 0.12;
  const spoutZ = z - 0.26;
  return (
    <group {...clickable(toggle)}>
      <mesh position={[x, RUN.top + 0.02, z]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.04, 20]} />
      </mesh>
      <mesh position={[x, RUN.top + 0.2, z]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.36, 18]} />
      </mesh>
      {/* Gooseneck */}
      <mesh position={[x, RUN.top + 0.38, z - 0.13]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow>
        <torusGeometry args={[0.13, 0.022, 12, 24, Math.PI]} />
      </mesh>
      <mesh position={[x, RUN.top + 0.3, spoutZ]} material={m.brass}>
        <cylinderGeometry args={[0.02, 0.018, 0.1, 16]} />
      </mesh>
      <mesh position={[x + 0.05, RUN.top + 0.3, z + 0.02]} rotation={[0, 0, -0.7]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.013, 0.013, 0.13, 12]} />
      </mesh>
      <Stream from={[x, RUN.top + 0.25, spoutZ]} length={0.33} on={running} />
    </group>
  );
}

/** Water from a tap: it grows down while running, with a ripple where it lands. */
function Stream({ from, length, on }: { from: V3; length: number; on: { current: number } }) {
  const mesh = useRef<THREE.Mesh>(null);
  const ripple = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#bcdde8", roughness: 0.04, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    []
  );
  useFrame(({ clock }) => {
    const v = on.current;
    if (mesh.current) {
      mesh.current.visible = v > 0.02;
      mesh.current.scale.y = v;
      mesh.current.scale.x = mesh.current.scale.z = 1 + Math.sin(clock.elapsedTime * 20) * 0.07;
      mesh.current.position.set(from[0], from[1] - (length * v) / 2, from[2]);
    }
    if (ripple.current) {
      ripple.current.visible = v > 0.05;
      const t = (clock.elapsedTime * 1.8) % 1;
      ripple.current.scale.setScalar(0.5 + t * 1.4);
      (ripple.current.material as THREE.Material).opacity = 0.45 * (1 - t) * v;
    }
  });
  return (
    <group>
      <mesh ref={mesh} material={mat} visible={false}>
        <cylinderGeometry args={[0.009, 0.012, length, 10, 1, true]} />
      </mesh>
      <mesh ref={ripple} position={[from[0], from[1] - length + 0.01, from[2]]} rotation={[-Math.PI / 2, 0, 0]} material={mat.clone()} visible={false}>
        <ringGeometry args={[0.035, 0.06, 28]} />
      </mesh>
    </group>
  );
}

function SinkRun() {
  const m = getBedroomMaterials();
  const [tapOn, setTapOn] = useState(false);
  const run = useEased(tapOn, 8);
  const sink = { x0: -7.62, x1: -6.78, depth: 0.22 };
  const backZ = RUN.z1 - 0.02;
  const worktopZ = RUN.z1 - RUN.depth / 2;
  return (
    <group>
      {/* Carcass, plinth and fronts */}
      <mesh position={[(RUN.x0 + RUN.x1) / 2, 0.45, worktopZ]} material={m.carcassInterior} receiveShadow>
        <boxGeometry args={[RUN.x1 - RUN.x0, 0.8, RUN.depth]} />
      </mesh>
      <mesh position={[(RUN.x0 + RUN.x1) / 2, 0.05, worktopZ + 0.04]} material={m.charcoal}>
        <boxGeometry args={[RUN.x1 - RUN.x0, 0.1, RUN.depth - 0.08]} />
      </mesh>
      {/* Drawer stack at the end, doors under the sink, dishwasher panel */}
      <group rotation={[0, Math.PI, 0]}>
        {[
          [0.66, 0.36],
          [0.3, 0.36],
        ].map(([y, h], i) => (
          <Drawer
            key={y}
            w={0.86}
            h={h}
            d={0.5}
            position={[8.12, y, -RUN_FRONT]}
            front={m.cabinetGreen}
            handle="bar"
            travel={0.34}
            hint={i === 0 ? "Open drawer" : undefined}
          >
            {i === 0
              ? [0, 1, 2, 3].map((k) => (
                  <mesh key={k} position={[-0.22 + k * 0.15, 0.02, 0]} rotation={[0, 0.3, 0]} material={m.steel} castShadow>
                    <boxGeometry args={[0.03, 0.02, 0.26]} />
                  </mesh>
                ))
              : [0, 1].map((k) => (
                  <mesh key={k} position={[-0.12 + k * 0.26, 0.06, 0]} castShadow>
                    <cylinderGeometry args={[0.09, 0.075, 0.12, 20]} />
                    <meshStandardMaterial color={k ? "#6F675D" : "#8D8377"} roughness={0.6} />
                  </mesh>
                ))}
          </Drawer>
        ))}
      </group>
      {[
        [sink.x0, -7.2],
        [-7.2, sink.x1],
      ].map(([a, b]) => (
        <CabinetFront key={a} size={[b - a - 0.01, 0.76]} position={[(a + b) / 2, 0.46, RUN_FRONT - 0.01]} rotationY={Math.PI} material={m.cabinetGreen} />
      ))}
      <mesh position={[-6.2, 0.46, RUN_FRONT - 0.012]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.76, 0.022]} />
        <meshStandardMaterial color="#8d949a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-6.2, 0.8, RUN_FRONT - 0.03]} material={m.brass}>
        <boxGeometry args={[0.5, 0.016, 0.02]} />
      </mesh>
      <CabinetFront size={[0.55, 0.76]} position={[-5.78, 0.46, RUN_FRONT - 0.01]} rotationY={Math.PI} material={m.cabinetGreen} />

      {/* Worktop, in pieces so the sink has a real cut-out — a single book-matched
          slab rather than a reused floor tile, for the worktop's dramatic veining */}
      <Box size={[sink.x0 - RUN.x0, 0.06, RUN.depth]} position={[(RUN.x0 + sink.x0) / 2, RUN.top + 0.03, worktopZ]} material={m.calacattaTop} />
      <Box size={[RUN.x1 - sink.x1, 0.06, RUN.depth]} position={[(sink.x1 + RUN.x1) / 2, RUN.top + 0.03, worktopZ]} material={m.calacattaTop} />
      <Box size={[sink.x1 - sink.x0, 0.06, 0.16]} position={[(sink.x0 + sink.x1) / 2, RUN.top + 0.03, backZ - 0.06]} material={m.calacattaTop} />
      <Box size={[sink.x1 - sink.x0, 0.06, 0.1]} position={[(sink.x0 + sink.x1) / 2, RUN.top + 0.03, RUN_FRONT + 0.05]} material={m.calacattaTop} />
      {/* Sink bowl */}
      <mesh position={[(sink.x0 + sink.x1) / 2, RUN.top - sink.depth / 2, worktopZ - 0.02]} material={m.porcelain} receiveShadow>
        <boxGeometry args={[sink.x1 - sink.x0, sink.depth, RUN.depth - 0.26]} />
      </mesh>
      <mesh position={[(sink.x0 + sink.x1) / 2, RUN.top - sink.depth + 0.012, worktopZ - 0.02]} material={m.chrome}>
        <cylinderGeometry args={[0.035, 0.035, 0.01, 20]} />
      </mesh>
      <KitchenTap running={run} toggle={() => setTapOn((v) => !v)} />

      {/* Marble splashback below the window */}
      <Box size={[RUN.x1 - RUN.x0 + 0.2, KITCHEN_WINDOW_S.y0 - RUN.top - 0.06, 0.02]} position={[(RUN.x0 + RUN.x1) / 2, (RUN.top + 0.06 + KITCHEN_WINDOW_S.y0) / 2, RUN.z1 - 0.011]} material={m.marbleWall} />
      <Hotspot position={[-7.2, RUN.top + 0.55, RUN.z1 - 0.45]} label={tapOn ? "Turn off the tap" : "Turn on the tap"} onActivate={() => setTapOn((v) => !v)} />
    </group>
  );
}

// ─── Island with the hob, and the extractor over it ───────────────────────

function Island() {
  const m = getBedroomMaterials();
  const [hobOn, setHobOn] = useState(false);
  const heat = useEased(hobOn, 1.2);
  const hood = useLampSwitch();
  const rings = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#1a1a1d", emissive: "#FF5A1E" }), 0, 0);
  const hoodGlow = useMixedEmissive(
    () => new THREE.MeshStandardMaterial({ color: "#f4f1ea", emissive: "#FFE3BE", side: THREE.DoubleSide }),
    0.15,
    7,
    hood.level
  );
  useFrame(() => {
    rings.emissiveIntensity = heat.current * 4.5;
  });
  const w = ISLAND.x1 - ISLAND.x0;
  const d = ISLAND.z1 - ISLAND.z0;
  const cx = (ISLAND.x0 + ISLAND.x1) / 2;
  const cz = (ISLAND.z0 + ISLAND.z1) / 2;
  const toggleHob = () => setHobOn((v) => !v);
  return (
    <group>
      {/* Body, with drawers on the working side */}
      <mesh position={[cx, 0.45, cz]} material={m.cabinetGreen} castShadow receiveShadow>
        <boxGeometry args={[w, 0.9, d]} />
      </mesh>
      <group rotation={[0, -Math.PI / 2, 0]}>
        {[
          [0.66, 0.36],
          [0.3, 0.36],
        ].map(([y, h], i) => (
          <Drawer
            key={y}
            w={0.9}
            h={h}
            d={0.45}
            position={[-cz + 0.5, y, -ISLAND.x0]}
            front={m.cabinetGreen}
            handle="bar"
            travel={0.32}
            hint={i === 0 ? "Open drawer" : undefined}
          >
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[-0.2 + k * 0.2, 0.03, 0]} rotation={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.1, 0.04, 0.24]} />
                <meshStandardMaterial color={["#8C5635", "#D9CFC0", "#42513F"][k]} roughness={0.7} />
              </mesh>
            ))}
          </Drawer>
        ))}
      </group>
      {/* Book-matched marble top with waterfall ends and a breakfast overhang */}
      <Box size={[ISLAND.x1 - ISLAND.overhang + 0.12, 0.06, d + 0.12]} position={[(ISLAND.overhang + ISLAND.x1) / 2 - 0.06, ISLAND.top + 0.03, cz]} material={m.calacattaTop} />
      {[ISLAND.z0 - 0.03, ISLAND.z1 + 0.03].map((z) => (
        <Box key={z} size={[w + 0.12, ISLAND.top, 0.06]} position={[cx, ISLAND.top / 2, z]} material={m.calacattaTop} />
      ))}
      {/* Induction hob */}
      <mesh position={[HOB.x, ISLAND.top + 0.063, HOB.z]} rotation={[-Math.PI / 2, 0, 0]} {...clickable(toggleHob)}>
        <planeGeometry args={[0.56, 0.48]} />
        <meshPhysicalMaterial color="#0c0c0f" roughness={0.12} clearcoat={1} />
      </mesh>
      {[
        [-0.13, -0.11],
        [0.13, -0.11],
        [-0.13, 0.11],
        [0.13, 0.11],
      ].map(([dx, dz]) => (
        <mesh key={`${dx}${dz}`} position={[HOB.x + dx, ISLAND.top + 0.065, HOB.z + dz]} rotation={[-Math.PI / 2, 0, 0]} material={rings} {...clickable(toggleHob)}>
          <ringGeometry args={[0.055, 0.075, 28]} />
        </mesh>
      ))}
      {/* Pan on the hob */}
      <group position={[HOB.x - 0.13, ISLAND.top + 0.07, HOB.z + 0.11]}>
        <mesh material={m.steel} castShadow>
          <cylinderGeometry args={[0.105, 0.095, 0.12, 28]} />
        </mesh>
        <mesh position={[0, 0.07, 0]} material={m.steel}>
          <cylinderGeometry args={[0.108, 0.108, 0.012, 28]} />
        </mesh>
        <mesh position={[0.15, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} material={m.blackMetal}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 10]} />
        </mesh>
      </group>
      {/* Extractor hood */}
      <group position={[HOB.x, 2.1, HOB.z]}>
        <mesh material={m.steel} castShadow {...clickable(hood.toggle)}>
          <boxGeometry args={[0.78, 0.22, 0.62]} />
        </mesh>
        <mesh position={[0, 0.42, 0]} material={m.steel}>
          <boxGeometry args={[0.22, 0.62, 0.22]} />
        </mesh>
        <mesh position={[0, -0.112, 0]} rotation={[Math.PI / 2, 0, 0]} material={hoodGlow}>
          <planeGeometry args={[0.7, 0.54]} />
        </mesh>
      </group>
      <MixedPointLight position={[HOB.x, 1.85, HOB.z]} day={0.2} evening={1.6} level={hood.level} distance={3.5} decay={2} color="#FFE7C6" />

      {/* Styling: board, bowl of fruit, mills */}
      <mesh position={[cx + 0.08, ISLAND.top + 0.075, 11.35]} rotation={[0, 0.2, 0]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.03, 0.24]} />
      </mesh>
      <FruitBowl position={[cx, ISLAND.top + 0.06, 10.95]} />
      {[0, 1].map((i) => (
        <mesh key={i} position={[cx - 0.28 + i * 0.12, ISLAND.top + 0.15, 11.62]} castShadow>
          <cylinderGeometry args={[0.035, 0.042, 0.18, 18]} />
          <meshStandardMaterial color={i ? "#6d4a38" : "#3a3f3a"} roughness={0.6} />
        </mesh>
      ))}
      <Hotspot position={[HOB.x, ISLAND.top + 0.3, HOB.z - 0.35]} label={hobOn ? "Turn off the hob" : "Turn on the hob"} onActivate={toggleHob} />
      <Hotspot position={[HOB.x + 0.5, 2.1, HOB.z]} label={hood.isOn ? "Switch off the hood light" : "Switch on the hood light"} onActivate={hood.toggle} />
    </group>
  );
}

function FruitBowl({ position }: { position: V3 }) {
  const m = getBedroomMaterials();
  const bowl = useMemo(() => vesselGeometry([[0, 0], [0.07, 0], [0.15, 0.05], [0.18, 0.09], [0.17, 0.09], [0.13, 0.05], [0, 0.03]], 40), []);
  return (
    <group position={position}>
      <mesh geometry={bowl} material={m.ceramic} castShadow receiveShadow />
      {[
        [0.05, 0.075, 0.02, "#C94F3A"],
        [-0.05, 0.075, 0.03, "#E8B54A"],
        [0, 0.08, -0.06, "#5E8A4A"],
        [0.01, 0.12, 0, "#D06A2C"],
      ].map(([x, y, z, c], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]} castShadow>
          <sphereGeometry args={[0.038, 18, 12]} />
          <meshStandardMaterial color={c as string} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function Stools() {
  const m = getBedroomMaterials();
  return (
    <group>
      {[10.1, 10.75, 11.4].map((z) => (
        <group key={z} position={[-5.8, 0, z]}>
          <mesh position={[0, 0.02, 0]} material={m.blackMetal} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.03, 24]} />
          </mesh>
          <mesh position={[0, 0.33, 0]} material={m.blackMetal} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.62, 16]} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
            <torusGeometry args={[0.16, 0.012, 10, 28]} />
          </mesh>
          <RoundedBox args={[0.36, 0.08, 0.34]} radius={0.035} smoothness={3} position={[0, 0.68, 0]} material={m.leather} castShadow receiveShadow />
          <RoundedBox args={[0.34, 0.3, 0.07]} radius={0.03} smoothness={3} position={[0, 0.86, -0.15]} rotation={[-0.16, 0, 0]} material={m.leather} castShadow />
        </group>
      ))}
    </group>
  );
}

/** Pendants over the island, a lit open shelf, and the room's own daylight. */
function KitchenLights() {
  const m = getBedroomMaterials();
  const pendants = useLampSwitch();
  const worktop = useLampSwitch();
  const mix = useEveningMix();
  const shade = useMixedEmissive(
    () => new THREE.MeshStandardMaterial({ color: "#F3EDE2", emissive: "#FFD9A6", side: THREE.DoubleSide }),
    0.05,
    2.6,
    pendants.level
  );
  const led = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFE0B2" }), []);
  useFrame(() => {
    led.emissiveIntensity = 0.3 + worktop.level.current * 6.5;
    void mix.current;
  });
  const cx = (ISLAND.x0 + ISLAND.x1) / 2;
  return (
    <group>
      {[11.05, 11.6].map((z) => (
        <group key={z} position={[cx, 0, z]} {...clickable(pendants.toggle)}>
          <mesh position={[0, KITCHEN.bandBottom - 0.01, 0]} material={m.brass}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
          </mesh>
          <mesh position={[0, (KITCHEN.bandBottom + 1.62) / 2, 0]} material={m.blackMetal}>
            <cylinderGeometry args={[0.004, 0.004, KITCHEN.bandBottom - 1.62, 6]} />
          </mesh>
          <mesh position={[0, 1.55, 0]} material={m.brass} castShadow>
            <cylinderGeometry args={[0.13, 0.03, 0.2, 28, 1, true]} />
          </mesh>
          <mesh position={[0, 1.55, 0]} material={shade}>
            <cylinderGeometry args={[0.125, 0.028, 0.2, 28, 1, true]} />
          </mesh>
        </group>
      ))}
      <MixedPointLight position={[cx, 1.5, 11.3]} day={0} evening={2.4} level={pendants.level} distance={5} decay={2} color="#FFD6A6" />

      {/* Floating shelf with an LED strip beneath it */}
      <Box size={[1.1, 0.05, 0.24]} position={[-6.0, 1.42, KITCHEN.z1 - 0.14]} material={m.oak} />
      <mesh position={[-6.0, 1.388, KITCHEN.z1 - 0.2]} material={led}>
        <boxGeometry args={[1.0, 0.008, 0.02]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-6.35 + i * 0.22, 1.52, KITCHEN.z1 - 0.16]} castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.14, 18]} />
          <meshStandardMaterial color={["#D9CFC0", "#42513F", "#8C5635"][i]} roughness={0.6} />
        </mesh>
      ))}
      <MixedPointLight position={[(KITCHEN.x0 + KITCHEN.x1) / 2, KITCHEN.height - 0.5, (KITCHEN.z0 + KITCHEN.z1) / 2]} day={0.4} evening={2.4} distance={7} decay={1.8} color="#FFE6C8" />
      {/* Daylight through the two windows */}
      <MixedPointLight position={[-6.6, 1.9, KITCHEN.z1 - 0.7]} day={2.2} evening={0.05} distance={6} decay={1.8} color="#E9F0F8" />
      <Hotspot position={[cx, 1.9, 11.3]} label={pendants.isOn ? "Switch off pendants" : "Switch on pendants"} onActivate={pendants.toggle} />
      <Hotspot position={[-6.0, 1.3, KITCHEN.z1 - 0.3]} label={worktop.isOn ? "Switch off worktop light" : "Switch on worktop light"} onActivate={worktop.toggle} />
    </group>
  );
}

export function Kitchen({ reflections }: { reflections: boolean }) {
  return (
    <group>
      <KitchenShell reflections={reflections} />
      <TallRun />
      <SinkRun />
      <Island />
      <Stools />
      <KitchenLights />
    </group>
  );
}
