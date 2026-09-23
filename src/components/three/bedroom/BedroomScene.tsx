import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SPAWN, spaceAt } from "./bedroomLayout";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { BedroomFurniture } from "./BedroomFurniture";
import { BedroomLighting } from "./BedroomLighting";
import { BedroomWalkController } from "./BedroomWalkController";
import {
  CameraSpaceContext,
  EveningMixContext,
  EveningTargetContext,
  HintsContext,
  OpeningsContext,
  type OpeningsControl,
} from "./bedroomState";
import { Entrance } from "./Entrance";
import { HallFurniture } from "./HallFurniture";
import { HallShell } from "./HallShell";
import { RoomShell } from "./RoomShell";
import { SpaceCull } from "./SpaceCull";
import { seesBedroom, seesHall } from "./spaceRules";
import { Wardrobe } from "./Wardrobe";

export type BedroomQuality = "high" | "balanced";

const scratchScale = new THREE.Vector3();

/** Reports the viewer's space whenever it changes. */
function CameraSpaceTracker({ onChange }: { onChange: (space: number) => void }) {
  const last = useMemo(() => ({ space: -1 }), []);
  useFrame(({ camera }) => {
    const s = spaceAt(camera.position.x, camera.position.z);
    if (s !== last.space) {
      last.space = s;
      onChange(s);
    }
  });
  return null;
}

/**
 * Compiles every shader program in the background (KHR_parallel_shader_compile)
 * before the first frame. The page keeps the frame loop paused until then —
 * a synchronous first-frame compile of a scene this size freezes the tab for
 * many seconds.
 */
function Precompile({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    // Handle for browser-based profiling. Dev builds only.
    if (import.meta.env.DEV) Object.assign(window, { __three: { gl, scene, camera } });
    // Small decor (fruit, candles, knobs, stems) casts shadows too small to
    // see from the sun but costs a draw call each in the shadow pass.
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.castShadow || (mesh as THREE.InstancedMesh).isInstancedMesh) return;
      mesh.geometry.computeBoundingSphere();
      const r = mesh.geometry.boundingSphere!.radius * mesh.getWorldScale(scratchScale).x;
      if (r < 0.09) mesh.castShadow = false;
    });
    let alive = true;
    // Let the rest of the tree mount (and its effects run) first.
    const id = requestAnimationFrame(() => {
      gl.compileAsync(scene, camera)
        .catch(() => undefined)
        .finally(() => {
          if (alive) onReady();
        });
    });
    return () => {
      alive = false;
      cancelAnimationFrame(id);
    };
  }, [gl, scene, camera, onReady]);
  return null;
}

/**
 * Everything inside the <Canvas>: the bedroom, the living hall outside its
 * door and the balcony beyond. "high" adds planar reflections (floors and
 * mirror), ambient occlusion and 4K sun shadows; "balanced" drops those
 * for phones and integrated GPUs.
 */
export function BedroomScene({
  evening,
  quality,
  hints,
  openings,
  onReady,
}: {
  evening: boolean;
  quality: BedroomQuality;
  hints: boolean;
  openings: OpeningsControl;
  onReady: () => void;
}) {
  // Starts wherever the toggle starts so the first frame doesn't fade in.
  const mix = useMemo(() => ({ current: evening ? 1 : 0 }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const high = quality === "high";
  const [space, setSpace] = useState(() => spaceAt(SPAWN.x, SPAWN.z));

  return (
    <EveningMixContext.Provider value={mix}>
      <EveningTargetContext.Provider value={evening}>
        <HintsContext.Provider value={hints}>
          <OpeningsContext.Provider value={openings}>
            <CameraSpaceContext.Provider value={space}>
              <CameraSpaceTracker onChange={setSpace} />
              <color attach="background" args={["#1c1916"]} />
              <BedroomLighting evening={evening} highQuality={high} />
              <RoomShell reflections={high} />
              <SpaceCull visibleWhen={seesBedroom}>
                <BedroomFurniture reflections={high} />
                <Wardrobe />
              </SpaceCull>
              <HallShell reflections={high} />
              <SpaceCull visibleWhen={seesHall}>
                <HallFurniture />
              </SpaceCull>
              <Entrance />
              <BedroomWalkController />
              <Precompile onReady={onReady} />

              {high ? (
                <EffectComposer multisampling={4}>
                  <N8AO halfRes aoRadius={0.5} distanceFalloff={0.6} intensity={2.2} quality="medium" />
                  <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1.05} luminanceSmoothing={0.3} />
                  <ToneMapping mode={ToneMappingMode.NEUTRAL} />
                  <Vignette offset={0.32} darkness={0.42} />
                </EffectComposer>
              ) : (
                <EffectComposer multisampling={2}>
                  <Bloom mipmapBlur intensity={0.45} luminanceThreshold={1.05} luminanceSmoothing={0.3} />
                  <ToneMapping mode={ToneMappingMode.NEUTRAL} />
                </EffectComposer>
              )}
            </CameraSpaceContext.Provider>
          </OpeningsContext.Provider>
        </HintsContext.Provider>
      </EveningTargetContext.Provider>
    </EveningMixContext.Provider>
  );
}
