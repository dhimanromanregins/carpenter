/** Reusable interactive parts shared by the base, wall and tall renderers. */
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Box, FT, Front, GAP, Handle, Interactive, T, useAnimated, useOpenProgress, useRenderCtx } from "../common";
import { getUtilMaterial } from "../materials";

type Edge = "top" | "bottom" | "none";

/** One hinged leaf. `cx` is the leaf centre in module space, hinged on `side`. */
export function HingedDoor({
  id,
  w,
  h,
  cx,
  cy,
  side,
  edge = "top",
  anchor = "top",
  noun = "Cabinet",
  maxAngle = 1.9,
  withHandle = true,
}: {
  id: string;
  w: number;
  h: number;
  cx: number;
  cy: number;
  side: "left" | "right";
  edge?: Edge;
  anchor?: "top" | "bottom" | "mid";
  noun?: string;
  maxAngle?: number;
  withHandle?: boolean;
}) {
  const c = useRenderCtx();
  const ref = useRef<THREE.Group>(null);
  useAnimated(id, (p) => {
    if (ref.current) ref.current.rotation.y = (side === "left" ? -1 : 1) * p * maxAngle;
  });
  const hingeX = cx + (side === "left" ? -w / 2 : w / 2);
  return (
    <Interactive id={id} moduleId={c.m.id} noun={noun}>
      <group ref={ref} position={[hingeX, cy, c.dp / 2 + FT / 2 + 0.001]}>
        <group position={[side === "left" ? w / 2 : -w / 2, 0, 0]}>
          <Front w={w} h={h} edge={edge}>
            {withHandle && <Handle orient="v" w={w} h={h} anchor={anchor} free={side === "left" ? "right" : "left"} />}
          </Front>
        </group>
      </group>
    </Interactive>
  );
}

/** One or two doors across `width`, centred on `cx`. */
export function DoorPair({
  idPrefix,
  width,
  h,
  cx = 0,
  cy,
  edge,
  anchor,
  noun,
  hinge = "left",
  forceSingle,
}: {
  idPrefix: string;
  width: number;
  h: number;
  cx?: number;
  cy: number;
  edge?: Edge;
  anchor?: "top" | "bottom" | "mid";
  noun?: string;
  hinge?: "left" | "right";
  forceSingle?: boolean;
}) {
  const n = !forceSingle && width >= 0.6 ? 2 : 1;
  const lw = (width - 2 * GAP - (n - 1) * 0.003) / n;
  return (
    <>
      <HingedDoor id={`${idPrefix}0`} w={lw} h={h} cx={n === 1 ? cx : cx - lw / 2 - 0.0015} cy={cy} side={n === 1 ? hinge : "left"} edge={edge} anchor={anchor} noun={noun} />
      {n === 2 && <HingedDoor id={`${idPrefix}1`} w={lw} h={h} cx={cx + lw / 2 + 0.0015} cy={cy} side="right" edge={edge} anchor={anchor} noun={noun} />}
    </>
  );
}

/** A pull-out drawer: front + box slide forward together. */
export function DrawerUnit({
  id,
  w,
  h,
  cy,
  travel,
  boxDepth,
  boxHeight,
  contents,
  noun = "Drawer",
  edge = "top",
}: {
  id: string;
  w: number;
  h: number;
  cy: number;
  travel: number;
  boxDepth: number;
  boxHeight?: number;
  /** Rendered in the drawer's local frame, floor of the box at y = 0. */
  contents?: (inner: { w: number; d: number; h: number }) => ReactNode;
  noun?: string;
  edge?: Edge;
}) {
  const c = useRenderCtx();
  const ref = useRef<THREE.Group>(null);
  const contentsRef = useRef<THREE.Group>(null);
  useAnimated(id, (p) => {
    if (ref.current) ref.current.position.z = p * travel;
    if (contentsRef.current) contentsRef.current.visible = p > 0.04;
  });
  const wi = w - 2 * T - 0.04;
  const bh = boxHeight ?? Math.max(0.06, h - 0.05);
  const mat = c.backMat;
  const frontZ = c.dp / 2 + FT / 2 + 0.001;
  const boxZ = c.dp / 2 - boxDepth / 2 - 0.01;
  return (
    <Interactive id={id} moduleId={c.m.id} noun={noun}>
      <group ref={ref} position={[0, cy, 0]}>
        <group position={[0, 0, frontZ]}>
          <Front w={w - 2 * GAP} h={h} edge={edge}>
            <Handle orient="h" w={w} h={h} anchor="top" />
          </Front>
        </group>
        <group position={[0, -h / 2 + 0.02, boxZ]}>
          <Box size={[wi, 0.012, boxDepth]} position={[0, 0, 0]} material={mat} />
          <Box size={[0.012, bh, boxDepth]} position={[-wi / 2, bh / 2, 0]} material={mat} />
          <Box size={[0.012, bh, boxDepth]} position={[wi / 2, bh / 2, 0]} material={mat} />
          <Box size={[wi, bh, 0.012]} position={[0, bh / 2, -boxDepth / 2]} material={mat} />
          {contents && c.showContents && (
            <group ref={contentsRef} position={[0, 0.006, 0]} visible={false}>
              {contents({ w: wi - 0.02, d: boxDepth - 0.04, h: bh })}
            </group>
          )}
        </group>
      </group>
    </Interactive>
  );
}

/** Two glass / laminate panels on rails — the front one slides across the rear one. */
export function SlidingPair({ id, w, h, cy, edge = "none" }: { id: string; w: number; h: number; cy: number; edge?: Edge }) {
  const c = useRenderCtx();
  const frontRef = useRef<THREE.Group>(null);
  const overlap = 0.03;
  const pw = (w - 2 * GAP + overlap) / 2;
  const slide = pw - overlap;
  useAnimated(id, (p) => {
    if (frontRef.current) frontRef.current.position.x = pw / 2 - GAP / 2 + overlap / 2 - p * slide;
  });
  const z = c.dp / 2;
  return (
    <Interactive id={id} moduleId={c.m.id} noun="Sliding Door" openVerb="Slide" closeVerb="Close">
      <group position={[0, cy, 0]}>
        <group position={[-pw / 2 + GAP / 2 - overlap / 2, 0, z + FT / 2 + 0.002]}>
          <Front w={pw} h={h} edge={edge} />
        </group>
        <group ref={frontRef} position={[pw / 2, 0, z + FT * 1.5 + 0.006]}>
          <Front w={pw} h={h} edge={edge}>
            <Handle orient="v" w={pw} h={h} anchor="mid" free="left" />
          </Front>
        </group>
        <Box size={[w, 0.014, 0.05]} position={[0, h / 2 + 0.007, z + FT + 0.004]} material={getUtilMaterial("steel")} cast={false} />
        <Box size={[w, 0.014, 0.05]} position={[0, -h / 2 - 0.007, z + FT + 0.004]} material={getUtilMaterial("steel")} cast={false} />
      </group>
    </Interactive>
  );
}

/** A flap that lifts up and out on a top hinge (lift-up wall cabinets). */
export function LiftDoor({ id, w, h, top }: { id: string; w: number; h: number; top: number }) {
  const c = useRenderCtx();
  const ref = useRef<THREE.Group>(null);
  useAnimated(id, (p) => {
    if (ref.current) ref.current.rotation.x = -p * 1.38;
  });
  return (
    <Interactive id={id} moduleId={c.m.id} noun="Shutter" openVerb="Lift" closeVerb="Lower">
      <group position={[0, top, c.dp / 2 + FT / 2 + 0.001]}>
        <group ref={ref}>
          <group position={[0, -h / 2, 0]}>
            <Front w={w} h={h} edge="bottom">
              <Handle orient="h" w={w} h={h} anchor="bottom" />
            </Front>
          </group>
        </group>
      </group>
    </Interactive>
  );
}

/** A false-front tray (above the sink) that tilts out — so no drawer-looking front is ever dead. */
export function TiltTray({ id, w, h, cy }: { id: string; w: number; h: number; cy: number }) {
  const c = useRenderCtx();
  const ref = useRef<THREE.Group>(null);
  useAnimated(id, (p) => {
    if (ref.current) ref.current.rotation.x = p * 0.85;
  });
  return (
    <Interactive id={id} moduleId={c.m.id} noun="Tilt-out Tray" openVerb="Tilt out" closeVerb="Close">
      <group position={[0, cy - h / 2, c.dp / 2 + FT / 2 + 0.001]}>
        <group ref={ref}>
          <group position={[0, h / 2, 0]}>
            <Front w={w} h={h} edge="top">
              <Handle orient="h" w={w} h={h} anchor="top" />
            </Front>
          </group>
        </group>
      </group>
    </Interactive>
  );
}

/** A tall panel that slides out (pantry, bottle pull-out, dustbin). Children move with it. */
export function SlideOut({ id, travel, noun, openVerb = "Pull Out", closeVerb = "Push In", children }: { id: string; travel: number; noun: string; openVerb?: string; closeVerb?: string; children: ReactNode }) {
  const c = useRenderCtx();
  const ref = useRef<THREE.Group>(null);
  useAnimated(id, (p) => {
    if (ref.current) ref.current.position.z = p * travel;
  });
  return (
    <Interactive id={id} moduleId={c.m.id} noun={noun} openVerb={openVerb} closeVerb={closeVerb}>
      <group ref={ref}>{children}</group>
    </Interactive>
  );
}

/** Hook for custom mechanisms: read the eased open progress inside a useFrame. */
export { useOpenProgress };

/** Wire-frame basket / tray used by baskets, corner trays, pantry shelves. */
export function WireTray({ w, d, rim = 0.04, position }: { w: number; d: number; rim?: number; position: [number, number, number] }) {
  const wire = getUtilMaterial("chrome");
  const bars = Math.max(3, Math.round(w / 0.05));
  return (
    <group position={position}>
      <Box size={[w, 0.004, d]} position={[0, 0, 0]} material={wire} cast={false} />
      {Array.from({ length: bars }).map((_, i) => (
        <Box key={i} size={[0.003, 0.003, d]} position={[-w / 2 + (w / (bars - 1)) * i, 0.004, 0]} material={wire} cast={false} />
      ))}
      <Box size={[w, rim, 0.004]} position={[0, rim / 2, d / 2]} material={wire} cast={false} />
      <Box size={[w, rim, 0.004]} position={[0, rim / 2, -d / 2]} material={wire} cast={false} />
      <Box size={[0.004, rim, d]} position={[w / 2, rim / 2, 0]} material={wire} cast={false} />
      <Box size={[0.004, rim, d]} position={[-w / 2, rim / 2, 0]} material={wire} cast={false} />
    </group>
  );
}
