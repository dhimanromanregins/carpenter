/**
 * Which hardware fits which module, and which module a product implies.
 * Data-driven so new products can be registered without touching the UI.
 */
import type { ModuleKind, ModuleParams } from "../model/types";

export interface HardwareTarget {
  kinds: ModuleKind[];
  param: keyof Pick<ModuleParams, "hardware" | "organiser">;
}

/** A product installs into an existing module when it has a target. */
export function hardwareTarget(productId: string): HardwareTarget | null {
  if (productId.startsWith("corner-")) return { kinds: ["base-corner"], param: "hardware" };
  if (productId.startsWith("cutlery-")) return { kinds: ["base-drawers", "base-cutlery"], param: "organiser" };
  if (productId.startsWith("lift-")) return { kinds: ["wall-lift"], param: "hardware" };
  if (productId === "pullout-pantry" || productId === "pullout-utility") return { kinds: ["tall-pantry"], param: "hardware" };
  return null;
}

/** Module type to add when a product is chosen from the library. */
export function suggestedModule(productId: string): string | null {
  const map: Record<string, string> = {
    "pullout-bottle": "base-bottle-200",
    "pullout-spice": "base-bottle-150",
    "pullout-narrow": "base-bottle-150",
    "pullout-utility": "base-bottle-300",
    "pullout-cleaning": "tall-utility",
    "pullout-pantry": "tall-pantry-full",
    "drawer-standard": "base-drawers-3",
    "drawer-tandem": "base-deep-drawers",
    "drawer-deep": "base-deep-drawers",
    "drawer-inner": "base-drawers-2",
    "drawer-cutlery": "base-cutlery",
    "drawer-peg": "base-deep-drawers",
    "drawer-bottle": "base-bottle-300",
    "bin-single": "base-dustbin-1",
    "bin-double": "base-dustbin-2",
    "bin-triple": "base-dustbin-3",
    "bin-undercounter": "base-dustbin-1",
    "bin-recycling": "base-dustbin-3",
    "corner-magic": "base-corner-magic",
    "corner-magic-2": "base-corner-magic",
    "corner-lemans": "base-corner-lemans",
    "corner-carousel": "base-corner-carousel",
    "corner-kidney": "base-corner-carousel",
    "corner-swing": "base-corner-blind",
    "corner-drawer": "base-corner-blind",
    "lift-up": "wall-lift",
    "lift-parallel": "wall-lift",
    "lift-bifold": "wall-lift",
    "lift-aventos": "wall-lift",
    "lift-flap": "wall-flap",
    "basket-plain": "base-drawers-2",
    "basket-ss": "base-drawers-2",
    "basket-chrome": "base-drawers-2",
    "basket-tandem": "base-deep-drawers",
    "basket-vegetable": "base-drawers-2",
    "basket-fruit": "base-drawers-2",
    "basket-plate": "base-deep-drawers",
    "basket-cup": "base-drawers-2",
    "basket-thali": "base-deep-drawers",
    "basket-corner": "base-corner-magic",
    "sink-drawer": "base-sink",
    "sink-organiser": "base-sink",
    "sink-bin": "base-dustbin-1",
    "sink-cleaning": "tall-utility",
    "sink-drain": "base-sink",
    "rack-plate": "base-open",
    "rack-bottle": "base-bottle-300",
    "rack-spice": "base-bottle-150",
  };
  return map[productId] ?? null;
}

/** Appliance products that map onto module params / global style. */
export function applianceRole(productId: string): { kind: "fridge" | "oven" | "microwave" | "dishwasher" | "washer" | "hob" | "chimney" | "top" } {
  if (productId.startsWith("fridge")) return { kind: "fridge" };
  if (productId === "oven-builtin") return { kind: "oven" };
  if (productId === "microwave-builtin") return { kind: "microwave" };
  if (productId === "dishwasher") return { kind: "dishwasher" };
  if (productId === "washing-machine") return { kind: "washer" };
  if (productId.startsWith("hob")) return { kind: "hob" };
  if (productId.startsWith("chimney")) return { kind: "chimney" };
  return { kind: "top" };
}
