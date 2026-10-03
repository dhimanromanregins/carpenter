import { findGlassFinish } from "@/data/glassFinishes";
import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useWoodTexture } from "@/hooks/useWoodTexture";
import {
  FINISHES,
  FRAME_FINISHES,
  HANDLE_FINISHES,
  INNER_DRAWER_H,
  LED_TEMPS,
  PANEL,
  findFinish,
  totalHeight,
  totalWidth,
  type DoorFace,
  type Finish,
  type HandleStyle,
  type Surface,
  type SurfaceType,
  type WardrobeConfig,
  type WardrobeSection,
} from "./wardrobeConfig";
import { DoorHandle, DrawerHandle } from "./WardrobeHandles";
import { buildSurface, surfaceKey, type SurfaceResult } from "./surfaceTextures";
import { FRAME_W, GAP, SLIDE_OVERLAP, leafCount, mirrorSpec, slidingPanelCount } from "./wardrobeParts";

const T = PANEL;
const DOOR_T = 0.018;

/** True while the blueprint ("details") view is on — boards turn ghosted with outlines. */
const BlueprintContext = createContext(false);

/* ───────────────────────── materials ───────────────────────── */

interface Mats {
  body: THREE.MeshStandardMaterial;
  back: THREE.MeshStandardMaterial;
  shutter: THREE.MeshStandardMaterial;
  handle: THREE.MeshStandardMaterial;
  handleDS: THREE.MeshStandardMaterial;
  leather: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  mirror: THREE.MeshStandardMaterial;
  led: THREE.MeshBasicMaterial;
  dark: THREE.MeshStandardMaterial;
  ledColor: string;
  /** Shutter material type + see-through pane, set per section from its surface. */
  surfType?: SurfaceType;
  pane?: THREE.Material;
}

function useFinishTexture(f: Finish) {
  const tex = useWoodTexture({ baseColor: f.color, ringColor: f.ring ?? f.color, repeatX: 1, repeatY: 1 });
  return useMemo(() => {
    if (!f.ring || !tex) return null;
    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI / 2; // vertical grain
    tex.needsUpdate = true;
    return tex;
  }, [f.ring, tex]);
}

function finishMaterial(f: Finish, map: THREE.Texture | null, shade = 1, ghost = false) {
  const color = new THREE.Color(map ? "#ffffff" : f.color).multiplyScalar(shade);
  const metal = f.metalness ?? 0;
  return new THREE.MeshStandardMaterial({
    color,
    map,
    roughness: f.roughness,
    metalness: metal * 0.8,
    envMapIntensity: metal ? 3 : 1,
    transparent: ghost,
    opacity: ghost ? 0.1 : 1,
    depthWrite: !ghost,
  });
}

function useMats(c: WardrobeConfig, ghost: boolean): Mats {
  const body = findFinish(FINISHES, c.bodyFinish);
  const shutter = findFinish(FINISHES, c.shutterFinish);
  const handle = findFinish(HANDLE_FINISHES, c.handleFinish);
  const frame = findFinish(FRAME_FINISHES, c.frameFinish);
  const tint = findGlassFinish(c.glassTint);
  const bodyTex = useFinishTexture(body);
  const shutterTex = useFinishTexture(shutter);
  const ledColor = LED_TEMPS[c.lights.temp].color;
  const brightness = c.lights.brightness;

  return useMemo(
    () => {
      const handleMat = finishMaterial(handle, null);
      const handleDS = handleMat.clone();
      handleDS.side = THREE.DoubleSide;
      return {
      body: finishMaterial(body, bodyTex, 1, ghost),
      back: finishMaterial(body, bodyTex, 0.88, ghost),
      shutter: finishMaterial(shutter, shutterTex, 1, ghost),
      handle: handleMat,
      handleDS,
      leather: new THREE.MeshStandardMaterial({ color: "#4a2f1c", roughness: 0.75 }),
      frame: finishMaterial(frame, null, 1, ghost),
      glass: new THREE.MeshPhysicalMaterial({
        color: tint.color,
        transparent: true,
        opacity: tint.opacity,
        roughness: tint.roughness,
        metalness: 0,
        envMapIntensity: 1.6,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      mirror: new THREE.MeshStandardMaterial({ color: "#d3dce0", metalness: 0.9, roughness: 0.06, envMapIntensity: 3.2 }),
      led: new THREE.MeshBasicMaterial({
        color: new THREE.Color(ledColor).multiplyScalar(1.6 * brightness),
        toneMapped: false,
      }),
      dark: new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.8 }),
      ledColor,
      };
    },
    [body, shutter, handle, frame, tint, bodyTex, shutterTex, ledColor, brightness, ghost]
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function Box({
  size,
  position,
  material,
  cast = true,
}: {
  size: [number, number, number];
  position: [number, number, number];
  material: THREE.Material;
  cast?: boolean;
}) {
  const blueprint = useContext(BlueprintContext);
  return (
    <mesh position={position} material={material} castShadow={cast && !blueprint} receiveShadow>
      <boxGeometry args={size} />
      {blueprint && material !== undefined && <Edges threshold={20} color="#e8d9a8" />}
    </mesh>
  );
}

/**
 * 0 to 1 progress for a door/drawer. Opens briskly with ease-out; closes with a
 * damped soft-close landing: normal speed at first, then slowing to a gentle,
 * bounce-free stop over the last quarter of travel.
 */
function useSoftMotion(open: boolean) {
  const p = useRef(0);
  return (delta: number) => {
    const d = Math.min(delta, 0.05);
    if (open) {
      p.current += (1 - p.current) * Math.min(1, d * 4.2) + d * 0.05;
      if (p.current > 0.998) p.current = 1;
    } else if (p.current > 0) {
      const k = Math.min(1, p.current / 0.25);
      const speed = 0.2 + 0.8 * k * k * (3 - 2 * k);
      p.current -= d * 1.15 * speed;
      if (p.current < 0.002) p.current = 0;
    }
    return p.current;
  };
}

function Clickable({
  children,
  onClick,
  position,
}: {
  children: ReactNode;
  onClick: () => void;
  position?: [number, number, number];
}) {
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {children}
    </group>
  );
}

/* ───────────────────────── handles & leaves ───────────────────────── */

function Handle({
  style,
  mats,
  w,
  h,
  hy,
  side,
}: {
  style: HandleStyle;
  mats: Mats;
  w: number;
  h: number;
  hy: number;
  side: "left" | "right";
}) {
  return <DoorHandle style={style} mats={mats} w={w} h={h} hy={hy} side={side} surface={DOOR_T / 2} />;
}

function Leaf({
  w,
  h,
  face,
  mats,
  handle,
  side,
  hy,
  mirror,
  solid,
}: {
  w: number;
  h: number;
  face: DoorFace;
  mats: Mats;
  handle: HandleStyle;
  side: "left" | "right";
  hy: number;
  /** Adds an inset viewing mirror on a laminate door. */
  mirror?: "full" | "half";
  /** Force an opaque shutter (loft doors) even when the surface is see-through. */
  solid?: boolean;
}) {
  const fw = FRAME_W;
  const blueprint = useContext(BlueprintContext);
  const framed = !solid && face === "laminate" && (mats.surfType === "fluted" || mats.surfType === "mesh") && !!mats.pane;
  const m = mirror && face === "laminate" && !framed ? mirrorSpec(w, h, mirror) : null;
  const my = m ? (mirror === "half" ? hy : m.cy) : 0;
  const mz = DOOR_T / 2 + 0.004;
  return (
    <group>
      {face === "laminate" && !framed && <Box size={[w, h, DOOR_T]} position={[0, 0, 0]} material={mats.shutter} />}
      {framed && mats.pane && (
        <>
          <Box size={[fw, h, DOOR_T]} position={[-(w - fw) / 2, 0, 0]} material={mats.frame} />
          <Box size={[fw, h, DOOR_T]} position={[(w - fw) / 2, 0, 0]} material={mats.frame} />
          <Box size={[w - 2 * fw, fw, DOOR_T]} position={[0, (h - fw) / 2, 0]} material={mats.frame} />
          <Box size={[w - 2 * fw, fw, DOOR_T]} position={[0, -(h - fw) / 2, 0]} material={mats.frame} />
          <mesh position={[0, 0, 0]} material={mats.pane} renderOrder={2}>
            <boxGeometry args={[w - 2 * fw, h - 2 * fw, 0.006]} />
          </mesh>
        </>
      )}
      {m && (
        <>
          <Box size={[m.w, m.h, 0.006]} position={[0, my, mz]} material={mats.dark} />
          {!blueprint && (
            <mesh position={[0, my, mz + 0.0035]}>
              <planeGeometry args={[m.w, m.h]} />
              <MeshReflectorMaterial
                resolution={512}
                mirror={1}
                mixStrength={1.6}
                mixBlur={0}
                blur={[0, 0]}
                roughness={0}
                metalness={0}
                depthScale={0}
                color="#e4ebee"
              />
            </mesh>
          )}
          {/* slim frame in the handle finish */}
          <Box size={[m.w + 0.024, 0.012, 0.01]} position={[0, my + m.h / 2 + 0.006, mz]} material={mats.handle} />
          <Box size={[m.w + 0.024, 0.012, 0.01]} position={[0, my - m.h / 2 - 0.006, mz]} material={mats.handle} />
          <Box size={[0.012, m.h, 0.01]} position={[-(m.w / 2 + 0.006), my, mz]} material={mats.handle} />
          <Box size={[0.012, m.h, 0.01]} position={[m.w / 2 + 0.006, my, mz]} material={mats.handle} />
        </>
      )}
      {face === "mirror" && (
        <>
          <Box size={[w, h, 0.012]} position={[0, 0, 0]} material={mats.mirror} />
          <Box size={[w, h, 0.004]} position={[0, 0, -0.008]} material={mats.dark} cast={false} />
        </>
      )}
      {face === "glass" && (
        <>
          <Box size={[fw, h, DOOR_T]} position={[-(w - fw) / 2, 0, 0]} material={mats.frame} />
          <Box size={[fw, h, DOOR_T]} position={[(w - fw) / 2, 0, 0]} material={mats.frame} />
          <Box size={[w - 2 * fw, fw, DOOR_T]} position={[0, (h - fw) / 2, 0]} material={mats.frame} />
          <Box size={[w - 2 * fw, fw, DOOR_T]} position={[0, -(h - fw) / 2, 0]} material={mats.frame} />
          <mesh position={[0, 0, 0]} material={mats.glass} renderOrder={2}>
            <boxGeometry args={[w - 2 * fw, h - 2 * fw, 0.006]} />
          </mesh>
        </>
      )}
      <Handle style={handle} mats={mats} w={w} h={h} hy={hy} side={side} />
    </group>
  );
}

/* ───────────────────────── section parts ───────────────────────── */

interface Geo {
  W: number;
  D: number;
  H: number;
  L: number;
  plinth: number;
  innerBottom: number;
  innerTop: number;
  ih: number;
}

interface SectionProps {
  s: WardrobeSection;
  cx: number; // section centre x
  c: WardrobeConfig;
  g: Geo;
  mats: Mats;
  openState: Record<string, boolean>;
  onToggle: (key: string) => void;
  onSelect: (id: number) => void;
  selected: boolean;
  getSurface: (s: Surface) => SurfaceResult;
}

function HingedLeaf({
  w,
  h,
  cy,
  hingeX,
  side,
  zc,
  face,
  mats,
  handle,
  handleY,
  open,
  onClick,
  mirror,
  solid,
}: {
  w: number;
  h: number;
  cy: number;
  hingeX: number;
  side: "left" | "right"; // which edge carries the hinge
  zc: number;
  face: DoorFace;
  mats: Mats;
  handle: HandleStyle;
  handleY: number;
  open: boolean;
  onClick: () => void;
  mirror?: "full" | "half";
  solid?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const motion = useSoftMotion(open);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const a = motion(delta) * 1.75;
    ref.current.rotation.y = side === "left" ? -a : a;
  });

  return (
    <Clickable onClick={onClick}>
      <group ref={ref} position={[hingeX, cy, zc]}>
        <group position={[side === "left" ? w / 2 : -w / 2, 0, 0]}>
          <Leaf
            w={w}
            h={h}
            face={face}
            mats={mats}
            handle={handle}
            side={side === "left" ? "right" : "left"}
            hy={handleY - cy}
            mirror={mirror}
            solid={solid}
          />
        </group>
      </group>
    </Clickable>
  );
}

function HingedLeaves({
  w,
  h,
  cy,
  g,
  c,
  mats,
  face,
  handleY,
  prefix,
  openState,
  onLeaf,
  mirrorLeaf = -1,
  mirrorSize = "full",
  solid,
}: {
  w: number;
  h: number;
  cy: number;
  g: Geo;
  c: WardrobeConfig;
  mats: Mats;
  face: DoorFace;
  handleY: number;
  prefix: string; // state-key prefix, e.g. "h12" or "l12"
  openState: Record<string, boolean>;
  onLeaf: (key: string) => void;
  mirrorLeaf?: number;
  mirrorSize?: "full" | "half";
  solid?: boolean;
}) {
  const n = leafCount(w);
  const leafW = (w - 2 * GAP - (n - 1) * 0.004) / n;
  const zc = g.D / 2 + DOOR_T / 2 + 0.001;
  return (
    <>
      <HingedLeaf
        w={leafW}
        h={h}
        cy={cy}
        hingeX={-w / 2 + GAP}
        side="left"
        zc={zc}
        face={face}
        mats={mats}
        handle={c.handle}
        handleY={handleY}
        open={!!openState[`${prefix}.0`]}
        onClick={() => onLeaf(`${prefix}.0`)}
        mirror={mirrorLeaf === 0 ? mirrorSize : undefined}
        solid={solid}
      />
      {n === 2 && (
        <HingedLeaf
          w={leafW}
          h={h}
          cy={cy}
          hingeX={w / 2 - GAP}
          side="right"
          zc={zc}
          face={face}
          mats={mats}
          handle={c.handle}
          handleY={handleY}
          open={!!openState[`${prefix}.1`]}
          onClick={() => onLeaf(`${prefix}.1`)}
          mirror={mirrorLeaf === 1 ? mirrorSize : undefined}
          solid={solid}
        />
      )}
    </>
  );
}

function SlidingPanels({
  w,
  h,
  cy,
  g,
  c,
  mats,
  open,
  face,
  handleY,
  mirrorLeaf = -1,
  mirrorSize = "full",
}: {
  w: number;
  h: number;
  cy: number;
  g: Geo;
  c: WardrobeConfig;
  mats: Mats;
  open: boolean;
  face: DoorFace;
  handleY: number;
  mirrorLeaf?: number;
  mirrorSize?: "full" | "half";
}) {
  const n = slidingPanelCount(w);
  const overlap = SLIDE_OVERLAP;
  const pw = (w - 2 * GAP + (n - 1) * overlap) / n;
  const refs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const motion = useSoftMotion(open);
  const dir = n === 3 ? 1 : -1;

  useFrame((_, delta) => {
    const v = motion(delta);
    for (let i = 0; i < n; i++) {
      const r = refs[i].current;
      if (!r) continue;
      const base = -w / 2 + GAP + pw / 2 + i * (pw - overlap);
      r.position.x = base + (i % 2 === 1 ? dir * (pw - overlap) * v : 0);
    }
  });

  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <group
          key={i}
          ref={refs[i]}
          position={[0, cy, g.D / 2 + 0.012 + (i % 2) * 0.024]}
        >
          <Leaf
            w={pw}
            h={h}
            face={face}
            mats={mats}
            handle={c.handle === "knob" ? "bar" : c.handle}
            side={i % 2 === 1 ? (dir === -1 ? "left" : "right") : "right"}
            hy={handleY - cy}
            mirror={mirrorLeaf === i ? mirrorSize : undefined}
          />
        </group>
      ))}
      <Box size={[w, 0.02, 0.07]} position={[0, g.H - 0.012, g.D / 2 + 0.024]} material={mats.dark} />
      <Box size={[w, 0.016, 0.07]} position={[0, g.plinth + 0.01, g.D / 2 + 0.024]} material={mats.dark} />
    </>
  );
}

function Interior({ s, cx, g, mats, c }: { s: WardrobeSection; cx: number; g: Geo; mats: Mats; c: WardrobeConfig }) {
  const iw = s.width - T;
  const ys: number[] = [];
  const count = s.kind === "open" ? s.shelves : s.shelves;
  if (s.kind === "doors" && s.rod) {
    // shelves live in the lower 40%, rod hangs above
    for (let i = 1; i <= count; i++) ys.push(g.innerBottom + ((g.ih * 0.4) / (count + 1)) * i);
  } else {
    for (let i = 1; i <= count; i++) ys.push(g.innerBottom + (g.ih / (count + 1)) * i);
  }
  const zc = -0.01;
  const sd = g.D - 0.05;
  return (
    <group position={[cx, 0, 0]}>
      {s.kind === "open" && (
        <Box size={[iw, g.ih, 0.006]} position={[0, g.innerBottom + g.ih / 2, -g.D / 2 + 0.012]} material={mats.back} cast={false} />
      )}
      {ys.map((y, i) => (
        <group key={i}>
          <Box size={[iw, T * 0.8, sd]} position={[0, y, zc]} material={mats.body} />
          {c.lights.shelf && (
            <Box
              size={[iw - 0.03, 0.005, 0.012]}
              position={[0, y - T * 0.4 - 0.004, g.D / 2 - 0.045]}
              material={mats.led}
              cast={false}
            />
          )}
        </group>
      ))}
      {s.kind === "doors" && s.rod && (
        <>
          <mesh position={[0, g.innerTop - 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.handle} castShadow>
            <cylinderGeometry args={[0.0125, 0.0125, iw - 0.01, 16]} />
          </mesh>
          <Box size={[iw, T * 0.8, sd]} position={[0, g.innerTop - 0.05, zc]} material={mats.body} />
        </>
      )}
    </group>
  );
}

function DrawerFront({
  s,
  g,
  c,
  mats,
  cy,
  fh,
  open,
  onClick,
}: {
  s: WardrobeSection;
  g: Geo;
  c: WardrobeConfig;
  mats: Mats;
  cy: number;
  fh: number;
  open: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const motion = useSoftMotion(open);
  useFrame((_, delta) => {
    if (ref.current) ref.current.position.z = motion(delta) * 0.34;
  });

  const iw = s.width - T;
  return (
    <Clickable onClick={onClick}>
      <group ref={ref} position={[0, cy, 0]}>
        <Box size={[s.width - 2 * GAP, fh, DOOR_T]} position={[0, 0, g.D / 2 + DOOR_T / 2 + 0.001]} material={mats.shutter} />
        {/* tray */}
        <Box size={[iw - 0.04, 0.012, g.D - 0.12]} position={[0, -fh / 2 + 0.03, 0.0]} material={mats.back} />
        <Box size={[0.012, fh - 0.07, g.D - 0.12]} position={[-(iw - 0.04) / 2, -0.005, 0]} material={mats.back} />
        <Box size={[0.012, fh - 0.07, g.D - 0.12]} position={[(iw - 0.04) / 2, -0.005, 0]} material={mats.back} />
        <Box size={[iw - 0.04, fh - 0.07, 0.012]} position={[0, -0.005, -(g.D - 0.12) / 2]} material={mats.back} />
        <DrawerHandle style={c.handle} mats={mats} w={s.width - 2 * GAP} h={fh} surface={g.D / 2 + DOOR_T + 0.001} />
      </group>
    </Clickable>
  );
}

function Drawers({
  s,
  cx,
  g,
  c,
  mats,
  openState,
  onDrawer,
}: {
  s: WardrobeSection;
  cx: number;
  g: Geo;
  c: WardrobeConfig;
  mats: Mats;
  openState: Record<string, boolean>;
  onDrawer: (key: string) => void;
}) {
  const n = s.drawers;
  const fh = (g.ih - GAP * (n + 1)) / n;
  return (
    <group position={[cx, 0, 0]}>
      {Array.from({ length: n }).map((_, i) => (
        <DrawerFront
          key={i}
          s={s}
          g={g}
          c={c}
          mats={mats}
          cy={g.innerBottom + GAP + fh / 2 + i * (fh + GAP)}
          fh={fh}
          open={!!openState[`d${s.id}.${i}`]}
          onClick={() => onDrawer(`d${s.id}.${i}`)}
        />
      ))}
    </group>
  );
}

function InnerDrawer({
  s,
  g,
  c,
  mats,
  cy,
  open,
  onClick,
}: {
  s: WardrobeSection;
  g: Geo;
  c: WardrobeConfig;
  mats: Mats;
  cy: number;
  open: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const motion = useSoftMotion(open);
  useFrame((_, delta) => {
    if (ref.current) ref.current.position.z = motion(delta) * 0.32;
  });
  const H = INNER_DRAWER_H;
  const iw = s.width - T;
  const fw = iw - 0.01;
  const fz = g.D / 2 - 0.04; // front panel sits just behind the doors
  const td = g.D - 0.2; // tray depth
  const tz = fz - 0.009 - td / 2;
  return (
    <Clickable onClick={onClick}>
      <group ref={ref} position={[0, cy, 0]}>
        <Box size={[fw, H, 0.018]} position={[0, 0, fz]} material={mats.shutter} />
        <Box size={[iw - 0.05, 0.01, td]} position={[0, -H / 2 + 0.025, tz]} material={mats.back} />
        <Box size={[0.01, H - 0.07, td]} position={[-(iw - 0.05) / 2, -0.005, tz]} material={mats.back} />
        <Box size={[0.01, H - 0.07, td]} position={[(iw - 0.05) / 2, -0.005, tz]} material={mats.back} />
        <Box size={[iw - 0.05, H - 0.07, 0.01]} position={[0, -0.005, tz - td / 2]} material={mats.back} />
        <DrawerHandle style={c.handle} mats={mats} w={fw} h={H} surface={fz + 0.009} />
      </group>
    </Clickable>
  );
}

function InnerDrawers({
  s,
  cx,
  g,
  c,
  mats,
  openState,
  onToggle,
}: {
  s: WardrobeSection;
  cx: number;
  g: Geo;
  c: WardrobeConfig;
  mats: Mats;
  openState: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const n = s.innerDrawers ?? 0;
  return (
    <group position={[cx, 0, 0]}>
      {Array.from({ length: n }).map((_, i) => (
        <InnerDrawer
          key={i}
          s={s}
          g={g}
          c={c}
          mats={mats}
          cy={g.innerBottom + 0.004 + INNER_DRAWER_H / 2 + i * (INNER_DRAWER_H + 0.004)}
          open={!!openState[`i${s.id}.${i}`]}
          onClick={() => onToggle(`i${s.id}.${i}`)}
        />
      ))}
    </group>
  );
}

function Section({ s, cx, c, g, mats: baseMats, openState, onToggle, onSelect, selected, getSurface }: SectionProps) {
  const surface = s.surface ?? c.surface;
  const sr = getSurface(surface);
  const mats = useMemo<Mats>(
    () => ({ ...baseMats, shutter: sr.solid as THREE.MeshStandardMaterial, pane: sr.pane ?? undefined, surfType: surface.type }),
    [baseMats, sr, surface.type]
  );
  const toggleKey = (key: string) => {
    onSelect(s.id);
    onToggle(key);
  };
  const innerN = s.kind === "doors" ? (s.innerDrawers ?? 0) : 0;
  const innerH = innerN * (INNER_DRAWER_H + 0.004);
  const gi: Geo = innerH > 0 ? { ...g, innerBottom: g.innerBottom + innerH, ih: g.ih - innerH } : g;
  const doorH = g.H - g.plinth - 2 * GAP;
  const doorCy = g.plinth + GAP + doorH / 2;
  const handleY = 1.05;

  const bounds = (
    <mesh position={[cx, g.plinth + (g.H - g.plinth) / 2, 0]} raycast={() => null}>
      <boxGeometry args={[s.width + 0.01, g.H - g.plinth + 0.01, g.D + 0.06]} />
      <meshBasicMaterial visible={false} />
      <Edges color="#e2cd9a" lineWidth={2} />
    </mesh>
  );

  return (
    <>
      <Interior s={s} cx={cx} g={gi} mats={mats} c={c} />
      {innerN > 0 && <InnerDrawers s={s} cx={cx} g={g} c={c} mats={mats} openState={openState} onToggle={toggleKey} />}

      {c.lights.interior && s.kind !== "drawers" && (
        <>
          {[-1, 1].map((sx) => (
            <Box
              key={sx}
              size={[0.008, g.ih - 0.06, 0.006]}
              position={[cx + sx * (s.width / 2 - T - 0.012), g.innerBottom + g.ih / 2, g.D / 2 - 0.035]}
              material={mats.led}
              cast={false}
            />
          ))}
          <pointLight
            position={[cx, g.innerBottom + g.ih * 0.62, g.D / 2 - 0.12]}
            intensity={0.55 * c.lights.brightness}
            distance={1.6}
            decay={2}
            color={mats.ledColor}
          />
        </>
      )}

      {s.kind === "doors" && s.doorMode === "hinged" && (
        <group position={[cx, 0, 0]}>
          <HingedLeaves
            w={s.width}
            h={doorH}
            cy={doorCy}
            g={g}
            c={c}
            mats={mats}
            face={s.face}
            handleY={handleY}
            prefix={`h${s.id}`}
            openState={openState}
            onLeaf={toggleKey}
            mirrorLeaf={s.mirrorLeaf ?? -1}
            mirrorSize={s.mirrorSize ?? "full"}
          />
        </group>
      )}

      {s.kind === "doors" && s.doorMode === "sliding" && (
        <Clickable position={[cx, 0, 0]} onClick={() => toggleKey(`s${s.id}`)}>
          <SlidingPanels w={s.width} h={doorH} cy={doorCy} g={g} c={c} mats={mats} open={!!openState[`s${s.id}`]} face={s.face} handleY={handleY} mirrorLeaf={s.mirrorLeaf ?? -1} mirrorSize={s.mirrorSize ?? "full"} />
        </Clickable>
      )}

      {s.kind === "drawers" && <Drawers s={s} cx={cx} g={g} c={c} mats={mats} openState={openState} onDrawer={toggleKey} />}

      {s.kind === "open" && (
        <Clickable onClick={() => onSelect(s.id)}>
          <mesh position={[cx, g.innerBottom + g.ih / 2, g.D / 2 - 0.02]} visible={false}>
            <boxGeometry args={[s.width, g.ih, 0.04]} />
          </mesh>
        </Clickable>
      )}

      {c.loft && (
        <group position={[cx, 0, 0]}>
          <HingedLeaves
            w={s.width}
            h={g.L - 2 * GAP}
            cy={g.H + g.L / 2}
            g={g}
            c={c}
            mats={mats}
            face="laminate"
            solid
            handleY={g.H + g.L / 2 - 0.12}
            prefix={`l${s.id}`}
            openState={openState}
            onLeaf={toggleKey}
          />
        </group>
      )}

      {selected && bounds}
    </>
  );
}

/* ───────────────────────── whole wardrobe ───────────────────────── */

interface WardrobeModelProps {
  config: WardrobeConfig;
  openState: Record<string, boolean>;
  onToggle: (key: string) => void;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  /** Blueprint view: ghosted boards with outlines. */
  blueprint?: boolean;
}

export function WardrobeModel({ config: c, openState, onToggle, selectedId, onSelect, blueprint = false }: WardrobeModelProps) {
  const mats = useMats(c, blueprint);
  const surfaceCache = useRef(new Map<string, SurfaceResult>());
  const getSurface = useCallback(
    (surf: Surface) => {
      const key = surfaceKey(surf, blueprint);
      let r = surfaceCache.current.get(key);
      if (!r) {
        r = buildSurface(surf, blueprint);
        surfaceCache.current.set(key, r);
      }
      return r;
    },
    [blueprint]
  );
  const W = totalWidth(c);
  const TH = totalHeight(c);
  const g: Geo = useMemo(() => {
    const innerBottom = c.plinth + T;
    const innerTop = c.height - T;
    return {
      W,
      D: c.depth,
      H: c.height,
      L: c.loft ? c.loftHeight : 0,
      plinth: c.plinth,
      innerBottom,
      innerTop,
      ih: innerTop - innerBottom,
    };
  }, [c.depth, c.height, c.loft, c.loftHeight, c.plinth, W]);

  // panel centre x for each boundary
  const bounds = useMemo(() => {
    const xs: number[] = [];
    let x = -W / 2 + T / 2;
    xs.push(x);
    c.sections.forEach((s) => {
      x += s.width;
      xs.push(x);
    });
    return xs;
  }, [c.sections, W]);

  return (
    <BlueprintContext.Provider value={blueprint}>
    <group onPointerMissed={() => onSelect(null)}>
      {/* carcass */}
      <Box size={[W, T, g.D]} position={[0, g.plinth + T / 2, 0]} material={mats.body} />
      <Box size={[W, T, g.D]} position={[0, g.H - T / 2, 0]} material={mats.body} />
      {c.loft && <Box size={[W, T, g.D]} position={[0, g.H + T / 2, 0]} material={mats.body} />}
      {c.loft && <Box size={[W, T, g.D]} position={[0, g.H + g.L - T / 2, 0]} material={mats.body} />}
      <Box size={[W, TH, 0.008]} position={[0, TH / 2, -g.D / 2 + 0.004]} material={mats.back} cast={false} />
      {bounds.map((x, i) => {
        const outer = i === 0 || i === bounds.length - 1;
        return (
          <Box
            key={i}
            size={[T, outer ? TH : TH - g.plinth, g.D]}
            position={[x, outer ? TH / 2 : g.plinth + (TH - g.plinth) / 2, 0]}
            material={mats.body}
          />
        );
      })}
      {/* plinth */}
      <Box size={[W - 2 * T, g.plinth, 0.012]} position={[0, g.plinth / 2, g.D / 2 - 0.05]} material={mats.dark} />

      {/* sections */}
      {c.sections.map((s, i) => (
        <Section
          key={s.id}
          s={s}
          cx={(bounds[i] + bounds[i + 1]) / 2}
          c={c}
          g={g}
          mats={mats}
          openState={openState}
          onToggle={onToggle}
          onSelect={onSelect}
          selected={selectedId === s.id}
          getSurface={getSurface}
        />
      ))}

      {/* profile lights — glow leaking from the vertical gaps between sections */}
      {c.lights.profile &&
        bounds.slice(1, -1).map((x, i) => (
          <Box
            key={i}
            size={[0.007, g.H - g.plinth - 0.04, 0.006]}
            position={[x, g.plinth + (g.H - g.plinth) / 2, g.D / 2 + 0.004]}
            material={mats.led}
            cast={false}
          />
        ))}
      {c.lights.profile && c.loft && (
        <Box size={[W - 2 * T - 0.02, 0.006, 0.006]} position={[0, g.H, g.D / 2 + 0.004]} material={mats.led} cast={false} />
      )}

      {/* cove light along the top, washing the ceiling */}
      {c.lights.top && (
        <>
          <Box size={[W - 0.12, 0.008, 0.012]} position={[0, TH + 0.005, -g.D / 2 + 0.07]} material={mats.led} cast={false} />
        </>
      )}

      {/* toe-kick glow */}
      {c.lights.plinth && (
        <>
          <Box size={[W - 0.16, 0.006, 0.01]} position={[0, 0.006, g.D / 2 - 0.042]} material={mats.led} cast={false} />
        </>
      )}
    </group>
    </BlueprintContext.Provider>
  );
}
