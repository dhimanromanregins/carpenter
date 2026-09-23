import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Link } from "react-router-dom";
import { BedroomScene, type BedroomQuality } from "@/components/three/bedroom/BedroomScene";
import { TouchJoystick } from "@/components/three/bedroom/TouchJoystick";
import { VIEWPOINTS, viewpointPose } from "@/components/three/bedroom/bedroomLayout";
import { walkInput, type OpeningsControl } from "@/components/three/bedroom/bedroomState";
import { getBedroomTextures } from "@/components/three/bedroom/proceduralTextures";
import { useIsCoarsePointer } from "@/hooks/useMediaQuery";
import { useSeo } from "@/hooks/useSeo";

function defaultQuality(coarse: boolean): BedroomQuality {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 8 : 8;
  return coarse || cores <= 4 ? "balanced" : "high";
}

export function BedroomWalkthroughPage() {
  useSeo({
    title: "3D Home Walkthrough — Entrance, Living Hall & Bedroom",
    description:
      "Walk up to a realistic 3D home by Dhiman Interiors — a stone-clad entrance with a walnut pivot door, a marble living hall with a Nero Marquina TV wall, a balcony deck and a master bedroom, in day and evening light.",
    path: "/design-studio/bedroom-walkthrough",
  });

  const coarse = useIsCoarsePointer();
  const [ready, setReady] = useState(false);
  // Shaders compile in the background before the first frame is drawn.
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useCallback(() => setCompiled(true), []);
  const [evening, setEvening] = useState(false);
  const [quality, setQuality] = useState<BedroomQuality>(() => defaultQuality(coarse));
  const [activeStop, setActiveStop] = useState<string | null>("garden");
  const [hints, setHints] = useState(true);
  const [doorOpen, setDoorOpen] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [mainDoorOpen, setMainDoorOpen] = useState(false);
  const openings = useMemo<OpeningsControl>(
    () => ({ doorOpen, sliderOpen, mainDoorOpen, setDoorOpen, setSliderOpen, setMainDoorOpen }),
    [doorOpen, sliderOpen, mainDoorOpen]
  );
  // Tours open the door / glass panel they need to walk through.
  useEffect(() => {
    walkInput.openings = openings;
  }, [openings]);

  // The room's textures are painted procedurally (~0.5 s of main-thread
  // work). Let the loading screen paint first, then build them.
  useEffect(() => {
    const id = window.setTimeout(() => {
      getBedroomTextures();
      setReady(true);
    }, 60);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(
    () => () => {
      walkInput.tour = null;
      walkInput.openings = null;
      walkInput.joyX = walkInput.joyY = 0;
      document.body.style.cursor = "";
    },
    []
  );

  const goTo = (id: string) => {
    const v = VIEWPOINTS.find((p) => p.id === id);
    if (!v) return;
    walkInput.tour = viewpointPose(v);
    setActiveStop(id);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1c1916] select-none">
      {ready && (
        <Canvas
          key={quality}
          frameloop={compiled ? "always" : "never"}
          shadows
          dpr={quality === "high" ? [1, 1.75] : [1, 1.5]}
          camera={{ fov: 62, near: 0.05, far: 160 }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          onPointerDown={() => setActiveStop(null)}
        >
          <BedroomScene evening={evening} quality={quality} hints={hints} openings={openings} onReady={onCompiled} />
        </Canvas>
      )}

      {!(ready && compiled) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#1c1916] text-[#EDE6DA]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EDE6DA]/30 border-t-[#EDE6DA]" />
          <p className="m-0 text-sm tracking-wide">{ready ? "Setting up the lighting…" : "Preparing the home…"}</p>
        </div>
      )}

      {/* Top bar (z-20 keeps the UI above the in-scene hotspot markers) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-4">
        <Link
          to="/design-studio"
          className="pointer-events-auto rounded-lg border border-[#E4DFD3] bg-white/90 px-3.5 py-2 text-[12.5px] font-semibold text-[#2A2620] no-underline backdrop-blur hover:border-[#B5714A]"
        >
          ← Design Studio
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex rounded-lg border border-[#E4DFD3] bg-white/90 p-0.5 text-[12.5px] font-semibold backdrop-blur">
            {[
              { label: "Day", value: false },
              { label: "Evening", value: true },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setEvening(o.value)}
                aria-pressed={evening === o.value}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  evening === o.value ? "bg-[#8C5333] text-white" : "text-[#2A2620] hover:bg-[#F3EEE6]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setHints((h) => !h)}
            aria-pressed={hints}
            title="Show or hide the markers on things you can click"
            className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold backdrop-blur ${
              hints ? "border-[#8C5333] bg-[#8C5333] text-white" : "border-[#E4DFD3] bg-white/90 text-[#2A2620] hover:border-[#B5714A]"
            }`}
          >
            Hotspots
          </button>
          <button
            type="button"
            onClick={() => {
              setCompiled(false);
              setQuality((q) => (q === "high" ? "balanced" : "high"));
            }}
            title="Switch rendering quality"
            className="rounded-lg border border-[#E4DFD3] bg-white/90 px-3 py-2 text-[12.5px] font-semibold text-[#2A2620] backdrop-blur hover:border-[#B5714A]"
          >
            {quality === "high" ? "HD" : "Fast"}
          </button>
        </div>
      </div>

      {/* Bottom: tour stops, hint, CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2.5 p-3 pb-4 sm:p-5">
        <div className="pointer-events-auto flex max-w-full gap-1.5 overflow-x-auto rounded-xl border border-[#E4DFD3] bg-white/90 p-1 backdrop-blur">
          {VIEWPOINTS.map((v) => (
            <Fragment key={v.id}>
              {(v.id === "entrance" || v.id === "hall") && <span className="my-1 w-px shrink-0 bg-[#E4DFD3]" aria-hidden />}
              <button
                type="button"
                onClick={() => goTo(v.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                  activeStop === v.id ? "bg-[#2A2620] text-white" : "text-[#2A2620] hover:bg-[#F3EEE6]"
                }`}
              >
                {v.label}
              </button>
            </Fragment>
          ))}
        </div>
        <div className="max-w-[92vw] rounded-lg bg-black/45 px-3.5 py-2 text-center text-[11.5px] text-white/90 backdrop-blur">
          {coarse
            ? "Drag to look · joystick to walk · climb the steps and tap the main door to go in · tap anything with a marker"
            : "Drag to look · WASD / arrows to walk · climb the steps and click the main door to go in · click anything with a marker"}
        </div>
      </div>

      <Link
        to="/free-design-consultation"
        className="pointer-events-auto absolute top-[6.4rem] right-3 z-20 rounded-full bg-[#8C5333] px-4 py-2.5 text-[12.5px] font-semibold text-white no-underline shadow-lg hover:bg-[#7A4629] sm:top-[4.25rem] sm:right-4"
      >
        Get your home designed →
      </Link>

      {coarse && (
        <div className="pointer-events-none absolute bottom-40 left-4 z-20">
          <TouchJoystick />
        </div>
      )}
    </div>
  );
}
