import type { HandleFinishId, HandleStyle, ShutterStyle } from "../model/types";

export interface HandleFinishDef {
  id: HandleFinishId;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  price: number;
}

export const HANDLE_FINISHES: HandleFinishDef[] = [
  { id: "black", name: "Matte Black", color: "#171717", roughness: 0.5, metalness: 0.6, price: 0 },
  { id: "chrome", name: "Chrome", color: "#dde2e6", roughness: 0.1, metalness: 1, price: 150 },
  { id: "brushed-steel", name: "Brushed Steel", color: "#b6bbc0", roughness: 0.35, metalness: 1, price: 100 },
  { id: "gold", name: "Brushed Gold", color: "#c9a86a", roughness: 0.3, metalness: 1, price: 450 },
  { id: "brass", name: "Antique Brass", color: "#9a7a3f", roughness: 0.4, metalness: 1, price: 350 },
  { id: "bronze", name: "Bronze", color: "#7a5a3a", roughness: 0.38, metalness: 1, price: 300 },
];

export const HANDLE_FINISH_BY_ID: Record<HandleFinishId, HandleFinishDef> = Object.fromEntries(
  HANDLE_FINISHES.map((h) => [h.id, h])
) as Record<HandleFinishId, HandleFinishDef>;

export const HANDLE_STYLES: { id: HandleStyle; name: string; price: number }[] = [
  { id: "bar", name: "Bar handle", price: 350 },
  { id: "knob", name: "Knob", price: 180 },
  { id: "edge", name: "Edge handle", price: 420 },
  { id: "profile", name: "Profile handle", price: 650 },
  { id: "none", name: "No handle", price: 0 },
];

export interface ShutterStyleDef {
  id: ShutterStyle;
  name: string;
  hint: string;
  /** Handleless styles carry their own opening profile. */
  handleless: boolean;
  glass: boolean;
  /** Price multiplier on the front area. */
  priceMultiplier: number;
}

export const SHUTTER_STYLES: ShutterStyleDef[] = [
  { id: "flat", name: "Flat", hint: "Clean slab shutters", handleless: false, glass: false, priceMultiplier: 1 },
  { id: "profile", name: "Profile", hint: "Routed V-groove lines", handleless: false, glass: false, priceMultiplier: 1.1 },
  { id: "shaker", name: "Shaker", hint: "Framed panel look", handleless: false, glass: false, priceMultiplier: 1.2 },
  { id: "fluted", name: "Fluted", hint: "Vertical ribbed fronts", handleless: false, glass: false, priceMultiplier: 1.35 },
  { id: "glass-alu", name: "Glass · aluminium frame", hint: "Slim aluminium frame", handleless: false, glass: true, priceMultiplier: 1.5 },
  { id: "glass-wood", name: "Glass · wood frame", hint: "Wooden frame, glass inset", handleless: false, glass: true, priceMultiplier: 1.55 },
  { id: "glass-black", name: "Glass · black frame", hint: "Slim black aluminium frame", handleless: false, glass: true, priceMultiplier: 1.55 },
  { id: "glass-frameless", name: "Glass · frameless", hint: "Edge-to-edge glass, no frame", handleless: false, glass: true, priceMultiplier: 1.7 },
  { id: "handleless-j", name: "Handleless · J-profile", hint: "Lip profile along the top edge", handleless: true, glass: false, priceMultiplier: 1.3 },
  { id: "handleless-g", name: "Handleless · G-profile", hint: "Recessed groove channel", handleless: true, glass: false, priceMultiplier: 1.3 },
  { id: "handleless-c", name: "Handleless · C-profile", hint: "Curved C channel", handleless: true, glass: false, priceMultiplier: 1.35 },
  { id: "handleless-push", name: "Handleless · push-to-open", hint: "Touch latch, no hardware", handleless: true, glass: false, priceMultiplier: 1.25 },
];

export const SHUTTER_STYLE_BY_ID: Record<ShutterStyle, ShutterStyleDef> = Object.fromEntries(
  SHUTTER_STYLES.map((s) => [s.id, s])
) as Record<ShutterStyle, ShutterStyleDef>;
