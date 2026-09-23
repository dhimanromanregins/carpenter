import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mixValue, useEveningMix } from "./bedroomState";
import { usePooledLight } from "./lightRoles";

interface MixedPointLightProps {
  position: [number, number, number];
  day: number;
  evening: number;
  /** A lamp's own switch level; defaults to the Day → Evening mix. */
  level?: { current: number };
  color?: THREE.ColorRepresentation;
  distance?: number;
  decay?: number;
  /** Spaces other than its own that the light should stay on from. */
  alsoIn?: number[];
}

/**
 * A lamp's light, whose intensity follows the day → evening crossfade (or
 * the lamp's own switch). It doesn't own a real light: it marks where the
 * light is and borrows one from the shared pool (see lightRoles.ts).
 */
export function MixedPointLight({
  position,
  day,
  evening,
  level,
  color = "#ffffff",
  distance = 5,
  decay = 2,
  alsoIn = [],
}: MixedPointLightProps) {
  const marker = useRef<THREE.Group>(null);
  const mix = useEveningMix();
  const c = useMemo(() => new THREE.Color(color), [color]);
  usePooledLight({
    marker,
    intensity: () => mixValue(day, evening, (level ?? mix).current),
    color: c,
    distance,
    decay,
    alsoIn,
  });
  return <group ref={marker} position={position} />;
}
