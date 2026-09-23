import { useContext, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DOOR, PARTITION } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { OpeningsContext, openingState } from "./bedroomState";
import { Hotspot } from "./Hotspot";
import { clickable, useEased } from "./interaction";
import { Box } from "./primitives";

const LINING = 0.02;
const LEAF_T = 0.045;
const OPEN_ANGLE = 1.62; // a touch past 90°, swinging into the hall
const LEAF_W = DOOR.x1 - DOOR.x0 - 2 * LINING - 0.006;
const LEAF_H = DOOR.height - LINING - 0.008;
const HINGE_X = DOOR.x1 - LINING - 0.003;
const HINGE_Z = PARTITION.z1 - 0.004;

function Lever({ side }: { side: 1 | -1 }) {
  const m = getBedroomMaterials();
  // side: -1 = bedroom face, +1 = hall face (leaf-local z).
  return (
    <group position={[-LEAF_W + 0.07, 1.02, side * (LEAF_T / 2)]}>
      <mesh position={[0, 0, side * 0.006]} rotation={[Math.PI / 2, 0, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.012, 28]} />
      </mesh>
      <mesh position={[0, 0, side * 0.03]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
        <cylinderGeometry args={[0.009, 0.009, 0.05, 12]} />
      </mesh>
      <mesh position={[0.06, 0, side * 0.055]} rotation={[0, 0, Math.PI / 2]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.13, 12]} />
      </mesh>
    </group>
  );
}

/**
 * The bedroom door: a panelled walnut leaf with levers on both faces,
 * hung on three brass hinges, that swings open into the hall on click.
 * Its open/closed state lives with the page (tours open it too).
 */
export function BedroomDoor() {
  const m = getBedroomMaterials();
  const { doorOpen, setDoorOpen } = useContext(OpeningsContext);
  const open = useEased(doorOpen, 2.4);
  const leaf = useRef<THREE.Group>(null);
  const trim = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E6DFD3", roughness: 0.55 }), []);
  const panelMat = useMemo(() => {
    const p = m.walnut.clone();
    p.color = new THREE.Color("#d9cbbd");
    return p;
  }, [m.walnut]);

  useFrame(() => {
    openingState.door = open.current;
    if (leaf.current) leaf.current.rotation.y = OPEN_ANGLE * open.current;
  });

  const toggle = () => setDoorOpen(!doorOpen);
  const handlers = clickable(toggle);
  const midX = (DOOR.x0 + DOOR.x1) / 2;
  const depth = PARTITION.z1 - PARTITION.z0;
  const midZ = (PARTITION.z0 + PARTITION.z1) / 2;
  const arch = 0.07;

  return (
    <group>
      {/* Jamb and head linings inside the opening */}
      <Box size={[LINING, DOOR.height, depth]} position={[DOOR.x0 + LINING / 2, DOOR.height / 2, midZ]} material={trim} />
      <Box size={[LINING, DOOR.height, depth]} position={[DOOR.x1 - LINING / 2, DOOR.height / 2, midZ]} material={trim} />
      <Box size={[DOOR.x1 - DOOR.x0, LINING, depth]} position={[midX, DOOR.height - LINING / 2, midZ]} material={trim} />
      {/* Architraves on both faces */}
      {[PARTITION.z0 - 0.011, PARTITION.z1 + 0.011].map((z) => (
        <group key={z}>
          <Box size={[arch, DOOR.height + arch, 0.022]} position={[DOOR.x0 - arch / 2, (DOOR.height + arch) / 2, z]} material={trim} />
          <Box size={[arch, DOOR.height + arch, 0.022]} position={[DOOR.x1 + arch / 2, (DOOR.height + arch) / 2, z]} material={trim} />
          <Box size={[DOOR.x1 - DOOR.x0 + 2 * arch, arch, 0.022]} position={[midX, DOOR.height + arch / 2, z]} material={trim} />
        </group>
      ))}

      {/* The leaf, pivoting on its hinge edge */}
      <group ref={leaf} position={[HINGE_X, 0.004, HINGE_Z]}>
        <group position={[0, 0, -LEAF_T / 2]}>
          <mesh position={[-LEAF_W / 2, LEAF_H / 2, 0]} material={m.walnut} castShadow receiveShadow {...handlers}>
            <boxGeometry args={[LEAF_W, LEAF_H, LEAF_T]} />
          </mesh>
          {/* Recessed shaker panels, both faces */}
          {[-1, 1].flatMap((side) =>
            [
              [0.52, 1.02],
              [1.52, 0.72],
            ].map(([cy, ph]) => (
              <mesh key={`${side}-${cy}`} position={[-LEAF_W / 2, cy, side * (LEAF_T / 2 + 0.001)]} material={panelMat} receiveShadow {...handlers}>
                <boxGeometry args={[LEAF_W - 0.2, ph, 0.004]} />
              </mesh>
            ))
          )}
          <Lever side={-1} />
          <Lever side={1} />
        </group>
        {[0.25, 1.05, 1.85].map((y) => (
          <mesh key={y} position={[0.004, y, 0]} material={m.brass}>
            <cylinderGeometry args={[0.008, 0.008, 0.1, 10]} />
          </mesh>
        ))}
      </group>

      <Hotspot position={[midX, 1.35, midZ]} label={doorOpen ? "Close door" : "Open door"} onActivate={toggle} spaces={[0, 1]} />
    </group>
  );
}
