// Floor-plan geometry for the walkthrough experience. Ported from the room
// layout in public/design-studio-floor.html (vanilla three.js) so the R3F
// walkthrough shows the exact same rooms, walls and door openings.

export type FloorType = "wood" | "tile" | "kitchen";
export type WallSide = "N" | "S" | "E" | "W";

export interface DoorGap {
  width: number;
  /** fraction 0..1 along the wall where the door is centered; defaults to 0.5 */
  at?: number;
}

export interface Room {
  id: string;
  label: string;
  sub: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  floor: FloorType;
  walls: WallSide[];
  doors?: Partial<Record<WallSide, DoorGap>>;
  isKitchen?: boolean;
  isCore?: boolean;
}

export const WALL_H = 2.7;
export const WALL_T = 0.12;
export const EYE_H = 1.6;

export const ROOMS: Room[] = [
  {
    id: "bedroom",
    label: "Bedroom-1",
    sub: "5.785 × 3.775 m",
    x0: 5.5,
    x1: 11.285,
    z0: 1.35,
    z1: 5.125,
    floor: "wood",
    walls: ["S", "E", "N", "W"],
    doors: { S: { width: (11.285 - 5.5) * 0.75, at: 0.5 }, N: { width: 1.0, at: 0.121 } },
  },
  { id: "toilet", label: "", sub: "", x0: 0, x1: 3.3, z0: 5.125, z1: 6.7, floor: "wood", walls: [] },
  { id: "tvunit", label: "", sub: "", x0: 3.3, x1: 3.3, z0: 5.125, z1: 6.7, floor: "wood", walls: [] },
  { id: "pooja", label: "", sub: "", x0: 0, x1: 1.2, z0: 6.85, z1: 8.05, floor: "wood", walls: [] },
  {
    id: "kitchen",
    label: "Kitchen",
    sub: "2.85 × 4.085 m",
    x0: 0,
    x1: 2.85,
    z0: 8.2,
    z1: 12.285,
    floor: "kitchen",
    walls: ["W"],
    isKitchen: true,
  },
  { id: "dining", label: "", sub: "", x0: 3.45, x1: 6.3, z0: 8.2, z1: 12.285, floor: "wood", walls: [] },
  {
    id: "core",
    label: "Stair + Lift",
    sub: "",
    x0: 0,
    x1: 3.15,
    z0: 1.2,
    z1: 4.975,
    floor: "wood",
    walls: ["S", "W", "N"],
    isCore: true,
  },
  { id: "lobby", label: "", sub: "", x0: 3.45, x1: 5.35, z0: 4.755, z1: 7.65, floor: "wood", walls: [] },
  {
    id: "drawing",
    label: "Drawing Room",
    sub: "8.435 × 5.135 m",
    x0: 2.85,
    x1: 11.285,
    z0: 10.65,
    z1: 15.785,
    floor: "wood",
    walls: ["E", "N"],
  },
  {
    id: "ensuite",
    label: "Bathroom",
    sub: "3.985 × 2.375 m",
    x0: 7.3,
    x1: 11.285,
    z0: 5.125,
    z1: 7.5,
    floor: "tile",
    walls: ["W", "N", "E", "S"],
    doors: { W: { width: 0.9, at: 0.2 } },
  },
  { id: "diningNook", label: "", sub: "", x0: 5.35, x1: 7.3, z0: 5.125, z1: 6.5, floor: "wood", walls: [] },
];

export const BOTTOM_BALCONY = { x0: 0, x1: 11.285, z0: 0, z1: 1.2 };
export const TOP_BALCONY = { x0: 3.45, x1: 11.285, z0: 15.785, z1: 16.985 };
export const BUILDING = { x0: 0, x1: 11.285, z0: 0, z1: 16.985 };

export const FLOOR_COLORS: Record<FloorType, string> = {
  wood: "#B98F5E",
  tile: "#D8D3C6",
  kitchen: "#E8C9A0",
};

export const bedroomRoom = ROOMS[0];

export function roomWidth(r: Pick<Room, "x0" | "x1">): number {
  return r.x1 - r.x0;
}
export function roomDepth(r: Pick<Room, "z0" | "z1">): number {
  return r.z1 - r.z0;
}
export function roomCenterX(r: Pick<Room, "x0" | "x1">): number {
  return (r.x0 + r.x1) / 2;
}
export function roomCenterZ(r: Pick<Room, "z0" | "z1">): number {
  return (r.z0 + r.z1) / 2;
}

export interface WallSegment {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  exterior?: boolean;
}

// Mirrors buildRoomWalls() in design-studio-floor.html: cuts a gap into a
// side's wall for its door instead of building it solid.
export function buildRoomWallSegments(r: Room): WallSegment[] {
  const t = WALL_T / 2;
  const segs: WallSegment[] = [];
  (r.walls || []).forEach((side) => {
    const door = r.doors?.[side];
    if (side === "W" || side === "E") {
      const wx0 = side === "W" ? r.x0 - t : r.x1 - t;
      const wx1 = side === "W" ? r.x0 + t : r.x1 + t;
      if (!door) {
        segs.push({ x0: wx0, x1: wx1, z0: r.z0, z1: r.z1 });
        return;
      }
      const zc = r.z0 + (r.z1 - r.z0) * (door.at ?? 0.5);
      const zg0 = zc - door.width / 2;
      const zg1 = zc + door.width / 2;
      if (zg0 > r.z0) segs.push({ x0: wx0, x1: wx1, z0: r.z0, z1: zg0 });
      if (zg1 < r.z1) segs.push({ x0: wx0, x1: wx1, z0: zg1, z1: r.z1 });
    }
    if (side === "S" || side === "N") {
      const wz0 = side === "S" ? r.z0 - t : r.z1 - t;
      const wz1 = side === "S" ? r.z0 + t : r.z1 + t;
      if (!door) {
        segs.push({ x0: r.x0, x1: r.x1, z0: wz0, z1: wz1 });
        return;
      }
      const xc = r.x0 + (r.x1 - r.x0) * (door.at ?? 0.5);
      const xg0 = xc - door.width / 2;
      const xg1 = xc + door.width / 2;
      if (xg0 > r.x0) segs.push({ x0: r.x0, x1: xg0, z0: wz0, z1: wz1 });
      if (xg1 < r.x1) segs.push({ x0: xg1, x1: r.x1, z0: wz0, z1: wz1 });
    }
  });
  return segs;
}

// Subtracts the z-ranges rooms already cover on a given building edge from
// [z0, z1], returning the leftover gaps. Avoids stacking the exterior
// perimeter wall directly on top of a room's own edge wall (which the
// original file does unconditionally, causing z-fighting where a room like
// the kitchen or core already walls off that edge).
function subtractCoveredRanges(z0: number, z1: number, covered: Array<[number, number]>): Array<[number, number]> {
  const sorted = covered.slice().sort((a, b) => a[0] - b[0]);
  const gaps: Array<[number, number]> = [];
  let cursor = z0;
  for (const [c0, c1] of sorted) {
    if (c0 > cursor) gaps.push([cursor, Math.min(c0, z1)]);
    cursor = Math.max(cursor, c1);
    if (cursor >= z1) break;
  }
  if (cursor < z1) gaps.push([cursor, z1]);
  return gaps.filter(([g0, g1]) => g1 - g0 > 0.001);
}

export function allWallSegments(): WallSegment[] {
  const segs: WallSegment[] = [];
  ROOMS.forEach((r) => segs.push(...buildRoomWallSegments(r)));
  const t = WALL_T / 2;

  const westCovered: Array<[number, number]> = ROOMS.filter((r) => r.x0 === BUILDING.x0 && r.walls.includes("W")).map(
    (r) => [r.z0, r.z1]
  );
  const eastCovered: Array<[number, number]> = ROOMS.filter((r) => r.x1 === BUILDING.x1 && r.walls.includes("E")).map(
    (r) => [r.z0, r.z1]
  );

  subtractCoveredRanges(BOTTOM_BALCONY.z1, TOP_BALCONY.z0, westCovered).forEach(([z0, z1]) =>
    segs.push({ x0: BUILDING.x0 - t, x1: BUILDING.x0 + t, z0, z1, exterior: true })
  );
  subtractCoveredRanges(BOTTOM_BALCONY.z1, TOP_BALCONY.z0, eastCovered).forEach(([z0, z1]) =>
    segs.push({ x0: BUILDING.x1 - t, x1: BUILDING.x1 + t, z0, z1, exterior: true })
  );

  return segs;
}
