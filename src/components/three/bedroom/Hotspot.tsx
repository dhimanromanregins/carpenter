import { useContext, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { spaceAt } from "./bedroomLayout";
import { HintsContext } from "./bedroomState";

const scratch = new THREE.Vector3();

/**
 * Pulsing marker that floats over an interactive object; also tappable.
 * Markers only show while the viewer is in the same space (bedroom, hall,
 * deck) — otherwise they'd float through the walls from the next room.
 */
export function Hotspot({
  position,
  label,
  onActivate,
  spaces,
}: {
  position: [number, number, number];
  label: string;
  onActivate: () => void;
  /** For openings between spaces (doors): the spaces it's visible from. */
  spaces?: number[];
}) {
  const show = useContext(HintsContext);
  const group = useRef<THREE.Group>(null);
  const button = useRef<HTMLButtonElement>(null);
  const space = useRef<number | null>(null);

  useFrame(({ camera }) => {
    if (!show || !button.current) return;
    if (space.current === null && group.current) {
      const w = group.current.getWorldPosition(scratch);
      space.current = spaceAt(w.x, w.z);
    }
    const here = spaceAt(camera.position.x, camera.position.z);
    const visible = spaces ? spaces.includes(here) : here === space.current;
    const display = visible ? "" : "none";
    if (button.current.style.display !== display) button.current.style.display = display;
  });

  if (!show) return null;
  return (
    <group ref={group} position={position}>
      <Html center zIndexRange={[10, 0]}>
        <button
          ref={button}
          type="button"
          onClick={onActivate}
          aria-label={label}
          className="group relative flex h-7 w-7 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-50" />
          <span className="relative h-3 w-3 rounded-full border-2 border-white bg-[#8C5333] shadow-md" />
          <span className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded bg-black/75 px-2 py-0.5 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
            {label}
          </span>
        </button>
      </Html>
    </group>
  );
}
