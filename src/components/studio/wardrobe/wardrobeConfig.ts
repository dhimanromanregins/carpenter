import { GLASS_FINISHES } from "@/data/glassFinishes";
/** Data model + presets for the 3D wardrobe designer. All dimensions in metres. */

export type SectionKind = "doors" | "drawers" | "open";
export type DoorMode = "hinged" | "sliding";
export type DoorFace = "laminate" | "glass" | "mirror";
export type HandleStyle =
  | "bar"
  | "hbar"
  | "long"
  | "slim"
  | "tbar"
  | "dpull"
  | "knob"
  | "cup"
  | "ring"
  | "edge"
  | "gola"
  | "jpull"
  | "groove"
  | "recessed"
  | "strap"
  | "none";

export const HANDLE_STYLES: { id: HandleStyle; name: string; hint: string }[] = [
  { id: "bar", name: "Bar", hint: "Classic vertical bar" },
  { id: "hbar", name: "Horizontal bar", hint: "Modern horizontal pull" },
  { id: "long", name: "Long pull", hint: "Full-length vertical pull" },
  { id: "slim", name: "Slim line", hint: "Thin minimalist line" },
  { id: "tbar", name: "T-bar", hint: "Bar on two posts" },
  { id: "dpull", name: "D-pull", hint: "Curved bridge handle" },
  { id: "knob", name: "Round knob", hint: "Simple round knob" },
  { id: "cup", name: "Cup pull", hint: "Half-round scoop" },
  { id: "ring", name: "Ring pull", hint: "Flush ring on a plate" },
  { id: "edge", name: "Edge pull", hint: "Slim metal edge strip" },
  { id: "gola", name: "G-groove", hint: "Handle-less G profile channel" },
  { id: "jpull", name: "J-pull", hint: "J-profile lip along the edge" },
  { id: "groove", name: "Finger groove", hint: "Routed slot, no hardware" },
  { id: "recessed", name: "Recessed pull", hint: "Sunk-in rectangular pull" },
  { id: "strap", name: "Leather strap", hint: "Leather loop with studs" },
  { id: "none", name: "Push-to-open", hint: "No handle at all" },
];
/** Glass finish id — see src/data/glassFinishes.ts */
export type GlassTint = string;
export type LedTemp = "warm" | "neutral" | "cool";
export type RoomMood = "day" | "evening" | "night";

export type SurfaceType = "laminate" | "membrane" | "fluted" | "pu" | "wallpaper" | "mesh" | "acrylic";

export type PatternId =
  | "solid"
  | "split-h"
  | "split-v"
  | "stripes-v"
  | "stripes-h"
  | "blocks"
  | "checker"
  | "gradient"
  | "diagonal"
  | "chevron"
  | "arch"
  | "circle"
  | "diamond"
  | "frame";

export type WallpaperKind = "damask" | "geometric" | "floral" | "pinstripe" | "marble" | "grasscloth";
export type MeshKind = "wire" | "cane" | "perforated" | "sandwich";

/**
 * The look of a shutter. `colors` holds 1–4 entries, each a CSS hex colour or a
 * wood token like "wood:walnut"; the pattern spreads them across the door.
 */
export interface Surface {
  type: SurfaceType;
  colors: string[];
  pattern: PatternId;
  /** Number of stripes / cells for the repeating patterns. */
  scale: number;
  wallpaper: WallpaperKind;
  mesh: MeshKind;
}

export interface WardrobeSection {
  id: number;
  kind: SectionKind;
  width: number;
  doorMode: DoorMode;
  face: DoorFace;
  shelves: number;
  rod: boolean;
  drawers: number;
  /** Which door/panel carries an inset viewing mirror (0-based), or -1 for none. */
  mirrorLeaf?: number;
  mirrorSize?: "full" | "half";
  /** Drawers fitted inside a doors section, behind the doors (0–4). */
  innerDrawers?: number;
  /** Overrides the wardrobe-wide shutter surface for this section. */
  surface?: Surface;
}

export interface WardrobeLights {
  interior: boolean; // vertical LED strips inside each section
  shelf: boolean; // under-shelf LED strips
  top: boolean; // cove light on top
  plinth: boolean; // toe-kick glow
  profile: boolean; // light in the vertical gaps between sections
  temp: LedTemp;
  brightness: number; // 0.2 – 2
}

export interface WardrobeConfig {
  height: number;
  depth: number;
  plinth: number;
  loft: boolean;
  loftHeight: number;
  sections: WardrobeSection[];
  bodyFinish: string;
  shutterFinish: string;
  /** Wardrobe-wide shutter look (material, colours, pattern). */
  surface: Surface;
  handle: HandleStyle;
  handleFinish: string;
  glassTint: GlassTint;
  frameFinish: string;
  lights: WardrobeLights;
  mood: RoomMood;
  wallColor: string;
}

export interface Finish {
  id: string;
  name: string;
  color: string;
  /** Wood-grain ring colour; when set the finish renders as a wood texture. */
  ring?: string;
  roughness: number;
  metalness?: number;
}

export const FINISHES: Finish[] = [
  { id: "walnut", name: "Walnut", color: "#6b4a2f", ring: "#2e1c0d", roughness: 0.55 },
  { id: "oak", name: "Natural Oak", color: "#c9a678", ring: "#8a6a3f", roughness: 0.6 },
  { id: "teak", name: "Teak", color: "#a5733c", ring: "#5a3a1a", roughness: 0.55 },
  { id: "ash", name: "Ash Grey Wood", color: "#b9b2a6", ring: "#8a8377", roughness: 0.6 },
  { id: "ivory", name: "Ivory Matte", color: "#e9e2d3", roughness: 0.7 },
  { id: "white", name: "White Gloss", color: "#f4f4f2", roughness: 0.12 },
  { id: "greige", name: "Warm Greige", color: "#b8aca0", roughness: 0.7 },
  { id: "sage", name: "Sage Green", color: "#8a9a7b", roughness: 0.7 },
  { id: "olive", name: "Olive", color: "#6b6a3a", roughness: 0.7 },
  { id: "navy", name: "Navy Blue", color: "#26364d", roughness: 0.6 },
  { id: "charcoal", name: "Charcoal", color: "#2e2f31", roughness: 0.65 },
  { id: "black", name: "Black Matte", color: "#141414", roughness: 0.6 },
];

export const SURFACE_TYPES: { id: SurfaceType; name: string; blurb: string }[] = [
  { id: "laminate", name: "Laminate", blurb: "Hard-wearing, matt, endless colours & woods" },
  { id: "membrane", name: "Membrane", blurb: "Smooth PVC wrap with routed shaker grooves" },
  { id: "fluted", name: "Fluted glass", blurb: "Ribbed see-through glass in an aluminium frame" },
  { id: "pu", name: "PU finish", blurb: "Deep, glossy sprayed polyurethane" },
  { id: "wallpaper", name: "Wallpaper", blurb: "Printed designs bonded to the shutter" },
  { id: "mesh", name: "Mesh / Sandwich", blurb: "Wire, cane or perforated mesh, or back-painted glass" },
  { id: "acrylic", name: "Acrylic", blurb: "Mirror-gloss acrylic with a deep reflective shine" },
];

export const PATTERNS: { id: PatternId; name: string; minColors: number; scalable: boolean; group: "colour" | "shape" }[] = [
  { id: "solid", name: "Solid", minColors: 1, scalable: false, group: "colour" },
  { id: "split-h", name: "Two-tone (top/bottom)", minColors: 2, scalable: false, group: "colour" },
  { id: "split-v", name: "Two-tone (left/right)", minColors: 2, scalable: false, group: "colour" },
  { id: "stripes-v", name: "Vertical stripes", minColors: 2, scalable: true, group: "colour" },
  { id: "stripes-h", name: "Horizontal bands", minColors: 2, scalable: true, group: "colour" },
  { id: "blocks", name: "Colour blocks", minColors: 2, scalable: false, group: "colour" },
  { id: "checker", name: "Checker", minColors: 2, scalable: true, group: "colour" },
  { id: "gradient", name: "Gradient", minColors: 2, scalable: false, group: "colour" },
  { id: "diagonal", name: "Diagonal split", minColors: 2, scalable: false, group: "colour" },
  { id: "chevron", name: "Chevron", minColors: 2, scalable: true, group: "colour" },
  { id: "arch", name: "Arch inset", minColors: 2, scalable: false, group: "shape" },
  { id: "circle", name: "Circle inset", minColors: 2, scalable: false, group: "shape" },
  { id: "diamond", name: "Diamond inset", minColors: 2, scalable: false, group: "shape" },
  { id: "frame", name: "Frame inset", minColors: 2, scalable: false, group: "shape" },
];

export const WALLPAPERS: { id: WallpaperKind; name: string }[] = [
  { id: "damask", name: "Damask" },
  { id: "geometric", name: "Geometric" },
  { id: "floral", name: "Floral" },
  { id: "pinstripe", name: "Pinstripe" },
  { id: "marble", name: "Marble" },
  { id: "grasscloth", name: "Grasscloth" },
];

export const MESHES: { id: MeshKind; name: string }[] = [
  { id: "wire", name: "Wire mesh" },
  { id: "cane", name: "Cane weave" },
  { id: "perforated", name: "Perforated" },
  { id: "sandwich", name: "Sandwich (back-painted glass)" },
];

export const MAX_COLORS = 4;

export function makeSurface(partial: Partial<Surface> = {}): Surface {
  return {
    type: "laminate",
    colors: ["#d9c7a8"],
    pattern: "solid",
    scale: 6,
    wallpaper: "damask",
    mesh: "wire",
    ...partial,
  };
}

/** Wood finishes become "wood:<id>" tokens so they keep their grain inside patterns. */
export function surfaceFromFinish(id: string): Surface {
  const f = FINISHES.find((x) => x.id === id) ?? FINISHES[0];
  return makeSurface({ type: f.roughness < 0.2 ? "pu" : "laminate", colors: [f.ring ? `wood:${f.id}` : f.color] });
}

export const HANDLE_FINISHES: Finish[] = [
  { id: "gold", name: "Brushed Gold", color: "#c9a86a", roughness: 0.3, metalness: 1 },
  { id: "brass", name: "Antique Brass", color: "#9a7a3f", roughness: 0.4, metalness: 1 },
  { id: "rose", name: "Rose Gold", color: "#c58f7c", roughness: 0.3, metalness: 1 },
  { id: "chrome", name: "Chrome", color: "#d8dde2", roughness: 0.12, metalness: 1 },
  { id: "black", name: "Matte Black", color: "#161616", roughness: 0.5, metalness: 0.6 },
];

export const FRAME_FINISHES: Finish[] = [
  { id: "champagne", name: "Champagne", color: "#cdb98f", roughness: 0.3, metalness: 1 },
  { id: "black", name: "Black", color: "#161616", roughness: 0.45, metalness: 0.7 },
  { id: "silver", name: "Silver", color: "#c7ccd1", roughness: 0.25, metalness: 1 },
];

export const WALL_COLORS = [
  { id: "#ece6da", name: "Cream" },
  { id: "#d9d4cb", name: "Stone" },
  { id: "#c9d0c4", name: "Sage mist" },
  { id: "#2c3340", name: "Slate" },
  { id: "#f6f4ef", name: "White" },
];

export const GLASS_TINTS = GLASS_FINISHES;

export const LED_TEMPS: Record<LedTemp, { name: string; kelvin: string; color: string }> = {
  warm: { name: "Warm", kelvin: "2700K", color: "#ffb866" },
  neutral: { name: "Neutral", kelvin: "4000K", color: "#ffe6c4" },
  cool: { name: "Cool", kelvin: "6000K", color: "#d6e6ff" },
};

export const MOODS: { id: RoomMood; name: string }[] = [
  { id: "day", name: "Day" },
  { id: "evening", name: "Evening" },
  { id: "night", name: "Night" },
];

export const PANEL = 0.018; // board thickness
export const INNER_DRAWER_H = 0.2; // height of each drawer fitted behind doors
export const MIN_SECTION = 0.35;
export const MAX_SECTION = 1.4;
export const MAX_SECTIONS = 8;

export const findFinish = (list: Finish[], id: string): Finish => list.find((f) => f.id === id) ?? list[0];

let nextId = 100;
export const newSectionId = () => nextId++;

export function makeSection(kind: SectionKind, partial: Partial<WardrobeSection> = {}): WardrobeSection {
  return {
    id: newSectionId(),
    kind,
    width: kind === "drawers" ? 0.6 : kind === "open" ? 0.5 : 0.9,
    doorMode: "hinged",
    face: "laminate",
    shelves: kind === "open" ? 4 : 3,
    rod: kind === "doors",
    drawers: 3,
    mirrorLeaf: -1,
    mirrorSize: "full",
    innerDrawers: 0,
    ...partial,
  };
}

export function defaultConfig(): WardrobeConfig {
  return {
    height: 2.4,
    depth: 0.6,
    plinth: 0.1,
    loft: true,
    loftHeight: 0.5,
    sections: [
      makeSection("doors", { width: 0.9, face: "laminate" }),
      makeSection("doors", { width: 0.9, face: "glass", rod: true }),
      makeSection("drawers", { width: 0.6, drawers: 4 }),
      makeSection("open", { width: 0.5, shelves: 4 }),
    ],
    bodyFinish: "ivory",
    shutterFinish: "walnut",
    surface: surfaceFromFinish("walnut"),
    handle: "bar",
    handleFinish: "gold",
    glassTint: "bronze",
    frameFinish: "champagne",
    lights: { interior: true, shelf: true, top: true, plinth: true, profile: true, temp: "warm", brightness: 1 },
    mood: "evening",
    wallColor: "#d9d4cb",
  };
}

export const totalWidth = (c: WardrobeConfig) => c.sections.reduce((n, s) => n + s.width, 0) + PANEL;
export const totalHeight = (c: WardrobeConfig) => c.height + (c.loft ? c.loftHeight : 0);

/** Front-elevation area in sq ft, a common basis for wardrobe pricing. */
export const areaSqft = (c: WardrobeConfig) => totalWidth(c) * totalHeight(c) * 10.7639;

export interface Preset {
  id: string;
  name: string;
  blurb: string;
  build: () => WardrobeConfig;
}

const RAW_PRESETS: Preset[] = [
  {
    id: "signature",
    name: "Signature",
    blurb: "Walnut shutters, bronze glass and gold profile lights.",
    build: defaultConfig,
  },
  {
    id: "minimal",
    name: "Minimal White",
    blurb: "Clean handle-less white gloss with soft cool light.",
    build: () => ({
      ...defaultConfig(),
      sections: [
        makeSection("doors", { width: 1.0, doorMode: "sliding" }),
        makeSection("doors", { width: 1.0, doorMode: "sliding", face: "mirror" }),
        makeSection("doors", { width: 1.0, doorMode: "sliding" }),
      ],
      loft: true,
      bodyFinish: "white",
      shutterFinish: "white",
      handle: "none",
      handleFinish: "chrome",
      lights: { interior: true, shelf: false, top: true, plinth: true, profile: false, temp: "cool", brightness: 1 },
      mood: "day",
      wallColor: "#f6f4ef",
    }),
  },
  {
    id: "luxe",
    name: "Dark Luxe",
    blurb: "Black matte, smoked glass and warm LED glow.",
    build: () => ({
      ...defaultConfig(),
      sections: [
        makeSection("doors", { width: 0.8, face: "glass" }),
        makeSection("doors", { width: 0.8, face: "glass" }),
        makeSection("doors", { width: 0.8, face: "laminate" }),
        makeSection("drawers", { width: 0.6, drawers: 4 }),
      ],
      bodyFinish: "charcoal",
      shutterFinish: "black",
      handleFinish: "gold",
      glassTint: "smoked",
      frameFinish: "black",
      mood: "night",
      wallColor: "#2c3340",
    }),
  },
  {
    id: "natural",
    name: "Natural Oak",
    blurb: "Warm oak with sage-green accents and a daylight room.",
    build: () => ({
      ...defaultConfig(),
      sections: [
        makeSection("doors", { width: 0.9 }),
        makeSection("doors", { width: 0.9 }),
        makeSection("open", { width: 0.6, shelves: 5 }),
      ],
      bodyFinish: "oak",
      shutterFinish: "sage",
      handle: "knob",
      handleFinish: "brass",
      lights: { interior: true, shelf: true, top: false, plinth: false, profile: false, temp: "warm", brightness: 0.9 },
      mood: "day",
      wallColor: "#ece6da",
    }),
  },
  {
    id: "arch-two-tone",
    name: "Arch Two-Tone",
    blurb: "Acrylic shutters with a sage arch inset on ivory.",
    build: () => ({
      ...defaultConfig(),
      sections: [
        makeSection("doors", { width: 0.9 }),
        makeSection("doors", { width: 0.9 }),
        makeSection("doors", { width: 0.9 }),
      ],
      bodyFinish: "ivory",
      handle: "gola",
      handleFinish: "gold",
      surface: makeSurface({ type: "acrylic", pattern: "arch", colors: ["#efe7d8", "#8a9a7b", "#c6a86a"] }),
      lights: { interior: true, shelf: false, top: true, plinth: true, profile: false, temp: "warm", brightness: 1 },
      mood: "evening",
      wallColor: "#ece6da",
    }),
  },
  {
    id: "fluted-luxe",
    name: "Fluted Glass",
    blurb: "Smoke fluted-glass doors with warm LED glow inside.",
    build: () => ({
      ...defaultConfig(),
      sections: [
        makeSection("doors", { width: 0.9 }),
        makeSection("doors", { width: 0.9 }),
        makeSection("drawers", { width: 0.6, drawers: 4 }),
      ],
      bodyFinish: "charcoal",
      handle: "slim",
      handleFinish: "gold",
      frameFinish: "black",
      surface: makeSurface({ type: "fluted", colors: ["#6b7480"] }),
      mood: "night",
      wallColor: "#2c3340",
    }),
  },
];

/** Presets that don't set their own surface inherit one from their shutter finish. */
export const PRESETS: Preset[] = RAW_PRESETS.map((p) => ({
  ...p,
  build: () => {
    const c = p.build();
    const base = defaultConfig();
    // a preset that kept the default surface but changed shutterFinish should follow it
    const untouched = JSON.stringify(c.surface) === JSON.stringify(base.surface);
    return untouched ? { ...c, surface: surfaceFromFinish(c.shutterFinish) } : c;
  },
}));

