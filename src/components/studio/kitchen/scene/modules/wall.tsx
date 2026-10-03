/** Wall-cabinet renderers. Local origin: module underside, back at -dp/2, front at +dp/2. */
import { Box, Carcass, GAP, Led, RenderContext, T, glassCtx, useRenderCtx } from "../common";
import { Glasses, Jars, PlateStack } from "../contents";
import { Chimney, Microwave } from "../appliances";
import { getHandleMaterial } from "../materials";
import { DoorPair, LiftDoor, SlidingPair } from "./parts";

function ShelfItems({ shelves, jars = true }: { shelves: number; jars?: boolean }) {
  const c = useRenderCtx();
  if (!c.showContents) return null;
  const hi = c.h - 2 * T;
  return (
    <>
      {Array.from({ length: shelves + 1 }).map((_, i) => {
        const y = T + (hi / (shelves + 1)) * i + (i > 0 ? T * 0.4 : 0);
        const w = c.w - 2 * T - 0.04;
        if (i % 3 === 0) return <Glasses key={i} width={w} position={[0, y, 0]} count={Math.max(2, Math.floor(w / 0.09))} />;
        if (i % 3 === 1) return jars ? <Jars key={i} width={w} position={[0, y, 0]} /> : null;
        return <PlateStack key={i} position={[-w / 4, y, 0]} r={0.12} n={6} />;
      })}
    </>
  );
}

export function WallDoors() {
  const c = useRenderCtx();
  const shelves = c.m.params.shelves ?? 2;
  return (
    <>
      <Carcass top="full" plinth={false} shelves={shelves} />
      <ShelfItems shelves={shelves} />
      <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={c.h - 2 * GAP} cy={c.h / 2} edge="bottom" anchor="bottom" noun="Wall Cabinet" />
    </>
  );
}

export function WallLift() {
  const c = useRenderCtx();
  const shelves = c.m.params.shelves ?? 1;
  return (
    <>
      <Carcass top="full" plinth={false} shelves={shelves} />
      <ShelfItems shelves={shelves} />
      <LiftDoor id={`${c.m.id}:lift`} w={c.w - 2 * GAP} h={c.h - 2 * GAP} top={c.h - GAP} />
      {/* the hydraulic arms */}
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.012, 0.012, c.dp * 0.7]} position={[s * (c.w / 2 - T - 0.03), c.h - 0.06, 0]} material={getHandleMaterial("brushed-steel")} cast={false} />
      ))}
    </>
  );
}

/**
 * Glass wall cabinet — the whole family: hinged, sliding or lift-up doors; any tint
 * (clear, frosted, smoked, bronze, grey, fluted); aluminium, black, wood or no frame;
 * glass or board shelves; mirrored back; LED.
 */
export function WallGlass() {
  const c = useRenderCtx();
  const g = glassCtx(c);
  const shelves = c.m.params.shelves ?? 2;
  const mode = c.m.params.glassMode ?? "hinged";
  const glassShelves = c.m.params.glassShelves ?? false;
  const mirrorBack = c.m.params.mirrorBack ?? false;
  return (
    <RenderContext.Provider value={g}>
      <Carcass top="full" plinth={false} shelves={shelves} glassShelves={glassShelves} mirrorBack={mirrorBack} ledShelves autoLed={false} />
      <ShelfItems shelves={shelves} />
      {g.ledOn && (
        <>
          <Led size={[0.008, c.h - 0.1, 0.006]} position={[-c.w / 2 + T + 0.015, c.h / 2, c.dp / 2 - 0.04]} />
          <Led size={[0.008, c.h - 0.1, 0.006]} position={[c.w / 2 - T - 0.015, c.h / 2, c.dp / 2 - 0.04]} />
          <Led size={[c.w - 2 * T - 0.04, 0.006, 0.01]} position={[0, c.h - T - 0.01, c.dp / 2 - 0.04]} />
        </>
      )}
      {mode === "sliding" ? (
        <SlidingPair id={`${c.m.id}:slide`} w={c.w} h={c.h - 2 * GAP} cy={c.h / 2} />
      ) : mode === "lift" ? (
        <LiftDoor id={`${c.m.id}:lift`} w={c.w - 2 * GAP} h={c.h - 2 * GAP} top={c.h - GAP} />
      ) : (
        <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={c.h - 2 * GAP} cy={c.h / 2} edge="none" anchor="bottom" noun="Glass Cabinet" />
      )}
    </RenderContext.Provider>
  );
}

export function WallOpen() {
  const c = useRenderCtx();
  const shelves = c.m.params.shelves ?? 2;
  return (
    <>
      <Carcass top="full" plinth={false} shelves={shelves} />
      <ShelfItems shelves={shelves} />
      {c.ledOn && <Led size={[c.w - 2 * T - 0.04, 0.006, 0.01]} position={[0, c.h - T - 0.01, c.dp / 2 - 0.05]} />}
    </>
  );
}

export function WallChimney() {
  const c = useRenderCtx();
  return <Chimney moduleId={c.m.id} w={c.w} roomHeight={c.d.room.height / 1000} bottom={c.m.elevation / 1000} depth={c.dp} cover={c.shutterMat} position={[0, 0, 0]} />;
}

export function WallMicrowave() {
  const c = useRenderCtx();
  return (
    <>
      <Carcass top="full" plinth={false} shelves={0} />
      <Microwave moduleId={c.m.id} position={[0, T + 0.005, 0.02]} w={Math.min(0.595, c.w - 2 * T - 0.004)} d={Math.min(0.45, c.dp - 0.03)} />
      <Box size={[c.w - 2 * T, T * 0.8, c.dp - 0.03]} position={[0, T + 0.4, -0.005]} material={c.bodyMat} />
      <DoorPair idPrefix={`${c.m.id}:flap`} width={c.w} h={c.h - 0.4 - T - 2 * GAP} cy={c.h - (c.h - 0.4 - T) / 2} edge="bottom" anchor="bottom" noun="Wall Cabinet" />
    </>
  );
}
