import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { DOOR, ROOM, WINDOW } from "./bedroomLayout";
import { BedroomDoor } from "./BedroomDoor";
import { Box } from "./primitives";
import { TrayCeiling } from "./TrayCeiling";
import { getBedroomMaterials } from "./bedroomMaterials";
import { getBedroomTextures, withRepeat } from "./proceduralTextures";
import { curtainGeometry } from "./softGeometry";
import { CameraSpaceContext, mixValue, windowState } from "./bedroomState";
import { clickable, useEased } from "./interaction";
import { Hotspot } from "./Hotspot";

const W = ROOM.x1 - ROOM.x0;
const D = ROOM.z1 - ROOM.z0;
const H = ROOM.height;
const WALL_T = 0.2;

function Floor({ reflections: allowed }: { reflections: boolean }) {
  // drei's reflector re-renders the whole home every frame — only worth it
  // while you're in the room that can see it.
  const space = useContext(CameraSpaceContext);
  const reflections = allowed && space === 0;
  const maps = useMemo(() => withRepeat(getBedroomTextures().oakFloor, W / 1.2, D / 1.2), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[W, D]} />
      {reflections ? (
        <MeshReflectorMaterial
          map={maps.map}
          roughnessMap={maps.roughnessMap}
          bumpMap={maps.bumpMap}
          bumpScale={0.6}
          roughness={0.9}
          metalness={0}
          resolution={512}
          blur={[500, 160]}
          mixBlur={1}
          mixStrength={0.55}
          mixContrast={1}
          mirror={0}
          depthScale={0.6}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
        />
      ) : (
        <meshStandardMaterial
          map={maps.map}
          roughnessMap={maps.roughnessMap}
          bumpMap={maps.bumpMap}
          bumpScale={0.6}
          roughness={0.75}
        />
      )}
    </mesh>
  );
}

function Walls() {
  const m = getBedroomMaterials();
  const { z0, z1, y0, y1 } = WINDOW;
  const sideLen = z0 - ROOM.z0;
  const wx = ROOM.x0 - WALL_T / 2;
  return (
    <group>
      {/* North (bed wall), south (door wall), east (wardrobe wall) */}
      <Box size={[W + 2 * WALL_T, H, WALL_T]} position={[0, H / 2, ROOM.z0 - WALL_T / 2]} material={m.wall} />
      {/* South wall, with the door opening through to the hall */}
      <Box size={[DOOR.x0 - ROOM.x0 + WALL_T, H, WALL_T]} position={[(ROOM.x0 - WALL_T + DOOR.x0) / 2, H / 2, ROOM.z1 + WALL_T / 2]} material={m.wall} />
      <Box size={[ROOM.x1 + WALL_T - DOOR.x1, H, WALL_T]} position={[(DOOR.x1 + ROOM.x1 + WALL_T) / 2, H / 2, ROOM.z1 + WALL_T / 2]} material={m.wall} />
      <Box size={[DOOR.x1 - DOOR.x0, H - DOOR.height, WALL_T]} position={[(DOOR.x0 + DOOR.x1) / 2, (H + DOOR.height) / 2, ROOM.z1 + WALL_T / 2]} material={m.wall} />
      <Box size={[WALL_T, H, D]} position={[ROOM.x1 + WALL_T / 2, H / 2, 0]} material={m.wall} />
      {/* West wall, built around the window opening so sunlight passes through it */}
      <Box size={[WALL_T, y0, D]} position={[wx, y0 / 2, 0]} material={m.wall} />
      <Box size={[WALL_T, H - y1, D]} position={[wx, (H + y1) / 2, 0]} material={m.wall} />
      <Box size={[WALL_T, y1 - y0, sideLen]} position={[wx, (y0 + y1) / 2, ROOM.z0 + sideLen / 2]} material={m.wall} />
      <Box size={[WALL_T, y1 - y0, ROOM.z1 - z1]} position={[wx, (y0 + y1) / 2, (ROOM.z1 + z1) / 2]} material={m.wall} />
    </group>
  );
}

function Skirting() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E6DFD3", roughness: 0.55 }), []);
  const h = 0.09;
  const t = 0.014;
  return (
    <group>
      <Box size={[W, h, t]} position={[0, h / 2, ROOM.z0 + t / 2]} material={mat} cast={false} />
      {/* South runs stop at the door architraves */}
      <Box size={[DOOR.x0 - 0.07 - ROOM.x0, h, t]} position={[(ROOM.x0 + DOOR.x0 - 0.07) / 2, h / 2, ROOM.z1 - t / 2]} material={mat} cast={false} />
      <Box size={[ROOM.x1 - DOOR.x1 - 0.07, h, t]} position={[(ROOM.x1 + DOOR.x1 + 0.07) / 2, h / 2, ROOM.z1 - t / 2]} material={mat} cast={false} />
      <Box size={[t, h, D]} position={[ROOM.x0 + t / 2, h / 2, 0]} material={mat} cast={false} />
    </group>
  );
}

// Vertical oak battens behind the bed — the carpentry showpiece of the room.
const FLUTE_X0 = -1.75;
const FLUTE_X1 = 1.75;
const FLUTE_PITCH = 0.058;
const FLUTE_COUNT = Math.floor((FLUTE_X1 - FLUTE_X0) / FLUTE_PITCH);
const FLUTE_W = 0.045;
const FLUTE_DEPTH = 0.028;
const FLUTE_H = ROOM.bandBottom;

function FlutedWall() {
  const m = getBedroomMaterials();
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const mat = new THREE.Matrix4();
    const color = new THREE.Color();
    const start = FLUTE_X0 + (FLUTE_X1 - FLUTE_X0 - (FLUTE_COUNT - 1) * FLUTE_PITCH) / 2;
    for (let i = 0; i < FLUTE_COUNT; i++) {
      mat.makeTranslation(start + i * FLUTE_PITCH, FLUTE_H / 2, ROOM.z0 + 0.006 + FLUTE_DEPTH / 2);
      mesh.setMatrixAt(i, mat);
      const s = Math.sin(i * 12.9898) * 43758.5453;
      color.setScalar(0.9 + 0.12 * (s - Math.floor(s)));
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group>
      <mesh position={[0, FLUTE_H / 2, ROOM.z0 + 0.003]} receiveShadow>
        <boxGeometry args={[FLUTE_X1 - FLUTE_X0 + 0.02, FLUTE_H, 0.006]} />
        <meshStandardMaterial color="#4A3726" roughness={0.8} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, FLUTE_COUNT]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[FLUTE_W, FLUTE_H, FLUTE_DEPTH]} />
      </instancedMesh>
    </group>
  );
}

interface CurtainProps {
  /** Outer (fixed) edge on the track, where the panel gathers when open. */
  anchorZ: number;
  x: number;
  topY: number;
  /** +1 draws toward +z from its anchor, -1 toward -z. */
  dir: 1 | -1;
  closedWidth: number;
  openWidth: number;
  height: number;
  pleat: number;
  pleatDepth: number;
  seed: number;
  material: THREE.Material;
  amount: { current: number };
  /** 0..1 breeze strength (the window being open). */
  breeze?: { current: number };
  castShadow?: boolean;
  onToggle: () => void;
}

/**
 * One curtain panel on the track. Drawing it scales the pleated panel
 * toward its anchor — pleats bunch tighter and deeper, like real fabric —
 * and with the window open, a breeze billows it into the room.
 */
function Curtain({
  anchorZ,
  x,
  topY,
  dir,
  closedWidth,
  openWidth,
  height,
  pleat,
  pleatDepth,
  seed,
  material,
  amount,
  breeze,
  castShadow = false,
  onToggle,
}: CurtainProps) {
  const geo = useMemo(
    () => curtainGeometry(closedWidth, height, pleat, pleatDepth, seed),
    [closedWidth, height, pleat, pleatDepth, seed]
  );
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  const ref = useRef<THREE.Mesh>(null);
  const settled = useRef(true);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const sx = mixValue(openWidth / closedWidth, 1, amount.current);
    mesh.scale.set(sx, 1, 1 + (1 - sx) * 1.1);

    const b = breeze?.current ?? 0;
    if (b < 0.002 && settled.current) return;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    if (b < 0.002) {
      // Breeze died down: restore the resting drape exactly.
      (pos.array as Float32Array).set(base);
      settled.current = true;
    } else {
      settled.current = false;
      const t = clock.elapsedTime;
      const gust = 0.6 + 0.4 * Math.sin(t * 0.7 + seed);
      // Local +z faces out of the window for dir=+1, into the room for -1.
      const into = -dir;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const bz = base[i * 3 + 2];
        const fall = -by / height; // 0 at the track, 1 at the hem
        const wave =
          Math.sin(t * 1.9 + bx * 4.0 + by * 1.3 + seed) * 0.5 +
          Math.sin(t * 3.1 - bx * 7.0 + by * 2.2 + seed * 2) * 0.25;
        const lift = fall * fall * b * gust;
        pos.setZ(i, bz + into * lift * (0.16 + 0.06 * wave));
        pos.setY(i, by + lift * 0.05);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh
      ref={ref}
      geometry={geo}
      material={material}
      position={[x, topY, anchorZ]}
      rotation={[0, dir === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}
      castShadow={castShadow}
      receiveShadow
      {...clickable(onToggle)}
    />
  );
}

const SASH_OPEN_ANGLE = 1.25;

/**
 * One outward-opening casement sash hinged on a jamb; `dir` is the
 * direction (±z) it extends from its hinge toward the meeting stile.
 */
function Sash({
  hingeZ,
  dir,
  width,
  open,
  onToggle,
}: {
  hingeZ: number;
  dir: 1 | -1;
  width: number;
  open: { current: number };
  onToggle: () => void;
}) {
  const m = getBedroomMaterials();
  const ref = useRef<THREE.Group>(null);
  const { y0, y1 } = WINDOW;
  const h = y1 - y0 - 0.1;
  const p = 0.045;
  useFrame(() => {
    // Negative-x is outdoors: rotating by -dir·θ swings the free edge out.
    if (ref.current) ref.current.rotation.y = -dir * SASH_OPEN_ANGLE * open.current;
  });
  const handlers = clickable(onToggle);
  const c = (dir * width) / 2;
  const meet = dir * (width - p / 2);
  return (
    <group ref={ref} position={[ROOM.x0 - 0.12, (y0 + y1) / 2, hingeZ]}>
      <mesh position={[0, h / 2 - p / 2, c]} material={m.frameBronze} castShadow {...handlers}>
        <boxGeometry args={[0.05, p, width]} />
      </mesh>
      <mesh position={[0, -h / 2 + p / 2, c]} material={m.frameBronze} castShadow {...handlers}>
        <boxGeometry args={[0.05, p, width]} />
      </mesh>
      <mesh position={[0, 0, (dir * p) / 2]} material={m.frameBronze} castShadow {...handlers}>
        <boxGeometry args={[0.05, h, p]} />
      </mesh>
      <mesh position={[0, 0, meet]} material={m.frameBronze} castShadow {...handlers}>
        <boxGeometry args={[0.05, h, p]} />
      </mesh>
      <mesh position={[0, 0, c]} rotation={[0, Math.PI / 2, 0]} material={m.glass} {...handlers}>
        <planeGeometry args={[width - 2 * p, h - 2 * p]} />
      </mesh>
      {/* Lever handle on the room side of the meeting stile */}
      <mesh position={[0.04, 0, meet]} material={m.brass} castShadow {...handlers}>
        <boxGeometry args={[0.03, 0.014, 0.014]} />
      </mesh>
      <mesh position={[0.058, -0.05, meet]} material={m.brass} castShadow {...handlers}>
        <boxGeometry args={[0.014, 0.12, 0.014]} />
      </mesh>
    </group>
  );
}

function WindowAssembly() {
  const m = getBedroomMaterials();
  const { z0, z1, y0, y1 } = WINDOW;
  const fx = ROOM.x0 - 0.12;
  const f = 0.05;
  const midY = (y0 + y1) / 2;
  const openH = y1 - y0;
  const openW = z1 - z0;

  const [drapesClosed, setDrapesClosed] = useState(false);
  const [sheersClosed, setSheersClosed] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const drapes = useEased(drapesClosed, 1.8);
  const sheers = useEased(sheersClosed, 1.8);
  const sash = useEased(windowOpen, 1.6);
  const toggleDrapes = () => setDrapesClosed((v) => !v);
  const toggleSheers = () => setSheersClosed((v) => !v);
  const toggleWindow = () => setWindowOpen((v) => !v);

  const sheerMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#F7F3EC",
        roughness: 1,
        transparent: true,
        opacity: 0.62,
        sheen: 1,
        sheenColor: new THREE.Color("#ffffff"),
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );

  useFrame(() => {
    windowState.drapes = drapes.current;
    windowState.sheers = sheers.current;
    windowState.sash = sash.current;
  });

  const sheerX = ROOM.x0 + 0.26;
  const drapeX = ROOM.x0 + 0.14;
  const halfSash = openW / 2 - f;

  return (
    <group>
      {/* Slim bronze outer frame; two casement sashes open outward */}
      <Box size={[0.07, f, openW]} position={[fx, y0 + f / 2, 0]} material={m.frameBronze} />
      <Box size={[0.07, f, openW]} position={[fx, y1 - f / 2, 0]} material={m.frameBronze} />
      <Box size={[0.07, openH, f]} position={[fx, midY, z0 + f / 2]} material={m.frameBronze} />
      <Box size={[0.07, openH, f]} position={[fx, midY, z1 - f / 2]} material={m.frameBronze} />
      <Sash hingeZ={z0 + f} dir={1} width={halfSash} open={sash} onToggle={toggleWindow} />
      <Sash hingeZ={z1 - f} dir={-1} width={halfSash} open={sash} onToggle={toggleWindow} />

      {/* Stone sill */}
      <Box size={[0.27, 0.03, openW + 0.1]} position={[ROOM.x0 - 0.2 + 0.135 + 0.06, y0 + 0.015, 0]} material={m.stone} />

      {/* Curtain track, sheers and heavy linen drapes — each pair draws on click */}
      <Box size={[0.02, 0.02, 3.8]} position={[ROOM.x0 + 0.2, ROOM.bandBottom - 0.02, 0]} material={m.blackMetal} cast={false} />
      <Curtain anchorZ={-1.6} x={sheerX} topY={2.69} dir={1} closedWidth={1.62} openWidth={0.62} height={2.66} pleat={0.1} pleatDepth={0.035} seed={2} material={sheerMat} amount={sheers} breeze={sash} onToggle={toggleSheers} />
      <Curtain anchorZ={1.6} x={sheerX} topY={2.69} dir={-1} closedWidth={1.62} openWidth={0.62} height={2.66} pleat={0.1} pleatDepth={0.035} seed={3} material={sheerMat} amount={sheers} breeze={sash} onToggle={toggleSheers} />
      <Curtain anchorZ={-1.92} x={drapeX} topY={2.7} dir={1} closedWidth={1.93} openWidth={0.62} height={2.68} pleat={0.16} pleatDepth={0.06} seed={5} material={m.upholstery} amount={drapes} castShadow onToggle={toggleDrapes} />
      <Curtain anchorZ={1.92} x={drapeX} topY={2.7} dir={-1} closedWidth={1.93} openWidth={0.62} height={2.68} pleat={0.16} pleatDepth={0.06} seed={6} material={m.upholstery} amount={drapes} castShadow onToggle={toggleDrapes} />

      <Hotspot position={[ROOM.x0 + 0.02, 1.95, 0.45]} label={windowOpen ? "Close window" : "Open window"} onActivate={toggleWindow} />
      <Hotspot position={[sheerX + 0.05, 1.35, -1.25]} label={sheersClosed ? "Open sheers" : "Draw sheers"} onActivate={toggleSheers} />
      <Hotspot position={[drapeX + 0.12, 1.35, 1.62]} label={drapesClosed ? "Open curtains" : "Close curtains"} onActivate={toggleDrapes} />
    </group>
  );
}

export function RoomShell({ reflections }: { reflections: boolean }) {
  return (
    <group>
      <Floor reflections={reflections} />
      <Walls />
      <Skirting />
      <TrayCeiling
        x0={ROOM.x0}
        x1={ROOM.x1}
        z0={ROOM.z0}
        z1={ROOM.z1}
        height={ROOM.height}
        bandBottom={ROOM.bandBottom}
        inset={ROOM.trayInset}
        downlights={[
          [-1.05, ROOM.z1 - 0.3],
          [0.05, ROOM.z1 - 0.3],
          [ROOM.x0 + 0.3, -1.65],
          [ROOM.x0 + 0.3, 1.65],
        ]}
      />
      <FlutedWall />
      <BedroomDoor />
      <WindowAssembly />
    </group>
  );
}
