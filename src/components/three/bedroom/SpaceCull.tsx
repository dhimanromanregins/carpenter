import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { spaceAt } from "./bedroomLayout";
import { openingState } from "./bedroomState";

/**
 * Hides its children when the viewer can't possibly see them — e.g. the
 * bedroom's furniture from the front garden, or the hall's from the
 * bedroom with its door shut. Every mesh costs a draw call in the main,
 * shadow and reflection passes, so with ~1000 meshes in the house this is
 * the difference between ~10 and 60 fps. Walls and floors stay out of
 * this: they're the occluders.
 */
export function SpaceCull({
  visibleWhen,
  children,
}: {
  /** Given the viewer's space and the doors' openness, may this be seen? */
  visibleWhen: (space: number, openings: typeof openingState) => boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.visible = visibleWhen(spaceAt(camera.position.x, camera.position.z), openingState);
  });
  return <group ref={ref}>{children}</group>;
}
