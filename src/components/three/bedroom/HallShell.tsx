import { useContext, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { DECK, DOOR, GLASS_WALL, GROUND_Y, HALL, MAIN_DOOR, PARTITION, ROOM, SLIDER } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { CameraSpaceContext, mixValue, OpeningsContext, openingState, useEveningMix } from "./bedroomState";
import { Hotspot } from "./Hotspot";
import { clickable, useEased } from "./interaction";
import { MixedPointLight } from "./MixedLight";
import { Box, type V3 } from "./primitives";
import { getBedroomTextures, withRepeat } from "./proceduralTextures";
import { TrayCeiling } from "./TrayCeiling";

// The living hall outside the bedroom door, and the balcony deck beyond
// its sliding glass wall.

const HW = HALL.x1 - HALL.x0;
const HD = HALL.z1 - HALL.z0;
const HCX = (HALL.x0 + HALL.x1) / 2;
const HCZ = (HALL.z0 + HALL.z1) / 2;
const H = HALL.height;
const WALL_T = 0.2;
const SKIN_T = PARTITION.z1 - (PARTITION.z0 + 0.2);

function HallFloor({ reflections: allowed }: { reflections: boolean }) {
  // Seen from the hall itself, the deck and the porch — not the bedroom.
  const space = useContext(CameraSpaceContext);
  const reflections = allowed && space !== 0;
  const maps = useMemo(() => withRepeat(getBedroomTextures().marbleFloor, HW / 2.4, HD / 2.4), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[HCX, 0, HCZ]} receiveShadow>
      <planeGeometry args={[HW, HD]} />
      {reflections ? (
        <MeshReflectorMaterial
          map={maps.map}
          roughnessMap={maps.roughnessMap}
          roughness={1}
          metalness={0}
          resolution={1024}
          blur={[120, 60]}
          mixBlur={0.6}
          mixStrength={1.6}
          mixContrast={1}
          mirror={0}
          depthScale={0.3}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
        />
      ) : (
        <meshPhysicalMaterial map={maps.map} roughnessMap={maps.roughnessMap} roughness={1} clearcoat={1} clearcoatRoughness={0.06} />
      )}
    </mesh>
  );
}

/** Classic picture-frame wall mouldings, as four thin trim bars. */
function Moulding({ x0, x1, y0, y1, z }: { x0: number; x1: number; y0: number; y1: number; z: number }) {
  const m = getBedroomMaterials();
  const t = 0.028;
  const d = 0.014;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return (
    <group>
      <Box size={[x1 - x0, t, d]} position={[cx, y1 - t / 2, z + d / 2]} material={m.trim} cast={false} />
      <Box size={[x1 - x0, t, d]} position={[cx, y0 + t / 2, z + d / 2]} material={m.trim} cast={false} />
      <Box size={[t, y1 - y0 - 2 * t, d]} position={[x0 + t / 2, cy, z + d / 2]} material={m.trim} cast={false} />
      <Box size={[t, y1 - y0 - 2 * t, d]} position={[x1 - t / 2, cy, z + d / 2]} material={m.trim} cast={false} />
    </group>
  );
}

function HallWalls() {
  const m = getBedroomMaterials();
  const skinZ = PARTITION.z1 - SKIN_T / 2;
  const southZ = HALL.z1 + WALL_T / 2;
  const wallFace = PARTITION.z1;

  // Wainscot panels either side of the bedroom door.
  const bays: [number, number][] = [
    [-4.35, -3.3],
    [-3.15, -2.1],
    [-1.95, -0.9],
    [-0.75, 0.9],
    [2.3, 3.08],
  ];
  const M = MAIN_DOOR;
  return (
    <group>
      {/* North wall skin (shared with the bedroom), with the door opening */}
      <Box size={[DOOR.x0 - HALL.x0, H, SKIN_T]} position={[(HALL.x0 + DOOR.x0) / 2, H / 2, skinZ]} material={m.wall} />
      <Box size={[M.x0 - DOOR.x1, H, SKIN_T]} position={[(DOOR.x1 + M.x0) / 2, H / 2, skinZ]} material={m.wall} />
      <Box size={[M.sideX0 - M.x1, H, SKIN_T]} position={[(M.x1 + M.sideX0) / 2, H / 2, skinZ]} material={m.wall} />
      <Box size={[HALL.x1 - M.sideX1, H, SKIN_T]} position={[(M.sideX1 + HALL.x1) / 2, H / 2, skinZ]} material={m.wall} />
      <Box size={[DOOR.x1 - DOOR.x0, H - DOOR.height, SKIN_T]} position={[(DOOR.x0 + DOOR.x1) / 2, (H + DOOR.height) / 2, skinZ]} material={m.wall} />
      {/* Over the main door and its sidelight */}
      <Box size={[M.sideX1 - M.x0, H - M.height, SKIN_T]} position={[(M.x0 + M.sideX1) / 2, (H + M.height) / 2, skinZ]} material={m.wall} />
      {/* The bedroom's own wall only reaches its lower ceiling — close the gap above it */}
      <Box size={[HW, H - 3.0, 0.2]} position={[HCX, (H + 3.0) / 2, PARTITION.z0 + 0.1]} material={m.wall} cast={false} />
      {/* West and east walls */}
      <Box size={[WALL_T, H, HD + 0.44]} position={[HALL.x0 - WALL_T / 2, H / 2, HCZ]} material={m.wall} />
      <Box size={[WALL_T, H, HD + 0.44]} position={[HALL.x1 + WALL_T / 2, H / 2, HCZ]} material={m.wall} />
      {/* South wall: solid ends and the transom above the glass */}
      <Box size={[GLASS_WALL.x0 - HALL.x0 + WALL_T, H, WALL_T]} position={[(HALL.x0 - WALL_T + GLASS_WALL.x0) / 2, H / 2, southZ]} material={m.wall} />
      <Box size={[HALL.x1 + WALL_T - GLASS_WALL.x1, H, WALL_T]} position={[(GLASS_WALL.x1 + HALL.x1 + WALL_T) / 2, H / 2, southZ]} material={m.wall} />
      <Box size={[GLASS_WALL.x1 - GLASS_WALL.x0, H - GLASS_WALL.height, WALL_T]} position={[(GLASS_WALL.x0 + GLASS_WALL.x1) / 2, (H + GLASS_WALL.height) / 2, southZ]} material={m.wall} />

      {/* Wainscoting: chair rail, lower and upper panels */}
      {bays.map(([x0, x1]) => (
        <group key={x0}>
          <Moulding x0={x0} x1={x1} y0={0.22} y1={0.86} z={wallFace} />
          <Moulding x0={x0} x1={x1} y0={1.1} y1={2.86} z={wallFace} />
        </group>
      ))}
      <Box size={[DOOR.x0 - 0.07 - HALL.x0, 0.05, 0.022]} position={[(HALL.x0 + DOOR.x0 - 0.07) / 2, 0.97, wallFace + 0.011]} material={m.trim} cast={false} />
      <Box size={[M.x0 - 0.12 - DOOR.x1 - 0.07, 0.05, 0.022]} position={[(DOOR.x1 + 0.07 + M.x0 - 0.12) / 2, 0.97, wallFace + 0.011]} material={m.trim} cast={false} />

      {/* Skirting */}
      <Box size={[DOOR.x0 - 0.07 - HALL.x0, 0.13, 0.018]} position={[(HALL.x0 + DOOR.x0 - 0.07) / 2, 0.065, wallFace + 0.009]} material={m.trim} cast={false} />
      <Box size={[M.x0 - 0.12 - DOOR.x1 - 0.07, 0.13, 0.018]} position={[(DOOR.x1 + 0.07 + M.x0 - 0.12) / 2, 0.065, wallFace + 0.009]} material={m.trim} cast={false} />
      <Box size={[HALL.x1 - M.sideX1 - 0.12, 0.13, 0.018]} position={[(M.sideX1 + 0.12 + HALL.x1) / 2, 0.065, wallFace + 0.009]} material={m.trim} cast={false} />
      <Box size={[0.018, 0.13, HD]} position={[HALL.x0 + 0.009, 0.065, HCZ]} material={m.trim} cast={false} />
      <Box size={[0.018, 0.13, HD]} position={[HALL.x1 - 0.009, 0.065, HCZ]} material={m.trim} cast={false} />
    </group>
  );
}

const PANEL_W = (GLASS_WALL.x1 - GLASS_WALL.x0) / 4;
const OUTER_Z = GLASS_WALL.z + 0.1;
const INNER_Z = GLASS_WALL.z + 0.04;
const PROFILE = 0.05;
const SLIDE = SLIDER.x1 - SLIDER.x0 - 0.06;

function GlassPanel({ x0, z, handle, onToggle }: { x0: number; z: number; handle?: boolean; onToggle?: () => void }) {
  const m = getBedroomMaterials();
  const h = GLASS_WALL.height - 0.06;
  const cx = x0 + PANEL_W / 2;
  const handlers = onToggle ? clickable(onToggle) : {};
  return (
    <group position={[cx, 0.03, z]}>
      <mesh position={[0, h / 2, 0]} material={m.glass} {...handlers}>
        <planeGeometry args={[PANEL_W - 2 * PROFILE, h - 2 * PROFILE]} />
      </mesh>
      {(
        [
          [[PANEL_W, PROFILE, 0.05], [0, PROFILE / 2, 0]],
          [[PANEL_W, PROFILE, 0.05], [0, h - PROFILE / 2, 0]],
          [[PROFILE, h, 0.05], [-PANEL_W / 2 + PROFILE / 2, h / 2, 0]],
          [[PROFILE, h, 0.05], [PANEL_W / 2 - PROFILE / 2, h / 2, 0]],
        ] as [V3, V3][]
      ).map(([s, p], i) => (
        <mesh key={i} position={p} material={m.aluminium} castShadow {...handlers}>
          <boxGeometry args={s} />
        </mesh>
      ))}
      {handle && (
        <mesh position={[-PANEL_W / 2 + 0.1, 1.05, -0.045]} material={m.aluminium} castShadow {...handlers}>
          <boxGeometry args={[0.025, 0.55, 0.03]} />
        </mesh>
      )}
    </group>
  );
}

/** Four floor-to-ceiling glass panels; the third slides open onto the deck. */
function GlassWall() {
  const m = getBedroomMaterials();
  const { sliderOpen, setSliderOpen } = useContext(OpeningsContext);
  const open = useEased(sliderOpen, 1.6);
  const slider = useRef<THREE.Group>(null);
  useFrame(() => {
    openingState.slider = open.current;
    if (slider.current) slider.current.position.x = SLIDE * open.current;
  });
  const toggle = () => setSliderOpen(!sliderOpen);
  const span = GLASS_WALL.x1 - GLASS_WALL.x0;
  const cx = (GLASS_WALL.x0 + GLASS_WALL.x1) / 2;
  return (
    <group>
      {/* Head and sill tracks */}
      <Box size={[span, 0.04, 0.16]} position={[cx, GLASS_WALL.height - 0.02, GLASS_WALL.z + 0.07]} material={m.aluminium} />
      <Box size={[span, 0.03, 0.16]} position={[cx, 0.015, GLASS_WALL.z + 0.07]} material={m.aluminium} />
      <GlassPanel x0={GLASS_WALL.x0} z={OUTER_Z} />
      <GlassPanel x0={GLASS_WALL.x0 + PANEL_W} z={OUTER_Z} />
      <GlassPanel x0={GLASS_WALL.x0 + PANEL_W * 3} z={OUTER_Z} />
      <group ref={slider}>
        <GlassPanel x0={GLASS_WALL.x0 + PANEL_W * 2} z={INNER_Z} handle onToggle={toggle} />
      </group>
      <Hotspot
        position={[SLIDER.x0 + 0.35, 1.3, GLASS_WALL.z]}
        label={sliderOpen ? "Close glass door" : "Open glass door to the balcony"}
        onActivate={toggle}
        spaces={[1, 2]}
      />
    </group>
  );
}

function Deck() {
  const m = getBedroomMaterials();
  const w = DECK.x1 - DECK.x0;
  const d = DECK.z1 - HALL.z1;
  const cx = (DECK.x0 + DECK.x1) / 2;
  const cz = (HALL.z1 + DECK.z1) / 2;
  const railH = 1.05;
  const glassMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#cfe0e4", roughness: 0.05, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
    []
  );
  const runs: { from: [number, number]; to: [number, number] }[] = [
    { from: [DECK.x0, DECK.z1], to: [DECK.x1, DECK.z1] },
    { from: [DECK.x0, HALL.z1 + 0.2], to: [DECK.x0, DECK.z1] },
    { from: [DECK.x1, HALL.z1 + 0.2], to: [DECK.x1, DECK.z1] },
  ];
  return (
    <group>
      <mesh position={[cx, -0.04, cz]} material={m.teak} receiveShadow>
        <boxGeometry args={[w, 0.08, d]} />
      </mesh>
      {/* Slab edge below the deck */}
      <Box size={[w + 0.1, 0.3, 0.1]} position={[cx, -0.23, DECK.z1 + 0.05]} material={m.concrete} cast={false} />
      {runs.map(({ from, to }, i) => {
        const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
        const mx = (from[0] + to[0]) / 2;
        const mz = (from[1] + to[1]) / 2;
        const rotY = Math.atan2(to[0] - from[0], to[1] - from[1]) - Math.PI / 2;
        return (
          <group key={i} position={[mx, 0, mz]} rotation={[0, rotY, 0]}>
            <mesh position={[0, railH / 2, 0]} material={glassMat}>
              <boxGeometry args={[len, railH, 0.012]} />
            </mesh>
            <mesh position={[0, railH + 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={m.steel} castShadow>
              <cylinderGeometry args={[0.022, 0.022, len, 16]} />
            </mesh>
            <mesh position={[0, 0.03, 0]} material={m.steel}>
              <boxGeometry args={[len, 0.06, 0.05]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  uniform float uMix;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 dayTop = vec3(0.36, 0.56, 0.86);
    vec3 dayHorizon = vec3(0.86, 0.9, 0.93);
    vec3 duskTop = vec3(0.06, 0.08, 0.17);
    vec3 duskHorizon = vec3(0.93, 0.55, 0.34);
    vec3 top = mix(dayTop, duskTop, uMix);
    vec3 horizon = mix(dayHorizon, duskHorizon, uMix);
    vec3 sky = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55));
    vec3 ground = mix(vec3(0.3, 0.36, 0.26), vec3(0.05, 0.05, 0.06), uMix);
    vec3 col = h > 0.0 ? sky : mix(horizon * 0.8, ground, clamp(-h * 6.0, 0.0, 1.0));
    gl_FragColor = vec4(col * mix(1.3, 0.8, uMix), 1.0);
  }
`;

// Distant tree lines standing on the lawn's horizon, one per side. The
// painted ground band's top edge is placed at lawn level.
const BACKDROP_H = 38;
const BACKDROP_Y = GROUND_Y + 0.65 * BACKDROP_H - BACKDROP_H / 2;
const BACKDROPS: { position: V3; rotY: number }[] = [
  { position: [2, BACKDROP_Y, 38], rotY: Math.PI },
  { position: [2, BACKDROP_Y, -36], rotY: 0 },
  { position: [44, BACKDROP_Y, 1], rotY: -Math.PI / 2 },
  { position: [-40, BACKDROP_Y, 1], rotY: Math.PI / 2 },
];

/** Sky dome, the lawn the house stands on, and tree lines on every side. */
function Outdoors() {
  const t = getBedroomTextures();
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        uniforms: { uMix: { value: 0 } },
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );
  const dayMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: t.viewDay, transparent: true, depthWrite: false, toneMapped: false }),
    [t.viewDay]
  );
  const eveningMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: t.viewEvening, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
    [t.viewEvening]
  );
  useFrame(() => {
    const e = mix.current;
    skyMat.uniforms.uMix.value = e;
    eveningMat.opacity = e;
    dayMat.color.setScalar(mixValue(1.4, 0.6, e));
  });
  return (
    <group>
      <mesh material={skyMat} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[70, 32, 16]} />
      </mesh>
      {BACKDROPS.map((b, i) => (
        <group key={i} position={b.position} rotation={[0, b.rotY, 0]}>
          <mesh material={dayMat}>
            <planeGeometry args={[160, BACKDROP_H]} />
          </mesh>
          <mesh material={eveningMat} position={[0, 0, 0.05]}>
            <planeGeometry args={[160, BACKDROP_H]} />
          </mesh>
        </group>
      ))}
      {/* Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, GROUND_Y, 1]} material={m.grass} receiveShadow>
        <planeGeometry args={[86, 76]} />
      </mesh>
      {/* Stone plinth the house sits on (floors are 0.6 m above the lawn) */}
      <Box size={[ROOM.x1 - ROOM.x0 + 0.4, -GROUND_Y - 0.02, ROOM.z1 - ROOM.z0 + 0.4]} position={[0, GROUND_Y / 2 - 0.01, 0]} material={m.travertine} cast={false} />
      <Box size={[HW + 0.4, -GROUND_Y - 0.02, HD + 0.44 + 0.2]} position={[HCX, GROUND_Y / 2 - 0.01, HCZ + 0.1]} material={m.travertine} cast={false} />
      <Box size={[DECK.x1 - DECK.x0, -GROUND_Y - 0.08, DECK.z1 - HALL.z1]} position={[(DECK.x0 + DECK.x1) / 2, (GROUND_Y - 0.08) / 2, (HALL.z1 + DECK.z1) / 2]} material={m.concrete} cast={false} />
    </group>
  );
}

export function HallShell({ reflections }: { reflections: boolean }) {
  const inset = HALL.trayInset;
  return (
    <group>
      <HallFloor reflections={reflections} />
      <HallWalls />
      <TrayCeiling
        x0={HALL.x0}
        x1={HALL.x1}
        z0={HALL.z0}
        z1={HALL.z1}
        height={H}
        bandBottom={HALL.bandBottom}
        inset={inset}
        downlights={[
          [-3.6, HALL.z0 + inset / 2],
          [-1.2, HALL.z0 + inset / 2],
          [3.2, HALL.z0 + inset / 2],
          [4.6, HALL.z0 + inset / 2],
          [HALL.x0 + inset / 2, 4.3],
          [HALL.x0 + inset / 2, 6.0],
          [HALL.x0 + inset / 2, 7.7],
          [HALL.x1 - inset / 2, 3.9],
          [HALL.x1 - inset / 2, 8.5],
          [-2.2, HALL.z1 - inset / 2],
          [0.4, HALL.z1 - inset / 2],
          [3.0, HALL.z1 - inset / 2],
        ]}
      />
      {/* Cove wash from the hall's tray ceiling */}
      <MixedPointLight position={[HCX, H - 0.1, HCZ]} day={0} evening={2.6} distance={10} decay={1.4} color="#FFC98A" alsoIn={[2, 3]} />
      <GlassWall />
      <Deck />
      <Outdoors />
    </group>
  );
}
