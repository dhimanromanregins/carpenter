import { useContext, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { EveningTargetContext, useEveningMix } from "./bedroomState";

/**
 * Pointer handlers for a clickable object: pointer cursor on hover, and a
 * click that ignores the tail end of a drag-to-look gesture.
 */
export function clickable(onActivate: () => void) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (e.delta > 6) return;
      e.stopPropagation();
      onActivate();
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "";
    },
  };
}

/** A 0..1 value that eases toward `on`, read inside other useFrame callbacks. */
export function useEased(on: boolean, speed = 4) {
  const v = useRef(on ? 1 : 0);
  useFrame((_, delta) => {
    const target = on ? 1 : 0;
    v.current += (target - v.current) * (1 - Math.exp(-Math.min(delta, 0.1) * speed));
    if (Math.abs(target - v.current) < 1e-4) v.current = target;
  });
  return v;
}

/**
 * A lamp's own switch on top of the Day/Evening mode: lamps follow the
 * mode by default, and a click flips just that lamp. The override belongs
 * to the mode it was made in, so changing mode puts every lamp back on
 * its default rather than inverting it.
 */
export function useLampSwitch() {
  const evening = useContext(EveningTargetContext);
  const mix = useEveningMix();
  const [overrideFor, setOverrideFor] = useState<boolean | null>(null);
  const switched = overrideFor === evening;
  const flip = useEased(switched, 5);
  const level = useRef(evening ? 1 : 0);
  useFrame(() => {
    const m = mix.current;
    level.current = m + flip.current * (1 - 2 * m);
  });
  const toggle = () => setOverrideFor((o) => (o === evening ? null : evening));
  const isOn = evening !== switched;
  return { level, toggle, isOn };
}
