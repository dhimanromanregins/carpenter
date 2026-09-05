import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import { buildLegacyFloorScene, type LegacyFloorScene as LegacyFloorSceneResult } from "./legacyFloorSceneBuilder";

// Mounts the ported design-studio-floor.html scene (see legacyFloorScene.ts)
// into the R3F canvas, drives its per-frame animation (doors, drawers, the
// lift, chandelier, etc.), and reproduces the original page's click-to-
// interact behavior — pointerdown/pointerup with a small movement
// threshold so a look-around drag from WalkController is never mistaken
// for a click.
export function LegacyFloorScene() {
  const navigate = useNavigate();
  const { camera, gl } = useThree();
  const builtRef = useRef<LegacyFloorSceneResult | null>(null);

  const built = useMemo(() => {
    return buildLegacyFloorScene({
      onGoToKitchen: (widthMeters, depthMeters) => {
        navigate(`/design-studio/kitchen?w=${widthMeters.toFixed(3)}&d=${depthMeters.toFixed(3)}&from=floor`);
      },
    });
  }, [navigate]);
  builtRef.current = built;

  useFrame(() => {
    builtRef.current?.tick();
  });

  useEffect(() => {
    const el = gl.domElement;
    let downAt: { x: number; y: number } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      downAt = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      downAt = null;
      if (moved > 6) return; // was a look-around drag, not a click
      const rect = el.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      builtRef.current?.interact(camera, ndcX, ndcY);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
    };
  }, [camera, gl]);

  return <primitive object={built.group} />;
}
