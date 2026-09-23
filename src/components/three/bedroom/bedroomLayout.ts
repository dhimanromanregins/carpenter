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
export const WORLD = { x0: HALL.x0, x1: GARDEN.x1, z0: GARDEN.z0, z1: DECK.z1 } as const;

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
  // Hall side walls
  { x0: HALL.x0 - 0.2, x1: HALL.x0, z0: PARTITION.z0, z1: HALL.z1 + 0.2 },
  { x0: HALL.x1, x1: HALL.x1 + 0.2, z0: PARTITION.z0, z1: HALL.z1 + 0.2 },
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
  { x0: -3.4, x1: -1.4, z0: 5.8, z1: 7.8 }, // dining set
  { x0: HALL.x0, x1: -4.15, z0: 3.35, z1: 8.65 }, // bookshelf
  { x0: -3.25, x1: -1.35, z0: HALL.z0, z1: HALL.z0 + 0.45 }, // console
  { x0: HALL.x0, x1: -3.75, z0: 9.2, z1: HALL.z1 }, // plant SW
  { x0: 4.85, x1: HALL.x1, z0: 9.2, z1: HALL.z1 }, // plant SE
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
  { id: "dining", label: "Dining", x: -0.55, z: 5.1, look: [-2.4, 0.85, 6.8] },
  { id: "balcony", label: "Balcony", x: -2.5, z: 10.75, look: [2.2, 0.75, 13.4] },
  { id: "door", label: "Bedroom door", x: 0.9, z: 4.2, look: [1.6, 1.2, 2.5] },
];

export function viewpointPose(v: Viewpoint) {
  return { x: v.x, z: v.z, ...yawPitch(v, v.look) };
}

/** Visitors arrive in the front garden, facing the main door. */
export const SPAWN = viewpointPose(VIEWPOINTS[0]);

/** Which space a point is in: 0 bedroom, 1 hall, 2 deck, 3 front garden. */
export function spaceAt(x: number, z: number) {
  if (z < (PARTITION.z0 + PARTITION.z1) / 2) return x > ROOM.x1 + 0.15 ? 3 : 0;
  if (z < HALL.z1 + 0.07) return 1;
  return 2;
}

/** Floor height under a point: the lawn sits below the house, up three steps. */
export function floorHeightAt(x: number, z: number) {
  if (spaceAt(x, z) !== 3) return 0;
  if (z >= PORCH.z0 && x <= PORCH.x1) return 0;
  if (x >= STEPS.x0 - 0.05 && x <= STEPS.x1 + 0.05) {
    for (let i = 0; i < STEPS.count; i++) {
      // i = 0 is the top tread, just below the landing.
      if (z >= PORCH.z0 - STEPS.tread * (i + 1)) return -STEPS.rise * (i + 1);
    }
  }
  return GROUND_Y;
}
