import type { KitchenStyle, LightingConfig } from "../model/types";

export interface DesignPreset {
  id: string;
  name: string;
  blurb: string;
  swatches: string[];
  style: Partial<KitchenStyle>;
  lighting?: Partial<LightingConfig>;
}

export const PRESETS: DesignPreset[] = [
  {
    id: "modern-white",
    name: "Modern White",
    blurb: "White matte, quartz & black handles",
    swatches: ["#eeece6", "#f1f1ef", "#171717"],
    style: {
      shutterStyle: "flat",
      shutterMaterial: "matte-white",
      bodyMaterial: "matte-white",
      handleStyle: "bar",
      handleFinish: "black",
      counterMaterial: "ct-quartz-white",
      backsplash: { enabled: true, material: "bs-subway-white", height: 600 },
      floorMaterial: "fl-tile-light",
      wallColor: "#f1efe9",
    },
    lighting: { scene: "day", temperature: 4000 },
  },
  {
    id: "luxury-dark",
    name: "Luxury Dark",
    blurb: "Dark walnut, black & stone countertop",
    swatches: ["#3d2a1d", "#17171a", "#c9a86a"],
    style: {
      shutterStyle: "flat",
      shutterMaterial: "dark-wood",
      bodyMaterial: "matte-black",
      handleStyle: "edge",
      handleFinish: "gold",
      counterMaterial: "ct-marble-nero",
      backsplash: { enabled: true, material: "bs-marble", height: 600 },
      floorMaterial: "fl-tile-dark",
      wallColor: "#2c2f35",
    },
    lighting: { scene: "evening", temperature: 2700 },
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    blurb: "Oak, white & light stone",
    swatches: ["#c9a678", "#eeece6", "#d8d3ca"],
    style: {
      shutterStyle: "shaker",
      shutterMaterial: "ven-oak",
      bodyMaterial: "matte-white",
      handleStyle: "knob",
      handleFinish: "brushed-steel",
      counterMaterial: "ct-granite-kashmir",
      backsplash: { enabled: true, material: "bs-subway-white", height: 600 },
      floorMaterial: "fl-oak",
      wallColor: "#f4f1ea",
    },
    lighting: { scene: "day", temperature: 3000 },
  },
  {
    id: "contemporary",
    name: "Contemporary",
    blurb: "Grey acrylic & quartz",
    swatches: ["#8a8d90", "#9a9b9a", "#dde2e6"],
    style: {
      shutterStyle: "flat",
      shutterMaterial: "acr-grey",
      bodyMaterial: "light-grey",
      handleStyle: "profile",
      handleFinish: "chrome",
      counterMaterial: "ct-quartz-grey",
      backsplash: { enabled: true, material: "bs-matching", height: 600 },
      floorMaterial: "fl-concrete",
      wallColor: "#d9d7d2",
    },
    lighting: { scene: "day", temperature: 4000 },
  },
  {
    id: "classic",
    name: "Classic",
    blurb: "Shaker, wood & marble",
    swatches: ["#5e4129", "#e9e0cf", "#ecebe8"],
    style: {
      shutterStyle: "shaker",
      shutterMaterial: "pu-satin-ivory",
      bodyMaterial: "beige",
      handleStyle: "knob",
      handleFinish: "brass",
      counterMaterial: "ct-marble-carrara",
      backsplash: { enabled: true, material: "bs-marble", height: 600 },
      floorMaterial: "fl-oak",
      wallColor: "#ece3d3",
    },
    lighting: { scene: "evening", temperature: 3000 },
  },
  {
    id: "minimal-handleless",
    name: "Minimal Handleless",
    blurb: "Matte finish, J-profile & quartz",
    swatches: ["#a39c93", "#f1f1ef", "#1b1b1c"],
    style: {
      shutterStyle: "handleless-j",
      shutterMaterial: "pu-matte-graphite",
      bodyMaterial: "warm-grey",
      handleStyle: "none",
      handleFinish: "black",
      counterMaterial: "ct-quartz-white",
      backsplash: { enabled: false, material: "bs-matching", height: 600 },
      floorMaterial: "fl-concrete",
      wallColor: "#e3e1dc",
    },
    lighting: { scene: "presentation", temperature: 3000 },
  },
];
