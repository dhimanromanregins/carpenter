/**
 * KitchenScene: composes the room, modules, countertops, lighting, overlays and
 * the mode-specific camera (orbit / first-person / presentation). It reads the
 * design from the store and contains no business logic of its own.
 */
import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrthographicCamera } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { KitchenDesignConfig } from "../model/types";
import { buildCounterSlabs } from "../engine/countertop";
import { mm } from "../model/units";
import { useKitchenStore } from "../store/kitchenStore";
import { useSelection } from "../store/interactionStore";
import { useUi } from "../store/uiStore";
import { ModuleView } from "./modules";
import { Countertops } from "./Countertops";
import { ElectricalPlates, GhostKitchen, ServiceRoutes } from "./Services";
import { RoomShell } from "./Room";
import { KitchenLighting } from "./Lighting";
import { Clearances, Measurements, ServicePoints } from "./Overlays";
import { CameraRig, FirstPersonController, PresentationController } from "./Controls";
import { SCENE_MOODS } from "./lightingConfig";
import { Box, Cyl } from "./common";
import { getUtilMaterial } from "./materials";
import { registerCapture } from "./capture";
import { DragController } from "./DragController";
import { useDrag } from "../store/dragStore";
import { makeModule } from "../engine/layouts";
import { SelectionOutline } from "./common";
import { rotToRad } from "../model/units";

/** Outline showing where a card dragged in from the library will land. */
function DropGhost({ design }: { design: KitchenDesignConfig }) {
  const drop = useDrag((s) => s.drop);
  if (!drop) return null;
  const m = makeModule(drop.typeId, {}, design.style);
  return (
    <group position={[mm(drop.x), mm(m.elevation), mm(drop.z)]} rotation={[0, rotToRad(drop.rot), 0]}>
      <SelectionOutline w={mm(m.width)} h={mm(m.height)} d={mm(m.depth)} y0={0} color={drop.valid ? "#7fd18b" : "#ef5350"} />
    </group>
  );
}

function Stools({ design }: { design: KitchenDesignConfig }) {
  const slabs = useMemo(() => buildCounterSlabs(design), [design.modules, design.style, design.room]); // eslint-disable-line react-hooks/exhaustive-deps
  const seat = getUtilMaterial("fabric");
  const steel = getUtilMaterial("steel");
  const out: { x: number; z: number; h: number }[] = [];
  slabs.forEach((s) => {
    const sides: { v: number; axis: "x" | "z"; sign: 1 | -1 }[] = [
      { v: s.overhang.pz, axis: "z", sign: 1 },
      { v: s.overhang.nz, axis: "z", sign: -1 },
      { v: s.overhang.px, axis: "x", sign: 1 },
      { v: s.overhang.nx, axis: "x", sign: -1 },
    ];
    sides
      .filter((x) => x.v >= 280)
      .forEach((x) => {
        const len = x.axis === "z" ? s.x1 - s.x0 : s.z1 - s.z0;
        const n = Math.max(1, Math.min(4, Math.floor(len / 650)));
        for (let i = 0; i < n; i++) {
          const along = (len * (i + 0.5)) / n;
          const px = x.axis === "z" ? s.x0 + along : x.sign > 0 ? s.x1 + 280 : s.x0 - 280;
          const pz = x.axis === "z" ? (x.sign > 0 ? s.z1 + 280 : s.z0 - 280) : s.z0 + along;
          out.push({ x: mm(px), z: mm(pz), h: s.bar ? 0.74 : 0.66 });
        }
      });
  });
  return (
    <group>
      {out.map((o, i) => (
        <group key={i} position={[o.x, 0, o.z]}>
          <Cyl r={0.17} h={0.05} position={[0, o.h, 0]} material={seat} segments={20} />
          <Cyl r={0.02} h={o.h} position={[0, o.h / 2, 0]} material={steel} segments={10} />
          <Cyl r={0.15} h={0.015} position={[0, 0.0075, 0]} material={steel} segments={20} />
          <Box size={[0.26, 0.012, 0.012]} position={[0, o.h * 0.42, 0]} material={steel} cast={false} />
        </group>
      ))}
    </group>
  );
}

function Exposure({ value }: { value: number }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = value;
  }, [gl, value]);
  return null;
}

function CaptureBridge() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    registerCapture((scale) => {
      const prev = gl.getPixelRatio();
      gl.setPixelRatio(Math.max(prev, scale));
      gl.render(scene, camera);
      const url = gl.domElement.toDataURL("image/png");
      gl.setPixelRatio(prev);
      return url;
    });
    return () => registerCapture(null);
  }, [gl, scene, camera]);
  return null;
}

function SceneContents({ design }: { design: KitchenDesignConfig }) {
  const mode = useUi((s) => s.mode);
  const ortho = useUi((s) => s.ortho);
  const showMeasurements = useUi((s) => s.showMeasurements);
  const showClearances = useUi((s) => s.showClearances);
  const showPoints = useUi((s) => s.showPoints);
  const serviceView = useUi((s) => s.serviceView);
  const inService = serviceView !== "none" && mode === "design";
  const mood = SCENE_MOODS[design.lighting.scene];
  const W = mm(design.room.width);
  const D = mm(design.room.depth);

  // modules re-render only when their own data or the look-affecting settings change
  const lookKey = useMemo(
    () => JSON.stringify([design.style, design.lighting.insideCabinet, design.lighting.shelfLeds, design.lighting.temperature, design.lighting.brightness, design.lighting.scene, design.showContents, design.room.height]),
    [design.style, design.lighting.insideCabinet, design.lighting.shelfLeds, design.lighting.temperature, design.lighting.brightness, design.lighting.scene, design.showContents, design.room.height]
  );

  return (
    <>
      {ortho && mode === "design" && <OrthographicCamera key="ortho" makeDefault position={[W / 2 + 4, 4, D + 6]} near={-60} far={80} zoom={110} />}

      <Suspense fallback={null}>
        <KitchenLighting design={design} />
        <RoomShell design={design} />
        {inService ? (
          <>
            <GhostKitchen design={design} />
            <ServiceRoutes design={design} view={serviceView} />
          </>
        ) : (
          <>
            {design.modules.map((m) => (
              <ModuleView key={m.id} m={m} design={design} lookKey={lookKey} />
            ))}
            <Countertops design={design} />
            <Stools design={design} />
          </>
        )}
        <DropGhost design={design} />
        <ElectricalPlates design={design} labels={inService && serviceView === "electrical"} />
        <ContactShadows position={[W / 2, 0.004, D / 2]} opacity={0.45} scale={Math.max(W, D) * 1.4} blur={2.2} far={2.4} />
      </Suspense>

      {mode === "design" && <DragController />}
      {mode === "design" && <CameraRig key={ortho ? "o" : "p"} design={design} />}
      {mode === "walk" && <FirstPersonController design={design} />}
      {mode === "present" && <PresentationController design={design} />}

      {showMeasurements && mode !== "present" && <Measurements design={design} />}
      {showClearances && mode !== "present" && <Clearances design={design} />}
      {showPoints && mode === "design" && <ServicePoints design={design} />}
      <CaptureBridge />
      <Exposure value={mood.exposure} />

      <EffectComposer multisampling={4}>
        <Bloom intensity={mood.bloom} luminanceThreshold={0.95} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.2} darkness={mood.vignette} />
      </EffectComposer>
    </>
  );
}

export function KitchenScene() {
  const design = useKitchenStore((s) => s.design);
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.8]}
      camera={{ fov: 38, near: 0.05, far: 80, position: [6, 4, 8] }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onPointerMissed={() => {
        if (useUi.getState().mode === "design") useSelection.getState().select(null);
      }}
    >
      <SceneContents design={design} />
    </Canvas>
  );
}
