import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mixValue, useEveningMix } from "./bedroomState";

/**
 * A glowing material (lamp shade, bulb, candle flame) whose emissive
 * strength follows the crossfade. Values above ~1 feed the bloom pass.
 */
export function useMixedEmissive(
  make: () => THREE.MeshStandardMaterial,
  day: number,
  evening: number,
  level?: { current: number }
) {
  const mat = useMemo(make, []); // eslint-disable-line react-hooks/exhaustive-deps
  const mix = useEveningMix();
  useFrame(() => {
    mat.emissiveIntensity = mixValue(day, evening, (level ?? mix).current);
  });
  return mat;
}
