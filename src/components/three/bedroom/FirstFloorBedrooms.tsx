import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { F1 } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { Hotspot } from "./Hotspot";
import { clickable, useLampSwitch } from "./interaction";
import { MixedPointLight } from "./MixedLight";
import { Box } from "./primitives";
import { useMixedEmissive } from "./useMixedEmissive";

// Both ensuite bedroom suites: a king bed with an upholstered headboard, a
// full-height wardrobe, a dressing nook and an attached bath — the same
// kit of parts, re-skinned per bedroom so the two feel related but not
// identical, as the brief asks for.

type Rect = { x0: number; x1: number; z0: number; z1: number };

interface Scheme {
  headboard: THREE.Material;
  bench: THREE.Material;
  rugTone: string;
  accent: THREE.Material;
}

/** A king bed (1.98 x 2.1 m incl. the headboard), facing +dir along x. */
function KingBed({ x, z, dir, scheme }: { x: number; z: number; dir: 1 | -1; scheme: Scheme }) {
  const m = getBedroomMaterials();
  const bedLen = 2.1; // along x, headboard at the back
  const bedWid = 1.98; // along z
  const backX = x - dir * bedLen * 0.42;
  return (
    <group position={[x, 0, z]}>
      {/* Upholstered headboard */}
      <RoundedBox args={[0.1, 1.2, bedWid + 0.1]} radius={0.04} smoothness={3} position={[backX - dir * 0.45, 0.78, 0]} material={scheme.headboard} castShadow receiveShadow />
      {/* Base and mattress */}
      <RoundedBox args={[bedLen - 0.5, 0.42, bedWid]} radius={0.04} smoothness={2} position={[0, 0.21, 0]} material={scheme.bench} castShadow receiveShadow />
      <RoundedBox args={[bedLen - 0.56, 0.22, bedWid - 0.06]} radius={0.08} smoothness={3} position={[0, 0.53, 0]} material={m.linenWhite} castShadow receiveShadow />
      {/* Duvet and pillows */}
      <RoundedBox args={[bedLen - 0.58, 0.14, bedWid - 0.1]} radius={0.1} smoothness={3} position={[dir * 0.25, 0.63, 0]} material={m.linenDuvet} castShadow receiveShadow />
      {[-0.46, 0.46].map((dz) => (
        <RoundedBox key={dz} args={[0.5, 0.16, 0.38]} radius={0.08} smoothness={3} position={[backX - dir * 0.05, 0.73, dz]} rotation={[0, dir > 0 ? 0.08 : -0.08, 0]} material={m.linenWhite} castShadow receiveShadow />
      ))}
      <RoundedBox args={[0.6, 0.1, bedWid - 0.5]} radius={0.04} smoothness={2} position={[dir * (bedLen * 0.3), 0.58, 0]} material={scheme.accent} castShadow receiveShadow />
    </group>
  );
}

function Nightstand({ x, z, lamp }: { x: number; z: number; lamp: ReturnType<typeof useLampSwitch> }) {
  const m = getBedroomMaterials();
  const shade = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#efe4d0", emissive: "#FFC98C", roughness: 0.9, side: THREE.DoubleSide }), 0.03, 1.7, lamp.level);
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[0.42, 0.5, 0.4]} radius={0.02} smoothness={2} position={[0, 0.25, 0]} material={m.walnut} castShadow receiveShadow />
      <Box size={[0.38, 0.012, 0.36]} position={[0, 0.51, 0]} material={m.brass} />
      <group position={[0, 0.58, 0]} {...clickable(lamp.toggle)}>
        <mesh position={[0, 0.02, 0]} material={m.brass}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 10]} />
        </mesh>
        <mesh position={[0, 0.2, 0]} material={shade} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 0.2, 28, 1, true]} />
        </mesh>
      </group>
      <Hotspot position={[x, 0.75, z]} label={lamp.isOn ? "Switch off lamp" : "Switch on lamp"} onActivate={lamp.toggle} spaces={[12, 14]} />
    </group>
  );
}

function Wardrobe({ x0, x1, z, depth = 0.6 }: { x0: number; x1: number; z: number; depth?: number }) {
  const m = getBedroomMaterials();
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  return (
    <group>
      <Box size={[w, 2.3, depth]} position={[cx, 1.15, z]} material={m.carcassInterior} />
      {Array.from({ length: Math.max(2, Math.round(w / 0.9)) }, (_, i) => {
        const n = Math.max(2, Math.round(w / 0.9));
        const panelW = w / n - 0.012;
        const px = x0 + panelW / 2 + i * (w / n);
        return (
          <group key={i}>
            <mesh position={[px, 1.18, z + depth / 2 - 0.015]} material={m.walnut} castShadow receiveShadow>
              <boxGeometry args={[panelW, 2.22, 0.024]} />
            </mesh>
            <mesh position={[px + panelW * 0.33, 1.9, z + depth / 2]} material={m.brass}>
              <boxGeometry args={[0.2, 0.014, 0.01]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** A lounge chair and small side table in the reading corner. */
function LoungeCorner({ x, z, rotY, scheme }: { x: number; z: number; rotY: number; scheme: Scheme }) {
  const m = getBedroomMaterials();
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <RoundedBox args={[0.68, 0.1, 0.68]} radius={0.04} smoothness={2} position={[0, 0.4, 0]} material={scheme.accent} castShadow receiveShadow />
      <RoundedBox args={[0.68, 0.7, 0.1]} radius={0.06} smoothness={3} position={[0, 0.75, -0.3]} material={scheme.accent} castShadow receiveShadow />
      {[-0.29, 0.29].map((dx) => (
        <RoundedBox key={dx} args={[0.1, 0.45, 0.6]} radius={0.05} smoothness={2} position={[dx, 0.6, 0]} material={scheme.accent} castShadow receiveShadow />
      ))}
      {[-0.28, 0.28, 0.28, -0.28].map((dx, i) => (
        <mesh key={i} position={[dx, 0.13, i < 2 ? 0.26 : -0.26]} material={m.blackMetal} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.26, 10]} />
        </mesh>
      ))}
      <group position={[0.75, 0, 0.1]}>
        <mesh position={[0, 0.3, 0]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.56, 16]} />
        </mesh>
        <mesh position={[0, 0.58, 0]} material={m.stone} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 28]} />
        </mesh>
      </group>
    </group>
  );
}

function Rug({ x, z, w, d, color }: { x: number; z: number; w: number; d: number; color: string }) {
  return (
    <mesh position={[x, 0.006, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function BedroomCeilingLights({ r, pendant }: { r: Rect; pendant: ReturnType<typeof useLampSwitch> }) {
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  return (
    <group>
      <MixedPointLight position={[cx, F1.y + F1.height - 0.5, cz]} day={0.35} evening={2.0} level={pendant.level} distance={6} decay={1.8} color="#FFE6C8" />
    </group>
  );
}

function Bedroom1Furniture() {
  const r = F1.bedroom1;
  const m = getBedroomMaterials();
  const scheme: Scheme = { headboard: m.boucle, bench: m.sofa, rugTone: "#D9CFBE", accent: m.upholstery };
  const l1 = useLampSwitch();
  const l2 = useLampSwitch();
  const pendant = useLampSwitch();
  const cx = r.x0 + 1.55;
  const cz = (r.z0 + r.z1) / 2;
  return (
    <group>
      <Rug x={cx + 0.3} z={cz} w={2.6} d={2.3} color={scheme.rugTone} />
      <KingBed x={cx} z={cz} dir={1} scheme={scheme} />
      <Nightstand x={cx - 1.5} z={cz - 1.15} lamp={l1} />
      <Nightstand x={cx - 1.5} z={cz + 1.15} lamp={l2} />
      <Wardrobe x0={r.x1 - 1.9} x1={r.x1 - 0.1} z={r.z0 + 0.3} />
      <LoungeCorner x={r.x1 - 0.9} z={r.z1 - 0.9} rotY={Math.PI} scheme={scheme} />
      <BedroomCeilingLights r={r} pendant={pendant} />
      <Hotspot position={[cx, 1.3, cz]} label={pendant.isOn ? "Switch off bedroom light" : "Switch on bedroom light"} onActivate={pendant.toggle} spaces={[12]} />
    </group>
  );
}

function Bedroom2Furniture() {
  const r = F1.bedroom2;
  const m = getBedroomMaterials();
  const scheme: Scheme = { headboard: m.velvetSage, bench: m.sage, rugTone: "#BFC7B4", accent: m.velvetOlive };
  const l1 = useLampSwitch();
  const l2 = useLampSwitch();
  const pendant = useLampSwitch();
  const cx = r.x1 - 1.55;
  const cz = (r.z0 + r.z1) / 2;
  return (
    <group>
      <Rug x={cx - 0.3} z={cz} w={2.6} d={2.3} color={scheme.rugTone} />
      <KingBed x={cx} z={cz} dir={-1} scheme={scheme} />
      <Nightstand x={cx + 1.5} z={cz - 1.15} lamp={l1} />
      <Nightstand x={cx + 1.5} z={cz + 1.15} lamp={l2} />
      <Wardrobe x0={r.x0 + 0.1} x1={r.x0 + 1.9} z={r.z0 + 0.3} />
      <LoungeCorner x={r.x0 + 0.9} z={r.z1 - 0.9} rotY={0} scheme={scheme} />
      <BedroomCeilingLights r={r} pendant={pendant} />
      <Hotspot position={[cx, 1.3, cz]} label={pendant.isOn ? "Switch off bedroom light" : "Switch on bedroom light"} onActivate={pendant.toggle} spaces={[14]} />
    </group>
  );
}

/** A luxury ensuite: vanity, mirror, WC and a glass-screened rain shower. */
function Bathroom({ r, mirrorSide }: { r: Rect; mirrorSide: 1 | -1 }) {
  const m = getBedroomMaterials();
  const d = r.z1 - r.z0;
  const vanityX = mirrorSide > 0 ? r.x0 + 0.42 : r.x1 - 0.42;
  const showerX0 = mirrorSide > 0 ? r.x1 - 1.1 : r.x0;
  const showerX1 = mirrorSide > 0 ? r.x1 : r.x0 + 1.1;
  const led = useMixedEmissive(() => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFE0B2" }), 0.4, 3.5);
  return (
    <group>
      {/* Vanity run along one short wall */}
      <group position={[vanityX, 0, r.z0 + d / 2]} rotation={[0, mirrorSide > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <Box size={[0.46, 0.8, Math.min(1.6, d - 0.6)]} position={[0, 0.4, 0]} material={m.lacquerPale} />
        <Box size={[0.5, 0.04, Math.min(1.7, d - 0.5)]} position={[0, 0.81, 0]} material={m.calacattaTop} />
        <mesh position={[0, 0.84, -0.3]} material={m.porcelain}>
          <cylinderGeometry args={[0.19, 0.17, 0.12, 28]} />
        </mesh>
        <mesh position={[0, 1.0, -0.3]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 10]} />
        </mesh>
        <mesh position={[0, 1.55, 0.1]} material={m.chrome}>
          <boxGeometry args={[0.02, 0.9, 1.0]} />
        </mesh>
        <mesh position={[0, 0.5, 0.05]} material={led}>
          <boxGeometry args={[0.46, 0.012, 0.012]} />
        </mesh>
      </group>
      {/* WC, wall-hung, in the inner corner */}
      <group position={[mirrorSide > 0 ? r.x1 - 0.4 : r.x0 + 0.4, 0.4, r.z1 - 0.45]}>
        <mesh material={m.porcelain} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.14, 0.5]} />
        </mesh>
        <mesh position={[0, 0.1, -0.1]} material={m.porcelain} castShadow>
          <boxGeometry args={[0.34, 0.3, 0.2]} />
        </mesh>
      </group>
      {/* Glass-screened rain shower in the remaining corner */}
      <group>
        <Box size={[1.0, 0.03, 1.0]} position={[(showerX0 + showerX1) / 2, 0.015, r.z0 + 0.5]} material={m.stone} />
        <mesh position={[(showerX0 + showerX1) / 2, 1.0, r.z0 + 1.0]} material={m.showerGlass}>
          <boxGeometry args={[1.0, 2.0, 0.015]} />
        </mesh>
        <mesh position={[(showerX0 + showerX1) / 2, 2.1, r.z0 + 0.5]} material={m.chrome} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
        </mesh>
        <mesh position={[(showerX0 + showerX1) / 2, 1.5, r.z0 + 0.5]} material={m.chrome}>
          <cylinderGeometry args={[0.012, 0.012, 1.2, 10]} />
        </mesh>
      </group>
      {/* Recessed niche in the shower wall */}
      <Box size={[0.3, 0.4, 0.06]} position={[showerX0 - 0.03, 1.3, r.z0 + 0.5]} material={m.carcassInterior} />
      <MixedPointLight position={[(r.x0 + r.x1) / 2, F1.y + F1.height - 0.5, (r.z0 + r.z1) / 2]} day={0.4} evening={1.8} distance={4} decay={2} color="#F3EDE2" />
    </group>
  );
}

export function FirstFloorBedrooms() {
  return (
    <group>
      <Bedroom1Furniture />
      <Bathroom r={F1.bath1} mirrorSide={1} />
      <Bedroom2Furniture />
      <Bathroom r={F1.bath2} mirrorSide={-1} />
    </group>
  );
}
