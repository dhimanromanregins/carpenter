import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { spaceAt } from "./bedroomLayout";
import { POOL_SIZE, roles, type LightRole } from "./lightRoles";

const scratch = new THREE.Vector3();
const FADE_IN = 6; // 1/s — a freshly reassigned light fades up over ~0.2 s

/** The pool itself: renders POOL_SIZE point lights and assigns them each frame. */
export function LightPool() {
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  const assigned = useRef<(LightRole | null)[]>(Array(POOL_SIZE).fill(null));
  const ramp = useRef<number[]>(Array(POOL_SIZE).fill(1));

  useFrame(({ camera }, delta) => {
    const here = spaceAt(camera.position.x, camera.position.z);
    const active: LightRole[] = [];
    for (const r of roles) {
      if (!r.spaces) {
        const m = r.marker.current;
        if (!m) continue;
        const w = m.getWorldPosition(scratch);
        r.spaces = [spaceAt(w.x, w.z), ...r.alsoIn];
      }
      if (r.spaces.includes(here) && active.length < POOL_SIZE) active.push(r);
    }
    for (let i = 0; i < POOL_SIZE; i++) {
      const light = lights.current[i];
      if (!light) continue;
      const role = active[i] ?? null;
      if (role !== assigned.current[i]) {
        assigned.current[i] = role;
        ramp.current[i] = 0;
      }
      ramp.current[i] = Math.min(1, ramp.current[i] + Math.min(delta, 0.1) * FADE_IN);
      if (!role || !role.marker.current) {
        light.intensity = 0;
        continue;
      }
      role.marker.current.getWorldPosition(light.position);
      light.color.copy(role.color);
      light.distance = role.distance;
      light.decay = role.decay;
      light.intensity = role.intensity() * ramp.current[i];
    }
  });

  return (
    <>
      {Array.from({ length: POOL_SIZE }, (_, i) => (
        <pointLight
          key={i}
          ref={(l) => {
            lights.current[i] = l;
          }}
          intensity={0}
        />
      ))}
    </>
  );
}
