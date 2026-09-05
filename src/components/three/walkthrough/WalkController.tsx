import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BUILDING, TOP_BALCONY, EYE_H } from "@/data/floorPlan";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

// First-person look (drag) + move (WASD/arrows), ported from the walk mode
// in public/design-studio-floor.html — same feel, same building bounds.
export function WalkController() {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  useEffect(() => {
    // Start right outside the lift doors (the lift shaft's door opens
    // east at x≈1.7, z≈2.2 — see buildLiftShaft() in
    // legacyFloorSceneBuilder.ts), facing forward into the home as if
    // you've just stepped off.
    camera.position.set(1.9, EYE_H, 2.2);
    camera.lookAt(8.0, 1.4, 2.2);
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = e.y;
    pitch.current = e.x;
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      drag.current = { x: e.clientX, y: e.clientY, yaw: yaw.current, pitch: pitch.current };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      yaw.current = drag.current.yaw - dx * 0.0045;
      pitch.current = clamp(drag.current.pitch - dy * 0.0045, -1.3, 1.3);
      camera.quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, "YXZ"));
    };
    const onPointerUp = () => {
      drag.current = null;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [camera, gl]);

  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const speed = 2.4 * Math.min(delta, 0.1); // ~2.4 m/s, capped for tab-switch jumps
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();
    right.current.crossVectors(forward.current, camera.up).normalize();

    const fwd = (keys.current["w"] || keys.current["arrowup"] ? 1 : 0) - (keys.current["s"] || keys.current["arrowdown"] ? 1 : 0);
    const side = (keys.current["d"] || keys.current["arrowright"] ? 1 : 0) - (keys.current["a"] || keys.current["arrowleft"] ? 1 : 0);
    if (fwd) camera.position.addScaledVector(forward.current, fwd * speed);
    if (side) camera.position.addScaledVector(right.current, side * speed);

    camera.position.x = clamp(camera.position.x, BUILDING.x0 + 0.3, BUILDING.x1 - 0.3);
    camera.position.z = clamp(camera.position.z, BUILDING.z0 + 0.3, TOP_BALCONY.z1 - 0.3);
    camera.position.y = EYE_H;
  });

  return null;
}
