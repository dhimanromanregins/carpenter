/**
 * Shared glass-finish catalogue (56 finishes). Used by the quotation builder,
 * the wardrobe designer and the kitchen studio so every tool offers the same
 * choices. `opacity` / `roughness` drive the 3D materials; `color` also drives
 * the swatch preview.
 */

export type GlassGroup = "Clear & Tinted" | "Frosted & Etched" | "Fluted & Reeded" | "Textured & Patterned" | "Mirror & Reflective" | "Back-painted & Coloured" | "Decorative";

export interface GlassFinish {
  id: string;
  name: string;
  group: GlassGroup;
  color: string;
  opacity: number;
  roughness: number;
  /** "fluted" renders ribbed geometry in the 3D scenes that support it. */
  texture: "none" | "fluted";
}

type Row = [id: string, name: string, color: string, opacity: number, roughness: number, texture?: "fluted"];

const g = (group: GlassGroup, rows: Row[]): GlassFinish[] =>
  rows.map(([id, name, color, opacity, roughness, texture]) => ({ id, name, group, color, opacity, roughness, texture: texture ?? "none" }));

export const GLASS_FINISHES: GlassFinish[] = [
  ...g("Clear & Tinted", [
    ["clear", "Clear", "#dfeef2", 0.16, 0.02],
    ["low-iron", "Ultra Clear (Low-iron)", "#eef6f7", 0.1, 0.02],
    ["grey", "Grey Tint", "#7b858c", 0.34, 0.04],
    ["dark-grey", "Dark Grey", "#4b5258", 0.5, 0.04],
    ["smoked", "Smoked / Dark", "#3b4046", 0.42, 0.04],
    ["black", "Black Tint", "#16181a", 0.7, 0.04],
    ["bronze", "Bronze", "#7a5a3a", 0.38, 0.04],
    ["amber", "Amber", "#b57a32", 0.36, 0.04],
    ["gold-tint", "Gold Tint", "#c4a35a", 0.34, 0.04],
    ["green", "Bottle Green", "#4f7a64", 0.4, 0.04],
    ["blue", "Ocean Blue", "#5e8fb0", 0.36, 0.04],
  ]),
  ...g("Frosted & Etched", [
    ["frosted", "Frosted", "#eef2f4", 0.62, 0.55],
    ["acid-etched", "Acid Etched", "#e7edef", 0.58, 0.6],
    ["sandblasted", "Sandblasted", "#e3e9eb", 0.66, 0.7],
    ["satin", "Satin Matt", "#eaeff0", 0.5, 0.45],
    ["dark-frosted", "Dark Frosted", "#6b7378", 0.7, 0.55],
    ["bronze-frosted", "Bronze Frosted", "#a98a68", 0.66, 0.55],
    ["border-frost", "Clear with Frosted Border", "#e5eef1", 0.3, 0.3],
  ]),
  ...g("Fluted & Reeded", [
    ["fluted", "Fluted", "#e2edf0", 0.5, 0.2, "fluted"],
    ["fluted-dark", "Fluted Smoke", "#4b5258", 0.6, 0.2, "fluted"],
    ["fluted-bronze", "Fluted Bronze", "#8a6a48", 0.56, 0.2, "fluted"],
    ["fluted-green", "Fluted Green", "#5f8671", 0.56, 0.2, "fluted"],
    ["fluted-frosted", "Fluted Frosted", "#e9eff1", 0.7, 0.45, "fluted"],
    ["reeded", "Reeded (Fine Ribs)", "#dde9ec", 0.46, 0.18, "fluted"],
    ["reeded-wide", "Reeded (Wide Ribs)", "#dbe7ea", 0.44, 0.16, "fluted"],
    ["half-round-fluted", "Half-round Fluted", "#e0ecef", 0.48, 0.18, "fluted"],
  ]),
  ...g("Textured & Patterned", [
    ["pebble", "Pebble Texture", "#dce7ea", 0.55, 0.4],
    ["rain", "Rain / Droplet", "#dfeaed", 0.5, 0.3],
    ["hammered", "Hammered", "#d9e5e8", 0.5, 0.35],
    ["ripple", "Ripple / Water", "#dbe8eb", 0.48, 0.3],
    ["cathedral", "Cathedral", "#e3ecee", 0.5, 0.35],
    ["diamond", "Diamond Cut", "#e0eaec", 0.5, 0.3],
    ["linen", "Linen Weave", "#e7ecec", 0.58, 0.5],
    ["stippled", "Stippled", "#e1eaec", 0.55, 0.45],
    ["wave", "Wave Pattern", "#dce8eb", 0.48, 0.25],
  ]),
  ...g("Mirror & Reflective", [
    ["mirror-silver", "Silver Mirror", "#c9d1d4", 0.92, 0.02],
    ["mirror-bronze", "Bronze Mirror", "#9a7a56", 0.9, 0.03],
    ["mirror-grey", "Grey Mirror", "#707a80", 0.9, 0.03],
    ["mirror-gold", "Gold Mirror", "#c8a95c", 0.9, 0.03],
    ["antique-mirror", "Antique Mirror", "#8d8a80", 0.88, 0.2],
    ["one-way", "One-way / Reflective", "#9db0b8", 0.7, 0.03],
  ]),
  ...g("Back-painted & Coloured", [
    ["lacquer-white", "Lacquered White", "#f4f4f1", 0.97, 0.05],
    ["lacquer-black", "Lacquered Black", "#121314", 0.98, 0.05],
    ["lacquer-grey", "Lacquered Grey", "#8c9195", 0.97, 0.05],
    ["lacquer-beige", "Lacquered Beige", "#d8c9ae", 0.97, 0.05],
    ["lacquer-sage", "Lacquered Sage", "#8a9a7b", 0.97, 0.05],
    ["lacquer-navy", "Lacquered Navy", "#1f2f4a", 0.97, 0.05],
    ["lacquer-gold", "Lacquered Gold", "#b8984f", 0.97, 0.08],
  ]),
  ...g("Decorative", [
    ["wired", "Wired Glass", "#dde7e4", 0.5, 0.25],
    ["leaded", "Leaded / Stained", "#c9b27a", 0.5, 0.2],
    ["printed", "Digital Printed", "#e8e2d6", 0.75, 0.15],
    ["marble-print", "Marble-print Glass", "#e9e7e2", 0.85, 0.12],
    ["wood-print", "Wood-print Glass", "#a47c54", 0.88, 0.15],
    ["gradient-tint", "Gradient Tint", "#a8bcc4", 0.4, 0.05],
    ["laminated-opal", "Laminated Opal", "#f1f3f1", 0.8, 0.3],
    ["switchable", "Switchable (Smart) Glass", "#e8f0f2", 0.55, 0.2],
  ]),
];

export const GLASS_FINISH_GROUPS: GlassGroup[] = [
  "Clear & Tinted",
  "Frosted & Etched",
  "Fluted & Reeded",
  "Textured & Patterned",
  "Mirror & Reflective",
  "Back-painted & Coloured",
  "Decorative",
];

export const GLASS_FINISHES_BY_ID: Record<string, GlassFinish> = Object.fromEntries(GLASS_FINISHES.map((f) => [f.id, f]));

/** Ids used by older saved designs. */
const LEGACY_IDS: Record<string, string> = { smoke: "smoked" };

export function findGlassFinish(id: string | null | undefined): GlassFinish {
  const key = id ? LEGACY_IDS[id] ?? id : "clear";
  return GLASS_FINISHES_BY_ID[key] ?? GLASS_FINISHES[0];
}
