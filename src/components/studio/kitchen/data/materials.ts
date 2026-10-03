import { GLASS_FINISHES } from "@/data/glassFinishes";
/**
 * Central material registry. Components never define their own colours or
 * roughness — they ask the registry for a MaterialDef and the MaterialLibrary
 * turns it into a cached PBR material.
 */

export type MaterialCategory =
  | "laminate"
  | "acrylic"
  | "pu"
  | "veneer"
  | "glass"
  | "countertop"
  | "backsplash"
  | "floor";

export type TextureKind = "none" | "wood" | "marble" | "stone" | "granite" | "concrete" | "terrazzo" | "subway" | "mosaic" | "plank" | "tile" | "fluted";

export interface MaterialDef {
  id: string;
  name: string;
  category: MaterialCategory;
  color: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  texture: TextureKind;
  /** Secondary colour used by textures (grain rings, veins, grout…). */
  accent?: string;
  /** Glass opacity (1 = opaque). */
  opacity?: number;
  sku: string;
  manufacturer: string;
  /** Multiplies the base cabinet / counter rate. */
  priceMultiplier: number;
}

const M = "Kraftspace Select"; // placeholder manufacturer — replace with real catalogue data

const lam = (id: string, name: string, color: string, extra: Partial<MaterialDef> = {}): MaterialDef => ({
  id,
  name,
  category: "laminate",
  color,
  roughness: 0.62,
  metalness: 0,
  texture: "none",
  sku: `LAM-${id.toUpperCase()}`,
  manufacturer: M,
  priceMultiplier: 1,
  ...extra,
});

const acr = (id: string, name: string, color: string): MaterialDef => ({
  id,
  name,
  category: "acrylic",
  color,
  roughness: 0.05,
  metalness: 0,
  clearcoat: 1,
  texture: "none",
  sku: `ACR-${id.toUpperCase()}`,
  manufacturer: M,
  priceMultiplier: 1.35,
});

const pu = (id: string, name: string, color: string, roughness: number, clearcoat: number): MaterialDef => ({
  id,
  name,
  category: "pu",
  color,
  roughness,
  metalness: 0,
  clearcoat,
  texture: "none",
  sku: `PU-${id.toUpperCase()}`,
  manufacturer: M,
  priceMultiplier: 1.6,
});

const ven = (id: string, name: string, color: string, ring: string): MaterialDef => ({
  id,
  name,
  category: "veneer",
  color,
  roughness: 0.5,
  metalness: 0,
  clearcoat: 0.25,
  texture: "wood",
  accent: ring,
  sku: `VEN-${id.toUpperCase()}`,
  manufacturer: M,
  priceMultiplier: 1.8,
});

const glass = (id: string, name: string, color: string, opacity: number, roughness: number, texture: TextureKind = "none"): MaterialDef => ({
  id,
  name,
  category: "glass",
  color,
  roughness,
  metalness: 0,
  opacity,
  texture,
  sku: `GLS-${id.toUpperCase()}`,
  manufacturer: M,
  priceMultiplier: 1.5,
});

const top = (
  id: string,
  name: string,
  color: string,
  texture: TextureKind,
  accent: string,
  roughness: number,
  priceMultiplier: number
): MaterialDef => ({
  id,
  name,
  category: "countertop",
  color,
  roughness,
  metalness: 0,
  clearcoat: roughness < 0.25 ? 0.6 : 0.1,
  texture,
  accent,
  sku: `CTR-${id.toUpperCase()}`,
  manufacturer: M,
  priceMultiplier,
});

export const MATERIALS: MaterialDef[] = [
  // laminates
  lam("matte-white", "Matte White", "#eeece6"),
  lam("matte-black", "Matte Black", "#1b1b1c"),
  lam("warm-grey", "Warm Grey", "#a39c93"),
  lam("light-grey", "Light Grey", "#c9cbcc"),
  lam("beige", "Beige", "#d6c6a8"),
  lam("sand", "Sand", "#c8b08a"),
  lam("taupe", "Taupe", "#8b7b6e"),
  lam("walnut-lam", "Walnut", "#6b4a2f", { texture: "wood", accent: "#2e1c0d", roughness: 0.55 }),
  lam("oak-lam", "Oak", "#c9a678", { texture: "wood", accent: "#8a6a3f", roughness: 0.6 }),
  lam("dark-wood", "Dark Wood", "#3d2a1d", { texture: "wood", accent: "#1a100a", roughness: 0.55 }),
  lam("concrete-lam", "Concrete", "#8c8d8b", { texture: "concrete", accent: "#6f706e", roughness: 0.85 }),
  lam("marble-lam", "Marble-look", "#e8e6e1", { texture: "marble", accent: "#9b9892", roughness: 0.35 }),
  lam("stone-lam", "Stone-look", "#a89f94", { texture: "stone", accent: "#7a7268", roughness: 0.8 }),
  // acrylic
  acr("acr-white", "High Gloss White", "#f6f6f4"),
  acr("acr-black", "High Gloss Black", "#101011"),
  acr("acr-champagne", "Champagne", "#d9c7a3"),
  acr("acr-grey", "Gloss Grey", "#8a8d90"),
  acr("acr-beige", "Gloss Beige", "#dccdb4"),
  acr("acr-sage", "Gloss Sage", "#8a9a7b"),
  // PU
  pu("pu-matte-graphite", "Matte PU — Graphite", "#3a3d40", 0.78, 0),
  pu("pu-matte-sage", "Matte PU — Sage", "#8a9a7b", 0.78, 0),
  pu("pu-gloss-navy", "Gloss PU — Navy", "#1f2f4a", 0.1, 1),
  pu("pu-gloss-pearl", "Gloss PU — Pearl", "#f1efe9", 0.1, 1),
  pu("pu-satin-ivory", "Satin PU — Ivory", "#e9e0cf", 0.35, 0.4),
  pu("pu-satin-greige", "Satin PU — Greige", "#b3a898", 0.35, 0.4),
  // veneer
  ven("ven-oak", "Natural Oak", "#c8a574", "#8a6a3f"),
  ven("ven-walnut", "Walnut", "#5e4129", "#2a190b"),
  ven("ven-teak", "Teak", "#a5733c", "#5a3a1a"),
  ven("ven-ash", "Ash", "#c9c0b0", "#8f8574"),
  ven("ven-smoked-oak", "Smoked Oak", "#4a3a2c", "#1c140d"),
  // glass
  ...GLASS_FINISHES.map((f) => glass(`gl-${f.id}`, f.name, f.color, f.opacity, f.roughness, f.texture)),
  // countertops
  top("ct-granite-black", "Granite — Black Galaxy", "#1c1d20", "granite", "#d8c27a", 0.25, 0.9),
  top("ct-granite-kashmir", "Granite — Kashmir White", "#d8d3ca", "granite", "#7d6f63", 0.28, 0.85),
  top("ct-quartz-white", "Quartz — Pure White", "#f1f1ef", "stone", "#cfcfcc", 0.18, 1.3),
  top("ct-quartz-grey", "Quartz — Concrete Grey", "#9a9b9a", "stone", "#6e6f6e", 0.2, 1.3),
  top("ct-marble-carrara", "Marble — Carrara", "#ecebe8", "marble", "#a7a7a5", 0.18, 1.8),
  top("ct-marble-nero", "Marble — Nero", "#17171a", "marble", "#c9b878", 0.18, 2.1),
  top("ct-sintered-calacatta", "Sintered Stone — Calacatta", "#f3f1ec", "marble", "#b9a98a", 0.12, 2.3),
  top("ct-solid-white", "Solid Surface — White", "#f4f3ee", "none", "#f4f3ee", 0.3, 1.1),
  top("ct-wood-oak", "Butcher Block — Oak", "#c39a64", "wood", "#7a5a30", 0.5, 1.0),
  // backsplash
  { id: "bs-subway-white", name: "Subway Tile — White", category: "backsplash", color: "#f4f3ef", roughness: 0.2, metalness: 0, clearcoat: 0.6, texture: "subway", accent: "#cfcac0", sku: "BSP-SUBWAY-WHT", manufacturer: M, priceMultiplier: 1 },
  { id: "bs-subway-sage", name: "Subway Tile — Sage", category: "backsplash", color: "#8a9a7b", roughness: 0.2, metalness: 0, clearcoat: 0.6, texture: "subway", accent: "#cfcac0", sku: "BSP-SUBWAY-SAG", manufacturer: M, priceMultiplier: 1.1 },
  { id: "bs-marble", name: "Marble Slab", category: "backsplash", color: "#ecebe8", roughness: 0.2, metalness: 0, clearcoat: 0.5, texture: "marble", accent: "#a7a7a5", sku: "BSP-MARBLE", manufacturer: M, priceMultiplier: 2.4 },
  { id: "bs-mosaic", name: "Mosaic — Warm Mix", category: "backsplash", color: "#c9b79a", roughness: 0.3, metalness: 0, texture: "mosaic", accent: "#8b7b6e", sku: "BSP-MOSAIC", manufacturer: M, priceMultiplier: 1.6 },
  { id: "bs-matching", name: "Match Countertop", category: "backsplash", color: "#ecebe8", roughness: 0.2, metalness: 0, texture: "none", sku: "BSP-MATCH", manufacturer: M, priceMultiplier: 1.4 },
  // floors
  { id: "fl-oak", name: "Oak Planks", category: "floor", color: "#b99468", roughness: 0.5, metalness: 0, texture: "plank", accent: "#7d5a35", sku: "FLR-OAK", manufacturer: M, priceMultiplier: 1 },
  { id: "fl-tile-light", name: "Light Porcelain Tile", category: "floor", color: "#d8d6d0", roughness: 0.3, metalness: 0, clearcoat: 0.4, texture: "tile", accent: "#bdbab2", sku: "FLR-TILE-L", manufacturer: M, priceMultiplier: 1 },
  { id: "fl-tile-dark", name: "Graphite Tile", category: "floor", color: "#4a4b4d", roughness: 0.3, metalness: 0, clearcoat: 0.4, texture: "tile", accent: "#38393a", sku: "FLR-TILE-D", manufacturer: M, priceMultiplier: 1 },
  { id: "fl-concrete", name: "Polished Concrete", category: "floor", color: "#8f908e", roughness: 0.55, metalness: 0, texture: "concrete", accent: "#6f706e", sku: "FLR-CONC", manufacturer: M, priceMultiplier: 1 },
];

export const MATERIALS_BY_ID: Record<string, MaterialDef> = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));

export const materialsIn = (...cats: MaterialCategory[]) => MATERIALS.filter((m) => cats.includes(m.category));

/** Custom colours are encoded as "custom:#rrggbb" so they travel through the same pipeline. */
export function resolveMaterial(id: string): MaterialDef {
  if (id.startsWith("custom:")) {
    const color = id.slice(7);
    return {
      id,
      name: `Custom ${color}`,
      category: "acrylic",
      color,
      roughness: 0.3,
      metalness: 0,
      clearcoat: 0.5,
      texture: "none",
      sku: "CUSTOM",
      manufacturer: "Custom colour",
      priceMultiplier: 1.45,
    };
  }
  return MATERIALS_BY_ID[id] ?? MATERIALS[0];
}

export const CABINET_FINISH_CATEGORIES: MaterialCategory[] = ["laminate", "acrylic", "pu", "veneer"];
