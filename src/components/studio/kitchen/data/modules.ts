/**
 * Cabinet-module catalogue. Each entry declares what a module is (kind, zone,
 * dimension limits, price rate, built-in hardware). The scene looks the `kind`
 * up in its renderer registry — so a new cabinet type is: add an entry here,
 * and (only if it needs a brand-new look) register a renderer for its kind.
 */
import type { ModuleKind, ModuleType, Range, Zone } from "../model/types";

const KS = "Kraftspace Select";
const r = (min: number, max: number, def: number): Range => ({ min, max, default: def });

const RATE: Record<Zone, number> = { base: 13000, island: 13000, wall: 11000, tall: 14500 };

function mt(
  id: string,
  kind: ModuleKind,
  zone: Zone,
  name: string,
  subcategory: string,
  width: Range,
  height: Range,
  depth: Range,
  standardWidths: number[],
  extra: Partial<ModuleType> = {}
): ModuleType {
  return {
    id,
    kind,
    zone,
    name,
    subcategory,
    manufacturer: KS,
    sku: `MOD-${id.toUpperCase()}`,
    width,
    height,
    depth,
    standardWidths,
    ratePerSqm: RATE[zone],
    fixedPrice: 0,
    ...extra,
  };
}

const BASE_H = r(720, 900, 820); // carcass + plinth
const BASE_D = r(450, 650, 560);
const WALL_H = r(300, 1200, 700);
const WALL_D = r(300, 400, 350);
const TALL_H = r(1800, 2400, 2200);
const TALL_D = r(550, 650, 600);

export const MODULE_TYPES: ModuleType[] = [
  /* ───── base ───── */
  mt("base-single", "base-doors", "base", "Single-door cabinet", "Base cabinets", r(300, 600, 450), BASE_H, BASE_D, [300, 400, 450, 500, 600]),
  mt("base-double", "base-doors", "base", "Double-door cabinet", "Base cabinets", r(600, 1200, 800), BASE_H, BASE_D, [600, 800, 900, 1000, 1200]),
  mt("base-drawers-2", "base-drawers", "base", "Two-drawer cabinet", "Drawer units", r(300, 1200, 600), BASE_H, BASE_D, [450, 600, 800, 900], { includes: ["drawer-standard", "drawer-deep"] }),
  mt("base-drawers-3", "base-drawers", "base", "Three-drawer cabinet", "Drawer units", r(300, 1200, 600), BASE_H, BASE_D, [450, 600, 800, 900], { includes: ["drawer-standard", "drawer-standard", "drawer-deep"] }),
  mt("base-drawers-4", "base-drawers", "base", "Four-drawer cabinet", "Drawer units", r(300, 1200, 600), BASE_H, BASE_D, [450, 600, 800, 900], { includes: ["drawer-standard", "drawer-standard", "drawer-standard", "drawer-deep"] }),
  mt("base-deep-drawers", "base-drawers", "base", "Deep-drawer cabinet", "Drawer units", r(450, 1200, 800), BASE_H, BASE_D, [600, 800, 900, 1000], { includes: ["drawer-tandem", "drawer-tandem"] }),
  mt("base-cutlery", "base-cutlery", "base", "Cutlery drawer unit", "Drawer units", r(450, 900, 600), BASE_H, BASE_D, [450, 600, 800, 900], { includes: ["drawer-cutlery", "cutlery-premium", "drawer-standard", "drawer-deep"] }),
  mt("base-sink", "base-sink", "base", "Sink cabinet", "Sink & hob", r(800, 1200, 900), BASE_H, BASE_D, [800, 900, 1000, 1200]),
  mt("base-hob", "base-hob", "base", "Hob cabinet", "Sink & hob", r(600, 900, 750), BASE_H, BASE_D, [600, 750, 900]),
  mt("base-corner-magic", "base-corner", "base", "Corner cabinet — Magic corner", "Corner units", r(900, 1100, 1000), BASE_H, BASE_D, [1000], { includes: ["corner-magic"] }),
  mt("base-corner-carousel", "base-corner", "base", "Corner cabinet — Carousel", "Corner units", r(900, 1100, 1000), BASE_H, BASE_D, [1000], { includes: ["corner-carousel"] }),
  mt("base-corner-lemans", "base-corner", "base", "Corner cabinet — LeMans", "Corner units", r(900, 1100, 1000), BASE_H, BASE_D, [1000], { includes: ["corner-lemans"] }),
  mt("base-corner-blind", "base-corner", "base", "Blind corner cabinet", "Corner units", r(900, 1100, 1000), BASE_H, BASE_D, [1000], { includes: ["corner-swing"] }),
  mt("base-bottle-150", "base-bottle", "base", "Bottle pull-out — 150 mm", "Pull-outs", r(150, 150, 150), BASE_H, BASE_D, [150], { includes: ["pullout-spice"] }),
  mt("base-bottle-200", "base-bottle", "base", "Bottle pull-out — 200 mm", "Pull-outs", r(200, 200, 200), BASE_H, BASE_D, [200], { includes: ["pullout-bottle"] }),
  mt("base-bottle-300", "base-bottle", "base", "Bottle pull-out — 300 mm", "Pull-outs", r(300, 300, 300), BASE_H, BASE_D, [300], { includes: ["pullout-utility"] }),
  mt("base-dustbin-1", "base-dustbin", "base", "Dustbin unit — single", "Waste", r(300, 300, 300), BASE_H, BASE_D, [300], { includes: ["bin-single"] }),
  mt("base-dustbin-2", "base-dustbin", "base", "Dustbin unit — double", "Waste", r(450, 450, 450), BASE_H, BASE_D, [450], { includes: ["bin-double"] }),
  mt("base-dustbin-3", "base-dustbin", "base", "Dustbin unit — triple", "Waste", r(600, 600, 600), BASE_H, BASE_D, [600], { includes: ["bin-triple"] }),
  mt("base-open", "base-open", "base", "Open cabinet", "Base cabinets", r(300, 900, 600), BASE_H, BASE_D, [300, 450, 600, 800]),
  mt("base-glass", "base-glass", "base", "Glass display base cabinet", "Glass cabinets", r(450, 1200, 800), BASE_H, BASE_D, [450, 600, 800, 900, 1200]),
  mt("base-dishwasher", "base-dishwasher", "base", "Dishwasher cabinet", "Appliance cabinets", r(600, 600, 600), BASE_H, BASE_D, [600], { includes: ["dishwasher"] }),
  mt("base-washer", "base-washer", "base", "Washing-machine cabinet", "Appliance cabinets", r(600, 600, 600), BASE_H, BASE_D, [600], { includes: ["washing-machine"] }),

  /* ───── wall ───── */
  mt("wall-single", "wall-doors", "wall", "Single-shutter wall cabinet", "Wall cabinets", r(300, 600, 450), WALL_H, WALL_D, [300, 400, 450, 500, 600]),
  mt("wall-double", "wall-doors", "wall", "Double-shutter wall cabinet", "Wall cabinets", r(600, 1200, 800), WALL_H, WALL_D, [600, 800, 900, 1000, 1200]),
  mt("wall-lift", "wall-lift", "wall", "Lift-up wall cabinet", "Wall cabinets", r(600, 1200, 900), r(300, 700, 450), WALL_D, [600, 800, 900, 1000, 1200], { includes: ["lift-up"] }),
  mt("wall-flap", "wall-lift", "wall", "Flap-door wall cabinet", "Wall cabinets", r(600, 1200, 800), r(300, 700, 450), WALL_D, [600, 800, 900, 1000], { includes: ["lift-flap"] }),
  mt("wall-glass", "wall-glass", "wall", "Glass wall cabinet — hinged", "Glass cabinets", r(450, 900, 600), WALL_H, WALL_D, [450, 600, 800, 900]),
  mt("wall-glass-sliding", "wall-glass", "wall", "Glass wall cabinet — sliding", "Glass cabinets", r(800, 1500, 1000), WALL_H, WALL_D, [900, 1000, 1200, 1500]),
  mt("wall-glass-lift", "wall-glass", "wall", "Glass wall cabinet — lift-up", "Glass cabinets", r(600, 1200, 900), r(300, 700, 500), WALL_D, [600, 800, 900, 1000, 1200], { includes: ["lift-up"] }),
  mt("wall-glass-frameless", "wall-glass", "wall", "Frameless glass wall cabinet", "Glass cabinets", r(450, 900, 600), WALL_H, WALL_D, [450, 600, 800, 900]),
  mt("wall-open", "wall-open", "wall", "Open wall shelf", "Wall cabinets", r(300, 1200, 600), r(300, 900, 600), WALL_D, [300, 450, 600, 800, 900]),
  mt("wall-chimney", "wall-chimney", "wall", "Chimney cabinet", "Appliance cabinets", r(600, 900, 600), r(400, 1200, 700), r(300, 500, 400), [600, 750, 900], { includes: ["chimney-wall"] }),
  mt("wall-microwave", "wall-microwave", "wall", "Microwave wall cabinet", "Appliance cabinets", r(600, 600, 600), r(500, 900, 600), r(350, 450, 400), [600], { includes: ["microwave-builtin"] }),
  mt("wall-corner", "wall-corner", "wall", "Corner wall cabinet", "Wall cabinets", r(600, 800, 600), WALL_H, r(300, 400, 350), [600]),
  mt("wall-loft", "wall-loft", "wall", "Loft cabinet", "Wall cabinets", r(300, 1200, 800), r(300, 900, 450), r(300, 650, 350), [450, 600, 800, 900]),

  /* ───── tall ───── */
  mt("tall-pantry-full", "tall-pantry", "tall", "Full-height pantry", "Tall units", r(450, 900, 600), TALL_H, TALL_D, [450, 600, 800, 900], { includes: ["pullout-pantry"] }),
  mt("tall-pantry-half", "tall-pantry", "tall", "Half-height pantry", "Tall units", r(450, 900, 600), r(1000, 1800, 1500), TALL_D, [450, 600, 800], { includes: ["pullout-utility"] }),
  mt("tall-fridge", "tall-fridge", "tall", "Refrigerator enclosure", "Tall units", r(650, 950, 750), r(2000, 2400, 2300), r(600, 700, 650), [700, 750, 900], { includes: ["fridge-double"] }),
  mt("tall-oven", "tall-oven", "tall", "Oven tower", "Tall units", r(600, 700, 600), TALL_H, TALL_D, [600], { includes: ["oven-builtin", "microwave-builtin"] }),
  mt("tall-microwave", "tall-oven", "tall", "Microwave tower", "Tall units", r(600, 700, 600), TALL_H, TALL_D, [600], { includes: ["microwave-builtin"] }),
  mt("tall-glass", "tall-glass", "tall", "Glass display tower", "Glass cabinets", r(450, 900, 600), TALL_H, TALL_D, [450, 600, 800, 900]),
  mt("tall-storage", "tall-storage", "tall", "Storage tower", "Tall units", r(450, 900, 600), TALL_H, TALL_D, [450, 600, 800, 900]),
  mt("tall-utility", "tall-utility", "tall", "Utility tower", "Tall units", r(450, 600, 450), TALL_H, TALL_D, [450, 600], { includes: ["pullout-cleaning"] }),

  /* ───── fillers ───── */
  mt("filler", "filler", "base", "Filler panel", "Fillers", r(20, 300, 50), BASE_H, r(20, 650, 560), [50, 100, 150]),
];

export const MODULE_TYPE_BY_ID: Record<string, ModuleType> = Object.fromEntries(MODULE_TYPES.map((m) => [m.id, m]));

export const getModuleType = (id: string): ModuleType => MODULE_TYPE_BY_ID[id] ?? MODULE_TYPES[0];

export const MODULE_ZONES: { id: Zone; name: string }[] = [
  { id: "base", name: "Base" },
  { id: "wall", name: "Wall" },
  { id: "tall", name: "Tall" },
];

/** Default hardware / params when a module type is first placed. */
export function defaultParams(typeId: string): import("../model/types").ModuleParams {
  switch (typeId) {
    case "base-drawers-2":
      return { drawers: 2 };
    case "base-drawers-3":
      return { drawers: 3 };
    case "base-drawers-4":
      return { drawers: 4 };
    case "base-deep-drawers":
      return { drawers: 2 };
    case "base-cutlery":
      return { drawers: 3, organiser: "cutlery-premium" };
    case "base-single":
      return { shelves: 1, hinge: "left" };
    case "base-double":
      return { shelves: 1 };
    case "base-corner-magic":
      return { hardware: "corner-magic" };
    case "base-corner-carousel":
      return { hardware: "corner-carousel" };
    case "base-corner-lemans":
      return { hardware: "corner-lemans" };
    case "base-corner-blind":
      return { hardware: "corner-swing" };
    case "base-dustbin-1":
      return { count: 1 };
    case "base-dustbin-2":
      return { count: 2 };
    case "base-dustbin-3":
      return { count: 3 };
    case "base-bottle-150":
    case "base-bottle-200":
    case "base-bottle-300":
      return { count: 3 };
    case "base-hob":
      return { drawers: 1 };
    case "base-dishwasher":
      return { appliance: "dishwasher" };
    case "base-washer":
      return { appliance: "washing-machine" };
    case "wall-single":
    case "wall-double":
      return { shelves: 2 };
    case "wall-glass":
      return { shelves: 2, glassMode: "hinged", led: true };
    case "wall-open":
      return { shelves: 2 };
    case "wall-glass-sliding":
      return { shelves: 2, glassMode: "sliding", led: true };
    case "wall-glass-lift":
      return { shelves: 1, glassMode: "lift", hardware: "lift-up", led: true };
    case "wall-glass-frameless":
      return { shelves: 2, glassMode: "hinged", led: true };
    case "base-glass":
      return { shelves: 2, glassMode: "hinged", glassShelves: true, led: true };
    case "tall-glass":
      return { shelves: 5, glassMode: "hinged", glassShelves: true, mirrorBack: true, led: true };
    case "tall-pantry-full":
      return { shelves: 5, hardware: "pullout-pantry" };
    case "tall-pantry-half":
      return { shelves: 3, hardware: "pullout-utility" };
    case "tall-fridge":
      return { appliance: "fridge-double" };
    case "tall-oven":
      return { appliance: "oven-builtin" };
    case "tall-microwave":
      return { appliance: "microwave-builtin" };
    case "tall-storage":
      return { shelves: 5 };
    case "tall-utility":
      return { shelves: 4 };
    case "wall-chimney":
      return { appliance: "chimney-wall" };
    case "wall-microwave":
      return { appliance: "microwave-builtin" };
    case "wall-lift":
    case "wall-flap":
      return { hardware: "lift-up", shelves: 1 };
    default:
      return {};
  }
}
