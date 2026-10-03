import * as THREE from "three";
import type { HandleStyle } from "./wardrobeConfig";

export interface HandleMats {
  handle: THREE.Material;
  /** Same finish, double-sided — for open shells like the cup pull. */
  handleDS: THREE.Material;
  dark: THREE.Material;
  leather: THREE.Material;
}

type V3 = [number, number, number];

function B({ s, p, m }: { s: V3; p: V3; m: THREE.Material }) {
  return (
    <mesh position={p} material={m} castShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

/**
 * One handle, modelled lengthwise along Y with its back on the surface (z = 0)
 * and pointing out along +z. `dir="h"` lays it along X instead (drawers).
 * `span` is the length of the door edge / drawer front, used by the edge-style pulls.
 */
function HandleShape({ style, span, mats }: { style: HandleStyle; span: number; mats: HandleMats }) {
  const { handle, handleDS, dark, leather } = mats;
  const len = span * 0.94;

  switch (style) {
    case "bar":
      return <B s={[0.012, 0.28, 0.022]} p={[0, 0, 0.011]} m={handle} />;
    case "hbar":
      return <B s={[0.2, 0.012, 0.022]} p={[0, 0, 0.011]} m={handle} />;
    case "long":
      return <B s={[0.014, Math.min(span * 0.7, 1.1), 0.026]} p={[0, 0, 0.013]} m={handle} />;
    case "slim":
      return <B s={[0.006, 0.45, 0.012]} p={[0, 0, 0.006]} m={handle} />;
    case "tbar":
      return (
        <group>
          <B s={[0.012, 0.3, 0.012]} p={[0, 0, 0.032]} m={handle} />
          <B s={[0.01, 0.01, 0.028]} p={[0, 0.11, 0.014]} m={handle} />
          <B s={[0.01, 0.01, 0.028]} p={[0, -0.11, 0.014]} m={handle} />
        </group>
      );
    case "dpull":
      // half-torus arch: spans along Y, bulges out along +Z
      return (
        <group rotation={[0, -Math.PI / 2, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]} material={handle} castShadow>
            <torusGeometry args={[0.065, 0.0065, 12, 28, Math.PI]} />
          </mesh>
        </group>
      );
    case "knob":
      return (
        <group>
          <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]} material={handle} castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.016, 10]} />
          </mesh>
          <mesh position={[0, 0, 0.019]} material={handle} castShadow>
            <sphereGeometry args={[0.018, 24, 24]} />
          </mesh>
        </group>
      );
    case "cup":
      return (
        <mesh position={[0, 0, 0]} material={handleDS} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.1, 24, 1, true, -Math.PI / 2, Math.PI]} />
        </mesh>
      );
    case "ring":
      return (
        <group>
          <mesh position={[0, 0, 0.002]} rotation={[Math.PI / 2, 0, 0]} material={handle} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.004, 28]} />
          </mesh>
          <mesh position={[0, -0.006, 0.01]} material={handle} castShadow>
            <torusGeometry args={[0.02, 0.0042, 10, 28]} />
          </mesh>
        </group>
      );
    case "edge":
      return <B s={[0.014, len, 0.008]} p={[0, 0, 0.004]} m={handle} />;
    case "gola":
      // handle-less G-profile: a recessed channel with a metal lip
      return (
        <group>
          <B s={[0.026, len, 0.003]} p={[0, 0, 0.0015]} m={dark} />
          <B s={[0.004, len, 0.012]} p={[-0.011, 0, 0.006]} m={handle} />
        </group>
      );
    case "jpull":
      return (
        <group>
          <B s={[0.022, len, 0.004]} p={[0, 0, 0.002]} m={handle} />
          <B s={[0.004, len, 0.02]} p={[0.009, 0, 0.011]} m={handle} />
        </group>
      );
    case "groove":
      return <B s={[0.009, len * 0.96, 0.003]} p={[0, 0, 0.0015]} m={dark} />;
    case "recessed":
      return (
        <group>
          <B s={[0.05, 0.14, 0.003]} p={[0, 0, 0.0015]} m={dark} />
          <B s={[0.054, 0.004, 0.005]} p={[0, 0.072, 0.0025]} m={handle} />
          <B s={[0.054, 0.004, 0.005]} p={[0, -0.072, 0.0025]} m={handle} />
          <B s={[0.004, 0.14, 0.005]} p={[0.027, 0, 0.0025]} m={handle} />
          <B s={[0.004, 0.14, 0.005]} p={[-0.027, 0, 0.0025]} m={handle} />
        </group>
      );
    case "strap":
      return (
        <group>
          <B s={[0.022, 0.24, 0.006]} p={[0, 0, 0.016]} m={leather} />
          {[-0.1, 0.1].map((y) => (
            <mesh key={y} position={[0, y, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={handle} castShadow>
              <cylinderGeometry args={[0.007, 0.007, 0.02, 14]} />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}

const EDGE_TYPES: HandleStyle[] = ["edge", "gola", "jpull", "groove"];
export const isEdgeStyle = (s: HandleStyle) => EDGE_TYPES.includes(s);

interface DoorHandleProps {
  style: HandleStyle;
  mats: HandleMats;
  w: number;
  h: number;
  /** Handle height relative to the door's centre. */
  hy: number;
  /** Which edge is the free (opening) edge. */
  side: "left" | "right";
  /** z of the door's front surface. */
  surface: number;
}

/** A handle on a door leaf — placed at the free edge, vertical. */
export function DoorHandle({ style, mats, w, h, hy, side, surface }: DoorHandleProps) {
  if (style === "none") return null;
  const sx = side === "right" ? 1 : -1;
  let x: number;
  let y = hy;
  if (isEdgeStyle(style)) {
    x = sx * (w / 2 - 0.014);
    y = 0;
  } else if (style === "hbar") {
    x = sx * (w / 2 - 0.13);
  } else if (style === "long") {
    x = sx * (w / 2 - 0.04);
    y = 0;
  } else if (style === "recessed") {
    x = sx * (w / 2 - 0.06);
  } else if (style === "slim") {
    x = sx * (w / 2 - 0.03);
  } else {
    x = sx * (w / 2 - 0.045);
  }
  // gola/jpull lips sit on the outer side of the groove
  const flip = (style === "gola" || style === "jpull") && sx === -1;
  return (
    <group position={[x, y, surface]} scale={flip ? [-1, 1, 1] : [1, 1, 1]}>
      <HandleShape style={style} span={h} mats={mats} />
    </group>
  );
}

interface DrawerHandleProps {
  style: HandleStyle;
  mats: HandleMats;
  w: number;
  h: number;
  surface: number;
}

/** A handle on a drawer front — placed near the top edge, horizontal. */
export function DrawerHandle({ style, mats, w, h, surface }: DrawerHandleProps) {
  if (style === "none") return null;
  // hbar means "horizontal bar" — on a drawer that is simply the normal bar
  const shape: HandleStyle = style === "hbar" ? "bar" : style;
  const y = isEdgeStyle(shape) ? h / 2 - 0.013 : h / 2 - 0.045;
  const rotates = shape !== "knob" && shape !== "ring" && shape !== "recessed";
  const rotZ = rotates ? Math.PI / 2 : 0;
  return (
    <group position={[0, y, surface]} rotation={[0, 0, rotZ]}>
      <HandleShape style={shape} span={w} mats={mats} />
    </group>
  );
}
