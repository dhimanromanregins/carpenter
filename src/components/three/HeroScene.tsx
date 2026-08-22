import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  Sparkles,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { WoodPlane } from "./WoodPlane";
import { FloatingCabinet } from "./FloatingCabinet";
import { LightShaft } from "./LightShaft";
import { CameraRig } from "./CameraRig";
import { CarpenterFigure } from "./CarpenterFigure";
import { useIsMobile } from "@/hooks/useMediaQuery";

function RoomEnvironment() {
  return (
    <group>
      <WoodPlane
        position={[0, -1.8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[20, 20]}
        baseColor="#38230f"
        ringColor="#150c04"
        roughness={0.85}
      />
      <WoodPlane
        position={[0, 3, -6]}
        rotation={[0, 0, 0]}
        size={[20, 10]}
        baseColor="#4a2f18"
        ringColor="#1c1108"
        roughness={0.9}
      />
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.35} color="#c6a86a" />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.6}
        color="#ffe6b0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        position={[-5, 4, -2]}
        angle={0.4}
        penumbra={1}
        intensity={2}
        color="#c6a86a"
      />
      <pointLight position={[0, 1, 3]} intensity={0.5} color="#ffffff" />
    </>
  );
}

export function HeroScene() {
  const isMobile = useIsMobile();

  return (
    <Canvas
      shadows
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 8, 22]} />
      <PerspectiveCamera makeDefault fov={45} position={[0, 0.3, 9]} />
      <CameraRig />

      <Suspense fallback={null}>
        <SceneLights />
        <RoomEnvironment />

        <FloatingCabinet position={[2.7, 1.4, -1.5]} scale={0.85} speed={0.8} />
        <FloatingCabinet position={[-3.6, 1.6, -2.8]} scale={0.7} speed={1.1} />

        <CarpenterFigure position={[3.1, -1.78, 1.4]} scale={0.85} />

        <LightShaft
          position={[-3, 2.5, -3]}
          rotation={[0, 0.5, 0.15]}
          size={[3.5, 9]}
          opacity={0.22}
        />
        <LightShaft
          position={[3.2, 2.8, -4]}
          rotation={[0, -0.4, -0.1]}
          size={[2.5, 8]}
          opacity={0.15}
        />

        <Sparkles
          count={isMobile ? 60 : 140}
          scale={[10, 6, 8]}
          size={2}
          speed={0.25}
          opacity={0.5}
          color="#e2cd9a"
        />

        <ContactShadows
          position={[0, -1.79, 0]}
          opacity={0.6}
          scale={12}
          blur={2.5}
          far={4}
        />

        <Environment resolution={256}>
          <Lightformer
            intensity={3}
            color="#c6a86a"
            position={[0, 4, -5]}
            scale={[10, 1, 1]}
          />
          <Lightformer
            intensity={1.5}
            color="#ffffff"
            position={[-6, 2, 2]}
            scale={[1, 8, 1]}
          />
          <Lightformer
            intensity={1}
            color="#7a5535"
            position={[6, -2, 2]}
            scale={[1, 8, 1]}
          />
        </Environment>

        {!isMobile && (
          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
              intensity={0.6}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.7} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
