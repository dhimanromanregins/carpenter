import { useMemo } from "react";
import * as THREE from "three";
import { floorHeightAt, GROUND_Y, HALL, STAIRCASE, STAIR_HALL } from "./bedroomLayout";
import { getBedroomMaterials } from "./bedroomMaterials";
import { MixedPointLight } from "./MixedLight";
import { Box, type V3 } from "./primitives";
import { getBedroomTextures, withRepeat } from "./proceduralTextures";

// A stair tower bump-out east of the hall: open-riser oak treads
// cantilevered off the walls, climbing in an L up the hall's full height
// (3.4 m) to a top landing where a first floor will eventually connect.
// Every edge of the flight is either flush against a wall or guarded by
// a steel-and-glass rail — see bedroomLayout's STAIR_HALL comment.

const WALL_T = 0.2;
const RAIL_H = 0.95;
/** Height of the grand opening from the top landing into the first floor. */
const LANDING_OPENING_H = 2.6;
const W = STAIR_HALL.x1 - STAIR_HALL.x0;
const D = STAIR_HALL.z1 - STAIR_HALL.z0;

type Box2D = { x0: number; x1: number; z0: number; z1: number };

function StairHallShell() {
  const m = getBedroomMaterials();
  const cx = (STAIR_HALL.x0 + STAIR_HALL.x1) / 2;
  const cz = (STAIR_HALL.z0 + STAIR_HALL.z1) / 2;
  const H = STAIR_HALL.height;
  const maps = useMemo(() => withRepeat(getBedroomTextures().marbleFloor, W / 1.2, D / 1.2), []);
  return (
    <group>
      {/* Floor, carried straight through from the hall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshPhysicalMaterial map={maps.map} roughnessMap={maps.roughnessMap} roughness={1} clearcoat={0.85} clearcoatRoughness={0.1} />
      </mesh>
      {/* North and east walls, full height — west is the hall's own east wall */}
      <Box size={[W + 2 * WALL_T, H, WALL_T]} position={[cx, H / 2, STAIR_HALL.z0 - WALL_T / 2]} material={m.wall} />
      <Box size={[WALL_T, H, D + 2 * WALL_T]} position={[STAIR_HALL.x1 + WALL_T / 2, H / 2, cz]} material={m.wall} />
      {/* South wall, open where the top landing meets the first floor's landing hall */}
      <Box
        size={[STAIRCASE.topLanding.x0 - (STAIR_HALL.x0 - WALL_T), H, WALL_T]}
        position={[(STAIR_HALL.x0 - WALL_T + STAIRCASE.topLanding.x0) / 2, H / 2, STAIR_HALL.z1 + WALL_T / 2]}
        material={m.wall}
      />
      <Box
        size={[STAIR_HALL.x1 + WALL_T - STAIRCASE.topLanding.x1, H, WALL_T]}
        position={[(STAIRCASE.topLanding.x1 + STAIR_HALL.x1 + WALL_T) / 2, H / 2, STAIR_HALL.z1 + WALL_T / 2]}
        material={m.wall}
      />
      <Box
        size={[STAIRCASE.topLanding.x1 - STAIRCASE.topLanding.x0, H - LANDING_OPENING_H, WALL_T]}
        position={[(STAIRCASE.topLanding.x0 + STAIRCASE.topLanding.x1) / 2, (H + LANDING_OPENING_H) / 2, STAIR_HALL.z1 + WALL_T / 2]}
        material={m.wall}
      />
      {/* The shared wall with the hall rises past its roofline to the tower's own */}
      <Box size={[WALL_T, H - HALL.height, D + 2 * WALL_T]} position={[HALL.x1 + WALL_T / 2, (H + HALL.height) / 2, cz]} material={m.wall} />
      {/* A clerestory strip of glazing high on the east wall, for daylight down the stairwell */}
      <mesh position={[STAIR_HALL.x1 + 0.01, H - 0.9, cz]} rotation={[0, -Math.PI / 2, 0]} material={m.glass}>
        <planeGeometry args={[D - 0.6, 1.1]} />
      </mesh>
      {/* Flat roof and parapet, matching the rest of the house */}
      <Box size={[W + 0.4, 0.1, D + 0.4]} position={[cx, H + 0.05, cz]} material={m.ceiling} cast={false} />
      <Box size={[W + 2 * WALL_T + 0.04, 0.3, WALL_T + 0.04]} position={[cx, H + 0.15, STAIR_HALL.z0 - WALL_T / 2]} material={m.charcoal} />
      <Box size={[WALL_T + 0.04, 0.3, D + 2 * WALL_T]} position={[STAIR_HALL.x1 + WALL_T / 2, H + 0.15, cz]} material={m.charcoal} />
      <Box size={[W + 2 * WALL_T + 0.04, 0.3, WALL_T + 0.04]} position={[cx, H + 0.15, STAIR_HALL.z1 + WALL_T / 2]} material={m.charcoal} />
      {/* Plinth below the floor, as every other wing stands on */}
      <Box size={[W + 2 * WALL_T, -GROUND_Y - 0.02, D + 2 * WALL_T]} position={[cx, GROUND_Y / 2 - 0.01, cz]} material={m.travertine} cast={false} />
    </group>
  );
}

const ledStrip = () => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFC98A", emissiveIntensity: 2.2 });

/** One flight's run of marble treads, with a warm LED strip under each nosing. */
function TreadRow({ box, axis, baseY }: { box: Box2D; axis: "x" | "z"; baseY: number }) {
  const m = getBedroomMaterials();
  const led = useMemo(ledStrip, []);
  const { steps, run, rise } = STAIRCASE;
  return (
    <group>
      {Array.from({ length: steps }, (_, i) => {
        const y = baseY + (i + 1) * rise - 0.025;
        const along = (axis === "x" ? box.x0 : box.z0) + i * run + run / 2;
        const cx = axis === "x" ? along : (box.x0 + box.x1) / 2;
        const cz = axis === "x" ? (box.z0 + box.z1) / 2 : along;
        const sx = axis === "x" ? run - 0.012 : box.x1 - box.x0;
        const sz = axis === "x" ? box.z1 - box.z0 : run - 0.012;
        // The nosing edge, where the tread overhangs the riser below.
        const nx = axis === "x" ? cx - run / 2 + 0.01 : cx;
        const nz = axis === "x" ? cz : cz - run / 2 + 0.01;
        return (
          <group key={i}>
            <mesh position={[cx, y, cz]} material={m.stone} castShadow receiveShadow>
              <boxGeometry args={[sx, 0.05, sz]} />
            </mesh>
            <mesh position={[nx, y - 0.018, nz]} material={led}>
              <boxGeometry args={[axis === "x" ? 0.012 : sx - 0.1, 0.01, axis === "x" ? sz - 0.1 : 0.012]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** A flat landing slab in the same marble as the treads. */
function LandingSlab({ box, y }: { box: Box2D; y: number }) {
  const m = getBedroomMaterials();
  return <Box size={[box.x1 - box.x0, 0.05, box.z1 - box.z0]} position={[(box.x0 + box.x1) / 2, y - 0.025, (box.z0 + box.z1) / 2]} material={m.stone} />;
}

/**
 * A glass-and-steel guardrail topped with a warm wooden handrail, along a
 * polyline of waypoints — straight where the floor is flat, sloped where
 * it climbs a flight. Posts drop from the rail line down to whatever
 * tread or landing is underfoot.
 */
function GuardRail({ waypoints }: { waypoints: V3[] }) {
  const m = getBedroomMaterials();
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({ color: "#cfe0e4", roughness: 0.05, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
    []
  );
  const segments: [V3, V3][] = waypoints.slice(0, -1).map((p, i) => [p, waypoints[i + 1]]);
  const posts: V3[] = [];
  for (const [a, b] of segments) {
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const horiz = Math.hypot(dx, dz);
    const n = Math.max(1, Math.round(horiz / 0.85));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      posts.push([a[0] + dx * t, a[1] + (b[1] - a[1]) * t, a[2] + dz * t]);
    }
  }
  return (
    <group>
      {segments.map(([a, b], i) => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const dz = b[2] - a[2];
        const horiz = Math.hypot(dx, dz);
        const len = Math.hypot(horiz, dy);
        const yaw = Math.atan2(dx, dz);
        const pitch = Math.atan2(dy, horiz);
        const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        return (
          <group key={i} position={mid} rotation={[0, yaw, 0]}>
            <group rotation={[-pitch, 0, 0]}>
              {/* Warm walnut handrail cap */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.walnut} castShadow>
                <cylinderGeometry args={[0.028, 0.028, len, 16]} />
              </mesh>
              <mesh position={[0, -0.016, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.blackMetal}>
                <cylinderGeometry args={[0.016, 0.016, len, 12]} />
              </mesh>
              <mesh position={[0, -0.45, 0]} material={glassMat}>
                <boxGeometry args={[0.012, 0.86, Math.max(0.01, len - 0.08)]} />
              </mesh>
            </group>
          </group>
        );
      })}
      {posts.map((p, i) => {
        const floorY = floorHeightAt(p[0], p[2]);
        const h = Math.max(0.05, p[1] - floorY);
        return (
          <mesh key={i} position={[p[0], floorY + h / 2, p[2]]} material={m.blackMetal} castShadow>
            <cylinderGeometry args={[0.016, 0.016, h, 10]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Staircase() {
  const { flight1, landing1, flight2, topLanding } = STAIRCASE;
  const railWaypoints: V3[] = useMemo(
    () => [
      [flight1.x0, RAIL_H, flight1.z1],
      [landing1.x0, landing1.y + RAIL_H, landing1.z1],
      [flight2.x0, topLanding.y + RAIL_H, flight2.z1],
      [flight2.x0, topLanding.y + RAIL_H, topLanding.z1],
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return (
    <group>
      <TreadRow box={flight1} axis="x" baseY={0} />
      <LandingSlab box={landing1} y={landing1.y} />
      <TreadRow box={flight2} axis="z" baseY={landing1.y} />
      <LandingSlab box={topLanding} y={topLanding.y} />
      <GuardRail waypoints={railWaypoints} />
      <MixedPointLight position={[flight1.x0 + 1.2, 2.0, (flight1.z0 + flight1.z1) / 2]} day={0.3} evening={1.6} distance={5} decay={1.8} color="#FFE6C8" />
      <MixedPointLight position={[flight2.x0 + 0.5, topLanding.y + 1.8, flight2.z1]} day={0.3} evening={1.6} distance={5} decay={1.8} color="#FFE6C8" />
    </group>
  );
}

export function StairHall() {
  return (
    <group>
      <StairHallShell />
      <Staircase />
    </group>
  );
}
