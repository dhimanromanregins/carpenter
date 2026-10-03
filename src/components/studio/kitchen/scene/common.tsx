/**
 * Shared building blocks for every cabinet / appliance renderer: materials
 * context, panels, shutter fronts, handles, and the reusable interaction layer.
 * Renderers are small compositions of these — none of them define their own
 * animation or pointer logic.
 */
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { KitchenDesignConfig, ModuleInstance, ShutterStyle } from "../model/types";
import { mm } from "../model/units";
import { MATERIALS_BY_ID, resolveMaterial } from "../data/materials";
import { SHUTTER_STYLE_BY_ID } from "../data/handles";
import { getEmissive, getHandleMaterial, getMaterial, getUtilMaterial } from "./materials";
import { LED_COLORS } from "./lightingConfig";
import { registerInteractive, useInteraction, useIsOpen, useSelection, type SurfaceTarget } from "../store/interactionStore";
import { useUi } from "../store/uiStore";

export const T = 0.018; // board thickness
export const FT = 0.018; // front thickness
export const GAP = 0.002;

/* ───────────────────────── render context ───────────────────────── */

export interface RenderCtx {
  m: ModuleInstance;
  d: KitchenDesignConfig;
  /** Module size in metres. */
  w: number;
  h: number;
  dp: number;
  /** Height of the toe-kick plinth in metres (0 for wall units). */
  plinth: number;
  style: ShutterStyle;
  handleless: boolean;
  handleStyle: "knob" | "bar" | "edge" | "profile" | "none";
  shutterMat: THREE.Material;
  flutedMat: THREE.Material;
  bodyMat: THREE.Material;
  backMat: THREE.Material;
  glassMat: THREE.Material;
  frameMat: THREE.Material;
  handleMat: THREE.MeshStandardMaterial;
  plinthMat: THREE.Material;
  ledOn: boolean;
  ledColor: string;
  ledBrightness: number;
  showContents: boolean;
}

export const RenderContext = createContext<RenderCtx | null>(null);
export const useRenderCtx = () => {
  const c = useContext(RenderContext);
  if (!c) throw new Error("RenderContext missing");
  return c;
};

export function buildRenderCtx(m: ModuleInstance, d: KitchenDesignConfig, plinthM: number): RenderCtx {
  const style = m.overrides.shutterStyle ?? d.style.shutterStyle;
  const def = SHUTTER_STYLE_BY_ID[style];
  const shutterDef = resolveMaterial(m.overrides.shutterMaterial ?? d.style.shutterMaterial);
  const bodyDef = resolveMaterial(m.overrides.bodyMaterial ?? d.style.bodyMaterial);
  const wood = shutterDef.texture === "wood";
  const glassDef = MATERIALS_BY_ID[m.overrides.glassMaterial ?? d.style.glassMaterial] ?? MATERIALS_BY_ID["gl-smoked"];
  const handleStyle = m.overrides.handleStyle ?? d.style.handleStyle;
  const handleFinish = m.overrides.handleFinish ?? d.style.handleFinish;
  const frameMat =
    style === "glass-wood"
      ? getMaterial(MATERIALS_BY_ID["ven-walnut"], { rotate: true })
      : style === "glass-black"
        ? getHandleMaterial("black")
        : getHandleMaterial(handleFinish === "black" ? "black" : "brushed-steel");
  const lighting = d.lighting;
  const nightish = lighting.scene === "night" || lighting.scene === "evening";
  return {
    m,
    d,
    w: mm(m.width),
    h: mm(m.height),
    dp: mm(m.depth),
    plinth: plinthM,
    style,
    handleless: def.handleless,
    handleStyle: def.handleless ? "none" : handleStyle,
    shutterMat: getMaterial(shutterDef, { rotate: wood }),
    flutedMat: getMaterial(shutterDef, { rotate: wood, fluted: true }),
    bodyMat: getMaterial(bodyDef),
    backMat: getMaterial({ ...bodyDef, id: `${bodyDef.id}-back`, color: shade(bodyDef.color, 0.9) }),
    glassMat: getMaterial(glassDef),
    frameMat,
    handleMat: getHandleMaterial(handleFinish),
    plinthMat: getUtilMaterial("dark"),
    ledOn: m.params.led ?? lighting.insideCabinet,
    ledColor: LED_COLORS[lighting.temperature],
    ledBrightness: lighting.brightness * (nightish ? 1 : 0.7),
    showContents: d.showContents,
  };
}

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}

/* ───────────────────────── primitives ───────────────────────── */

type V3 = [number, number, number];

export function Box({ size, position, material, cast = true, rotation }: { size: V3; position: V3; material: THREE.Material; cast?: boolean; rotation?: V3 }) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow={cast} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

export function RBox({ size, position, material, radius = 0.002 }: { size: V3; position: V3; material: THREE.Material; radius?: number }) {
  return (
    <RoundedBox args={size} radius={Math.min(radius, Math.min(...size) / 2.2)} smoothness={2} position={position} material={material} castShadow receiveShadow />
  );
}

export function Cyl({ r, h, position, material, rotation, segments = 20, cast = true }: { r: number; h: number; position: V3; material: THREE.Material; rotation?: V3; segments?: number; cast?: boolean }) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow={cast} receiveShadow>
      <cylinderGeometry args={[r, r, h, segments]} />
    </mesh>
  );
}

/** Carcass: sides, bottom, top (full / rails), back, optional shelves & plinth. */
export function Carcass({
  top = "rails",
  shelves = 0,
  plinth = true,
  back = true,
  shelfFrom = 0,
  shelfTo,
  hOverride,
  glassShelves = false,
  mirrorBack = false,
  ledShelves = false,
  autoLed = true,
}: {
  /** Fit the interior LED strips when the user switched "Interior light" on (glass renderers draw their own). */
  autoLed?: boolean;
  top?: "full" | "rails" | "none";
  shelves?: number;
  plinth?: boolean;
  back?: boolean;
  /** Clear glass shelves instead of board shelves. */
  glassShelves?: boolean;
  /** Mirrored back panel. */
  mirrorBack?: boolean;
  /** LED under every shelf. */
  ledShelves?: boolean;
  /** Shelves are spread between these heights (defaults to the interior). */
  shelfFrom?: number;
  shelfTo?: number;
  hOverride?: number;
}) {
  const c = useRenderCtx();
  const { w, dp, plinth: ph } = c;
  const h = hOverride ?? c.h;
  const hb = h - ph;
  const inner = w - 2 * T;
  const y0 = ph + T + shelfFrom;
  const y1 = (shelfTo ?? h - T) - 0;
  return (
    <group>
      {[-1, 1].map((s) => (
        <Box key={s} size={[T, hb, dp]} position={[s * (w / 2 - T / 2), ph + hb / 2, 0]} material={c.bodyMat} />
      ))}
      <Box size={[inner, T, dp - 0.01]} position={[0, ph + T / 2, -0.005]} material={c.bodyMat} />
      {top === "full" && <Box size={[inner, T, dp]} position={[0, h - T / 2, 0]} material={c.bodyMat} />}
      {top === "rails" && (
        <>
          <Box size={[inner, T, 0.08]} position={[0, h - T / 2, -dp / 2 + 0.04]} material={c.bodyMat} />
          <Box size={[inner, T, 0.08]} position={[0, h - T / 2, dp / 2 - 0.04]} material={c.bodyMat} />
        </>
      )}
      {back && <Box size={[inner, hb, 0.006]} position={[0, ph + hb / 2, -dp / 2 + 0.003]} material={mirrorBack ? getUtilMaterial("mirror") : c.backMat} cast={false} />}
      {Array.from({ length: shelves }).map((_, i) => {
        const y = y0 + ((y1 - y0) / (shelves + 1)) * (i + 1);
        return (
          <group key={i}>
            {glassShelves ? (
              <mesh position={[0, y, -0.005]} material={c.glassMat} renderOrder={2}>
                <boxGeometry args={[inner, 0.008, dp - 0.03]} />
              </mesh>
            ) : (
              <Box size={[inner, T * 0.8, dp - 0.03]} position={[0, y, -0.005]} material={c.bodyMat} />
            )}
            {ledShelves && c.ledOn && c.d.lighting.shelfLeds && <Led size={[inner - 0.04, 0.005, 0.01]} position={[0, y - (glassShelves ? 0.006 : T * 0.4 + 0.004), dp / 2 - 0.045]} />}
          </group>
        );
      })}
      {plinth && ph > 0 && <Box size={[inner, ph, T]} position={[0, ph / 2, dp / 2 - 0.06]} material={c.plinthMat} cast={false} />}
      {autoLed && c.m.params.led === true && (
        <>
          {[-1, 1].map((s) => (
            <Led key={s} size={[0.008, hb - 0.1, 0.006]} position={[s * (w / 2 - T - 0.015), ph + hb / 2, dp / 2 - 0.04]} />
          ))}
          <Led size={[inner - 0.04, 0.006, 0.01]} position={[0, h - T - 0.01, dp / 2 - 0.045]} />
        </>
      )}
    </group>
  );
}

/* ───────────────────────── animation ───────────────────────── */

/**
 * 0 → 1 progress. Opens briskly with ease-out; closes with a damped soft-close
 * landing (full speed, then a gentle bounce-free stop over the last quarter).
 */
export function useOpenProgress(key: string) {
  const open = useIsOpen(key);
  const p = useRef(0);
  const step = (delta: number) => {
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
  return { step, open, progress: p };
}

/** Convenience: drive a ref'd object each frame with eased open progress. */
export function useAnimated(key: string, apply: (p: number) => void) {
  const { step } = useOpenProgress(key);
  useFrame((_, delta) => apply(step(delta)));
}

/* ───────────────────────── interaction layer ───────────────────────── */

interface InteractiveProps {
  id: string;
  moduleId: string;
  /** What the part is called: "Drawer", "Cabinet", "Pantry"… */
  noun: string;
  openVerb?: string;
  closeVerb?: string;
  children: ReactNode;
  position?: V3;
}

/**
 * Wraps any openable part. Hover → subtle label, click → select, double-click →
 * open/close, right-click → context menu. In walk mode, the first-person
 * controller reads `userData` instead and toggles the same store key.
 */
export function Interactive({ id, moduleId, noun, openVerb = "Open", closeVerb = "Close", children, position }: InteractiveProps) {
  const open = useIsOpen(id);
  const label = `${open ? closeVerb : openVerb} ${noun}`;
  const designMode = () => useUi.getState().mode === "design";
  useEffect(() => registerInteractive(id), [id]);
  return (
    <group
      position={position}
      userData={{ interactKey: id, label, moduleId }}
      onClick={(e) => {
        // one click does both: select the unit (so its properties show) and use the part
        if (!designMode()) return;
        e.stopPropagation();
        useSelection.getState().select(moduleId);
        useInteraction.getState().toggle(id);
      }}
      onContextMenu={(e) => {
        if (!designMode()) return;
        e.stopPropagation();
        e.nativeEvent.preventDefault();
        useSelection.getState().select(moduleId);
        useInteraction.getState().showContextMenu({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, moduleId });
      }}
      onPointerOver={(e) => {
        if (!designMode()) return;
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        useInteraction.getState().setHover({ key: id, moduleId, label });
        useSelection.getState().setHoveredModule(moduleId);
        useInteraction.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY);
      }}
      onPointerMove={(e) => {
        if (!designMode()) return;
        useInteraction.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
        useInteraction.getState().setHover(null);
        useSelection.getState().setHoveredModule(null);
      }}
    >
      {children}
    </group>
  );
}

/**
 * Pointer handlers that make a non-cabinet surface (countertop, backsplash, floor,
 * wall) selectable: hover shows "Change …", click opens its settings.
 */
export function surfaceHandlers(kind: SurfaceTarget, label: string) {
  const designMode = () => useUi.getState().mode === "design";
  return {
    userData: { interactKey: `surface:${kind}`, label: `Change ${label}`, moduleId: "" },
    onClick: (e: { stopPropagation: () => void }) => {
      if (!designMode()) return;
      e.stopPropagation();
      useSelection.getState().selectSurface(kind);
      useUi.getState().setLeftTab("counter");
    },
    onPointerOver: (e: { stopPropagation: () => void; nativeEvent: PointerEvent }) => {
      if (!designMode()) return;
      e.stopPropagation();
      document.body.style.cursor = "pointer";
      useInteraction.getState().setHover({ key: `surface:${kind}`, moduleId: "", label: `Change ${label}` });
      useInteraction.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY);
    },
    onPointerMove: (e: { nativeEvent: PointerEvent }) => {
      if (!designMode()) return;
      useInteraction.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY);
    },
    onPointerOut: () => {
      document.body.style.cursor = "";
      useInteraction.getState().setHover(null);
    },
  };
}

/** Gold outline box around the selected / hovered module. */
export function SelectionOutline({ w, h, d, y0, color = "#e2cd9a", opacity = 1 }: { w: number; h: number; d: number; y0: number; color?: string; opacity?: number }) {
  return (
    <mesh position={[0, y0 + h / 2, 0]} raycast={() => null}>
      <boxGeometry args={[w + 0.008, h + 0.008, d + 0.008]} />
      <meshBasicMaterial color={color} transparent opacity={0.1 * opacity} depthWrite={false} />
      <Edges color={color} lineWidth={2} transparent opacity={opacity} />
    </mesh>
  );
}

/* ───────────────────────── shutter front ───────────────────────── */

type Edge = "top" | "bottom" | "none";

/** One shutter face, centred on its own origin, front toward +z. */
export function Front({ w, h, edge = "none", children }: { w: number; h: number; edge?: Edge; children?: ReactNode }) {
  const c = useRenderCtx();
  const mat = c.style === "fluted" ? c.flutedMat : c.shutterMat;
  const prof = getUtilMaterial("steel");
  const dark = getUtilMaterial("dark");
  const shadow = useMemo(() => new THREE.MeshBasicMaterial({ color: "#2a2724", transparent: true, opacity: 0.55 }), []);
  const fz = FT / 2;
  const sign = edge === "bottom" ? -1 : 1;

  let face: ReactNode;
  switch (c.style) {
    case "shaker": {
      const f = Math.min(0.065, w * 0.22, h * 0.22);
      face = (
        <>
          <RBox size={[w - 2 * f + 0.002, h - 2 * f + 0.002, FT * 0.62]} position={[0, 0, -FT * 0.19]} material={mat} radius={0.001} />
          <RBox size={[w, f, FT]} position={[0, h / 2 - f / 2, 0]} material={mat} radius={0.0015} />
          <RBox size={[w, f, FT]} position={[0, -h / 2 + f / 2, 0]} material={mat} radius={0.0015} />
          <RBox size={[f, h - 2 * f, FT]} position={[-w / 2 + f / 2, 0, 0]} material={mat} radius={0.0015} />
          <RBox size={[f, h - 2 * f, FT]} position={[w / 2 - f / 2, 0, 0]} material={mat} radius={0.0015} />
        </>
      );
      break;
    }
    case "profile":
      face = (
        <>
          <RBox size={[w, h, FT]} position={[0, 0, 0]} material={mat} />
          {[-0.28, 0, 0.28].map((k) => (
            <Box key={k} size={[w - 0.04, 0.0018, 0.0012]} position={[0, h * k, fz + 0.0004]} material={dark} cast={false} />
          ))}
        </>
      );
      break;
    case "glass-alu":
    case "glass-wood":
    case "glass-black": {
      const fw = 0.03;
      face = (
        <>
          <Box size={[fw, h, FT]} position={[-(w - fw) / 2, 0, 0]} material={c.frameMat} />
          <Box size={[fw, h, FT]} position={[(w - fw) / 2, 0, 0]} material={c.frameMat} />
          <Box size={[w - 2 * fw, fw, FT]} position={[0, (h - fw) / 2, 0]} material={c.frameMat} />
          <Box size={[w - 2 * fw, fw, FT]} position={[0, -(h - fw) / 2, 0]} material={c.frameMat} />
          <mesh position={[0, 0, 0]} material={c.glassMat} renderOrder={3}>
            <boxGeometry args={[w - 2 * fw, h - 2 * fw, 0.005]} />
          </mesh>
        </>
      );
      break;
    }
    case "glass-frameless": {
      // edge-to-edge glass held by small steel clips at the hinge side
      const steel = getUtilMaterial("steel");
      face = (
        <>
          <mesh material={c.glassMat} renderOrder={3}>
            <boxGeometry args={[w, h, 0.008]} />
          </mesh>
          {[0.18, 0.5, 0.82].map((k) => (
            <Box key={k} size={[0.026, 0.045, 0.014]} position={[-w / 2 + 0.013, (k - 0.5) * h, 0]} material={steel} />
          ))}
        </>
      );
      break;
    }
    default:
      face = <RBox size={[w, h, FT]} position={[0, 0, 0]} material={mat} />;
  }

  // handle-less opening profiles sit on the pulling edge. Lofts and full-height doors
  // (edge "none") skip them: stacked dark lines read as clutter, and a click opens them anyway.
  let profile: ReactNode = null;
  const wantsProfile = edge !== "none" && !c.m.run.endsWith("-loft");
  if (!wantsProfile) {
    profile = null;
  } else if (c.style === "handleless-j") {
    profile = (
      <>
        <Box size={[w - 0.004, 0.03, 0.004]} position={[0, sign * (h / 2 - 0.015), fz + 0.002]} material={prof} />
        <Box size={[w - 0.004, 0.004, 0.022]} position={[0, sign * (h / 2 - 0.002), fz + 0.011]} material={prof} />
      </>
    );
  } else if (c.style === "handleless-g") {
    profile = (
      <>
        <Box size={[w - 0.02, 0.016, 0.0032]} position={[0, sign * (h / 2 - 0.01), fz + 0.0016]} material={shadow} cast={false} />
        <Box size={[w - 0.02, 0.003, 0.01]} position={[0, sign * (h / 2 - 0.02), fz + 0.005]} material={prof} />
      </>
    );
  } else if (c.style === "handleless-c") {
    profile = (
      <>
        <Box size={[w - 0.004, 0.034, 0.003]} position={[0, sign * (h / 2 - 0.017), fz + 0.0015]} material={dark} cast={false} />
        <mesh position={[0, sign * (h / 2 - 0.034), fz + 0.004]} rotation={[0, 0, Math.PI / 2]} material={prof} castShadow>
          <cylinderGeometry args={[0.006, 0.006, w - 0.004, 14, 1, false, 0, Math.PI]} />
        </mesh>
      </>
    );
  }

  return (
    <group>
      {face}
      {profile}
      {children}
    </group>
  );
}

/* ───────────────────────── handles ───────────────────────── */

export function Handle({ orient, w, h, anchor = "top", free = "right" }: { orient: "v" | "h"; w: number; h: number; anchor?: "top" | "bottom" | "mid"; free?: "left" | "right" }) {
  const c = useRenderCtx();
  if (c.handleStyle === "none") return null;
  const mat = c.handleMat;
  const z = FT / 2;
  const sx = free === "right" ? 1 : -1;
  const hy = anchor === "top" ? h / 2 - Math.min(0.1, h * 0.25) : anchor === "bottom" ? -h / 2 + Math.min(0.1, h * 0.25) : 0;

  if (orient === "v") {
    const x = sx * (w / 2 - 0.045);
    switch (c.handleStyle) {
      case "knob":
        return (
          <group position={[x, hy, z]}>
            <Cyl r={0.004} h={0.016} position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]} material={mat} />
            <mesh position={[0, 0, 0.02]} material={mat} castShadow>
              <sphereGeometry args={[0.017, 20, 20]} />
            </mesh>
          </group>
        );
      case "edge":
        return <Box size={[0.014, h * 0.7, 0.012]} position={[sx * (w / 2 - 0.009), 0, z + 0.006]} material={mat} />;
      case "profile":
        return <Box size={[0.02, h * 0.92, 0.016]} position={[sx * (w / 2 - 0.01), 0, z + 0.008]} material={mat} />;
      default: {
        const len = Math.min(0.22, h * 0.5);
        return (
          <group position={[x, hy, z]}>
            <Box size={[0.012, len, 0.012]} position={[0, 0, 0.024]} material={mat} />
            <Box size={[0.01, 0.01, 0.024]} position={[0, len / 2 - 0.012, 0.012]} material={mat} />
            <Box size={[0.01, 0.01, 0.024]} position={[0, -len / 2 + 0.012, 0.012]} material={mat} />
          </group>
        );
      }
    }
  }

  // horizontal (drawers, lift-ups)
  const y = anchor === "bottom" ? -h / 2 + 0.03 : h / 2 - 0.04;
  switch (c.handleStyle) {
    case "knob":
      return (
        <group position={[0, y - 0.005, z]}>
          <mesh position={[0, 0, 0.02]} material={mat} castShadow>
            <sphereGeometry args={[0.017, 20, 20]} />
          </mesh>
        </group>
      );
    case "edge":
      return <Box size={[w * 0.82, 0.014, 0.012]} position={[0, anchor === "bottom" ? -h / 2 + 0.007 : h / 2 - 0.007, z + 0.006]} material={mat} />;
    case "profile":
      return <Box size={[w * 0.96, 0.026, 0.016]} position={[0, anchor === "bottom" ? -h / 2 + 0.013 : h / 2 - 0.013, z + 0.008]} material={mat} />;
    default: {
      const len = Math.min(0.26, w * 0.6);
      return (
        <group position={[0, y, z]}>
          <Box size={[len, 0.012, 0.012]} position={[0, 0, 0.024]} material={mat} />
          <Box size={[0.01, 0.01, 0.024]} position={[len / 2 - 0.012, 0, 0.012]} material={mat} />
          <Box size={[0.01, 0.01, 0.024]} position={[-len / 2 + 0.012, 0, 0.012]} material={mat} />
        </group>
      );
    }
  }
}

/**
 * Context for glass cabinets: keeps the kitchen's glass style if it already is one,
 * otherwise falls back to a slim aluminium frame (or frameless for the frameless type).
 */
export function glassCtx(c: RenderCtx): RenderCtx {
  const isGlass = c.style.startsWith("glass");
  const style: ShutterStyle = isGlass ? c.style : c.m.typeId === "wall-glass-frameless" ? "glass-frameless" : "glass-alu";
  const frameless = style === "glass-frameless";
  const frameMat =
    style === "glass-wood" ? c.frameMat : style === "glass-black" ? getHandleMaterial("black") : getHandleMaterial(c.d.style.handleFinish === "black" ? "black" : "brushed-steel");
  return { ...c, style, handleless: frameless ? false : c.handleless, frameMat, handleStyle: frameless ? "knob" : c.handleStyle === "none" ? "none" : c.handleStyle };
}

/* ───────────────────────── led ───────────────────────── */

export function Led({ size, position }: { size: V3; position: V3 }) {
  const c = useRenderCtx();
  const mat = useMemo(() => getEmissive(c.ledColor, 1.05 * c.ledBrightness), [c.ledColor, c.ledBrightness]);
  return <Box size={size} position={position} material={mat} cast={false} />;
}
