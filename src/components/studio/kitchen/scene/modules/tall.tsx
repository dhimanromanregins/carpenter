/** Tall-unit renderers: pantry, refrigerator enclosure, oven tower, storage, utility. */
import { Box, Carcass, FT, Front, GAP, Handle, Led, RenderContext, T, glassCtx, useRenderCtx } from "../common";
import { Bottles, Glasses, Jars, PlateStack } from "../contents";
import { Fridge, Microwave, Oven } from "../appliances";
import { getUtilMaterial } from "../materials";
import { DoorPair, DrawerUnit, SlidingPair, SlideOut, WireTray } from "./parts";
import { getProduct } from "../../data/products";
import { mm } from "../../model/units";

export function TallPantry() {
  const c = useRenderCtx();
  const shelves = c.m.params.shelves ?? 5;
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const iw = c.w - 2 * T - 0.04;
  const bd = c.dp - 0.1;
  const rail = getUtilMaterial("steel");
  const usable = dh - 0.12;
  const gap = usable / shelves;
  return (
    <>
      <Carcass top="full" />
      <SlideOut id={`${c.m.id}:pantry`} travel={c.dp * 0.85} noun="Pantry" openVerb="Open" closeVerb="Close">
        <group position={[0, cy, c.dp / 2 + FT / 2 + 0.001]}>
          <Front w={c.w - 2 * GAP} h={dh} edge="none">
            <Handle orient="v" w={c.w} h={dh} anchor="mid" free="right" />
          </Front>
        </group>
        <group position={[0, c.plinth + 0.06, c.dp / 2 - bd / 2 - 0.012]}>
          <Box size={[0.008, usable, bd]} position={[-iw / 2, usable / 2, 0]} material={rail} cast={false} />
          <Box size={[0.008, usable, bd]} position={[iw / 2, usable / 2, 0]} material={rail} cast={false} />
          {Array.from({ length: shelves }).map((_, i) => (
            <group key={i} position={[0, 0.02 + i * gap, 0]}>
              <WireTray w={iw} d={bd - 0.03} rim={0.03} position={[0, 0, 0]} />
              {c.showContents && (i % 3 === 0 ? <Bottles width={iw - 0.04} position={[0, 0.004, -bd / 5]} /> : <Jars width={iw - 0.04} position={[0, 0.004, -bd / 5]} />)}
              {c.showContents && i % 3 === 2 && <Box size={[iw * 0.35, 0.12, bd * 0.35]} position={[iw * 0.22, 0.064, bd / 5]} material={getUtilMaterial("foam")} />}
            </group>
          ))}
        </group>
      </SlideOut>
    </>
  );
}

export function TallFridge() {
  const c = useRenderCtx();
  const prod = getProduct(c.m.params.appliance ?? "fridge-double");
  const fw = Math.min(mm(prod?.dims?.[0] ?? 700), c.w - 2 * T - 0.01);
  const fh = mm(prod?.dims?.[1] ?? 1750);
  const double = (c.m.params.appliance ?? "fridge-double") !== "fridge-single";
  const loftBottom = c.plinth + fh + 0.04;
  const loftH = Math.max(0.2, c.h - loftBottom - GAP);
  return (
    <>
      <Carcass top="full" />
      {/* niche shelf above the fridge */}
      <Box size={[c.w - 2 * T, T, c.dp - 0.01]} position={[0, loftBottom - T / 2, -0.005]} material={c.bodyMat} />
      <Fridge moduleId={c.m.id} w={fw} h={fh} d={c.dp - 0.02} doubleDoor={double} position={[0, c.plinth + 0.02, -0.01]} />
      <DoorPair idPrefix={`${c.m.id}:loft`} width={c.w} h={loftH - 0.01} cy={loftBottom + loftH / 2} edge="none" anchor="bottom" noun="Loft Cabinet" />
    </>
  );
}

export function TallOven() {
  const c = useRenderCtx();
  const hasOven = c.m.typeId === "tall-oven";
  const iw = c.w - 2 * T - 0.004;
  const drawerH = 0.42;
  const bottomY = c.plinth;
  const ovenY = bottomY + drawerH + 0.04;
  const ovenH = 0.595;
  const microY = hasOven ? ovenY + ovenH + 0.02 : ovenY;
  const microH = 0.39;
  const storageBottom = microY + microH + 0.03;
  const storageH = Math.max(0.2, c.h - storageBottom - GAP);
  const fill = c.shutterMat;
  return (
    <>
      <Carcass top="full" />
      <DrawerUnit id={`${c.m.id}:drawer0`} w={c.w} h={drawerH - 0.01} cy={bottomY + drawerH / 2} travel={c.dp * 0.8} boxDepth={c.dp - 0.1} boxHeight={0.3} contents={() => <Jars width={0.4} position={[0, 0, 0]} count={3} />} />
      {hasOven && <Oven moduleId={c.m.id} position={[0, ovenY, 0.01]} w={Math.min(0.595, iw)} d={Math.min(0.55, c.dp - 0.04)} />}
      <Microwave moduleId={c.m.id} position={[0, microY, 0.01]} w={Math.min(0.595, iw)} d={Math.min(0.45, c.dp - 0.04)} />
      <Box size={[iw, 0.022, FT]} position={[0, ovenY - 0.02, c.dp / 2 + FT / 2 - 0.004]} material={fill} />
      <Box size={[iw, 0.022, FT]} position={[0, storageBottom - 0.015, c.dp / 2 + FT / 2 - 0.004]} material={fill} />
      <DoorPair idPrefix={`${c.m.id}:storage`} width={c.w} h={storageH - 0.01} cy={storageBottom + storageH / 2} edge="none" anchor="bottom" noun="Storage Cabinet" />
    </>
  );
}

/** Full-height glass display tower (crockery / crystal / bar). */
export function TallGlass() {
  const c = useRenderCtx();
  const g = glassCtx(c);
  const shelves = c.m.params.shelves ?? 5;
  const dh = c.h - c.plinth - 2 * GAP;
  const cy = c.plinth + GAP + dh / 2;
  const mode = c.m.params.glassMode ?? "hinged";
  return (
    <RenderContext.Provider value={g}>
      <Carcass top="full" shelves={shelves} glassShelves={c.m.params.glassShelves ?? true} mirrorBack={c.m.params.mirrorBack ?? true} ledShelves autoLed={false} />
      {c.showContents &&
        Array.from({ length: shelves + 1 }).map((_, i) => {
          const y = c.plinth + T + ((c.h - c.plinth - 2 * T) / (shelves + 1)) * i + (i ? 0.01 : 0);
          const w = c.w - 2 * T - 0.06;
          return i % 3 === 0 ? <Glasses key={i} width={w} position={[0, y, 0]} count={Math.max(2, Math.floor(w / 0.09))} /> : i % 3 === 1 ? <PlateStack key={i} position={[0, y, 0]} r={Math.min(0.12, w / 2.4)} n={7} /> : <Bottles key={i} width={w} position={[0, y, 0]} />;
        })}
      {g.ledOn && (
        <>
          <Led size={[0.008, c.h - c.plinth - 0.1, 0.006]} position={[-c.w / 2 + T + 0.015, c.plinth + (c.h - c.plinth) / 2, c.dp / 2 - 0.04]} />
          <Led size={[0.008, c.h - c.plinth - 0.1, 0.006]} position={[c.w / 2 - T - 0.015, c.plinth + (c.h - c.plinth) / 2, c.dp / 2 - 0.04]} />
        </>
      )}
      {mode === "sliding" ? <SlidingPair id={`${c.m.id}:slide`} w={c.w} h={dh} cy={cy} /> : <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={dh} cy={cy} edge="none" anchor="mid" noun="Glass Display" />}
    </RenderContext.Provider>
  );
}

export function TallStorage() {
  const c = useRenderCtx();
  const shelves = c.m.params.shelves ?? 5;
  const dh = c.h - c.plinth - 2 * GAP;
  return (
    <>
      <Carcass top="full" shelves={shelves} />
      {c.showContents && (
        <>
          {Array.from({ length: shelves + 1 }).map((_, i) => (
            <Jars key={i} width={c.w - 2 * T - 0.06} position={[0, c.plinth + T + ((c.h - c.plinth - 2 * T) / (shelves + 1)) * i + (i ? T * 0.4 : 0), 0]} />
          ))}
        </>
      )}
      <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={dh} cy={c.plinth + GAP + dh / 2} edge="none" anchor="mid" noun="Tall Cabinet" />
    </>
  );
}

export function TallUtility() {
  const c = useRenderCtx();
  const dh = c.h - c.plinth - 2 * GAP;
  const dark = getUtilMaterial("dark");
  return (
    <>
      <Carcass top="full" shelves={c.m.params.shelves ?? 3} />
      {c.showContents && (
        <>
          {[-1, 0, 1].map((k) => (
            <Box key={k} size={[0.025, 1.3, 0.025]} position={[k * 0.1, c.plinth + 0.7, c.dp / 2 - 0.12]} material={dark} />
          ))}
        </>
      )}
      <DoorPair idPrefix={`${c.m.id}:door`} width={c.w} h={dh} cy={c.plinth + GAP + dh / 2} edge="none" anchor="mid" noun="Utility Cabinet" forceSingle />
    </>
  );
}

export function Filler() {
  const c = useRenderCtx();
  return <Box size={[c.w, c.h - c.plinth, c.dp]} position={[0, c.plinth + (c.h - c.plinth) / 2, 0]} material={c.shutterMat} />;
}
