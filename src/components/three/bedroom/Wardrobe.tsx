import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ROOM } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { Drawer } from "./Drawer";
import { clickable } from "./interaction";
import { Hotspot } from "./Hotspot";
import { usePooledLight } from "./lightRoles";

// Floor-to-ceiling six-door wardrobe on the east wall, three sections of
// paired doors. Clicking a door swings its pair open (hinged at the outer
// edges) and lights the interior: long hang, shelving, short hang + working
// drawers.

const FRONT_X = 2.0;
const BACK_X = ROOM.x1;
const DEPTH = BACK_X - FRONT_X;
const Z0 = -2.25;
const Z1 = 1.55;
const BASE_Y = 0.09;
const TOP_Y = ROOM.bandBottom - 0.005;
const PANEL = 0.018;
const SECTIONS = 3;
const SECTION_W = (Z1 - Z0) / SECTIONS;
const DOOR_GAP = 0.004;
const DOOR_W = SECTION_W / 2 - DOOR_GAP;
const DOOR_H = TOP_Y - BASE_Y - 0.01;
const OPEN_ANGLE = 1.72;

/** Eased openness of each section, shared with the single interior light. */
const sectionGlow = [0, 0, 0];

const GARMENT_COLORS = ["#E8E4DC", "#4A5568", "#B89F84", "#2F3A33", "#D9CFC0", "#7C5A46", "#A7B2B8", "#1F2226", "#C9B8A0"];

function Garments({ zStart, zEnd, rodY, long }: { zStart: number; zEnd: number; rodY: number; long: boolean }) {
  const items = useMemo(() => {
    const out: { z: number; len: number; color: string; tilt: number }[] = [];
    let z = zStart + 0.06;
    let i = long ? 3 : 0;
    while (z < zEnd - 0.06) {
      const h = Math.sin(i * 91.7) * 0.5 + 0.5;
      out.push({
        z,
        len: long ? 1.05 + h * 0.25 : 0.72 + h * 0.2,
        color: GARMENT_COLORS[i % GARMENT_COLORS.length],
        tilt: (h - 0.5) * 0.08,
      });
      z += 0.065 + h * 0.05;
      i++;
    }
    return out;
  }, [zStart, zEnd, long]);
  const m = getBedroomMaterials();
  const x = FRONT_X + DEPTH / 2 + 0.02;
  return (
    <group>
      <mesh position={[x, rodY, (zStart + zEnd) / 2]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
        <cylinderGeometry args={[0.012, 0.012, zEnd - zStart, 12]} />
      </mesh>
      {items.map((g, i) => (
        <group key={i} position={[x, rodY, g.z]} rotation={[g.tilt, 0, 0]}>
          <mesh position={[0, -0.035, 0]} material={m.walnut}>
            <boxGeometry args={[0.4, 0.012, 0.012]} />
          </mesh>
          <RoundedBox args={[0.44, g.len, 0.03]} radius={0.012} smoothness={2} position={[0, -0.05 - g.len / 2, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={g.color} roughness={0.9} sheen={0.8} sheenRoughness={0.6} sheenColor="#ffffff" />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

function FoldedStack({ z, y, count, seed }: { z: number; y: number; count: number; seed: number }) {
  return (
    <group position={[FRONT_X + DEPTH / 2 + 0.02, y, z]}>
      {Array.from({ length: count }, (_, i) => {
        const h = Math.sin((seed + i) * 57.3) * 0.5 + 0.5;
        return (
          <RoundedBox
            key={i}
            args={[0.34, 0.045, 0.3]}
            radius={0.015}
            smoothness={2}
            position={[(h - 0.5) * 0.02, 0.024 + i * 0.047, (h - 0.5) * 0.015]}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial color={GARMENT_COLORS[(seed + i * 2) % GARMENT_COLORS.length]} roughness={0.95} sheen={0.7} sheenColor="#ffffff" />
          </RoundedBox>
        );
      })}
    </group>
  );
}

function Door({
  hingeZ,
  dir,
  openness,
  onToggle,
}: {
  hingeZ: number;
  dir: 1 | -1;
  openness: React.RefObject<number>;
  onToggle: () => void;
}) {
  const m = getBedroomMaterials();
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = -dir * OPEN_ANGLE * openness.current;
  });
  return (
    <group ref={ref} position={[FRONT_X - 0.011, BASE_Y + 0.005, hingeZ]}>
      <mesh position={[0, DOOR_H / 2, (dir * DOOR_W) / 2]} material={m.laminate} castShadow receiveShadow {...clickable(onToggle)}>
        <boxGeometry args={[0.02, DOOR_H, DOOR_W]} />
      </mesh>
      {/* Slim brass bar pull on the meeting edge */}
      <group position={[-0.03, 1.12, dir * (DOOR_W - 0.045)]}>
        <mesh material={m.brass} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.62, 12]} />
        </mesh>
        {[-0.26, 0.26].map((y) => (
          <mesh key={y} position={[0.012, y, 0]} rotation={[0, 0, Math.PI / 2]} material={m.brass}>
            <cylinderGeometry args={[0.005, 0.005, 0.024, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Section({ index }: { index: number }) {
  const m = getBedroomMaterials();
  const z0 = Z0 + index * SECTION_W;
  const z1 = z0 + SECTION_W;
  const zc = (z0 + z1) / 2;
  const [open, setOpen] = useState(false);
  const openness = useRef(0);
  const led = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFE3BE" }), []);

  useFrame((_, delta) => {
    const target = open ? 1 : 0;
    openness.current += (target - openness.current) * (1 - Math.exp(-delta * 4));
    const glow = Math.min(1, openness.current * 1.6);
    led.emissiveIntensity = glow * 7;
    sectionGlow[index] = glow;
  });

  const toggle = () => setOpen((o) => !o);

  const inner0 = z0 + PANEL / 2;
  const inner1 = z1 - PANEL / 2;
  const shelfW = SECTION_W - PANEL;
  const interiorX = FRONT_X + DEPTH / 2 + 0.01;

  return (
    <group>
      {/* Interior LED strip behind the top rail */}
      <mesh position={[FRONT_X + 0.06, TOP_Y - PANEL - 0.008, zc]} material={led}>
        <boxGeometry args={[0.012, 0.006, shelfW - 0.04]} />
      </mesh>

      {index === 0 && (
        <>
          <mesh position={[interiorX, 2.3, zc]} material={m.carcassInterior} castShadow receiveShadow>
            <boxGeometry args={[DEPTH - 0.04, PANEL, shelfW]} />
          </mesh>
          <Garments zStart={inner0} zEnd={inner1} rodY={2.18} long />
          <FoldedStack z={zc - 0.3} y={2.3 + PANEL / 2} count={3} seed={1} />
          <FoldedStack z={zc + 0.25} y={2.3 + PANEL / 2} count={4} seed={4} />
        </>
      )}
      {index === 1 &&
        [0.5, 0.95, 1.4, 1.85, 2.3].map((y, i) => (
          <group key={y}>
            <mesh position={[interiorX, y, zc]} material={m.carcassInterior} castShadow receiveShadow>
              <boxGeometry args={[DEPTH - 0.04, PANEL, shelfW]} />
            </mesh>
            {i < 4 && <FoldedStack z={zc - 0.3} y={y + PANEL / 2} count={3 + (i % 3)} seed={i * 3} />}
            {i < 4 && i !== 1 && <FoldedStack z={zc + 0.28} y={y + PANEL / 2} count={2 + (i % 2)} seed={i * 5 + 2} />}
          </group>
        ))}
      {index === 2 && (
        <>
          <mesh position={[interiorX, 2.3, zc]} material={m.carcassInterior} castShadow receiveShadow>
            <boxGeometry args={[DEPTH - 0.04, PANEL, shelfW]} />
          </mesh>
          <Garments zStart={inner0} zEnd={inner1} rodY={2.18} long={false} />
          {/* Internal drawers under the short hang — they only slide while
              the doors in front of them are open. Built facing local +z,
              turned so they pull out toward the room (-x). */}
          <group position={[FRONT_X + 0.06, 0, zc]} rotation={[0, -Math.PI / 2, 0]}>
            {[0.245, 0.52].map((y, i) => (
              <Drawer
                key={y}
                w={shelfW - 0.02}
                h={0.26}
                d={0.46}
                position={[0, y, 0]}
                front={m.walnut}
                handle="bar"
                travel={0.26}
                locked={!open}
                hint={i === 1 ? "Open drawer" : undefined}
              >
                {Array.from({ length: 6 }, (_, k) => (
                  <mesh key={k} position={[-0.42 + k * 0.17, 0.035, (k % 2) * 0.12 - 0.06]} scale={[1.3, 0.8, 1]} castShadow receiveShadow>
                    <sphereGeometry args={[0.05, 14, 10]} />
                    <meshPhysicalMaterial color={GARMENT_COLORS[(k * 2 + i) % GARMENT_COLORS.length]} roughness={0.95} sheen={0.7} />
                  </mesh>
                ))}
              </Drawer>
            ))}
          </group>
          <mesh position={[interiorX, 0.68, zc]} material={m.carcassInterior} castShadow receiveShadow>
            <boxGeometry args={[DEPTH - 0.04, PANEL, shelfW]} />
          </mesh>
        </>
      )}

      <Door hingeZ={z0 + DOOR_GAP / 2} dir={1} openness={openness} onToggle={toggle} />
      <Door hingeZ={z1 - DOOR_GAP / 2} dir={-1} openness={openness} onToggle={toggle} />
      <Hotspot position={[FRONT_X - 0.06, 1.45, zc]} label={open ? "Close wardrobe" : "Open wardrobe"} onActivate={toggle} />
    </group>
  );
}

export function Wardrobe() {
  const m = getBedroomMaterials();
  // One interior light, parked in whichever section is most open — cheaper
  // than a light per section, since every light costs every material.
  const marker = useRef<THREE.Group>(null);
  const best = useRef(0);
  const color = useMemo(() => new THREE.Color("#FFE6C4"), []);
  usePooledLight({ marker, intensity: () => sectionGlow[best.current] * 1.1, color, distance: 2.4, decay: 2, alsoIn: [] });
  useFrame(() => {
    let b = 0;
    for (let i = 1; i < SECTIONS; i++) if (sectionGlow[i] > sectionGlow[b]) b = i;
    best.current = b;
    if (marker.current) marker.current.position.z = Z0 + (b + 0.5) * SECTION_W;
  });
  const h = TOP_Y - BASE_Y;
  const cy = (TOP_Y + BASE_Y) / 2;
  const cz = (Z0 + Z1) / 2;
  const len = Z1 - Z0;
  return (
    <group>
      {/* Carcass */}
      <mesh position={[BACK_X - PANEL / 2, cy, cz]} material={m.carcassInterior} receiveShadow>
        <boxGeometry args={[PANEL, h, len]} />
      </mesh>
      <mesh position={[FRONT_X + DEPTH / 2, TOP_Y - PANEL / 2, cz]} material={m.carcassInterior} castShadow receiveShadow>
        <boxGeometry args={[DEPTH, PANEL, len]} />
      </mesh>
      <mesh position={[FRONT_X + DEPTH / 2, BASE_Y + PANEL / 2, cz]} material={m.carcassInterior} receiveShadow>
        <boxGeometry args={[DEPTH, PANEL, len]} />
      </mesh>
      {Array.from({ length: SECTIONS + 1 }, (_, i) => (
        <mesh key={i} position={[FRONT_X + DEPTH / 2, cy, Z0 + i * SECTION_W + (i === 0 ? PANEL / 2 : i === SECTIONS ? -PANEL / 2 : 0)]} material={i === 0 || i === SECTIONS ? m.laminate : m.carcassInterior} castShadow receiveShadow>
          <boxGeometry args={[DEPTH, h, PANEL]} />
        </mesh>
      ))}
      {/* Recessed kick plinth */}
      <mesh position={[FRONT_X + DEPTH / 2 + 0.04, BASE_Y / 2, cz]} receiveShadow>
        <boxGeometry args={[DEPTH - 0.08, BASE_Y, len - 0.02]} />
        <meshStandardMaterial color="#2A2521" roughness={0.7} />
      </mesh>
      {Array.from({ length: SECTIONS }, (_, i) => (
        <Section key={i} index={i} />
      ))}
      <group ref={marker} position={[FRONT_X + 0.18, TOP_Y - 0.2, Z0 + SECTION_W / 2]} />
    </group>
  );
}
