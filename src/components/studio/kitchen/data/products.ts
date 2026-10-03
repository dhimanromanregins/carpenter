/**
 * Product catalogue: hardware, accessories, appliances, sinks, faucets, lighting.
 *
 * To add a product: append an entry here (and, optionally, a GLB under
 * /public/models/kitchen/ referenced via `modelUrl`). Anything registered shows up
 * in the library and in pricing/BOQ without touching the kitchen engine.
 *
 * Manufacturer / SKU / price values are PLACEHOLDERS — replace with your real
 * supplier catalogue.
 */
import type { Product } from "../model/types";

const KS = "Kraftspace Select";

const p = (
  id: string,
  name: string,
  category: string,
  subcategory: string,
  price: number,
  dims?: [number, number, number],
  extra: Partial<Product> = {}
): Product => ({ id, name, category, subcategory, manufacturer: KS, sku: `KS-${id.toUpperCase()}`, price, dims, ...extra });

/* ───────────────────────── hardware ───────────────────────── */

export const HARDWARE: Product[] = [
  // drawers
  p("drawer-standard", "Standard soft-close drawer", "hardware", "Drawers", 2800, [450, 90, 500], { loadKg: 30 }),
  p("drawer-tandem", "Tandem drawer", "hardware", "Drawers", 6200, [600, 180, 500], { loadKg: 40 }),
  p("drawer-deep", "Deep drawer", "hardware", "Drawers", 5400, [600, 300, 500], { loadKg: 50 }),
  p("drawer-inner", "Inner drawer", "hardware", "Drawers", 3200, [450, 120, 450], { loadKg: 25 }),
  p("drawer-cutlery", "Cutlery drawer", "hardware", "Drawers", 3600, [450, 90, 500], { loadKg: 25 }),
  p("drawer-peg", "Peg drawer (plate storage)", "hardware", "Drawers", 7200, [600, 200, 500], { loadKg: 40 }),
  p("drawer-bottle", "Bottle drawer", "hardware", "Drawers", 5100, [300, 480, 500], { loadKg: 30 }),
  // pull-outs
  p("pullout-bottle", "Bottle pull-out", "hardware", "Pull-outs", 8500, [200, 600, 500], { loadKg: 30 }),
  p("pullout-spice", "Spice pull-out", "hardware", "Pull-outs", 7400, [150, 600, 500], { loadKg: 15 }),
  p("pullout-narrow", "Narrow pull-out", "hardware", "Pull-outs", 7800, [150, 600, 500], { loadKg: 20 }),
  p("pullout-pantry", "Pantry pull-out", "hardware", "Pull-outs", 21000, [450, 1900, 500], { loadKg: 80 }),
  p("pullout-utility", "Utility pull-out", "hardware", "Pull-outs", 9500, [300, 600, 500], { loadKg: 30 }),
  p("pullout-cleaning", "Cleaning-supplies pull-out", "hardware", "Pull-outs", 8800, [300, 600, 500], { loadKg: 25 }),
  // baskets
  p("basket-plain", "Plain basket", "hardware", "Baskets", 2400, [450, 150, 500]),
  p("basket-ss", "Stainless-steel basket", "hardware", "Baskets", 4200, [450, 150, 500]),
  p("basket-chrome", "Chrome basket", "hardware", "Baskets", 3600, [450, 150, 500]),
  p("basket-tandem", "Tandem basket", "hardware", "Baskets", 8800, [450, 400, 500]),
  p("basket-vegetable", "Vegetable basket", "hardware", "Baskets", 5200, [450, 250, 500]),
  p("basket-fruit", "Fruit basket", "hardware", "Baskets", 4800, [450, 200, 500]),
  p("basket-plate", "Plate basket", "hardware", "Baskets", 5600, [450, 250, 500]),
  p("basket-cup", "Cup basket", "hardware", "Baskets", 5000, [450, 200, 500]),
  p("basket-thali", "Thali basket", "hardware", "Baskets", 6400, [450, 250, 500]),
  p("basket-corner", "Corner basket", "hardware", "Baskets", 9800, [500, 200, 500]),
  // corner hardware
  p("corner-magic", "Magic corner", "hardware", "Corner", 24500, [500, 600, 500], { loadKg: 35 }),
  p("corner-magic-2", "Magic corner II", "hardware", "Corner", 28500, [500, 600, 500], { loadKg: 40 }),
  p("corner-lemans", "LeMans swing-out", "hardware", "Corner", 32000, [500, 600, 500], { loadKg: 40 }),
  p("corner-carousel", "Carousel (360°)", "hardware", "Corner", 21000, [800, 600, 800], { loadKg: 30 }),
  p("corner-kidney", "Kidney-shaped shelves", "hardware", "Corner", 17500, [800, 600, 800]),
  p("corner-swing", "Swing tray", "hardware", "Corner", 15800, [500, 600, 500]),
  p("corner-drawer", "Corner drawer", "hardware", "Corner", 19000, [900, 200, 900]),
  // sink accessories
  p("sink-drawer", "Under-sink drawer", "hardware", "Sink", 6800, [800, 200, 500]),
  p("sink-organiser", "Under-sink organiser", "hardware", "Sink", 4200, [800, 400, 450]),
  p("sink-bin", "Under-sink waste bin", "hardware", "Sink", 3900, [300, 400, 450]),
  p("sink-cleaning", "Cleaning-supply organiser", "hardware", "Sink", 3400, [300, 300, 450]),
  p("sink-drain", "Drain-pipe organiser", "hardware", "Sink", 2500, [450, 300, 450]),
  // lift-up
  p("lift-up", "Upward lift (hydraulic)", "hardware", "Lift systems", 7600, [900, 350, 350], { loadKg: 12 }),
  p("lift-parallel", "Parallel lift", "hardware", "Lift systems", 9400, [900, 350, 350], { loadKg: 14 }),
  p("lift-bifold", "Bi-fold lift", "hardware", "Lift systems", 11800, [900, 700, 350], { loadKg: 16 }),
  p("lift-aventos", "Aventos-style lift", "hardware", "Lift systems", 12600, [900, 350, 350], { loadKg: 18 }),
  p("lift-flap", "Flap lift", "hardware", "Lift systems", 6400, [900, 350, 350], { loadKg: 10 }),
  // dustbins
  p("bin-single", "Single dustbin pull-out", "hardware", "Waste", 5200, [300, 450, 450]),
  p("bin-double", "Double dustbin pull-out", "hardware", "Waste", 8600, [450, 450, 450]),
  p("bin-triple", "Triple dustbin pull-out", "hardware", "Waste", 12400, [600, 450, 450]),
  p("bin-undercounter", "Under-counter dustbin", "hardware", "Waste", 4800, [300, 400, 450]),
  p("bin-recycling", "Recycling compartment", "hardware", "Waste", 9800, [600, 450, 450]),
  // cutlery organisers
  p("cutlery-basic", "Basic cutlery tray", "accessory", "Cutlery", 900, [450, 50, 450]),
  p("cutlery-premium", "Premium organiser", "accessory", "Cutlery", 3800, [450, 60, 450]),
  p("cutlery-wood", "Wooden cutlery organiser", "accessory", "Cutlery", 4600, [450, 60, 450]),
  p("cutlery-plastic", "Plastic organiser", "accessory", "Cutlery", 1200, [450, 50, 450]),
  // misc
  p("rack-plate", "Plate rack", "accessory", "Racks", 3200, [450, 250, 300]),
  p("rack-bottle", "Bottle rack", "accessory", "Racks", 2800, [300, 600, 500]),
  p("rack-spice", "Spice rack", "accessory", "Racks", 2200, [300, 200, 100]),
];

/* ───────────────────────── appliances ───────────────────────── */

export const APPLIANCES: Product[] = [
  p("fridge-single", "Refrigerator — single door", "appliance", "Refrigerators", 28000, [600, 1550, 650]),
  p("fridge-double", "Refrigerator — double door", "appliance", "Refrigerators", 62000, [700, 1750, 700]),
  p("fridge-builtin", "Refrigerator — built-in", "appliance", "Refrigerators", 98000, [600, 1780, 560]),
  p("hob-gas-4", "Hob — 4-burner gas", "appliance", "Hobs", 18500, [600, 40, 520]),
  p("hob-gas-3", "Hob — 3-burner gas", "appliance", "Hobs", 14500, [600, 40, 500]),
  p("hob-induction", "Hob — induction", "appliance", "Hobs", 24500, [600, 40, 520]),
  p("chimney-wall", "Chimney — wall mounted", "appliance", "Chimneys", 22500, [600, 700, 500]),
  p("chimney-island", "Chimney — island", "appliance", "Chimneys", 46000, [900, 800, 500]),
  p("chimney-builtin", "Chimney — built-in", "appliance", "Chimneys", 31000, [600, 300, 450]),
  p("oven-builtin", "Built-in oven", "appliance", "Ovens", 42000, [595, 595, 550]),
  p("microwave-builtin", "Built-in microwave", "appliance", "Microwaves", 32000, [595, 390, 450]),
  p("dishwasher", "Dishwasher", "appliance", "Dishwashers", 44000, [600, 820, 600]),
  p("washing-machine", "Washing machine", "appliance", "Laundry", 36000, [600, 820, 580]),
  p("coffee-machine", "Coffee machine", "appliance", "Countertop", 38000, [300, 400, 380]),
  p("air-fryer", "Air fryer", "appliance", "Countertop", 9500, [300, 320, 360]),
  p("water-purifier", "Water purifier", "appliance", "Countertop", 14500, [300, 400, 250]),
];

/* ───────────────────────── sinks, faucets ───────────────────────── */

export interface SinkDef extends Product {
  bowls: 1 | 2;
  mount: "undermount" | "topmount";
  material: "stainless" | "quartz";
  /** Cut-out size (mm). */
  cutout: [number, number];
}

export const SINKS: SinkDef[] = [
  { ...p("sink-single-ss", "Single bowl — stainless steel", "sink", "Sinks", 9800, [600, 200, 450]), bowls: 1, mount: "topmount", material: "stainless", cutout: [560, 410] },
  { ...p("sink-double-ss", "Double bowl — stainless steel", "sink", "Sinks", 15800, [820, 200, 450]), bowls: 2, mount: "topmount", material: "stainless", cutout: [780, 410] },
  { ...p("sink-single-under", "Single bowl — undermount", "sink", "Sinks", 14200, [600, 220, 450]), bowls: 1, mount: "undermount", material: "stainless", cutout: [560, 410] },
  { ...p("sink-double-under", "Double bowl — undermount", "sink", "Sinks", 21800, [820, 220, 450]), bowls: 2, mount: "undermount", material: "stainless", cutout: [780, 410] },
  { ...p("sink-quartz", "Quartz sink — single bowl", "sink", "Sinks", 18900, [600, 200, 450]), bowls: 1, mount: "topmount", material: "quartz", cutout: [560, 410] },
];

export type FaucetFinish = "chrome" | "black" | "brushed-steel" | "gold";
export interface FaucetDef extends Product {
  style: "standard" | "pull-out" | "flexible";
  finish: FaucetFinish;
}
export const FAUCETS: FaucetDef[] = [
  { ...p("faucet-standard-chrome", "Standard faucet — chrome", "faucet", "Faucets", 6200), style: "standard", finish: "chrome" },
  { ...p("faucet-pullout-chrome", "Pull-out faucet — chrome", "faucet", "Faucets", 11800), style: "pull-out", finish: "chrome" },
  { ...p("faucet-flex-steel", "Flexible faucet — brushed steel", "faucet", "Faucets", 13400), style: "flexible", finish: "brushed-steel" },
  { ...p("faucet-pullout-black", "Pull-out faucet — black", "faucet", "Faucets", 14600), style: "pull-out", finish: "black" },
  { ...p("faucet-standard-gold", "Standard faucet — gold", "faucet", "Faucets", 17800), style: "standard", finish: "gold" },
];

/* ───────────────────────── lookup ───────────────────────── */

export const ALL_PRODUCTS: Product[] = [...HARDWARE, ...APPLIANCES, ...SINKS, ...FAUCETS];
export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(ALL_PRODUCTS.map((x) => [x.id, x]));

export const getProduct = (id: string | undefined): Product | undefined => (id ? PRODUCT_BY_ID[id] : undefined);

export const hardwareBySubcategory = () => {
  const map = new Map<string, Product[]>();
  HARDWARE.forEach((h) => {
    const key = h.subcategory ?? "Other";
    map.set(key, [...(map.get(key) ?? []), h]);
  });
  return map;
};
