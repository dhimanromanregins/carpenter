import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { Bed } from "@/components/three/walkthrough/Bed";
import { BedroomDecor } from "@/components/three/walkthrough/BedroomDecor";
import { CoffeeTable } from "@/components/three/walkthrough/CoffeeTable";
import { DrawingRoomDecor } from "@/components/three/walkthrough/DrawingRoomDecor";
import { LegacyFloorScene } from "@/components/three/walkthrough/LegacyFloorScene";
import { Sofa } from "@/components/three/walkthrough/Sofa";
import { WalkController } from "@/components/three/walkthrough/WalkController";
import { useSeo } from "@/hooks/useSeo";

export function FloorWalkthroughPage() {
  useSeo({
    title: "3D Interior Walkthrough",
    description: "Explore an interactive 3D walkthrough of a Dhiman Interiors home design, serving Zirakpur, Chandigarh and Mohali.",
    path: "/design-studio/floor-walkthrough",
  });

  return (
    <div className="fixed inset-0 bg-[#EFEAE0]">
      <div className="hidden h-full md:block">
        <Canvas
          shadows
          camera={{ fov: 42, near: 0.1, far: 300 }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.3;
          }}
        >
          <color attach="background" args={["#EFEAE0"]} />
          <fog attach="fog" args={["#EFEAE0", 12, 40]} />
          {/* Three's modern linear color management renders the same numeric
              intensities noticeably darker than the original page's legacy
              (r128) pipeline, so these run higher than that page's values to
              land on the same visual brightness. */}
          <ambientLight intensity={0.55} />
          <hemisphereLight args={["#E9EDF5", "#C7BFA9", 1.1]} />
          <directionalLight
            position={[-14, 22, 10]}
            intensity={2.6}
            color="#fff2df"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-14}
            shadow-camera-right={14}
            shadow-camera-top={14}
            shadow-camera-bottom={-14}
            shadow-camera-far={60}
            shadow-bias={-0.0015}
          />
          <directionalLight position={[12, 8, -10]} intensity={0.6} color="#dce6ff" />
          <Suspense fallback={null}>
            <LegacyFloorScene />
            <Sofa position={[1.048, 0.407, 8.0]} rotationY={Math.PI / 2} scale={[3.2, 3.8, 2.0]} modelUrl="/models/sofa-user2.glb" />
            <CoffeeTable position={[2.8, 0, 8.0]} />
            <DrawingRoomDecor />
            <Bed position={[6.9, 0.252, 3.2375]} rotationY={0} scale={[2.8, 1.7, 3.2]} />
            <BedroomDecor />
          </Suspense>
          <WalkController />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4">
          <Link
            to="/design-studio/floor"
            className="pointer-events-auto rounded-lg border border-[#E4DFD3] bg-white/90 px-3.5 py-2 text-[12.5px] font-semibold text-[#2A2620] backdrop-blur hover:border-[#B5714A]"
          >
            ← Floor design
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="pointer-events-none max-w-[92vw] rounded-lg border border-[#E4DFD3] bg-white/90 px-4 py-2.5 text-center text-xs text-[#7A7468] backdrop-blur">
            Drag to look around &middot; WASD or arrow keys to walk &middot; click the bedroom door or a wardrobe door/drawer to open it, or the TV / kitchen to open their design
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col items-center justify-center gap-3.5 px-7 text-center md:hidden">
        <h1 className="m-0 text-xl font-bold text-[#2A2620]">Floor Walkthrough</h1>
        <p className="m-0 max-w-[320px] text-sm leading-relaxed text-[#7A7468]">
          This first-person walkthrough needs a bigger screen. Please switch to a tablet or larger device.
        </p>
        <Link
          to="/design-studio/floor"
          className="mt-2 rounded-full bg-[#8C5333] px-5.5 py-2.5 text-[13px] font-semibold text-white no-underline"
        >
          ← Back to floor design
        </Link>
      </div>
    </div>
  );
}
