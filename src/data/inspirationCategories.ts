import type { InspirationCategory } from "./wardrobeInspiration";
import { BALCONY_INSPIRATION } from "./balconyInspiration";
import { BATHROOM_INSPIRATION, BATHROOM_INSPIRATION_CREDIT } from "./bathroomInspiration";
import { CEILING_INSPIRATION, CEILING_INSPIRATION_CREDIT } from "./ceilingInspiration";
import { CROCKERY_INSPIRATION } from "./crockeryInspiration";
import { DINING_ROOM_INSPIRATION } from "./diningRoomInspiration";
import { DOOR_INSPIRATION, DOOR_INSPIRATION_CREDIT } from "./doorInspiration";
import { KITCHEN_INSPIRATION, KITCHEN_INSPIRATION_CREDIT } from "./kitchenInspiration";
import { MANDIR_INSPIRATION, MANDIR_INSPIRATION_CREDIT } from "./mandirInspiration";
import { MASTER_BEDROOM_INSPIRATION, MASTER_BEDROOM_INSPIRATION_CREDIT } from "./masterBedroomInspiration";
import { STAIRCASE_INSPIRATION } from "./staircaseInspiration";
import { STUDY_ROOM_INSPIRATION } from "./studyRoomInspiration";
import { TV_PANEL_INSPIRATION, TV_PANEL_INSPIRATION_CREDIT } from "./tvPanelInspiration";
import { WALL_DESIGN_INSPIRATION } from "./wallDesignInspiration";
import { WARDROBE_INSPIRATION, WARDROBE_INSPIRATION_CREDIT } from "./wardrobeInspiration";

const DEFAULT_CREDIT =
  "Reference images curated for client inspiration only — not photos of our own completed projects.";

export interface InspirationRoom {
  slug: string;
  label: string;
  description: string;
  categories: InspirationCategory[];
  credit: string;
}

export const INSPIRATION_ROOMS: InspirationRoom[] = [
  {
    slug: "kitchen",
    label: "Kitchen",
    description: "L-shaped, U-shaped, parallel, straight and open layouts.",
    categories: KITCHEN_INSPIRATION,
    credit: KITCHEN_INSPIRATION_CREDIT,
  },
  {
    slug: "wardrobe",
    label: "Wardrobe",
    description: "Sliding, hinged, walk-in and loft wardrobe designs.",
    categories: WARDROBE_INSPIRATION,
    credit: WARDROBE_INSPIRATION_CREDIT,
  },
  {
    slug: "master-bedroom",
    label: "Master Bedroom",
    description: "Headboards, feature walls and full room styling.",
    categories: MASTER_BEDROOM_INSPIRATION,
    credit: MASTER_BEDROOM_INSPIRATION_CREDIT,
  },
  {
    slug: "bathroom",
    label: "Bathroom",
    description: "Vanities, tiling and fixtures for every style.",
    categories: BATHROOM_INSPIRATION,
    credit: BATHROOM_INSPIRATION_CREDIT,
  },
  {
    slug: "dining-room",
    label: "Dining Room",
    description: "Tables, seating and lighting for shared meals.",
    categories: DINING_ROOM_INSPIRATION,
    credit: DEFAULT_CREDIT,
  },
  {
    slug: "tv-panel",
    label: "TV Panel",
    description: "Media walls and entertainment unit designs.",
    categories: TV_PANEL_INSPIRATION,
    credit: TV_PANEL_INSPIRATION_CREDIT,
  },
  {
    slug: "wall-design",
    label: "Wall Design",
    description: "Accent walls, textures and decorative panelling.",
    categories: WALL_DESIGN_INSPIRATION,
    credit: DEFAULT_CREDIT,
  },
  {
    slug: "ceiling",
    label: "Ceiling",
    description: "False ceilings, coves and cornice detailing.",
    categories: CEILING_INSPIRATION,
    credit: CEILING_INSPIRATION_CREDIT,
  },
  {
    slug: "door",
    label: "Doors",
    description: "Main doors, interior doors and framing styles.",
    categories: DOOR_INSPIRATION,
    credit: DOOR_INSPIRATION_CREDIT,
  },
  {
    slug: "staircase",
    label: "Staircase",
    description: "Railings, treads and under-stair storage ideas.",
    categories: STAIRCASE_INSPIRATION,
    credit: DEFAULT_CREDIT,
  },
  {
    slug: "balcony",
    label: "Balcony",
    description: "Seating, greenery and railing designs.",
    categories: BALCONY_INSPIRATION,
    credit: DEFAULT_CREDIT,
  },
  {
    slug: "mandir",
    label: "Mandir",
    description: "Pooja room units, alcoves and finishes.",
    categories: MANDIR_INSPIRATION,
    credit: MANDIR_INSPIRATION_CREDIT,
  },
  {
    slug: "crockery",
    label: "Crockery Unit",
    description: "Display cabinets and crockery storage.",
    categories: CROCKERY_INSPIRATION,
    credit: DEFAULT_CREDIT,
  },
  {
    slug: "study-room",
    label: "Study Room",
    description: "Desks, shelving and home-office layouts.",
    categories: STUDY_ROOM_INSPIRATION,
    credit: DEFAULT_CREDIT,
  },
];

export function getInspirationRoom(slug: string | undefined): InspirationRoom | undefined {
  return INSPIRATION_ROOMS.find((r) => r.slug === slug);
}
