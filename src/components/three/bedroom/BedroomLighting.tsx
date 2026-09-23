import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { spaceAt } from "./bedroomLayout";
import { mixValue, useEveningMix, windowState } from "./bedroomState";
import { LightPool } from "./lightPool";
import { MixedPointLight } from "./MixedLight";

const SUN_DAY = new THREE.Color("#FFF1DC");
const SUN_DUSK = new THREE.Color("#FF9E5E");
const SKY_DAY = new THREE.Color("#DCE6F2");
const SKY_DUSK = new THREE.Color("#4A5578");

// The sun sits low in the south-west, so it streams in through both the
// bedroom's west window and the hall's south glass wall. One shadow map
// covers the whole home, aimed at its middle.
const SUN_TARGET: [number, number, number] = [2.0, 0, 2.4];
const SUN_OFFSET: [number, number, number] = [-7.5, 6.5, 6.0];

/**
 * Daylight: a low sun streaming through the openings (the walls cast it
 * into real sun patches on the floors), plus soft sky light through the
 * window and the glass wall. Evening: sun and sky fade out, warm
 * practicals take over. The eased mix lives here; everything else reads it.
 */
export function BedroomLighting({ evening, highQuality }: { evening: boolean; highQuality: boolean }) {
  const mix = useEveningMix();
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  // The floor/mirror reflectors each render the scene again; without this
  // every one of those passes would redraw the 4K sun shadow map too.
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const skyFill = useRef<THREE.DirectionalLight>(null);
  const northFill = useRef<THREE.DirectionalLight>(null);
  const sunTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...SUN_TARGET);
    return o;
  }, []);

  const frame = useRef(0);
  useFrame(({ camera }, delta) => {
    // The sun never moves, so the shadow map only has to catch moving
    // things (doors, drawers, curtains): every third frame is plenty, and
    // needsUpdate is consumed by the first render pass that frame.
    if (frame.current++ % 3 === 0) gl.shadowMap.needsUpdate = true;
    const target = evening ? 1 : 0;
    mix.current += (target - mix.current) * (1 - Math.exp(-Math.min(delta, 0.1) * 2.2));
    if (Math.abs(target - mix.current) < 1e-4) mix.current = target;
    const t = mix.current;
    // Closed drapes block the window (they also cast the sun's shadow for
    // real); sheers only diffuse it.
    const daylight = (1 - 0.85 * windowState.drapes) * (1 - 0.3 * windowState.sheers);
    // The bedroom's curtains only darken the ambient light while you're in there.
    const drapeDim = spaceAt(camera.position.x, camera.position.z) === 0 ? mixValue(1, 0.45, windowState.drapes) : 1;
    if (sun.current) {
      // Sun sinks and warms before it disappears.
      sun.current.intensity = mixValue(4.6, 0, Math.min(1, t * 1.3)) * (1 - 0.45 * windowState.sheers);
      sun.current.color.lerpColors(SUN_DAY, SUN_DUSK, Math.min(1, t * 1.6));
    }
    if (hemi.current) {
      hemi.current.intensity = mixValue(0.8, 0.07, t) * drapeDim;
      hemi.current.color.lerpColors(SKY_DAY, SKY_DUSK, t);
    }
    if (northFill.current) northFill.current.intensity = mixValue(0.6, 0.03, t);
    if (skyFill.current) {
      const inBedroom = spaceAt(camera.position.x, camera.position.z) === 0;
      skyFill.current.intensity = mixValue(1.1, 0.05, t) * (inBedroom ? daylight : 1);
    }
    scene.environmentIntensity = mixValue(1.0, 0.14, t) * drapeDim;
  });

  return (
    <>
      <primitive object={sunTarget} />
      <directionalLight
        ref={sun}
        target={sunTarget}
        position={[SUN_TARGET[0] + SUN_OFFSET[0], SUN_TARGET[1] + SUN_OFFSET[1], SUN_TARGET[2] + SUN_OFFSET[2]]}
        intensity={4.6}
        castShadow
        shadow-mapSize={highQuality ? [4096, 4096] : [2048, 2048]}
        shadow-camera-left={-12.5}
        shadow-camera-right={12.5}
        shadow-camera-top={12.5}
        shadow-camera-bottom={-12.5}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />
      <hemisphereLight ref={hemi} args={["#DCE6F2", "#E3D9CB", 0.6]} />
      {/* Soft sky fill from the south-west — the glow off the window and
          the glass wall. Unshadowed, so it's cheap: area lights looked a
          little better but tripled shader compile time. */}
      <directionalLight ref={skyFill} position={[-6, 4, 5]} intensity={1.1} color="#E4ECF6" />
      {/* Open-sky light on the north-facing front of the house */}
      <directionalLight ref={northFill} position={[1, 5, -10]} intensity={0.6} color="#DDE6F2" />
      <LightPool />
      {/* Cove wash from the bedroom's tray ceiling */}
      <MixedPointLight position={[0, 2.88, 0]} day={0} evening={1.8} distance={6} decay={1.6} color="#FFC98A" alsoIn={[1]} />

      {/* Image-based lighting built from light cards — no HDRI download,
          and its reflections line up with the room's actual window. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#2E2924"]} />
        <Lightformer form="rect" intensity={7} color="#F2F6FF" position={[-5, 1.55, 0]} rotation-y={Math.PI / 2} scale={[2.4, 2.1, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#FFF4E4" position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[4.5, 3.5, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#EFE3D2" position={[5, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[4.5, 3, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#EADCC8" position={[0, 1.5, 5]} rotation-y={Math.PI} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={0.4} color="#D9C2A5" position={[0, 1.5, -5]} scale={[5, 3, 1]} />
      </Environment>
    </>
  );
}
