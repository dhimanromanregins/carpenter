import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import type CameraControlsImpl from "camera-controls";
import { useWoodTexture } from "@/hooks/useWoodTexture";
import { WardrobeModel } from "./WardrobeModel";
import { WardrobeBlueprint } from "./WardrobeBlueprint";
import { totalHeight, totalWidth, type RoomMood, type WardrobeConfig } from "./wardrobeConfig";

export type CameraView = "perspective" | "front" | "top" | "closeup";

const MOOD: Record<
  RoomMood,
  { ambient: number; ambientColor: string; sun: number; sunColor: string; env: number; bg: string; bloom: number }
> = {
  day: { ambient: 0.7, ambientColor: "#fff6e8", sun: 2.4, sunColor: "#fff1da", env: 0.9, bg: "#cfd5da", bloom: 0.35 },
  evening: { ambient: 0.28, ambientColor: "#ffd9b0", sun: 0.75, sunColor: "#ff9f5e", env: 0.38, bg: "#2a2420", bloom: 0.7 },
  night: { ambient: 0.06, ambientColor: "#8aa0ff", sun: 0.08, sunColor: "#9db4ff", env: 0.12, bg: "#07080c", bloom: 1.0 },
};

function Room({ config }: { config: WardrobeConfig }) {
  const W = totalWidth(config);
  const TH = totalHeight(config);
  const floorTex = useWoodTexture({ baseColor: "#b99468", ringColor: "#7d5a35", repeatX: 4, repeatY: 3 });
  const roomW = Math.max(7, W + 4);
  const ceilY = Math.max(2.9, TH + 0.45);
  const back = -config.depth / 2 - 0.002;

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1.5]} receiveShadow>
        <planeGeometry args={[roomW, 8]} />
        <meshStandardMaterial map={floorTex} color="#ffffff" roughness={0.45} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, ceilY / 2, back]} receiveShadow>
        <planeGeometry args={[roomW, ceilY]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.95} />
      </mesh>
      {/* side walls */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * roomW / 2, ceilY / 2, 1.5]} rotation={[0, -sx * Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, ceilY]} />
          <meshStandardMaterial color={config.wallColor} roughness={0.95} />
        </mesh>
      ))}
      {/* ceiling */}
      <mesh position={[0, ceilY, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomW, 8]} />
        <meshStandardMaterial color="#f1eee8" roughness={1} />
      </mesh>
      {/* skirting */}
      <mesh position={[0, 0.045, back + 0.01]}>
        <boxGeometry args={[roomW, 0.09, 0.02]} />
        <meshStandardMaterial color="#efeae0" roughness={0.6} />
      </mesh>
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 1.4]} receiveShadow>
        <planeGeometry args={[Math.min(W + 0.8, 4.2), 2.2]} />
        <meshStandardMaterial color="#d8cdb9" roughness={1} />
      </mesh>
    </group>
  );
}

function CameraRig({ view, config, ctrl }: { view: CameraView; config: WardrobeConfig; ctrl: React.RefObject<CameraControlsImpl | null> }) {
  const W = totalWidth(config);
  const TH = totalHeight(config);
  const aspect = useThree((s) => s.size.width / s.size.height);
  useEffect(() => {
    const c = ctrl.current;
    if (!c) return;
    // distance needed to frame the whole wardrobe with some breathing room
    const halfTan = Math.tan((38 * Math.PI) / 360);
    const dist = Math.max((TH * 1.2) / 2 / halfTan, (W * 1.25) / 2 / (halfTan * aspect)) + config.depth / 2;
    const midY = TH * 0.48;
    switch (view) {
      case "front":
        void c.setLookAt(0, midY, dist + 0.8, 0, midY, 0, true);
        break;
      case "top":
        void c.setLookAt(0, dist + 2.2, 0.8, 0, 0, 0.1, true);
        break;
      case "closeup":
        void c.setLookAt(W * 0.18, 1.35, 1.9, W * 0.05, 1.2, 0, true);
        break;
      default:
        void c.setLookAt(W * 0.35, midY + 0.45, dist, 0, midY, 0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, W, TH, ctrl, aspect > 1.3]);
  return null;
}

/** Registers a function that exports the current frame as a PNG data URL. */
function CaptureBridge({ register }: { register: (fn: () => string) => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    register(() => gl.domElement.toDataURL("image/png"));
  }, [gl, register]);
  return null;
}

interface WardrobeSceneProps {
  config: WardrobeConfig;
  view: CameraView;
  openState: Record<string, boolean>;
  onToggle: (key: string) => void;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  registerCapture: (fn: () => string) => void;
  /** Details view: ghosted boards, outlines and dimension lines. */
  blueprint?: boolean;
}

export function WardrobeScene({ config: userConfig, view, openState, onToggle, selectedId, onSelect, registerCapture, blueprint = false }: WardrobeSceneProps) {
  // In the details view every light strip is switched off so the outlines stay readable.
  const config = useMemo<WardrobeConfig>(
    () =>
      blueprint
        ? { ...userConfig, lights: { ...userConfig.lights, interior: false, shelf: false, top: false, plinth: false, profile: false } }
        : userConfig,
    [userConfig, blueprint]
  );
  const ctrl = useRef<CameraControlsImpl>(null);
  const mood = MOOD[config.mood];
  const sunPos = useMemo<[number, number, number]>(() => [3.2, 4.6, 4], []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [1.2, 1.9, 5.2], fov: 38, near: 0.1, far: 40 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <color attach="background" args={[blueprint ? "#0a1018" : mood.bg]} />
      <ambientLight intensity={mood.ambient} color={mood.ambientColor} />
      <directionalLight
        position={sunPos}
        intensity={mood.sun}
        color={mood.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0004}
      />

      <Suspense fallback={null}>
        <Environment resolution={256} environmentIntensity={mood.env}>
          <Lightformer intensity={2.2} color="#fff3e0" position={[0, 4, 3]} scale={[8, 1.2, 1]} />
          <Lightformer intensity={1.4} color="#ffffff" position={[-5, 2, 2]} scale={[1.2, 5, 1]} />
          <Lightformer intensity={0.9} color="#cfe0ff" position={[5, 2, 3]} scale={[1.2, 5, 1]} />
          <Lightformer intensity={0.9} color="#fff8ee" position={[0, 2, 7]} scale={[12, 6, 1]} />
        </Environment>
        {!blueprint && <Room config={config} />}
        {blueprint && <gridHelper args={[10, 40, "#c6a86a", "#26313f"]} position={[0, 0.001, 0.5]} />}
        <WardrobeModel
          config={config}
          openState={openState}
          onToggle={onToggle}
          selectedId={selectedId}
          onSelect={onSelect}
          blueprint={blueprint}
        />
        {blueprint && <WardrobeBlueprint config={config} />}
        {!blueprint && <ContactShadows position={[0, 0.006, 0.3]} opacity={0.5} scale={9} blur={2.4} far={2.2} />}
      </Suspense>

      <CameraControls
        ref={ctrl}
        makeDefault
        minDistance={1.2}
        maxDistance={9}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI / 2 - 0.02}
        dollySpeed={0.6}
      />
      <CameraRig view={view} config={config} ctrl={ctrl} />
      <CaptureBridge register={registerCapture} />

      <EffectComposer multisampling={4}>
        <Bloom intensity={mood.bloom} luminanceThreshold={0.95} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.2} darkness={config.mood === "day" ? 0.35 : 0.65} />
      </EffectComposer>
    </Canvas>
  );
}
