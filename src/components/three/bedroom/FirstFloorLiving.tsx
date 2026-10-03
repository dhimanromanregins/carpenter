import { useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { F1 } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { Hotspot } from "./Hotspot";
import { clickable, useEased, useLampSwitch } from "./interaction";
import { MixedPointLight } from "./MixedLight";
import { Box } from "./primitives";
import { useMixedEmissive } from "./useMixedEmissive";

// The first floor's open public wing: the drawing room (the hero shot as
// you arrive off the stairs), the dining table, the open kitchen and the
// pooja room — plus the balcony off the landing hall.

function Rug({ x, z, w, d, color }: { x: number; z: number; w: number; d: number; color: string }) {
  return (
    <mesh position={[x, F1.y + 0.006, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

// ─── Drawing room ───────────────────────────────────────────────────────

/** A large L-shaped sectional, the room's centrepiece. */
function Sectional({ x, z }: { x: number; z: number }) {
  const m = getBedroomMaterials();
  return (
    <group position={[x, 0, z]}>
      {/* Main run */}
      <RoundedBox args={[2.9, 0.42, 0.95]} radius={0.06} smoothness={3} position={[0, 0.21, 0]} material={m.sofa} castShadow receiveShadow />
      <RoundedBox args={[2.9, 0.28, 0.22]} radius={0.08} smoothness={3} position={[0, 0.56, -0.37]} material={m.sofa} castShadow receiveShadow />
      {[-1.05, -0.35, 0.35, 1.05].map((dx) => (
        <RoundedBox key={dx} args={[0.65, 0.2, 0.8]} radius={0.1} smoothness={3} position={[dx, 0.5, 0.06]} material={m.sofa} castShadow receiveShadow />
      ))}
      {[-1.33, 1.33].map((dx) => (
        <RoundedBox key={dx} args={[0.2, 0.55, 0.95]} radius={0.06} smoothness={3} position={[dx, 0.3, 0]} material={m.sofa} castShadow receiveShadow />
      ))}
      {/* Chaise return */}
      <RoundedBox args={[1.0, 0.42, 1.65]} radius={0.06} smoothness={3} position={[1.95, 0.21, 1.3]} material={m.sofa} castShadow receiveShadow />
      <RoundedBox args={[0.65, 0.2, 1.5]} radius={0.1} smoothness={3} position={[1.95, 0.5, 1.33]} material={m.sofa} castShadow receiveShadow />
      <RoundedBox args={[1.0, 0.55, 0.2]} radius={0.06} smoothness={3} position={[1.95, 0.3, 2.07]} material={m.sofa} castShadow receiveShadow />
    </group>
  );
}

function AccentChair({ x, z, rotY, fabric }: { x: number; z: number; rotY: number; fabric: THREE.Material }) {
  const m = getBedroomMaterials();
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <RoundedBox args={[0.62, 0.1, 0.6]} radius={0.04} smoothness={2} position={[0, 0.4, 0]} material={fabric} castShadow receiveShadow />
      <RoundedBox args={[0.62, 0.7, 0.1]} radius={0.06} smoothness={3} position={[0, 0.75, -0.26]} material={fabric} castShadow receiveShadow />
      {[-0.26, 0.26].map((dx) => (
        <RoundedBox key={dx} args={[0.1, 0.42, 0.56]} radius={0.05} smoothness={2} position={[dx, 0.58, 0]} material={fabric} castShadow receiveShadow />
      ))}
      {[
        [-0.25, 0.24],
        [0.25, 0.24],
        [-0.25, -0.24],
        [0.25, -0.24],
      ].map(([dx, dz], i) => (
        <mesh key={i} position={[dx, 0.17, dz]} material={m.walnut} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.34, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeTable({ x, z }: { x: number; z: number }) {
  const m = getBedroomMaterials();
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.34, 0]} material={m.calacattaTop} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 48]} />
      </mesh>
      <mesh position={[0, 0.17, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.34, 16]} />
      </mesh>
      <mesh position={[0, 0.005, 0]} material={m.brass}>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 48]} />
      </mesh>
    </group>
  );
}

function SideTable({ x, z }: { x: number; z: number }) {
  const m = getBedroomMaterials();
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.28, 0]} material={m.oak} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.16, 0.13, Math.sin(a) * 0.16]} rotation={[0, -a, 0.12]} material={m.brass} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.26, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** The fluted-walnut TV / media wall, with warm backlighting. */
function MediaWall() {
  const m = getBedroomMaterials();
  const r = F1.drawing;
  const wallX = r.x1 - 0.02;
  const wallZ = r.z1 - 1.7;
  const w = 2.6;
  const h = 1.7;
  const mix = useLampSwitch();
  const screen = useMemo(() => new THREE.MeshStandardMaterial({ color: "#050506", roughness: 0.15, metalness: 0.2, emissive: "#101418", emissiveIntensity: 0.4 }), []);
  const flutes = 18;
  return (
    <group position={[wallX, 0, wallZ]} rotation={[0, -Math.PI / 2, 0]}>
      {Array.from({ length: flutes }, (_, i) => (
        <mesh key={i} position={[0, h / 2 + 0.3, -1.4 + (i / (flutes - 1)) * 2.8]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[0.03, h + 0.6, 0.12]} />
        </mesh>
      ))}
      <RoundedBox args={[0.04, h, w]} radius={0.01} smoothness={2} position={[0.04, h / 2 + 0.3, 0]} material={screen} castShadow {...clickable(mix.toggle)} />
      <MixedPointLight position={[0.1, h / 2 + 0.3, 0]} day={0} evening={0.8} level={mix.level} distance={3} decay={2} color="#6fa8dc" />
      <Hotspot position={[0.2, h, 0]} label={mix.isOn ? "Switch off TV ambience" : "Switch on TV ambience"} onActivate={mix.toggle} spaces={[11]} />
    </group>
  );
}

function DrawingRoomFurniture() {
  const r = F1.drawing;
  const cx = (r.x0 + r.x1) / 2 + 0.3;
  const cz = (r.z0 + r.z1) / 2 + 0.2;
  const m = getBedroomMaterials();
  const pendant = useLampSwitch();
  return (
    <group>
      <Rug x={cx} z={cz} w={4.4} d={3.2} color="#D6CFBF" />
      <Sectional x={cx - 0.7} z={cz - 0.5} />
      <AccentChair x={r.x0 + 0.7} z={cz + 0.9} rotY={-0.5} fabric={m.velvetSage} />
      <AccentChair x={r.x0 + 1.5} z={cz + 1.5} rotY={-1.1} fabric={m.velvetSage} />
      <CoffeeTable x={cx - 0.3} z={cz + 0.6} />
      <SideTable x={r.x0 + 0.5} z={r.z0 + 0.5} />
      <MediaWall />
      {/* Large indoor plant in the corner */}
      <group position={[r.x1 - 0.5, 0, r.z1 - 0.5]}>
        <mesh position={[0, 0.3, 0]} material={m.ceramicDark} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.2, 0.5, 24]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i % 2) * 0.15 - 0.07, 0.9 + i * 0.06, ((i / 2) % 2) * 0.15 - 0.07]} rotation={[0, i, 0.3]} material={m.leaf} castShadow>
            <coneGeometry args={[0.16, 0.6, 6]} />
          </mesh>
        ))}
      </group>
      <MixedPointLight position={[cx, F1.y + F1.height - 0.5, cz]} day={0.5} evening={2.2} level={pendant.level} distance={8} decay={1.6} color="#FFE6C8" />
      <Hotspot position={[cx, 1.6, cz]} label={pendant.isOn ? "Switch off drawing room lights" : "Switch on drawing room lights"} onActivate={pendant.toggle} spaces={[11]} />
    </group>
  );
}

// ─── Dining ─────────────────────────────────────────────────────────────

function DiningChair({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  const m = getBedroomMaterials();
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <RoundedBox args={[0.42, 0.04, 0.42]} radius={0.02} smoothness={2} position={[0, 0.46, 0]} material={m.upholstery} castShadow receiveShadow />
      <RoundedBox args={[0.4, 0.5, 0.04]} radius={0.03} smoothness={2} position={[0, 0.72, -0.19]} material={m.upholstery} castShadow receiveShadow />
      {[
        [-0.17, -0.17],
        [0.17, -0.17],
        [-0.17, 0.17],
        [0.17, 0.17],
      ].map(([dx, dz], i) => (
        <mesh key={i} position={[dx, 0.22, dz]} material={m.walnut} castShadow>
          <cylinderGeometry args={[0.016, 0.02, 0.44, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function DiningSet() {
  const r = F1.dining;
  const m = getBedroomMaterials();
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  const pendant = useLampSwitch();
  const shade = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#2c2a26", emissive: "#FFD9A6", side: THREE.DoubleSide }), 0.05, 2.6, pendant.level);
  return (
    <group>
      <Rug x={cx} z={cz} w={2.6} d={3.0} color="#C9BFA8" />
      <RoundedBox args={[1.6, 0.05, 0.95]} radius={0.02} smoothness={2} position={[cx, 0.74, cz]} material={m.oak} castShadow receiveShadow />
      <mesh position={[cx, 0.37, cz]} material={m.blackMetal} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.6]} />
      </mesh>
      {[-0.65, 0.65].map((dx) =>
        [-0.42, 0.42].map((dz) => <DiningChair key={`${dx}-${dz}`} x={cx + dx * 1.15} z={cz + dz} rotY={dx < 0 ? Math.PI / 2 : -Math.PI / 2} />)
      )}
      <DiningChair x={cx} z={cz - 0.75} rotY={0} />
      <DiningChair x={cx} z={cz + 0.75} rotY={Math.PI} />
      <group position={[cx, 1.55, cz]} {...clickable(pendant.toggle)}>
        <mesh material={m.brass}>
          <cylinderGeometry args={[0.004, 0.004, 0.5, 6]} />
        </mesh>
        <mesh position={[0, -0.3, 0]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.22, 0.05, 0.3, 28, 1, true]} />
        </mesh>
        <mesh position={[0, -0.3, 0]} material={shade}>
          <cylinderGeometry args={[0.2, 0.045, 0.28, 28, 1, true]} />
        </mesh>
      </group>
      {/* Console and artwork on the feature wall */}
      <RoundedBox args={[1.3, 0.75, 0.32]} radius={0.02} smoothness={2} position={[r.x0 + 0.2, 0.37, r.z0 + 0.3]} material={m.walnut} castShadow receiveShadow />
      <Box size={[1.0, 0.7, 0.03]} position={[r.x0 + 0.21, 1.4, r.z0 + 0.3]} material={m.frameBronze} />
      <MixedPointLight position={[cx, F1.y + F1.height - 0.5, cz]} day={0.3} evening={0.4} level={pendant.level} distance={4} decay={2} color="#FFD6A6" />
      <Hotspot position={[cx, 1.85, cz]} label={pendant.isOn ? "Switch off pendant" : "Switch on pendant"} onActivate={pendant.toggle} spaces={[7]} />
    </group>
  );
}

// ─── Kitchen ────────────────────────────────────────────────────────────

function KitchenIsland() {
  const r = F1.kitchen;
  const m = getBedroomMaterials();
  const [hobOn, setHobOn] = useState(false);
  const heat = useEased(hobOn, 1.2);
  const rings = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#1a1a1d", emissive: "#FF5A1E" }), 0, 0);
  useFrame(() => {
    rings.emissiveIntensity = heat.current * 4.5;
  });
  const hood = useLampSwitch();
  const cx = (r.x0 + r.x1) / 2;
  const iz = r.z1 - 1.4;
  const w = 2.44; // 8'
  const d = 1.07; // 3.5'
  return (
    <group>
      <mesh position={[cx, 0.45, iz]} material={m.lacquerPale} castShadow receiveShadow>
        <boxGeometry args={[w, 0.9, d]} />
      </mesh>
      <Box size={[w + 0.12, 0.06, d + 0.12]} position={[cx, 0.93, iz]} material={m.calacattaTop} />
      <mesh position={[cx - 0.3, 0.963, iz]} rotation={[-Math.PI / 2, 0, 0]} {...clickable(() => setHobOn((v) => !v))}>
        <planeGeometry args={[0.56, 0.48]} />
        <meshPhysicalMaterial color="#0c0c0f" roughness={0.12} clearcoat={1} />
      </mesh>
      {[
        [-0.43, -0.11],
        [-0.17, -0.11],
        [-0.43, 0.11],
        [-0.17, 0.11],
      ].map(([dx, dz]) => (
        <mesh key={`${dx}${dz}`} position={[cx + dx, 0.965, iz + dz]} rotation={[-Math.PI / 2, 0, 0]} material={rings} {...clickable(() => setHobOn((v) => !v))}>
          <ringGeometry args={[0.05, 0.068, 24]} />
        </mesh>
      ))}
      <group position={[cx - 0.3, 2.0, iz]}>
        <mesh material={m.steel} castShadow {...clickable(hood.toggle)}>
          <boxGeometry args={[0.7, 0.2, 0.55]} />
        </mesh>
        <mesh position={[0, 0.35, 0]} material={m.steel}>
          <boxGeometry args={[0.2, 0.55, 0.2]} />
        </mesh>
      </group>
      <MixedPointLight position={[cx - 0.3, 1.8, iz]} day={0.2} evening={1.5} level={hood.level} distance={3} decay={2} color="#FFE7C6" />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[cx - 0.9 + i * 0.6, 0, iz + d / 2 + 0.3]}>
          <mesh position={[0, 0.02, 0]} material={m.blackMetal} castShadow>
            <cylinderGeometry args={[0.17, 0.19, 0.03, 24]} />
          </mesh>
          <mesh position={[0, 0.3, 0]} material={m.blackMetal} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.58, 14]} />
          </mesh>
          <RoundedBox args={[0.34, 0.07, 0.32]} radius={0.03} smoothness={2} position={[0, 0.63, 0]} material={m.leather} castShadow receiveShadow />
        </group>
      ))}
      <Hotspot position={[cx - 0.3, 1.2, iz - 0.3]} label={hobOn ? "Turn off the hob" : "Turn on the hob"} onActivate={() => setHobOn((v) => !v)} spaces={[8]} />
      <Hotspot position={[cx + 0.1, 2.0, iz]} label={hood.isOn ? "Switch off the hood light" : "Switch on the hood light"} onActivate={hood.toggle} spaces={[8]} />
    </group>
  );
}

function KitchenCabinets() {
  const r = F1.kitchen;
  const m = getBedroomMaterials();
  const [open, setOpen] = useState(false);
  const swing = useEased(open, 2.4);
  const h = 2.3;
  const runX = r.x1 - 0.33;
  const z0 = r.z0 + 0.1;
  const z1 = r.z0 + 3.0;
  return (
    <group>
      {/* Tall run against the east wall: fridge, pantry, oven tower */}
      <Box size={[0.65, h, z1 - z0]} position={[runX, h / 2, (z0 + z1) / 2]} material={m.carcassInterior} />
      <Box size={[0.64 - 0.01, h - 0.1, 0.9]} position={[r.x1 - 0.01, h / 2, z0 + 0.45]} material={m.walnut} />
      <group position={[r.x1 - 0.01, 0, z0 + 0.45]}>
        <group rotation={[0, -1.3 * swing.current, 0]} position={[0, 0, 0.44]}>
          <mesh position={[0.01, 1.1, -0.44]} material={m.walnut} castShadow {...clickable(() => setOpen((v) => !v))}>
            <boxGeometry args={[0.02, 2.1, 0.86]} />
          </mesh>
        </group>
      </group>
      <Box size={[0.64, h - 0.1, 1.9]} position={[r.x1 - 0.01, h / 2, z0 + 1.95]} material={m.lacquerPale} />
      {/* Base run along the north wall with the sink */}
      <Box size={[r.x1 - r.x0 - 0.1, 0.9, 0.6]} position={[(r.x0 + r.x1) / 2, 0.45, r.z0 + 0.4]} material={m.lacquerPale} />
      <Box size={[r.x1 - r.x0 - 0.1, 0.06, 0.66]} position={[(r.x0 + r.x1) / 2, 0.93, r.z0 + 0.4]} material={m.calacattaTop} />
      <Box size={[0.5, 0.18, 0.4]} position={[r.x0 + 0.9, 0.84, r.z0 + 0.4]} material={m.porcelain} />
      <mesh position={[r.x0 + 0.9, 1.1, r.z0 + 0.28]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.3, 12]} />
      </mesh>
      {/* Under-cabinet LED */}
      <mesh position={[(r.x0 + r.x1) / 2, 0.86, r.z0 + 0.65]}>
        <boxGeometry args={[r.x1 - r.x0 - 0.2, 0.01, 0.01]} />
        <meshStandardMaterial color="#000" emissive="#FFE0B2" emissiveIntensity={2} />
      </mesh>
      <Hotspot position={[r.x1 - 0.2, 1.3, z0 + 0.45]} label={open ? "Close the fridge" : "Open the fridge"} onActivate={() => setOpen((v) => !v)} spaces={[8]} />
    </group>
  );
}

function KitchenFurniture() {
  return (
    <group>
      <KitchenCabinets />
      <KitchenIsland />
    </group>
  );
}

// ─── Pooja ──────────────────────────────────────────────────────────────

function PoojaRoom() {
  const r = F1.pooja;
  const m = getBedroomMaterials();
  const lamp = useLampSwitch();
  const glow = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#2a1c0e", emissive: "#FFB366", side: THREE.DoubleSide }), 0.1, 3.2, lamp.level);
  const cx = (r.x0 + r.x1) / 2;
  const backZ = r.z0 + 0.25;
  return (
    <group>
      {/* Wooden mandir with a jaali back panel, backlit */}
      <group position={[cx, 0, backZ]} {...clickable(lamp.toggle)}>
        <Box size={[1.3, 0.1, 0.4]} position={[0, 0.65, 0]} material={m.walnut} />
        <Box size={[1.3, 0.9, 0.04]} position={[0, 1.15, -0.18]} material={glow} />
        {Array.from({ length: 6 }, (_, i) => (
          <Box key={i} size={[0.03, 0.9, 0.06]} position={[-0.55 + i * 0.22, 1.15, -0.16]} material={m.walnut} />
        ))}
        <Box size={[0.08, 1.1, 0.08]} position={[-0.6, 1.2, -0.17]} material={m.walnut} />
        <Box size={[0.08, 1.1, 0.08]} position={[0.6, 1.2, -0.17]} material={m.walnut} />
        <Box size={[1.3, 0.08, 0.4]} position={[0, 1.72, 0]} material={m.walnut} />
        {/* Small brass idol platform */}
        <mesh position={[0, 0.72, 0.02]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.06, 20]} />
        </mesh>
        <mesh position={[0, 0.85, 0.02]} material={m.ceramic} castShadow>
          <coneGeometry args={[0.08, 0.26, 16]} />
        </mesh>
        {/* Storage drawers below */}
        {[0, 1].map((i) => (
          <Box key={i} size={[0.58, 0.2, 0.38]} position={[-0.32 + i * 0.64, 0.25, 0]} material={m.walnut} />
        ))}
        {[0, 1].map((i) => (
          <mesh key={i} position={[-0.32 + i * 0.64, 0.25, 0.2]} material={m.brass}>
            <boxGeometry args={[0.1, 0.012, 0.01]} />
          </mesh>
        ))}
      </group>
      {/* Brass diyas on the marble platform */}
      {[-0.5, 0, 0.5].map((dx) => (
        <group key={dx} position={[cx + dx, F1.y, (r.z0 + r.z1) / 2 + 0.6]}>
          <mesh position={[0, 0.02, 0]} material={m.brass} castShadow>
            <cylinderGeometry args={[0.05, 0.03, 0.04, 16]} />
          </mesh>
        </group>
      ))}
      <MixedPointLight position={[cx, F1.y + F1.height - 0.6, (r.z0 + r.z1) / 2]} day={0.4} evening={1.4} level={lamp.level} distance={4} decay={2} color="#FFC98A" />
      <Hotspot position={[cx, 1.9, backZ + 0.3]} label={lamp.isOn ? "Switch off pooja lighting" : "Switch on pooja lighting"} onActivate={lamp.toggle} spaces={[9]} />
    </group>
  );
}

// ─── Balcony ────────────────────────────────────────────────────────────

function BalconyFurniture() {
  const r = F1.balcony;
  const m = getBedroomMaterials();
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  return (
    <group>
      {[-0.6, 0.6].map((dx) => (
        <group key={dx} position={[cx + dx, 0, cz]}>
          <RoundedBox args={[0.55, 0.08, 0.55]} radius={0.04} smoothness={2} position={[0, 0.35, 0]} material={m.rust} castShadow receiveShadow />
          <mesh position={[0, 0.17, 0]} material={m.blackMetal} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.34, 16]} />
          </mesh>
        </group>
      ))}
      <mesh position={[cx, 0.42, cz]} material={m.stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 32]} />
      </mesh>
      <mesh position={[cx, 0.2, cz]} material={m.blackMetal}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 12]} />
      </mesh>
      {/* Planters along the rail */}
      {[r.z0 + 0.4, r.z1 - 0.4].map((z) => (
        <group key={z} position={[r.x1 - 0.35, 0, z]}>
          <mesh position={[0, 0.25, 0]} material={m.ceramicDark} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.17, 0.4, 20]} />
          </mesh>
          <mesh position={[0, 0.55, 0]} material={m.leaf} castShadow>
            <coneGeometry args={[0.18, 0.5, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function FirstFloorLiving() {
  return (
    <group>
      <DrawingRoomFurniture />
      <DiningSet />
      <KitchenFurniture />
      <PoojaRoom />
      <BalconyFurniture />
    </group>
  );
}
