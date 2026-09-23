import { useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getBedroomMaterials } from "./bedroomMaterials";
import { clickable, useEased } from "./interaction";
import { Hotspot } from "./Hotspot";

type V3 = [number, number, number];

interface DrawerProps {
  /** Front panel size; the box behind it is inset to fit the carcass. */
  w: number;
  h: number;
  /** Depth of the drawer box behind the front. */
  d: number;
  /** Centre of the front panel's outer face, in the parent's space. */
  position: V3;
  front: THREE.Material;
  handle: "knob" | "bar";
  /** How far it slides out along the parent's +z. */
  travel?: number;
  /** Forces it shut (e.g. the wardrobe doors in front of it closed). */
  locked?: boolean;
  /** Shows a hotspot marker with this label. */
  hint?: string;
  /** Contents, positioned from the centre of the drawer box's floor. */
  children?: ReactNode;
}

/**
 * A working drawer: a front panel with its pull, and a real open-topped
 * box behind it that slides out on click so its contents show.
 */
export function Drawer({ w, h, d, position, front, handle, travel = d * 0.72, locked = false, hint, children }: DrawerProps) {
  const m = getBedroomMaterials();
  const [open, setOpen] = useState(false);
  const isOpen = open && !locked;
  const t = useEased(isOpen, 5);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.z = position[2] + t.current * travel;
  });

  const toggle = () => {
    if (!locked) setOpen((o) => !o);
  };
  const handlers = clickable(toggle);
  const FRONT_T = 0.018;
  const SIDE = 0.012;
  const boxW = w - 0.05;
  const boxH = Math.max(0.05, h - 0.05);
  const boxZ = -FRONT_T - d / 2;
  const floorY = -h / 2 + 0.03;

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0, -FRONT_T / 2]} material={front} castShadow receiveShadow {...handlers}>
        <boxGeometry args={[w - 0.004, h - 0.004, FRONT_T]} />
      </mesh>
      {handle === "knob" ? (
        <mesh position={[0, h * 0.18, 0.009]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow {...handlers}>
          <cylinderGeometry args={[0.012, 0.012, 0.018, 16]} />
        </mesh>
      ) : (
        <mesh position={[0, h / 2 - 0.05, 0.012]} rotation={[0, 0, Math.PI / 2]} material={m.brass} castShadow {...handlers}>
          <cylinderGeometry args={[0.006, 0.006, Math.min(0.16, w * 0.4), 10]} />
        </mesh>
      )}

      {/* The drawer box (pale birch), open at the top */}
      <group position={[0, 0, boxZ]}>
        <mesh position={[0, floorY - 0.005, 0]} material={m.drawerBox} receiveShadow>
          <boxGeometry args={[boxW, 0.01, d]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (boxW / 2 - SIDE / 2), floorY + boxH / 2 - 0.01, 0]} material={m.drawerBox} castShadow receiveShadow>
            <boxGeometry args={[SIDE, boxH, d]} />
          </mesh>
        ))}
        <mesh position={[0, floorY + boxH / 2 - 0.01, -d / 2 + SIDE / 2]} material={m.drawerBox} receiveShadow>
          <boxGeometry args={[boxW, boxH, SIDE]} />
        </mesh>
        <group position={[0, floorY, 0]}>{children}</group>
      </group>

      {hint && !locked && (
        <Hotspot position={[0, h / 2 + 0.03, 0.03]} label={isOpen ? "Close drawer" : hint} onActivate={toggle} />
      )}
    </group>
  );
}
