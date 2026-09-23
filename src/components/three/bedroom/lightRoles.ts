import { useEffect, useRef, type RefObject } from "react";
import type * as THREE from "three";

// three.js evaluates every light in every material's shader, so shader
// compile time and per-pixel cost grow with the total number of lights in
// the scene — across the whole home, that was most of a 20-second load.
// Instead, each lamp registers a "light role", and a fixed pool of real
// point lights is handed to the roles in the space the viewer is standing
// in (bedroom, hall, deck).

export const POOL_SIZE = 5;

export interface LightRole {
  marker: RefObject<THREE.Object3D | null>;
  intensity: () => number;
  color: THREE.Color;
  distance: number;
  decay: number;
  /** Extra spaces (besides its own) the lamp should stay lit from. */
  alsoIn: number[];
  /** Resolved on first use from the marker's world position. */
  spaces?: number[];
}

export const roles = new Set<LightRole>();

/** Registers a lamp's light with the pool for as long as the component lives. */
export function usePooledLight(role: Omit<LightRole, "spaces">) {
  const ref = useRef<LightRole>(role);
  ref.current.intensity = role.intensity;
  useEffect(() => {
    const r = ref.current;
    roles.add(r);
    return () => {
      roles.delete(r);
    };
  }, []);
}

