/**
 * Renderer registry: ModuleKind → component. A new cabinet kind is one entry
 * here (plus its catalogue entry); the scene, layout engine and pricing need no
 * changes.
 */
import { Component, memo, useMemo, type ComponentType, type ReactNode } from "react";
import type { KitchenDesignConfig, ModuleInstance, ModuleKind } from "../../model/types";
import { getModuleType } from "../../data/modules";
import { mm, rotToRad } from "../../model/units";
import { Box, buildRenderCtx, RenderContext, SelectionOutline } from "../common";
import { CounterItem } from "../appliances";
import { getUtilMaterial } from "../materials";
import { useSelection } from "../../store/interactionStore";
import { useUi } from "../../store/uiStore";
import { useDrag } from "../../store/dragStore";
import {
  BaseBottle,
  BaseCorner,
  BaseCutlery,
  BaseDishwasher,
  BaseDoors,
  BaseDrawers,
  BaseDustbin,
  BaseGlass,
  BaseHob,
  BaseOpen,
  BaseSink,
  BaseWasher,
} from "./base";
import { WallChimney, WallDoors, WallGlass, WallLift, WallMicrowave, WallOpen } from "./wall";
import { Filler, TallFridge, TallGlass, TallOven, TallPantry, TallStorage, TallUtility } from "./tall";

export const MODULE_RENDERERS: Record<ModuleKind, ComponentType> = {
  "base-doors": BaseDoors,
  "base-drawers": BaseDrawers,
  "base-sink": BaseSink,
  "base-hob": BaseHob,
  "base-corner": BaseCorner,
  "base-bottle": BaseBottle,
  "base-dustbin": BaseDustbin,
  "base-open": BaseOpen,
  "base-dishwasher": BaseDishwasher,
  "base-washer": BaseWasher,
  "base-cutlery": BaseCutlery,
  "base-glass": BaseGlass,
  "wall-doors": WallDoors,
  "wall-lift": WallLift,
  "wall-glass": WallGlass,
  "wall-open": WallOpen,
  "wall-chimney": WallChimney,
  "wall-microwave": WallMicrowave,
  "wall-corner": WallDoors,
  "wall-loft": WallDoors,
  "tall-pantry": TallPantry,
  "tall-fridge": TallFridge,
  "tall-oven": TallOven,
  "tall-storage": TallStorage,
  "tall-utility": TallUtility,
  "tall-glass": TallGlass,
  filler: Filler,
};

/** A failing renderer degrades to a plain box instead of taking the whole scene down. */
class ModuleBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("Kitchen module failed to render:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface ModuleViewProps {
  m: ModuleInstance;
  design: KitchenDesignConfig;
  /** Serialised look-affecting settings; changes only when the visuals change. */
  lookKey: string;
}

function ModuleViewImpl({ m, design }: ModuleViewProps) {
  const t = getModuleType(m.typeId);
  const Renderer = MODULE_RENDERERS[t.kind] ?? Filler;
  const plinthM = t.zone === "wall" ? 0 : mm(design.style.plinthHeight);
  const ctx = useMemo(() => buildRenderCtx(m, design, plinthM), [m, design, plinthM]);
  const selected = useSelection((s) => s.selectedId === m.id);
  const hovered = useSelection((s) => s.hoveredModuleId === m.id);
  const designMode = useUi((s) => s.mode === "design");
  const preview = useDrag((s) => (s.active?.kind === "module" && s.active.id === m.id ? s.preview : null));
  const itemTarget = useDrag((s) => s.itemTarget === m.id);
  const y0 = mm(m.elevation);
  const fallback = <Box size={[ctx.w, ctx.h, ctx.dp]} position={[0, y0 + ctx.h / 2, 0]} material={getUtilMaterial("plastic")} />;

  return (
    <group
      position={[mm(preview ? preview.x : m.x), y0, mm(preview ? preview.z : m.z)]}
      rotation={[0, rotToRad(preview ? preview.rot : m.rot), 0]}
      userData={{ moduleId: m.id }}
      // press-and-drag anywhere on a cabinet or appliance picks it up (see DragController)
      onPointerDown={(e) => {
        if (useUi.getState().mode !== "design" || e.nativeEvent.button !== 0) return;
        useDrag.getState().arm({ kind: "module", id: m.id }, e.nativeEvent.clientX, e.nativeEvent.clientY, { planeY: e.point.y, ox: m.x - e.point.x * 1000, oz: m.z - e.point.z * 1000 });
      }}
      // anything on the cabinet that isn't an openable part still selects the cabinet
      onClick={(e) => {
        if (useUi.getState().mode !== "design") return;
        e.stopPropagation();
        useSelection.getState().select(m.id);
      }}
      onPointerOver={(e) => {
        if (useUi.getState().mode !== "design") return;
        e.stopPropagation();
        useSelection.getState().setHoveredModule(m.id);
      }}
      onPointerOut={() => useSelection.getState().setHoveredModule(null)}
    >
      <ModuleBoundary fallback={fallback}>
        <RenderContext.Provider value={ctx}>
          <Renderer />
        </RenderContext.Provider>
      </ModuleBoundary>
      {(m.params.topItems ?? []).map((id, i, all) => (
        <group
          key={id}
          onPointerDown={(e) => {
            if (useUi.getState().mode !== "design" || e.nativeEvent.button !== 0) return;
            e.stopPropagation();
            useDrag.getState().arm({ kind: "item", id: m.id, itemId: id }, e.nativeEvent.clientX, e.nativeEvent.clientY, { planeY: e.point.y, ox: 0, oz: 0 });
          }}
        >
          <CounterItem id={id} position={[(i - (all.length - 1) / 2) * 0.4, ctx.h + mm(design.style.counterThickness), -ctx.dp / 2 + 0.25]} />
        </group>
      ))}
      {designMode && itemTarget && <SelectionOutline w={ctx.w} h={ctx.h} d={ctx.dp} y0={0} opacity={1} color="#7fd18b" />}
      {designMode && (selected || hovered || preview) && <SelectionOutline w={ctx.w} h={ctx.h} d={ctx.dp} y0={0} opacity={selected || preview ? 1 : 0.45} color={preview && !preview.valid ? "#ef5350" : preview ? "#7fd18b" : selected ? "#e2cd9a" : "#c6a86a"} />}
    </group>
  );
}

export const ModuleView = memo(ModuleViewImpl, (a, b) => a.m === b.m && a.lookKey === b.lookKey);
