// Single source of truth for the walkthrough's dimensions: the master
// bedroom, the living hall outside its door, and the balcony deck beyond
// the hall's sliding glass wall. Interior wall faces sit exactly on these
// bounds; furniture placement, walk colliders and tour viewpoints are laid
// out against them. Units are metres, +y up, the bed wall is north (-z),
// the hall is south (+z) of the bedroom.

export const ROOM = {
  x0: -2.6,
  x1: 2.6,
  z0: -2.3,
  z1: 2.3,
  height: 3.0,
  /** Underside of the perimeter drop-ceiling band. */
  bandBottom: 2.72,
  /** Inner edge of the drop-ceiling band (the recessed tray opening). */
  trayInset: 0.6,
} as const;

export const WINDOW = { z0: -1.2, z1: 1.2, y0: 0.45, y1: 2.6 } as const;

/** The bedroom door opening in the shared bedroom/hall wall. */
export const DOOR = { x0: 1.15, x1: 2.05, height: 2.1 } as const;
/** Bedroom wall (0.2) plus the hall's panelled skin (0.04). */
export const PARTITION = { z0: ROOM.z1, z1: ROOM.z1 + 0.24 } as const;

export const HALL = {
  x0: -4.6,
  x1: 5.4,
  z0: PARTITION.z1,
  z1: 9.9,
  height: 3.4,
  bandBottom: 3.12,
  trayInset: 0.75,
} as const;

/** The hall's south glass wall: four panels, the third one slides. */
export const GLASS_WALL = { x0: -3.4, x1: 4.4, height: 3.0, z: HALL.z1 } as const;
export const SLIDER = { x0: 0.5, x1: 2.45 } as const;

export const DECK = { x0: -3.6, x1: 4.6, z0: HALL.z1 + 0.2, z1: 12.8 } as const;

/** En-suite bathroom wing, west of the hall. */
export const BATH = {
  x0: -8.6,
  x1: HALL.x0 - 0.2,
  z0: 3.2,
  z1: 7.6,
  height: 3.0,
  bandBottom: 2.74,
  trayInset: 0.55,
} as const;
/** Kitchen wing, south of the bathroom and open to the dining end of the hall. */
export const KITCHEN = {
  x0: -8.6,
  x1: HALL.x0 - 0.2,
  z0: 7.8,
  z1: 12.6,
  height: 3.0,
  bandBottom: 2.74,
  trayInset: 0.55,
} as const;
/** Wide cased opening between the hall and the kitchen — no door. */
export const KITCHEN_OPENING = { z0: 8.4, z1: 9.7, height: 2.4 } as const;
export const KITCHEN_WINDOW_S = { x0: -8.2, x1: -6.4, y0: 1.05, y1: 2.2 } as const;
export const KITCHEN_WINDOW_E = { z0: 10.7, z1: 11.9, y0: 1.0, y1: 2.25 } as const;

/**
 * Stair tower: a bump-out east of the hall, reached where the SE floor
 * plant used to stand. A wide, grand L-shaped flight (5'6" / 1.7 m, marble
 * treads) climbs the hall's full height (3.4 m) to a top landing that
 * opens directly onto the first floor's drawing room.
 */
const STAIR_RISE = HALL.height / 20;
const STAIR_RUN = 0.27;
const STAIR_STEPS = 10;
const STAIR_WIDTH = 1.7;
/** No door — a plain cased opening through the hall's east wall. */
export const STAIR_OPENING = { z0: 9.1, z1: 10.6, height: 2.4 } as const;
export const STAIRCASE = {
  rise: STAIR_RISE,
  run: STAIR_RUN,
  steps: STAIR_STEPS,
  width: STAIR_WIDTH,
  /** Flight 1: climbs east, straight in from the hall doorway. */
  flight1: { x0: 5.9, x1: 5.9 + STAIR_STEPS * STAIR_RUN, z0: 9.0, z1: 10.0 },
  /** Corner landing, half way up. */
  landing1: { x0: 5.9 + STAIR_STEPS * STAIR_RUN, x1: 5.9 + STAIR_STEPS * STAIR_RUN + STAIR_WIDTH, z0: 9.0, z1: 10.0, y: STAIR_STEPS * STAIR_RISE },
  /** Flight 2: turns 90°, climbs south to the top landing. */
  flight2: {
    x0: 5.9 + STAIR_STEPS * STAIR_RUN,
    x1: 5.9 + STAIR_STEPS * STAIR_RUN + STAIR_WIDTH,
    z0: 10.0,
    z1: 10.0 + STAIR_STEPS * STAIR_RUN,
  },
  /** Where the first floor will eventually connect. */
  topLanding: {
    x0: 5.9 + STAIR_STEPS * STAIR_RUN,
    x1: 5.9 + STAIR_STEPS * STAIR_RUN + STAIR_WIDTH,
    z0: 10.0 + STAIR_STEPS * STAIR_RUN,
    z1: 10.0 + STAIR_STEPS * STAIR_RUN + STAIR_WIDTH,
    y: 2 * STAIR_STEPS * STAIR_RISE,
  },
} as const;
/** Floor-to-floor height of the first storey (11 ft ceiling + structure). */
export const FIRST_FLOOR_HEIGHT = 3.35;
/**
 * The tower's own footprint — tall enough to clear the top landing's
 * headroom and rise the full double-height void up to the first floor's
 * own ceiling. Flush against the stair's own north/east/south edges (no
 * margin), so every wall doubles as that edge's guardrail; only the
 * flight's two genuinely open edges (handled in bedroomLayout's wall/
 * collider lists) need a real rail.
 */
export const STAIR_HALL = {
  x0: HALL.x1 + 0.2,
  x1: STAIRCASE.flight2.x1,
  z0: STAIRCASE.flight1.z0,
  z1: STAIRCASE.topLanding.z1,
  height: HALL.height + FIRST_FLOOR_HEIGHT,
} as const;

// ═══════════════════════════ FIRST FLOOR ═══════════════════════════════
// A luxury residence floor reached by the staircase above: an open
// drawing/kitchen/dining/pooja wing north, two ensuite bedrooms either
// side of the drawing room, a short landing hall off the stair's top
// landing, and a balcony filling the bay east of the drawing room. Built
// entirely in fresh x/z territory south of the stair tower, so it never
// overlaps the ground floor's own walls and colliders below it.
const F1Y = HALL.height; // 3.4 — the floor level the stairs arrive at
export const F1 = {
  y: F1Y,
  height: FIRST_FLOOR_HEIGHT,
  bandBottom: F1Y + FIRST_FLOOR_HEIGHT - 0.26,
  trayInset: 0.6,
  // Back row, north-facing, each sharing the party wall with the front row.
  dining: { x0: -3.55, x1: -0.5, z0: 11.44, z1: 15.1 },
  kitchen: { x0: -0.5, x1: 3.77, z0: 11.44, z1: 15.1 },
  pooja: { x0: 3.77, x1: 5.6, z0: 12.66, z1: 15.1 },
  // Landing hall off the top of the stairs — the circulation hub.
  hall: { x0: 4.99, x1: STAIRCASE.topLanding.x1, z0: STAIRCASE.topLanding.z1, z1: 16.8 },
  // Front row, south of the party wall (z = 15.1).
  drawing: { x0: -0.5, x1: 4.99, z0: 15.1, z1: 19.98 },
  bedroom1: { x0: -4.77, x1: -0.5, z0: 15.1, z1: 19.37 },
  bath1: { x0: -7.21, x1: -4.77, z0: 15.1, z1: 16.93 },
  bedroom2: { x0: STAIRCASE.topLanding.x1, x1: STAIRCASE.topLanding.x1 + 4.27, z0: 15.1, z1: 19.37 },
  bath2: { x0: STAIRCASE.topLanding.x1 + 4.27, x1: STAIRCASE.topLanding.x1 + 4.27 + 2.44, z0: 15.1, z1: 16.93 },
  // Fills the bay east of the drawing room / south of the landing hall.
  balcony: { x0: 4.99, x1: STAIRCASE.topLanding.x1, z0: 16.8, z1: 19.98 },
} as const;
/** Plain cased openings between the open-plan rooms (no door leaf). */
export const F1_OPENINGS = {
  diningKitchen: { x: F1.dining.x1, z0: F1.dining.z0, z1: F1.dining.z1 },
  kitchenDrawing: { z: F1.drawing.z0, x0: F1.kitchen.x0, x1: F1.kitchen.x1 },
  drawingHall: { x: F1.hall.x0, z0: F1.hall.z0, z1: F1.hall.z1 },
  hallLanding: { z: STAIRCASE.topLanding.z1, x0: STAIRCASE.topLanding.x0, x1: STAIRCASE.topLanding.x1 },
  hallBalcony: { z: F1.hall.z1, x0: F1.balcony.x0, x1: F1.balcony.x1 },
  bedroom2Balcony: { x: F1.bedroom2.x0, z0: F1.balcony.z0, z1: Math.min(F1.balcony.z1, F1.bedroom2.z1) },
} as const;
/** Doorways with a real leaf (bedroom/bath/pooja privacy). */
export const F1_DOORS = {
  drawingBedroom1: { x: F1.bedroom1.x1, z0: F1.bedroom1.z0 + 0.1, z1: F1.bedroom1.z0 + 1.05, width: 0.95, height: 2.1 },
  bedroom1Bath1: { x: F1.bath1.x1, z0: F1.bath1.z1 - 0.85, z1: F1.bath1.z1, width: 0.85, height: 2.1 },
  hallBedroom2: { x: F1.bedroom2.x0, z0: F1.hall.z0 + 0.1, z1: F1.hall.z0 + 1.05, width: 0.95, height: 2.1 },
  bedroom2Bath2: { x: F1.bath2.x0, z0: F1.bath2.z1 - 0.85, z1: F1.bath2.z1, width: 0.85, height: 2.1 },
  /** Pooja's own wood-and-glass entrance, off the drawing room. */
  drawingPooja: { z: F1.drawing.z0, x0: 3.88, x1: 4.88, width: 1.0, height: 2.2 },
} as const;

/**
 * First-floor rooms, each its own space index (7–16). Checked as actual
 * box containment rather than a threshold, since the first floor's x/z
 * footprint partly sits above ground-floor rooms (bath1 over open garden
 * territory, but near enough the ground kitchen's x-range that a simple
 * threshold would misclassify it). Declared here (ahead of VIEWPOINTS'
 * module-load-time spaceAt() calls) so there's no temporal-dead-zone trap.
 */
const F1_ROOMS: [number, { x0: number; x1: number; z0: number; z1: number }][] = [
  [7, F1.dining],
  [8, F1.kitchen],
  [9, F1.pooja],
  [10, F1.hall],
  [11, F1.drawing],
  [12, F1.bedroom1],
  [13, F1.bath1],
  [14, F1.bedroom2],
  [15, F1.bath2],
  [16, F1.balcony],
];
function firstFloorRoomAt(x: number, z: number): number | null {
  for (const [id, b] of F1_ROOMS) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) return id;
  return null;
}

/** Its door, through the west wall of the hall. */
export const BATH_DOOR = { z0: 3.5, z1: 4.4, height: 2.15 } as const;
export const BATH_WINDOW = { z0: 4.75, z1: 6.35, y0: 1.15, y1: 2.45 } as const;

/**
 * The main entrance, in the hall's north wall east of the bedroom: a pivot
 * door with a glass sidelight, opening from a raised porch that three
 * steps climb to from the front garden.
 */
export const MAIN_DOOR = { x0: 3.3, x1: 4.5, height: 2.7, sideX0: 4.62, sideX1: 4.95 } as const;
/** Exterior face of the hall's north wall where it's outside the bedroom. */
export const FACADE = { x0: ROOM.x1 + 0.2, x1: HALL.x1 + 0.2, z: PARTITION.z0 } as const;
export const GROUND_Y = -0.6;
export const PORCH = { x0: FACADE.x0, x1: 6.0, z0: 0.7, z1: FACADE.z } as const;
/** Three treads between the lawn and the porch landing (0.15 m risers). */
export const STEPS = { x0: 3.0, x1: 4.8, tread: 0.38, rise: 0.15, count: 3 } as const;
export const GARDEN = { x0: FACADE.x0, x1: 9.0, z0: -8.0, z1: FACADE.z } as const;

export const EYE_HEIGHT = 1.6;
export const PLAYER_RADIUS = 0.24;

export interface Box2 {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

/** Everywhere the walker could possibly be (for clamping and path-finding). */
export const WORLD = {
  x0: Math.min(BATH.x0, F1.bath1.x0 - 0.2),
  x1: Math.max(STAIR_HALL.x1, F1.bath2.x1) + 0.2,
  z0: GARDEN.z0,
  z1: Math.max(DECK.z1, F1.drawing.z1, F1.balcony.z1) + 0.2,
} as const;

// Wall footprints. Openings (the door, the sliding panel) are left out
// here and handled as dynamic colliders by the walk controller.
export const WALLS: Box2[] = [
  // Bedroom
  { x0: ROOM.x0 - 0.2, x1: ROOM.x0, z0: ROOM.z0 - 0.2, z1: PARTITION.z1 },
  { x0: ROOM.x1, x1: ROOM.x1 + 0.2, z0: ROOM.z0 - 0.2, z1: PARTITION.z1 },
  { x0: ROOM.x0 - 0.2, x1: ROOM.x1 + 0.2, z0: ROOM.z0 - 0.2, z1: ROOM.z0 },
  // Bedroom/hall partition (and the hall's front wall) around both doors
  { x0: HALL.x0 - 0.2, x1: DOOR.x0, z0: PARTITION.z0, z1: PARTITION.z1 },
  { x0: DOOR.x1, x1: MAIN_DOOR.x0, z0: PARTITION.z0, z1: PARTITION.z1 },
  { x0: MAIN_DOOR.x1, x1: HALL.x1 + 0.2, z0: PARTITION.z0, z1: PARTITION.z1 },
  // Hall side walls — the west one has the bathroom door through it
  { x0: HALL.x0 - 0.2, x1: HALL.x0, z0: PARTITION.z0, z1: BATH_DOOR.z0 },
  { x0: HALL.x0 - 0.2, x1: HALL.x0, z0: BATH_DOOR.z1, z1: KITCHEN_OPENING.z0 },
  { x0: HALL.x0 - 0.2, x1: HALL.x0, z0: KITCHEN_OPENING.z1, z1: HALL.z1 + 0.2 },
  // Bathroom wing
  { x0: BATH.x0 - 0.2, x1: BATH.x0, z0: BATH.z0 - 0.2, z1: BATH.z1 + 0.2 },
  { x0: BATH.x0 - 0.2, x1: BATH.x1 + 0.2, z0: BATH.z0 - 0.2, z1: BATH.z0 },
  { x0: BATH.x0 - 0.2, x1: BATH.x1 + 0.2, z0: BATH.z1, z1: BATH.z1 + 0.2 },
  // Kitchen wing
  { x0: KITCHEN.x0 - 0.2, x1: KITCHEN.x0, z0: KITCHEN.z0 - 0.2, z1: KITCHEN.z1 + 0.2 },
  { x0: KITCHEN.x0 - 0.2, x1: KITCHEN.x1 + 0.2, z0: KITCHEN.z1, z1: KITCHEN.z1 + 0.2 },
  { x0: KITCHEN.x1, x1: KITCHEN.x1 + 0.2, z0: HALL.z1 + 0.2, z1: KITCHEN.z1 + 0.2 },
  // Hall east wall, split either side of the stair tower's doorway
  { x0: HALL.x1, x1: HALL.x1 + 0.2, z0: PARTITION.z0, z1: STAIR_OPENING.z0 },
  { x0: HALL.x1, x1: HALL.x1 + 0.2, z0: STAIR_OPENING.z1, z1: HALL.z1 + 0.2 },
  // Stair tower: north, east and south exterior walls (west is the hall's own east wall, above)
  { x0: STAIR_HALL.x0 - 0.2, x1: STAIR_HALL.x1 + 0.2, z0: STAIR_HALL.z0 - 0.2, z1: STAIR_HALL.z0 },
  { x0: STAIR_HALL.x1, x1: STAIR_HALL.x1 + 0.2, z0: STAIR_HALL.z0 - 0.2, z1: STAIR_HALL.z1 + 0.2 },
  { x0: STAIR_HALL.x0 - 0.2, x1: STAIR_HALL.x1 + 0.2, z0: STAIR_HALL.z1, z1: STAIR_HALL.z1 + 0.2 },
  // Guardrails along the open edge of each flight — block stepping off sideways
  { x0: STAIRCASE.flight1.x0, x1: STAIRCASE.flight1.x1, z0: STAIRCASE.flight1.z1 - 0.05, z1: STAIRCASE.flight1.z1 + 0.15 },
  { x0: STAIRCASE.flight2.x0 - 0.15, x1: STAIRCASE.flight2.x0 + 0.05, z0: STAIRCASE.flight2.z0, z1: STAIRCASE.flight2.z1 },
  // Fills the gap below the first floor in the tower's own west wall,
  // beyond where the hall's east wall (above) stops.
  { x0: STAIR_HALL.x0 - 0.2, x1: STAIR_HALL.x0, z0: HALL.z1 + 0.2, z1: STAIR_HALL.z1 + 0.2 },

  // ─── First floor ───────────────────────────────────────────────────────
  // Dining: west and north exterior walls; open to the kitchen (east) and
  // walled off from Bedroom 1 below it (south).
  { x0: F1.dining.x0 - 0.2, x1: F1.dining.x0, z0: F1.dining.z0 - 0.2, z1: F1.dining.z1 },
  { x0: F1.dining.x0 - 0.2, x1: F1.dining.x1 + 0.2, z0: F1.dining.z0 - 0.2, z1: F1.dining.z0 },
  { x0: F1.dining.x0, x1: F1.dining.x1, z0: F1.dining.z1, z1: F1.dining.z1 + 0.2 },
  // Kitchen: north wall and the party wall with Pooja (east); open to
  // dining (west) and the drawing room (south, its full width).
  { x0: F1.kitchen.x0, x1: F1.kitchen.x1 + 0.2, z0: F1.kitchen.z0 - 0.2, z1: F1.kitchen.z0 },
  { x0: F1.kitchen.x1, x1: F1.kitchen.x1 + 0.2, z0: F1.kitchen.z0 - 0.2, z1: F1.kitchen.z1 },
  // Pooja: north wall and its own entrance, off the drawing room (south),
  // either side of its door. East wall is the stair tower's own.
  { x0: F1.pooja.x0, x1: F1.pooja.x1 + 0.2, z0: F1.pooja.z0 - 0.2, z1: F1.pooja.z0 },
  { x0: F1.pooja.x0, x1: F1_DOORS.drawingPooja.x0, z0: F1.pooja.z1, z1: F1.pooja.z1 + 0.2 },
  { x0: F1_DOORS.drawingPooja.x1, x1: F1.pooja.x1, z0: F1.pooja.z1, z1: F1.pooja.z1 + 0.2 },
  // Drawing room: east wall open to the landing hall and (below it) the
  // balcony — its full depth; south wall exterior. The north wall is
  // entirely accounted for above (open to the kitchen, Pooja's door and
  // its flanking jambs); west wall is Bedroom 1's door, above.
  { x0: F1.drawing.x0, x1: F1.drawing.x1 + 0.2, z0: F1.drawing.z1, z1: F1.drawing.z1 + 0.2 },
  // Landing hall: south wall open onto the balcony (full width); north
  // wall open to the stair's top landing (either side of that opening).
  { x0: F1.hall.x0, x1: STAIRCASE.topLanding.x0, z0: F1.hall.z0 - 0.2, z1: F1.hall.z0 },
  { x0: STAIRCASE.topLanding.x1, x1: F1.hall.x1 + 0.2, z0: F1.hall.z0 - 0.2, z1: F1.hall.z0 },
  // Bedroom 1: north (party wall with dining), west and south exterior
  // walls, and its own door either side, off the drawing room (east).
  { x0: F1.bedroom1.x0, x1: F1.dining.x0, z0: F1.bedroom1.z0 - 0.2, z1: F1.bedroom1.z0 },
  { x0: F1.dining.x1, x1: F1.bedroom1.x1, z0: F1.bedroom1.z0 - 0.2, z1: F1.bedroom1.z0 },
  { x0: F1.bedroom1.x0 - 0.2, x1: F1.bedroom1.x0, z0: F1.bath1.z0, z1: F1.bedroom1.z1 + 0.2 },
  { x0: F1.bedroom1.x0, x1: F1.bedroom1.x1, z0: F1.bedroom1.z1, z1: F1.bedroom1.z1 + 0.2 },
  { x0: F1.bedroom1.x1, x1: F1.bedroom1.x1 + 0.2, z0: F1.bedroom1.z0, z1: F1_DOORS.drawingBedroom1.z0 },
  { x0: F1.bedroom1.x1, x1: F1.bedroom1.x1 + 0.2, z0: F1_DOORS.drawingBedroom1.z1, z1: F1.bedroom1.z1 },
  // Bath 1: north, west and south exterior walls; door off Bedroom 1 (east).
  { x0: F1.bath1.x0 - 0.2, x1: F1.bath1.x1, z0: F1.bath1.z0 - 0.2, z1: F1.bath1.z0 },
  { x0: F1.bath1.x0 - 0.2, x1: F1.bath1.x0, z0: F1.bath1.z0, z1: F1.bath1.z1 + 0.2 },
  { x0: F1.bath1.x0, x1: F1.bath1.x1, z0: F1.bath1.z1, z1: F1.bath1.z1 + 0.2 },
  { x0: F1.bath1.x1, x1: F1.bath1.x1 + 0.2, z0: F1.bath1.z0, z1: F1_DOORS.bedroom1Bath1.z0 },
  { x0: F1.bath1.x1, x1: F1.bath1.x1 + 0.2, z0: F1_DOORS.bedroom1Bath1.z1, z1: F1.bath1.z1 + 0.2 },
  // Bedroom 2: north exterior wall and south wall; its own door off the
  // landing hall (west, above the party line) then fully open onto the
  // balcony (west, below it) — east wall is shared with Bath 2, above.
  { x0: F1.bedroom2.x0, x1: F1.bedroom2.x1, z0: F1.bedroom2.z0 - 0.2, z1: F1.bedroom2.z0 },
  { x0: F1.bedroom2.x1, x1: F1.bath2.x0, z0: F1.bedroom2.z0 - 0.2, z1: F1.bedroom2.z0 },
  { x0: F1.bedroom2.x0, x1: F1.bedroom2.x1 + 0.2, z0: F1.bedroom2.z1, z1: F1.bedroom2.z1 + 0.2 },
  { x0: F1.bedroom2.x0 - 0.2, x1: F1.bedroom2.x0, z0: F1.hall.z0, z1: F1_DOORS.hallBedroom2.z0 },
  { x0: F1.bedroom2.x0 - 0.2, x1: F1.bedroom2.x0, z0: F1_DOORS.hallBedroom2.z1, z1: F1.hall.z1 },
  // Bath 2: north, east and south exterior walls; door off Bedroom 2 (west).
  { x0: F1.bath2.x0, x1: F1.bath2.x1 + 0.2, z0: F1.bath2.z0 - 0.2, z1: F1.bath2.z0 },
  { x0: F1.bath2.x1, x1: F1.bath2.x1 + 0.2, z0: F1.bath2.z0, z1: F1.bath2.z1 + 0.2 },
  { x0: F1.bath2.x0, x1: F1.bath2.x1 + 0.2, z0: F1.bath2.z1, z1: F1.bath2.z1 + 0.2 },
  { x0: F1.bath2.x0 - 0.2, x1: F1.bath2.x0, z0: F1.bath2.z0, z1: F1_DOORS.bedroom2Bath2.z0 },
  { x0: F1.bath2.x0 - 0.2, x1: F1.bath2.x0, z0: F1_DOORS.bedroom2Bath2.z1, z1: F1.bath2.z1 },
  // Balcony: a glass railing round its two open edges (east and south).
  { x0: F1.balcony.x1, x1: F1.balcony.x1 + 0.1, z0: F1.balcony.z0, z1: F1.balcony.z1 + 0.1 },
  { x0: F1.balcony.x0, x1: F1.balcony.x1 + 0.1, z0: F1.balcony.z1, z1: F1.balcony.z1 + 0.1 },

  // Glass wall either side of the sliding panel
  { x0: HALL.x0 - 0.2, x1: SLIDER.x0, z0: HALL.z1, z1: HALL.z1 + 0.15 },
  { x0: SLIDER.x1, x1: HALL.x1 + 0.2, z0: HALL.z1, z1: HALL.z1 + 0.15 },
  // Deck railing
  { x0: DECK.x0 - 0.1, x1: DECK.x1 + 0.1, z0: DECK.z1, z1: DECK.z1 + 0.1 },
  { x0: DECK.x0 - 0.1, x1: DECK.x0, z0: HALL.z1, z1: DECK.z1 + 0.1 },
  { x0: DECK.x1, x1: DECK.x1 + 0.1, z0: HALL.z1, z1: DECK.z1 + 0.1 },
  // Front garden: hedges round three sides, the house on the fourth
  { x0: FACADE.x0 - 0.2, x1: FACADE.x0 + 0.25, z0: GARDEN.z0 - 0.3, z1: ROOM.z0 - 0.2 },
  { x0: FACADE.x0 - 0.2, x1: GARDEN.x1 + 0.3, z0: GARDEN.z0 - 0.3, z1: GARDEN.z0 + 0.1 },
  { x0: GARDEN.x1 - 0.1, x1: GARDEN.x1 + 0.3, z0: GARDEN.z0 - 0.3, z1: GARDEN.z1 + 0.3 },
  { x0: HALL.x1 + 0.2, x1: GARDEN.x1 + 0.3, z0: GARDEN.z1 - 0.05, z1: GARDEN.z1 + 0.3 },
  // Porch: stone cheek walls beside the steps and the landing's low edges
  { x0: FACADE.x0, x1: STEPS.x0, z0: PORCH.z0 - STEPS.tread * STEPS.count - 0.02, z1: PORCH.z0 },
  { x0: STEPS.x1, x1: STEPS.x1 + 0.2, z0: PORCH.z0 - STEPS.tread * STEPS.count - 0.02, z1: PORCH.z0 },
  { x0: STEPS.x1, x1: PORCH.x1 + 0.1, z0: PORCH.z0 - 0.1, z1: PORCH.z0 },
  { x0: PORCH.x1, x1: PORCH.x1 + 0.1, z0: PORCH.z0 - 0.1, z1: PORCH.z1 },
];

export const DOOR_CLOSED_COLLIDER: Box2 = { x0: DOOR.x0, x1: DOOR.x1, z0: PARTITION.z0, z1: PARTITION.z1 };
/** The open door leaf, swung into the hall against its hinge side. */
export const DOOR_OPEN_COLLIDER: Box2 = { x0: DOOR.x1 - 0.09, x1: DOOR.x1 + 0.03, z0: PARTITION.z1 - 0.04, z1: PARTITION.z1 + 0.9 };
/** The shower cabin: a fixed screen, a return panel and a hinged door. */
export const SHOWER = { x0: BATH.x0, x1: -6.8, z0: 6.3, z1: BATH.z1, doorX0: -7.55 } as const;
export const SHOWER_GLASS_COLLIDERS: Box2[] = [
  { x0: SHOWER.x0, x1: SHOWER.doorX0, z0: SHOWER.z0 - 0.03, z1: SHOWER.z0 + 0.03 },
  { x0: SHOWER.x1 - 0.03, x1: SHOWER.x1 + 0.03, z0: SHOWER.z0, z1: SHOWER.z1 },
];
export const SHOWER_DOOR_CLOSED_COLLIDER: Box2 = {
  x0: SHOWER.doorX0,
  x1: SHOWER.x1,
  z0: SHOWER.z0 - 0.03,
  z1: SHOWER.z0 + 0.03,
};
/** Swung outward, the leaf stands across the room in front of its hinge. */
export const SHOWER_DOOR_OPEN_COLLIDER: Box2 = {
  x0: SHOWER.x1 - 0.03,
  x1: SHOWER.x1 + 0.03,
  z0: SHOWER.z0 - (SHOWER.x1 - SHOWER.doorX0),
  z1: SHOWER.z0,
};

export const BATH_DOOR_CLOSED_COLLIDER: Box2 = { x0: BATH.x1, x1: HALL.x0, z0: BATH_DOOR.z0, z1: BATH_DOOR.z1 };
/** The open leaf, swung back against the bathroom side of the wall. */
export const BATH_DOOR_OPEN_COLLIDER: Box2 = { x0: BATH.x1 - 0.92, x1: BATH.x1, z0: BATH_DOOR.z0 - 0.06, z1: BATH_DOOR.z0 + 0.06 };

export const SLIDER_CLOSED_COLLIDER: Box2 = { x0: SLIDER.x0, x1: SLIDER.x1, z0: HALL.z1, z1: HALL.z1 + 0.15 };
export const MAIN_DOOR_CLOSED_COLLIDER: Box2 = { x0: MAIN_DOOR.x0, x1: MAIN_DOOR.x1, z0: PARTITION.z0, z1: PARTITION.z1 };
/** Pivot axis a quarter of the way in; open, the leaf stands along z there. */
export const MAIN_DOOR_PIVOT_X = MAIN_DOOR.x0 + 0.26;
export const MAIN_DOOR_OPEN_COLLIDER: Box2 = {
  x0: MAIN_DOOR_PIVOT_X - 0.06,
  x1: MAIN_DOOR_PIVOT_X + 0.06,
  z0: PARTITION.z0 - 0.2,
  z1: PARTITION.z1 + 0.95,
};

// Furniture footprints the walker can't pass through (xz only).
export const COLLIDERS: Box2[] = [
  // Bedroom
  { x0: -1.0, x1: 1.0, z0: ROOM.z0, z1: -0.1 }, // bed
  { x0: -1.64, x1: -1.08, z0: ROOM.z0, z1: -1.82 }, // left nightstand
  { x0: 1.08, x1: 1.64, z0: ROOM.z0, z1: -1.82 }, // right nightstand
  { x0: -0.66, x1: 0.66, z0: 0.04, z1: 0.46 }, // bench
  { x0: 1.98, x1: ROOM.x1, z0: -2.25, z1: 1.55 }, // wardrobe
  { x0: -1.28, x1: 0.28, z0: 1.82, z1: ROOM.z1 }, // dresser
  { x0: -2.4, x1: -1.35, z0: 0.85, z1: 1.85 }, // armchair
  { x0: -2.5, x1: -2.0, z0: 1.72, z1: 2.2 }, // floor lamp
  { x0: ROOM.x0, x1: -1.95, z0: ROOM.z0, z1: -1.55 }, // plant
  // Hall
  { x0: 4.92, x1: HALL.x1, z0: 4.85, z1: 7.55 }, // TV console
  { x0: 1.25, x1: 2.35, z0: 4.55, z1: 7.85 }, // sofa
  { x0: 2.35, x1: 3.95, z0: 6.9, z1: 7.85 }, // sofa chaise
  { x0: 2.85, x1: 4.35, z0: 5.25, z1: 6.8 }, // coffee tables
  { x0: 0.72, x1: 1.18, z0: 7.98, z1: 8.42 }, // arc lamp base
  { x0: 3.9, x1: 4.8, z0: 8.1, z1: 9.0 }, // accent chair
  { x0: -3.4, x1: -1.15, z0: 6.3, z1: 8.7 }, // dining set
  { x0: HALL.x0, x1: -4.15, z0: 5.35, z1: 8.25 }, // bookshelf
  { x0: 4.95, x1: HALL.x1, z0: 2.85, z1: 4.65 }, // console
  { x0: HALL.x0, x1: -3.75, z0: 9.2, z1: HALL.z1 }, // plant SW
  // Stair tower
  { x0: 6.0, x1: 6.6, z0: 11.7, z1: 12.3 }, // plant, tucked under the upper flight
  // Bathroom
  { x0: BATH.x0, x1: -5.65, z0: BATH.z0, z1: 3.78 }, // vanity
  { x0: BATH.x0, x1: -7.15, z0: 4.3, z1: 6.15 }, // bathtub
  { x0: -5.35, x1: BATH.x1, z0: 6.35, z1: 7.25 }, // WC
  { x0: -5.25, x1: BATH.x1, z0: 4.95, z1: 5.75 }, // towel rail and stool
  // Kitchen
  { x0: KITCHEN.x0, x1: -7.9, z0: 8.1, z1: 11.3 }, // tall run
  { x0: KITCHEN.x0, x1: -5.5, z0: 11.9, z1: KITCHEN.z1 }, // sink run
  { x0: -7.15, x1: -5.95, z0: 9.5, z1: 11.9 }, // island
  { x0: -5.95, x1: -5.6, z0: 9.8, z1: 11.6 }, // stools
  // Deck
  { x0: -0.45, x1: 0.45, z0: 11.2, z1: 12.75 }, // lounger 1
  { x0: 1.95, x1: 2.85, z0: 11.2, z1: 12.75 }, // lounger 2
  { x0: 0.95, x1: 1.45, z0: 11.95, z1: 12.45 }, // deck side table
  { x0: DECK.x0, x1: -3.0, z0: 12.2, z1: DECK.z1 }, // planter W
  { x0: 4.0, x1: DECK.x1, z0: 12.2, z1: DECK.z1 }, // planter E
  // Front garden
  { x0: 5.15, x1: 5.8, z0: 1.3, z1: 1.95 }, // porch planter
  { x0: 6.6, x1: 7.6, z0: -3.6, z1: -2.6 }, // tree
  { x0: 5.7, x1: 6.3, z0: -1.5, z1: -0.9 }, // garden planter
  { x0: 4.94, x1: 5.06, z0: -1.46, z1: -1.34 }, // bollards
  { x0: 4.94, x1: 5.06, z0: -3.66, z1: -3.54 },
  { x0: 4.94, x1: 5.06, z0: -5.86, z1: -5.74 },
  { x0: 6.9, x1: 7.9, z0: -6.9, z1: -5.9 }, // tree 2

  // ─── First floor ─────────────────────────────────────────────────────
  // Bedroom 1 / Bath 1
  { x0: -4.6, x1: -2.3, z0: 16.2, z1: 18.2 }, // bed
  { x0: -2.4, x1: -0.6, z0: 15.1, z1: 15.7 }, // wardrobe
  { x0: -2.0, x1: -0.8, z0: 17.87, z1: 19.07 }, // lounge chair + table
  { x0: -7.21, x1: -6.3, z0: 15.3, z1: 16.7 }, // vanity
  { x0: -5.37, x1: -4.97, z0: 16.23, z1: 16.73 }, // WC
  { x0: -5.87, x1: -4.77, z0: 15.1, z1: 16.1 }, // shower
  // Bedroom 2 / Bath 2
  { x0: 11.44, x1: 13.74, z0: 16.2, z1: 18.2 }, // bed
  { x0: 10.4, x1: 12.2, z0: 15.1, z1: 15.7 }, // wardrobe
  { x0: 10.6, x1: 11.8, z0: 17.87, z1: 19.07 }, // lounge chair + table
  { x0: 15.5, x1: 16.42, z0: 15.3, z1: 16.7 }, // vanity
  { x0: 14.77, x1: 15.17, z0: 16.23, z1: 16.73 }, // WC
  { x0: 14.57, x1: 15.67, z0: 15.1, z1: 16.1 }, // shower
  // Drawing room
  { x0: 0.3, x1: 4.3, z0: 16.2, z1: 19.5 }, // sectional sofa
  { x0: -0.4, x1: 1.5, z0: 18.0, z1: 19.8 }, // accent chairs
  { x0: 1.6, x1: 2.9, z0: 17.7, z1: 19.0 }, // coffee table
  { x0: -0.3, x1: 0.3, z0: 15.1, z1: 16.1 }, // side table
  { x0: 4.6, x1: 5.0, z0: 16.9, z1: 19.7 }, // media wall
  { x0: 4.3, x1: 5.0, z0: 19.3, z1: 20.0 }, // large plant
  // Dining
  { x0: -3.2, x1: -0.85, z0: 12.0, z1: 14.5 }, // table and chairs
  { x0: -4.0, x1: -2.7, z0: 11.4, z1: 12.1 }, // console
  // Kitchen
  { x0: 0.4, x1: 2.9, z0: 13.1, z1: 14.8 }, // island and stools
  { x0: 3.1, x1: 3.8, z0: 11.5, z1: 14.5 }, // tall run (fridge/pantry/oven)
  { x0: -0.45, x1: 3.72, z0: 11.44, z1: 12.14 }, // base run and sink
  // Pooja
  { x0: 4.0, x1: 5.35, z0: 12.66, z1: 13.3 }, // mandir
  // Balcony
  { x0: 6.4, x1: 8.8, z0: 17.2, z1: 18.8 }, // table and chairs
];

export interface Viewpoint {
  id: string;
  label: string;
  x: number;
  z: number;
  /** Point the camera turns to face. */
  look: [number, number, number];
}

function yawPitch(from: { x: number; z: number }, look: [number, number, number]) {
  const dx = look[0] - from.x;
  const dy = look[1] - (floorHeightAt(from.x, from.z) + EYE_HEIGHT);
  const dz = look[2] - from.z;
  return {
    yaw: Math.atan2(-dx, -dz),
    pitch: Math.atan2(dy, Math.hypot(dx, dz)),
  };
}

export const VIEWPOINTS: Viewpoint[] = [
  { id: "garden", label: "Front garden", x: 4.4, z: -5.0, look: [3.9, 0.9, 2.3] },
  { id: "front", label: "Front door", x: 3.9, z: -0.3, look: [3.9, 1.45, 2.3] },
  { id: "entrance", label: "Bedroom", x: 1.45, z: 1.85, look: [-0.9, 1.0, -1.5] },
  { id: "bed", label: "Bed", x: 0, z: 1.15, look: [0, 0.95, -2.2] },
  { id: "wardrobe", label: "Wardrobe", x: 0.15, z: 0.85, look: [2.3, 1.25, -0.45] },
  { id: "nook", label: "Reading nook", x: -0.25, z: 0.8, look: [-2.1, 0.85, 1.25] },
  { id: "dresser", label: "Dresser", x: 0.35, z: 0.75, look: [-0.6, 1.05, 2.3] },
  { id: "hall", label: "Living hall", x: 0.2, z: 3.35, look: [4.0, 1.15, 7.6] },
  { id: "tv", label: "TV wall", x: 0.45, z: 6.2, look: [5.4, 1.3, 6.2] },
  { id: "dining", label: "Dining", x: -0.6, z: 6.15, look: [-2.25, 1.0, 7.5] },
  { id: "kitchen", label: "Kitchen", x: -5.25, z: 9.1, look: [-7.6, 1.1, 11.0] },
  { id: "stairs", label: "Stairs", x: 5.3, z: 9.5, look: [9.1, 2.4, 13.0] },
  { id: "bathroom", label: "Bathroom", x: -5.55, z: 4.85, look: [-7.0, 1.15, 3.3] },
  { id: "bath", label: "Bathtub", x: -5.9, z: 5.75, look: [-7.9, 0.85, 5.3] },
  { id: "balcony", label: "Balcony", x: -2.5, z: 10.75, look: [2.2, 0.75, 13.4] },
  { id: "door", label: "Bedroom door", x: 0.9, z: 4.2, look: [1.6, 1.2, 2.5] },
  // First floor
  { id: "f1-drawing", label: "Drawing Room", x: 2.2, z: 16.2, look: [4.5, 1.1, 18.5] },
  { id: "f1-kitchen", label: "F1 Kitchen", x: 1.6, z: 12.2, look: [3.3, 1.1, 14.2] },
  { id: "f1-dining", label: "F1 Dining", x: -2.0, z: 12.2, look: [-0.9, 1.0, 13.8] },
  { id: "f1-pooja", label: "Pooja", x: 4.3, z: 13.5, look: [4.3, 1.2, 14.9] },
  { id: "f1-bedroom1", label: "Bedroom 1", x: -2.6, z: 16.6, look: [-2.6, 1.0, 19.0] },
  { id: "f1-bath1", label: "Bath 1", x: -6.0, z: 15.8, look: [-6.0, 1.1, 16.7] },
  { id: "f1-bedroom2", label: "Bedroom 2", x: 12.4, z: 16.6, look: [12.4, 1.0, 19.0] },
  { id: "f1-bath2", label: "Bath 2", x: 15.8, z: 15.8, look: [15.8, 1.1, 16.7] },
  { id: "f1-balcony", label: "Balcony (F1)", x: 7.6, z: 18.5, look: [7.6, 0.9, 19.8] },
];

export function viewpointPose(v: Viewpoint) {
  return { x: v.x, z: v.z, ...yawPitch(v, v.look) };
}

/** Visitors arrive in the front garden, facing the main door. */
export const SPAWN = viewpointPose(VIEWPOINTS[0]);

/**
 * Which space: 0 bedroom, 1 hall, 2 deck, 3 front garden, 4 bathroom,
 * 5 kitchen, 6 stair tower, 7–16 first-floor rooms (dining, kitchen,
 * pooja, landing hall, drawing room, bedroom1, bath1, bedroom2, bath2,
 * balcony — see F1_ROOMS above).
 */
export function spaceAt(x: number, z: number) {
  const f1 = firstFloorRoomAt(x, z);
  if (f1 !== null) return f1;
  if (z < (PARTITION.z0 + PARTITION.z1) / 2) return x > ROOM.x1 + 0.15 ? 3 : 0;
  if (x < HALL.x0 - 0.1) return z > KITCHEN.z0 - 0.1 ? 5 : 4;
  if (x > HALL.x1 + 0.1) return 6;
  if (z < HALL.z1 + 0.07) return 1;
  return 2;
}

/** Height of the tread or landing underfoot, climbing the stair tower. */
function stairHallFloorHeightAt(x: number, z: number) {
  const { flight1, landing1, flight2, topLanding, steps, rise } = STAIRCASE;
  const stepOf = (t: number) => (Math.min(steps - 1, Math.max(0, Math.floor(t * steps))) + 1) * rise;
  if (x >= flight1.x0 && x <= flight1.x1 && z >= flight1.z0 && z <= flight1.z1) {
    return stepOf((x - flight1.x0) / (flight1.x1 - flight1.x0));
  }
  if (x >= landing1.x0 && x <= landing1.x1 && z >= landing1.z0 && z <= landing1.z1) return landing1.y;
  if (x >= flight2.x0 && x <= flight2.x1 && z >= flight2.z0 && z <= flight2.z1) {
    return landing1.y + stepOf((z - flight2.z0) / (flight2.z1 - flight2.z0));
  }
  if (x >= topLanding.x0 && x <= topLanding.x1 && z >= topLanding.z0 && z <= topLanding.z1) return topLanding.y;
  return 0;
}

/** Floor height under a point: the lawn sits below the house, up three steps. */
export function floorHeightAt(x: number, z: number) {
  const space = spaceAt(x, z);
  if (space === 6) return stairHallFloorHeightAt(x, z);
  if (space >= 7) return F1.y;
  if (space !== 3) return 0;
  if (z >= PORCH.z0 && x <= PORCH.x1) return 0;
  if (x >= STEPS.x0 - 0.05 && x <= STEPS.x1 + 0.05) {
    for (let i = 0; i < STEPS.count; i++) {
      // i = 0 is the top tread, just below the landing.
      if (z >= PORCH.z0 - STEPS.tread * (i + 1)) return -STEPS.rise * (i + 1);
    }
  }
  return GROUND_Y;
}
