/**
 * Wood-flooring catalogue — same shape as the board catalogue so the same
 * catalogue modal renders it. To show a real product photo, set `image` on a
 * brand product (files go under /public/flooring/...).
 *
 * NOTE: the per-brand range is a general summary — confirm it against each
 * brand's current catalogue before publishing.
 */
import type { BoardBrand, FullBoardType } from "./boardCatalog";

export const FLOORING_RATING_ROWS = [
  { key: "waterResistance", label: "Water resistance" },
  { key: "scratchResistance", label: "Scratch resistance" },
  { key: "durability", label: "Durability" },
  { key: "comfort", label: "Comfort underfoot" },
  { key: "easeOfInstall", label: "Ease of installation" },
  { key: "cost", label: "Price level" },
];

export const FLOORING_TYPES: FullBoardType[] = [
  {
    id: "laminate",
    name: "HDF Laminate Flooring",
    short: "Wood-look click-lock planks",
    standard: "AC3 – AC5 wear class",
    art: "plank",
    tone: ["#b98a5a", "#7b5330"],
    layerColors: ["#e8dccb", "#b98a5a", "#7b6a58", "#4b3a28"],
    layers: 4,
    description:
      "A realistic wood-look floor that clicks together over a foam underlay — durable, scratch-resistant and quick to install.",
    advantages: [
      "Hard-wearing surface resists scratches, scuffs and fading",
      "Realistic wood-grain and stone-look designs",
      "Click-lock installation over existing floors — fast and clean",
      "Much more affordable than real wood",
      "Easy to clean with a dry or lightly damp mop",
    ],
    bestFor: ["Bedrooms", "Living rooms", "Offices & studios", "Rental refurbishments"],
    thickness: ["7 mm", "8 mm", "10 mm", "12 mm"],
    inside: [
      { label: "Wear layer (overlay)", detail: "A clear melamine layer with aluminium oxide that takes the scratches and wear." },
      { label: "Décor layer", detail: "A high-resolution photo of real wood printed on paper — the look of the floor." },
      { label: "HDF core", detail: "High-density fibreboard that gives strength, stiffness and the click-lock profile." },
      { label: "Balancing backing", detail: "A moisture-resistant sheet that keeps the plank flat and blocks damp from below." },
    ],
    howMade:
      "The four layers are fused under heat and high pressure into one plank, which is then cut to size and machined with the click-lock edges.",
    glue: "Melamine & phenolic resins (heat-pressed)",
    weight: "Medium",
    ratings: { waterResistance: 2, scratchResistance: 4, durability: 4, comfort: 3, easeOfInstall: 5, cost: 2 },
  },
  {
    id: "waterproof-laminate",
    name: "Water-Resistant Laminate",
    short: "Laminate with a sealed core",
    standard: "AC4 + water-resistant core",
    art: "plank",
    tone: ["#a97d51", "#6d482a"],
    layerColors: ["#e8dccb", "#a97d51", "#5e7a86", "#4b3a28"],
    layers: 4,
    description:
      "The same wood-look laminate planks, with a water-repellent core and sealed edges that stand up to spills and humidity.",
    advantages: [
      "Sealed edges and moisture-resistant core resist spills and humidity",
      "Same realistic wood look as standard laminate",
      "Tougher wear layer for busy homes",
      "Good for kitchens and entrances where standard laminate is risky",
    ],
    bestFor: ["Kitchens", "Entrance halls", "Coastal / humid homes", "Busy family rooms"],
    thickness: ["8 mm", "10 mm", "12 mm"],
    inside: [
      { label: "Wear layer (overlay)", detail: "Hard aluminium-oxide overlay, often higher AC rating." },
      { label: "Décor layer", detail: "Printed wood-look paper." },
      { label: "Water-resistant HDF core", detail: "HDF made with water-repellent resins and a sealed profile." },
      { label: "Waterproof backing", detail: "Backing layer that blocks moisture from the subfloor." },
    ],
    howMade:
      "Made like standard laminate, but with a moisture-resistant core and edges that are wax-sealed to keep water out of the joints.",
    glue: "Water-resistant melamine & phenolic resins",
    weight: "Medium–heavy",
    ratings: { waterResistance: 4, scratchResistance: 4, durability: 4, comfort: 3, easeOfInstall: 5, cost: 3 },
  },
  {
    id: "engineered-wood",
    name: "Engineered Wood Flooring",
    short: "Real wood top layer",
    standard: "Real-wood veneer",
    art: "plank",
    tone: ["#c58d55", "#7d4f24"],
    layerColors: ["#c58d55", "#a97d51", "#8a6a45", "#6f5334"],
    layers: 4,
    description:
      "A real hardwood surface on a stable plywood core — the look and feel of solid timber without the swelling and gapping.",
    advantages: [
      "Genuine hardwood surface — warm, authentic and unique grain",
      "Cross-layer core keeps planks stable in heat and humidity",
      "Can be lightly sanded and refinished",
      "Adds real value to a home",
      "Feels warm and natural underfoot",
    ],
    bestFor: ["Living rooms", "Master bedrooms", "Premium villas", "Under-floor-heated rooms"],
    thickness: ["12 mm", "14 mm", "15 mm"],
    inside: [
      { label: "Hardwood veneer (top layer)", detail: "A real wood layer, typically 2–4 mm thick, in oak, teak, walnut or similar." },
      { label: "Plywood core (cross-laid)", detail: "Several layers of plywood with alternating grain that stop the plank warping." },
      { label: "Balancing veneer", detail: "A backing veneer that balances the top layer and keeps the plank flat." },
      { label: "UV-cured finish", detail: "A factory-applied lacquer or oil that protects the surface." },
    ],
    howMade:
      "A slice of real hardwood is glued on top of a cross-laminated plywood core, pressed, milled with tongue-and-groove edges, then finished in the factory.",
    glue: "Water-resistant urea / phenolic resins",
    weight: "Heavy",
    ratings: { waterResistance: 2, scratchResistance: 3, durability: 4, comfort: 5, easeOfInstall: 3, cost: 5 },
  },
  {
    id: "spc-vinyl",
    name: "SPC Vinyl Flooring",
    short: "100% waterproof rigid planks",
    standard: "Rigid-core vinyl (SPC)",
    art: "plank",
    tone: ["#bf8f60", "#7f5836"],
    layerColors: ["#e3d6c3", "#bf8f60", "#9aa1a7", "#5f656b"],
    layers: 4,
    description:
      "Rigid vinyl planks with a limestone-composite core — completely waterproof, thin and tough, with a convincing wood look.",
    advantages: [
      "100% waterproof — safe for bathrooms, kitchens and balconies",
      "Rigid core stays flat over minor subfloor imperfections",
      "Very tough wear layer resists scratches and stains",
      "Thin profile — fits under doors without trimming",
      "Quick click-lock installation",
    ],
    bestFor: ["Kitchens", "Bathrooms", "Balconies", "High-traffic & commercial spaces"],
    thickness: ["4 mm", "5 mm", "6 mm"],
    inside: [
      { label: "Clear wear layer", detail: "A thick, clear PVC layer that protects against scratches and stains." },
      { label: "Printed décor film", detail: "A high-resolution wood or stone pattern printed on PVC film." },
      { label: "SPC core", detail: "Stone Plastic Composite — limestone powder and PVC — rigid, dense and waterproof." },
      { label: "Underlay (IXPE)", detail: "A thin foam backing for comfort and sound reduction." },
    ],
    howMade:
      "Limestone powder and PVC are extruded into a rigid core sheet, then the printed film and wear layer are heat-laminated on top and the underlay attached.",
    glue: "Heat-laminated PVC (no wood or fibre)",
    weight: "Medium–heavy",
    ratings: { waterResistance: 5, scratchResistance: 5, durability: 5, comfort: 2, easeOfInstall: 5, cost: 3 },
  },
];

export const FLOORING_BRANDS: BoardBrand[] = [
  {
    id: "pergo",
    name: "Pergo",
    tier: "Luxury",
    tagline: "The original laminate flooring",
    about:
      "The inventor of laminate flooring, known for premium wood-look floors with excellent wear performance and realistic design detail.",
    whyWeUse: [
      "Premium wear performance and finish quality",
      "Realistic designs with convincing wood texture",
      "Trusted international brand with strong warranty",
    ],
    products: [
      { typeId: "laminate" },
      { typeId: "waterproof-laminate" },
      { typeId: "spc-vinyl" },
    ],
  },
  {
    id: "greenlam-flooring",
    name: "Greenlam Flooring",
    tier: "Standard",
    tagline: "Wide choice of designs and constructions",
    about:
      "From India's leading laminate house, offering a broad choice of laminate, engineered and vinyl flooring in many wood and stone looks.",
    whyWeUse: [
      "Broad range of designs and price points",
      "Good value with dependable durability",
      "Easy availability and service across India",
    ],
    products: [
      { typeId: "laminate" },
      { typeId: "waterproof-laminate" },
      { typeId: "engineered-wood" },
      { typeId: "spc-vinyl" },
    ],
  },
  {
    id: "action-tesa-flooring",
    name: "Action Tesa Flooring",
    tier: "Standard",
    tagline: "Practical flooring for every budget",
    about:
      "A well-known wood-panel maker with a flooring range focused on durable, easy-to-install laminate and engineered options.",
    whyWeUse: [
      "Strong value for whole-home flooring jobs",
      "Dependable thickness and click-lock fit",
      "Good range of popular wood-look designs",
    ],
    products: [
      { typeId: "laminate" },
      { typeId: "waterproof-laminate" },
      { typeId: "engineered-wood" },
    ],
  },
];

export const FLOORING_BRANDS_BY_NAME: Record<string, BoardBrand> = Object.fromEntries(
  FLOORING_BRANDS.map((b) => [b.name, b])
);
export const FLOORING_TYPES_BY_ID: Record<string, FullBoardType> = Object.fromEntries(
  FLOORING_TYPES.map((t) => [t.id, t])
);
