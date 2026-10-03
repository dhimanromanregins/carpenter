/** Base-cabinet renderers: doors, drawers, sink, hob, corner mechanisms, pull-outs, appliances. */
import { useRef } from "react";
import * as THREE from "three";
import { Box, Carcass, Cyl, FT, Front, GAP, Handle, Interactive, Led, RenderContext, T, glassCtx, useAnimated, useRenderCtx } from "../common";
import { Bottles, CutleryTray, Dustbin, Jars, PlateStack, Bowls, Pan, Pot } from "../contents";
import { DishwasherInterior, Hob } from "../appliances";
import { getUtilMaterial } from "../materials";
import { DoorPair, DrawerUnit, SlidingPair, SlideOut, TiltTray, WireTray } from "./parts";
import { SINKS, FAUCETS } from "../../data/products";
import { mm } from "../../model/units";

/* ───────────────────────── doors ───────────────────────── */

export function BaseDoors() {
  const c = useRenderCtx();
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const shelves = c.m.params.shelves ?? 1;
  return (
    <>
      <Carcass top="rails" shelves={shelves} />
      <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={dh} cy={cy} edge="top" anchor="top" noun="Cabinet" hinge={c.m.params.hinge ?? "left"} />
    </>
  );
}

/** Glass display base cabinet: glass doors, glass shelves, lit and optionally mirrored. */
export function BaseGlass() {
  const c = useRenderCtx();
  const g = glassCtx(c);
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const shelves = c.m.params.shelves ?? 2;
  const mode = c.m.params.glassMode ?? "hinged";
  return (
    <RenderContext.Provider value={g}>
      <Carcass top="rails" shelves={shelves} glassShelves={c.m.params.glassShelves ?? true} mirrorBack={c.m.params.mirrorBack ?? false} ledShelves autoLed={false} />
      {c.showContents &&
        Array.from({ length: shelves + 1 }).map((_, i) => {
          const y = c.plinth + T + ((c.h - c.plinth - 2 * T) / (shelves + 1)) * i + (i ? 0.01 : 0);
          return i % 2 ? <Jars key={i} width={c.w - 0.1} position={[0, y, 0]} /> : <PlateStack key={i} position={[(i - 1) * c.w * 0.18, y, 0]} r={Math.min(0.12, c.w / 4)} n={6} />;
        })}
      {g.ledOn && <Led size={[c.w - 2 * T - 0.04, 0.006, 0.01]} position={[0, c.h - T - 0.01, c.dp / 2 - 0.05]} />}
      {mode === "sliding" ? (
        <SlidingPair id={`${c.m.id}:slide`} w={c.w} h={dh} cy={cy} />
      ) : (
        <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={dh} cy={cy} edge="none" anchor="top" noun="Glass Cabinet" />
      )}
    </RenderContext.Provider>
  );
}

/* ───────────────────────── drawers ───────────────────────── */

function fractions(n: number, deep: boolean): number[] {
  if (deep) return Array.from({ length: n }, () => 1 / n);
  switch (n) {
    case 1:
      return [1];
    case 2:
      return [0.32, 0.68];
    case 3:
      return [0.2, 0.4, 0.4];
    case 4:
      return [0.16, 0.2, 0.32, 0.32];
    default:
      return Array.from({ length: n }, () => 1 / n);
  }
}

function drawerContents(kind: "cutlery" | "pots" | "plates" | "bowls", organiser: boolean) {
  return (inner: { w: number; d: number; h: number }) => {
    if (kind === "cutlery" && organiser) return <CutleryTray w={inner.w} d={inner.d} position={[0, 0, 0]} compartments={Math.max(2, Math.round(inner.w / 0.14))} />;
    if (kind === "pots")
      return (
        <>
          <Pot position={[-inner.w / 4, 0, -inner.d / 4]} r={0.1} h={0.13} />
          <Pot position={[inner.w / 4, 0, -inner.d / 4]} r={0.085} h={0.11} />
          <Pan position={[0, 0, inner.d / 4]} r={Math.min(0.13, inner.w / 4)} />
        </>
      );
    if (kind === "bowls") return <Bowls position={[0, 0, 0]} />;
    return <PlateStack position={[0, 0, 0]} r={Math.min(0.13, inner.w / 2.4)} n={Math.max(3, Math.round(inner.h / 0.025))} />;
  };
}

export function BaseDrawers() {
  const c = useRenderCtx();
  const n = c.m.params.drawers ?? 3;
  const deep = c.m.typeId === "base-deep-drawers";
  const organiser = !!c.m.params.organiser;
  const fr = fractions(n, deep);
  const top = c.h - GAP;
  const bottom = c.plinth + GAP;
  const total = top - bottom;
  let cursor = top;
  return (
    <>
      <Carcass top="rails" />
      {fr.map((f, i) => {
        const hh = f * total - GAP;
        const cy = cursor - hh / 2;
        cursor -= f * total;
        const kind = i === 0 && n >= 3 ? "cutlery" : hh > 0.25 ? "pots" : i % 2 ? "bowls" : "plates";
        return (
          <DrawerUnit
            key={i}
            id={`${c.m.id}:drawer${i}`}
            w={c.w}
            h={hh}
            cy={cy}
            travel={c.dp * 0.78}
            boxDepth={c.dp - 0.1}
            boxHeight={Math.max(0.07, hh - 0.06)}
            contents={drawerContents(kind, organiser)}
          />
        );
      })}
    </>
  );
}

export function BaseCutlery() {
  const c = useRenderCtx();
  const total = c.h - c.plinth - 2 * GAP;
  const fr = [0.2, 0.4, 0.4];
  let cursor = c.h - GAP;
  return (
    <>
      <Carcass top="rails" />
      {fr.map((f, i) => {
        const hh = f * total - GAP;
        const cy = cursor - hh / 2;
        cursor -= f * total;
        return (
          <DrawerUnit
            key={i}
            id={`${c.m.id}:drawer${i}`}
            w={c.w}
            h={hh}
            cy={cy}
            travel={c.dp * 0.78}
            boxDepth={c.dp - 0.1}
            boxHeight={Math.max(0.07, hh - 0.06)}
            contents={drawerContents(i === 0 ? "cutlery" : i === 1 ? "plates" : "pots", true)}
          />
        );
      })}
    </>
  );
}

/* ───────────────────────── sink ───────────────────────── */

function counterTop(c: ReturnType<typeof useRenderCtx>) {
  return c.h + mm(c.d.style.counterThickness);
}

export function SinkBowl({ y, z }: { y: number; z: number }) {
  const c = useRenderCtx();
  const sink = SINKS.find((s) => s.id === c.d.style.sinkType) ?? SINKS[0];
  const faucet = FAUCETS.find((f) => f.id === c.d.style.faucetType) ?? FAUCETS[0];
  const steel = getUtilMaterial(sink.material === "quartz" ? "white" : "steel");
  const chrome = faucet.finish === "chrome" ? getUtilMaterial("chrome") : getUtilMaterial(faucet.finish === "black" ? "dark" : "steel");
  const cw = Math.min(mm(sink.cutout[0]), c.w - 0.06) - 0.02;
  const cd = mm(sink.cutout[1]) - 0.02;
  const depth = 0.2;
  const ref = useRef<THREE.Group>(null);
  useAnimated(`${c.m.id}:faucet`, (p) => {
    if (ref.current) ref.current.rotation.y = p * 0.9;
  });
  const bowls = sink.bowls;
  return (
    <group position={[0, y, z]}>
      {/* rim */}
      <Box size={[cw + 0.03, 0.004, 0.015]} position={[0, 0.001, cd / 2 + 0.005]} material={steel} cast={false} />
      <Box size={[cw + 0.03, 0.004, 0.015]} position={[0, 0.001, -cd / 2 - 0.005]} material={steel} cast={false} />
      <Box size={[0.015, 0.004, cd + 0.03]} position={[cw / 2 + 0.005, 0.001, 0]} material={steel} cast={false} />
      <Box size={[0.015, 0.004, cd + 0.03]} position={[-cw / 2 - 0.005, 0.001, 0]} material={steel} cast={false} />
      {/* basin */}
      <Box size={[cw, 0.006, cd]} position={[0, -depth, 0]} material={steel} />
      <Box size={[0.006, depth, cd]} position={[cw / 2, -depth / 2, 0]} material={steel} />
      <Box size={[0.006, depth, cd]} position={[-cw / 2, -depth / 2, 0]} material={steel} />
      <Box size={[cw, depth, 0.006]} position={[0, -depth / 2, cd / 2]} material={steel} />
      <Box size={[cw, depth, 0.006]} position={[0, -depth / 2, -cd / 2]} material={steel} />
      {bowls === 2 && <Box size={[0.006, depth * 0.85, cd]} position={[0, -depth * 0.58, 0]} material={steel} />}
      {/* drain */}
      <Cyl r={0.03} h={0.004} position={[bowls === 2 ? -cw / 4 : 0, -depth + 0.005, 0]} material={getUtilMaterial("dark")} segments={14} cast={false} />
      {/* faucet */}
      <Interactive id={`${c.m.id}:faucet`} moduleId={c.m.id} noun="Faucet" openVerb="Swing" closeVerb="Swing back" position={[bowls === 2 ? cw * 0.18 : 0, 0, -cd / 2 - 0.045]}>
        <group ref={ref}>
          <Cyl r={0.018} h={faucet.style === "standard" ? 0.2 : 0.3} position={[0, (faucet.style === "standard" ? 0.2 : 0.3) / 2, 0]} material={chrome} segments={14} />
          <Box size={[0.02, 0.02, 0.2]} position={[0, faucet.style === "standard" ? 0.2 : 0.3, 0.09]} material={chrome} />
          <Cyl r={0.012} h={0.04} position={[0, faucet.style === "standard" ? 0.18 : 0.28, 0.18]} material={chrome} segments={10} />
          <Box size={[0.012, 0.012, 0.05]} position={[0.04, 0.06, 0]} material={chrome} />
        </group>
      </Interactive>
    </group>
  );
}

export function BaseSink() {
  const c = useRenderCtx();
  const topFront = 0.14;
  const dh = c.h - c.plinth - topFront - 3 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const zc = -mm(c.m.depth - 460) / 2 + 0.02;
  return (
    <>
      <Carcass top="rails" />
      {/* fixed false front above the doors */}
      <TiltTray id={`${c.m.id}:tray`} w={c.w - 2 * GAP} h={topFront} cy={c.h - GAP - topFront / 2} />
      <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={dh} cy={cy} edge="none" anchor="top" noun="Sink Cabinet" />
      <UnderSinkBin />
      <SinkBowl y={counterTop(c)} z={zc} />
    </>
  );
}

function UnderSinkBin() {
  const c = useRenderCtx();
  const open = c.m.id; // keep module id referenced for hover grouping
  void open;
  return <Dustbin r={0.08} h={0.26} position={[c.w / 4, c.plinth + T, 0]} />;
}

/* ───────────────────────── hob ───────────────────────── */

export function BaseHob() {
  const c = useRenderCtx();
  const topH = 0.17;
  const dh = c.h - c.plinth - topH - 3 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const zc = -mm(c.m.depth - 500) / 2 + 0.02;
  const induction = c.d.style.hobType === "hob-induction";
  return (
    <>
      <Carcass top="rails" />
      <DrawerUnit id={`${c.m.id}:drawer0`} w={c.w} h={topH} cy={c.h - GAP - topH / 2} travel={c.dp * 0.7} boxDepth={c.dp - 0.1} boxHeight={0.1} contents={() => <Pan position={[0, 0, 0]} r={0.1} />} />
      <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={dh} cy={cy} edge="none" anchor="top" noun="Cabinet" />
      <Hob moduleId={c.m.id} position={[0, counterTop(c), zc]} induction={induction} w={Math.min(0.58, c.w - 0.06)} />
    </>
  );
}

/* ───────────────────────── open, appliances ───────────────────────── */

export function BaseOpen() {
  const c = useRenderCtx();
  const shelves = 2;
  return (
    <>
      <Carcass top="rails" shelves={shelves} />
      {Array.from({ length: shelves + 1 }).map((_, i) => {
        const y0 = c.plinth + T + ((c.h - c.plinth - 2 * T) / (shelves + 1)) * i + T * 0.4;
        return i % 2 ? <Jars key={i} width={c.w - 0.1} position={[0, y0, 0]} count={Math.floor(c.w / 0.12)} /> : <Bowls key={i} position={[(i - 1) * c.w * 0.2, y0, 0]} />;
      })}
    </>
  );
}

export function BaseDishwasher() {
  const c = useRenderCtx();
  const ref = useRef<THREE.Group>(null);
  const dh = c.h - c.plinth - 2 * GAP;
  const id = `${c.m.id}:door`;
  useAnimated(id, (p) => {
    if (ref.current) ref.current.rotation.x = p * 1.45;
  });
  const dark = getUtilMaterial("dark");
  return (
    <>
      <Box size={[c.w - 2 * T, c.h - c.plinth, c.dp - 0.05]} position={[0, c.plinth + (c.h - c.plinth) / 2, -0.02]} material={getUtilMaterial("steel")} />
      <Box size={[T, c.h - c.plinth, c.dp]} position={[-c.w / 2 + T / 2, c.plinth + (c.h - c.plinth) / 2, 0]} material={c.bodyMat} />
      <Box size={[T, c.h - c.plinth, c.dp]} position={[c.w / 2 - T / 2, c.plinth + (c.h - c.plinth) / 2, 0]} material={c.bodyMat} />
      <Box size={[c.w - 2 * T, c.plinth, T]} position={[0, c.plinth / 2, c.dp / 2 - 0.06]} material={c.plinthMat} cast={false} />
      <group position={[0, c.plinth + GAP, c.dp / 2 + FT / 2 + 0.001]}>
        <Interactive id={id} moduleId={c.m.id} noun="Dishwasher">
          <group ref={ref}>
            <group position={[0, dh / 2, 0]}>
              <Front w={c.w - 2 * GAP} h={dh} edge="top">
                <Handle orient="h" w={c.w} h={dh} anchor="top" />
              </Front>
              <Box size={[c.w - 0.1, 0.03, 0.004]} position={[0, dh / 2 - 0.06, FT / 2 + 0.004]} material={dark} cast={false} />
            </group>
          </group>
        </Interactive>
      </group>
      <group position={[0, c.plinth, 0]}>
        <DishwasherInterior w={c.w} h={dh} d={c.dp} moduleId={c.m.id} />
      </group>
    </>
  );
}

export function BaseWasher() {
  const c = useRenderCtx();
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const glass = getUtilMaterial("black-glass");
  const steel = getUtilMaterial("steel");
  return (
    <>
      <Box size={[c.w - 2 * T, c.h - c.plinth, c.dp - 0.05]} position={[0, c.plinth + (c.h - c.plinth) / 2, -0.02]} material={getUtilMaterial("white")} />
      <Box size={[T, c.h - c.plinth, c.dp]} position={[-c.w / 2 + T / 2, c.plinth + (c.h - c.plinth) / 2, 0]} material={c.bodyMat} />
      <Box size={[T, c.h - c.plinth, c.dp]} position={[c.w / 2 - T / 2, c.plinth + (c.h - c.plinth) / 2, 0]} material={c.bodyMat} />
      <Box size={[c.w - 2 * T, c.plinth, T]} position={[0, c.plinth / 2, c.dp / 2 - 0.06]} material={c.plinthMat} cast={false} />
      <Interactive id={`${c.m.id}:door`} moduleId={c.m.id} noun="Washing Machine">
        <group position={[0, cy, c.dp / 2 + FT / 2 + 0.001]}>
          <Front w={c.w - 2 * GAP} h={dh} edge="top" />
          <Cyl r={0.19} h={0.012} position={[0, -0.02, FT / 2 + 0.006]} rotation={[Math.PI / 2, 0, 0]} material={steel} segments={32} />
          <Cyl r={0.15} h={0.014} position={[0, -0.02, FT / 2 + 0.01]} rotation={[Math.PI / 2, 0, 0]} material={glass} segments={32} />
        </group>
      </Interactive>
    </>
  );
}

/* ───────────────────────── pull-outs ───────────────────────── */

export function BaseBottle() {
  const c = useRenderCtx();
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const tiers = c.m.params.count ?? 3;
  const rail = getUtilMaterial("steel");
  const innerW = c.w - 2 * T - 0.03;
  const bd = c.dp - 0.1;
  const tierH = (dh - 0.12) / tiers;
  return (
    <>
      <Carcass top="rails" />
      <SlideOut id={`${c.m.id}:bottle`} travel={c.dp * 0.82} noun="Bottle Pull-out">
        <group position={[0, cy, c.dp / 2 + FT / 2 + 0.001]}>
          <Front w={c.w - 2 * GAP} h={dh} edge="top">
            <Handle orient="v" w={c.w} h={dh} anchor="top" free="right" />
          </Front>
        </group>
        <group position={[0, c.plinth + 0.06, c.dp / 2 - bd / 2 - 0.01]}>
          <Box size={[0.006, dh - 0.1, bd]} position={[-innerW / 2, (dh - 0.1) / 2, 0]} material={rail} cast={false} />
          <Box size={[0.006, dh - 0.1, bd]} position={[innerW / 2, (dh - 0.1) / 2, 0]} material={rail} cast={false} />
          {Array.from({ length: tiers }).map((_, i) => (
            <group key={i} position={[0, 0.02 + i * tierH, 0]}>
              <WireTray w={innerW} d={bd - 0.04} rim={0.02} position={[0, 0, 0]} />
              {c.showContents && (
                <>
                  <Bottles width={innerW - 0.02} position={[0, 0.004, -bd / 4]} />
                  {innerW > 0.2 && <Jars width={innerW - 0.02} position={[0, 0.004, bd / 6]} />}
                </>
              )}
            </group>
          ))}
        </group>
      </SlideOut>
    </>
  );
}

export function BaseDustbin() {
  const c = useRenderCtx();
  const n = c.m.params.count ?? 1;
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const innerW = c.w - 2 * T - 0.03;
  const r = Math.min(0.12, innerW / n / 2 - 0.01);
  return (
    <>
      <Carcass top="rails" />
      <SlideOut id={`${c.m.id}:bins`} travel={c.dp * 0.8} noun="Dustbin Unit">
        <group position={[0, cy, c.dp / 2 + FT / 2 + 0.001]}>
          <Front w={c.w - 2 * GAP} h={dh} edge="top">
            <Handle orient="h" w={c.w} h={dh} anchor="top" />
          </Front>
        </group>
        <group position={[0, c.plinth + 0.03, c.dp / 2 - 0.3]}>
          <Box size={[innerW, 0.01, 0.46]} position={[0, 0, 0]} material={getUtilMaterial("steel")} cast={false} />
          {Array.from({ length: n }).map((_, i) => (
            <Dustbin key={i} r={r} h={Math.min(0.4, dh - 0.12)} position={[-innerW / 2 + (innerW / n) * (i + 0.5), 0.005, 0]} />
          ))}
        </group>
      </SlideOut>
    </>
  );
}

/* ───────────────────────── corner mechanisms ───────────────────────── */

function blindLeft(c: ReturnType<typeof useRenderCtx>): boolean {
  // the blind side faces the nearer perpendicular wall
  const { m, d } = c;
  const worldDir: [number, number] = m.rot === 0 || m.rot === 180 ? [m.x < d.room.width / 2 ? -1 : 1, 0] : [0, m.z < d.room.depth / 2 ? -1 : 1];
  const localRight: [number, number] = m.rot === 0 ? [1, 0] : m.rot === 180 ? [-1, 0] : m.rot === 90 ? [0, -1] : [0, 1];
  return worldDir[0] * localRight[0] + worldDir[1] * localRight[1] < 0;
}

export function BaseCorner() {
  const c = useRenderCtx();
  const left = blindLeft(c);
  const hw = c.m.params.hardware ?? "corner-magic";
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const doorW = Math.min(0.46, c.w - 0.5);
  const dx = (left ? 1 : -1) * (c.w / 2 - doorW / 2 - GAP);
  const blindW = c.w - doorW - 3 * GAP;
  const bx = (left ? -1 : 1) * (c.w / 2 - blindW / 2 - GAP);
  const id = `${c.m.id}:corner`;
  const trayRef = useRef<THREE.Group>(null);
  const tray2Ref = useRef<THREE.Group>(null);
  const spinA = useRef<THREE.Group>(null);
  const spinB = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Group>(null);
  const side = left ? 1 : -1;
  useAnimated(id, (p) => {
    if (doorRef.current) doorRef.current.rotation.y = (left ? 1 : -1) * p * 1.9;
    if (hw.startsWith("corner-magic")) {
      if (trayRef.current) {
        trayRef.current.position.z = p * 0.36;
        trayRef.current.position.x = side * -p * 0.12;
      }
      if (tray2Ref.current) {
        tray2Ref.current.position.z = p * 0.12;
        tray2Ref.current.position.x = side * p * 0.28;
      }
    } else if (hw === "corner-carousel") {
      if (spinA.current) spinA.current.rotation.y = p * Math.PI * 1.2;
      if (spinB.current) spinB.current.rotation.y = -p * Math.PI * 0.8;
    } else if (hw === "corner-lemans") {
      if (trayRef.current) {
        trayRef.current.position.z = p * 0.32;
        trayRef.current.rotation.y = side * p * 0.9;
      }
      if (tray2Ref.current) {
        tray2Ref.current.position.z = p * 0.14;
        tray2Ref.current.rotation.y = side * p * 0.5;
      }
    } else if (trayRef.current) {
      trayRef.current.position.z = p * 0.38;
    }
  });
  const iw = c.w - 2 * T - 0.04;
  const trayY = c.plinth + 0.18;
  const wire = getUtilMaterial("chrome");
  return (
    <>
      <Carcass top="rails" />
      {/* door + mechanism; the blind panel is part of the same part, so the whole front responds */}
      <Interactive id={id} moduleId={c.m.id} noun={hw === "corner-carousel" ? "Carousel" : hw === "corner-lemans" ? "LeMans Shelf" : "Corner Unit"}>
        <group position={[bx, cy, c.dp / 2 + FT / 2 + 0.001]}>
          <Front w={blindW} h={dh} edge="top" />
        </group>
        <group ref={doorRef} position={[dx + (left ? -doorW / 2 : doorW / 2), cy, c.dp / 2 + FT / 2 + 0.001]}>
          <group position={[left ? doorW / 2 : -doorW / 2, 0, 0]}>
            <Front w={doorW} h={dh} edge="top">
              <Handle orient="v" w={doorW} h={dh} anchor="top" free={left ? "right" : "left"} />
            </Front>
          </group>
        </group>
        {/* mechanism */}
        {hw === "corner-carousel" ? (
          <group position={[0, 0, 0.0]}>
            {[0.22, 0.48].map((k, i) => (
              <group key={k} ref={i === 0 ? spinA : spinB} position={[side * -0.06, trayY + k, -0.02]}>
                <Cyl r={0.27} h={0.008} position={[0, 0, 0]} material={wire} segments={30} />
                <Cyl r={0.272} h={0.03} position={[0, 0.015, 0]} material={wire} segments={30} cast={false} />
                <Cyl r={0.012} h={0.5} position={[0, 0.2, 0]} material={wire} segments={10} />
                {c.showContents && <Jars width={0.3} position={[0, 0.004, 0]} count={4} />}
              </group>
            ))}
          </group>
        ) : (
          <>
            <group ref={trayRef} position={[0, trayY, 0]}>
              <WireTray w={iw * 0.5} d={c.dp - 0.14} position={[side * -(iw * 0.22), 0, -0.02]} />
              {c.showContents && <Pot position={[side * -(iw * 0.22), 0.004, 0]} r={0.09} h={0.11} />}
            </group>
            <group ref={tray2Ref} position={[0, trayY + 0.28, 0]}>
              <WireTray w={iw * 0.5} d={c.dp - 0.14} position={[side * (iw * 0.22), 0, -0.02]} />
              {c.showContents && <PlateStack position={[side * (iw * 0.22), 0.004, 0]} r={0.12} n={6} />}
            </group>
          </>
        )}
      </Interactive>
    </>
  );
}
