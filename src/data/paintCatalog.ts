/**
 * Paints & polish catalogue — same shape as the board catalogue so the same
 * catalogue modal renders it. To show a real product photo, set `image` on a
 * brand product (files go under /public/paints/...).
 *
 * NOTE: the per-brand range is a general summary — confirm it against each
 * brand's current catalogue before publishing.
 */
import type { BoardBrand, FullBoardType } from "./boardCatalog";

export const PAINT_RATING_ROWS = [
  { key: "durability", label: "Durability" },
  { key: "washability", label: "Washability" },
  { key: "weatherResistance", label: "Weather resistance" },
  { key: "sheen", label: "Sheen / depth" },
  { key: "lowOdour", label: "Low odour" },
  { key: "cost", label: "Price level" },
];

export const PAINT_TYPES: FullBoardType[] = [
  {
    id: "putty-primer",
    name: "Wall Putty & Primer",
    short: "The base of every paint job",
    standard: "Base coat",
    art: "paint",
    tone: ["#efece4", "#cfc9b9"],
    layerColors: ["#efece4", "#dcd6c6", "#a89f8c"],
    layers: 3,
    description:
      "Putty levels the wall and primer seals it — together they decide how smooth, even and long-lasting the final paint will be.",
    advantages: [
      "Fills hairline cracks and pores for a perfectly smooth surface",
      "Primer seals the wall so paint absorbs evenly",
      "Improves paint adhesion and coverage — saves topcoat",
      "Blocks alkali and dampness from lifting the paint",
    ],
    bestFor: ["New plastered walls", "Repainting old walls", "Ceilings", "Before PU or enamel on wood (use wood primer)"],
    thickness: ["1 kg", "5 kg", "20 kg", "40 kg"],
    inside: [
      { label: "Binder", detail: "White cement or acrylic polymer that makes the putty stick to the wall and set hard." },
      { label: "Fillers", detail: "Fine minerals (like calcium carbonate and talc) that fill pores and sand to a smooth finish." },
      { label: "Additives", detail: "Retarders and water-retention agents that give working time and prevent cracking." },
    ],
    howMade:
      "Binders, fine mineral fillers and additives are blended to a precise powder (or paste) that is mixed with water on site; primer is a thin acrylic or oil-based liquid that soaks into the putty.",
    glue: "White cement or acrylic polymer",
    weight: "Powder / paste",
    ratings: { durability: 4, washability: 2, weatherResistance: 2, sheen: 1, lowOdour: 4, cost: 2 },
  },
  {
    id: "interior-emulsion",
    name: "Interior Acrylic Emulsion",
    short: "Washable wall paint",
    standard: "Interior walls & ceilings",
    art: "paint",
    tone: ["#f1e3cc", "#d3b98f"],
    layerColors: ["#f1e3cc", "#e0cfae", "#bfae8c", "#efece4"],
    layers: 4,
    description:
      "Water-based acrylic paint for living spaces — available from soft matt to rich sheen, and in thousands of shades.",
    advantages: [
      "Water-based, low odour — easy to live with after painting",
      "Washable — marks wipe off without damaging the paint",
      "Smooth, even finish with excellent colour consistency",
      "Wide range from matt to silk-sheen",
      "Dries fast — rooms are ready in hours",
    ],
    bestFor: ["Living rooms", "Bedrooms", "Dining areas", "Office interiors"],
    thickness: ["1 L", "4 L", "10 L", "20 L"],
    inside: [
      { label: "Acrylic resin (binder)", detail: "Forms the tough, flexible film that holds the colour to the wall." },
      { label: "Pigments", detail: "Titanium dioxide for whiteness and coverage, plus colour pigments." },
      { label: "Extenders & additives", detail: "Minerals for body and smoothness, plus anti-fungal and levelling additives." },
      { label: "Water (carrier)", detail: "Evaporates as the paint dries, leaving a solid film." },
    ],
    howMade:
      "Pigments and fillers are dispersed in water, then the acrylic binder and additives are blended in and tinted to the chosen shade by machine.",
    glue: "Acrylic polymer",
    weight: "Liquid",
    ratings: { durability: 4, washability: 4, weatherResistance: 1, sheen: 3, lowOdour: 5, cost: 3 },
  },
  {
    id: "exterior-emulsion",
    name: "Exterior Weatherproof Emulsion",
    short: "Sun, rain and algae protection",
    standard: "Exterior walls",
    art: "paint",
    tone: ["#e6d2b4", "#bf9f72"],
    layerColors: ["#e6d2b4", "#d2b88e", "#a98d63", "#efece4"],
    layers: 4,
    description:
      "Tough elastomeric-style acrylic that flexes with the wall, sheds rain and resists fading, algae and fungus.",
    advantages: [
      "Weather-proof — resists rain, sun and temperature swings",
      "Fade-resistant colours that last for years",
      "Anti-algal and anti-fungal protection",
      "Flexible film bridges hairline cracks",
    ],
    bestFor: ["Exterior walls", "Boundary walls", "Balconies", "Parapets"],
    thickness: ["1 L", "4 L", "10 L", "20 L"],
    inside: [
      { label: "Weather-resistant acrylic binder", detail: "Cross-linking acrylic that stays flexible in heat and cold." },
      { label: "UV-stable pigments", detail: "Pigments chosen not to fade under strong sunlight." },
      { label: "Anti-algal agents", detail: "Biocides that stop algae and fungus growing on the film." },
      { label: "Water carrier", detail: "Evaporates on drying." },
    ],
    howMade:
      "Made like interior emulsion, but with a tougher binder system, UV-stable pigments and added biocides for outdoor exposure.",
    glue: "Weather-resistant acrylic polymer",
    weight: "Liquid",
    ratings: { durability: 5, washability: 3, weatherResistance: 5, sheen: 3, lowOdour: 4, cost: 4 },
  },
  {
    id: "enamel",
    name: "Synthetic Enamel",
    short: "Hard gloss paint for wood & metal",
    standard: "Wood & metal",
    art: "paint",
    tone: ["#b53a2d", "#7e2018"],
    layerColors: ["#b53a2d", "#9a2f24", "#e0d9c9", "#8c6a3f"],
    layers: 4,
    description:
      "A hard-wearing, high-gloss solvent-based paint for doors, grills and furniture that take daily knocks.",
    advantages: [
      "Hard, glossy, easy-to-clean surface",
      "Strong adhesion on wood and metal",
      "Resists scuffs and household chemicals",
      "Deep colour with a mirror-like gloss",
    ],
    bestFor: ["Doors & frames", "Metal grills & gates", "Painted wood furniture", "Railings"],
    thickness: ["200 ml", "500 ml", "1 L", "4 L", "20 L"],
    inside: [
      { label: "Alkyd resin", detail: "Oil-modified resin that dries to a hard, glossy film." },
      { label: "Pigments", detail: "Colour and opacity." },
      { label: "Solvent (thinner)", detail: "Mineral turpentine that keeps the paint workable, then evaporates." },
      { label: "Driers", detail: "Metal soaps that help the oil resin harden." },
    ],
    howMade:
      "Alkyd resin and pigments are ground together, then thinned with solvent and driers to a brushable consistency.",
    glue: "Alkyd resin",
    weight: "Liquid",
    ratings: { durability: 4, washability: 5, weatherResistance: 3, sheen: 5, lowOdour: 1, cost: 3 },
  },
  {
    id: "pu-finish",
    name: "PU Wood Finish",
    short: "Tough polyurethane polish",
    standard: "Wood finishing",
    art: "finish",
    tone: ["#c98f5a", "#7d4a22"],
    layerColors: ["#e9d7b8", "#cf9d66", "#a8743f", "#8a5a30"],
    layers: 4,
    description:
      "The premium choice for wood: a hard, clear polyurethane film that protects the grain while giving a glass-like or soft-matt finish.",
    advantages: [
      "Very hard film — resists scratches, heat and water rings",
      "Clear, deep finish that shows off the wood grain",
      "Available in gloss, semi-gloss and matt",
      "Resistant to common household chemicals",
      "Long-lasting — does not yellow quickly (aliphatic grades)",
    ],
    bestFor: ["Wooden doors", "Dining tables", "Wardrobe & kitchen shutters", "Staircase railings"],
    thickness: ["1 L", "4 L", "20 L"],
    inside: [
      { label: "Top coat (PU lacquer)", detail: "Two-pack polyurethane — resin plus hardener — that cures into a very tough film." },
      { label: "Sealer coat", detail: "Seals the wood pores so the topcoat sits on top, not in the wood." },
      { label: "Stain / toner (optional)", detail: "Adds colour while keeping the grain visible." },
      { label: "Bare wood", detail: "Sanded timber or veneered board underneath." },
    ],
    howMade:
      "A polyol resin and an isocyanate hardener are supplied separately and mixed just before spraying; they react to form a cross-linked polyurethane film.",
    glue: "Two-pack polyurethane (resin + hardener)",
    weight: "Liquid (2-pack)",
    ratings: { durability: 5, washability: 5, weatherResistance: 3, sheen: 5, lowOdour: 2, cost: 5 },
  },
  {
    id: "melamine-polish",
    name: "Melamine Polish",
    short: "Clear glossy wood lacquer",
    standard: "Wood finishing",
    art: "finish",
    tone: ["#cf9d66", "#8a5a30"],
    layerColors: ["#ecdcbd", "#d3a56d", "#b27c47", "#8a5a30"],
    layers: 4,
    description:
      "A fast-drying, glossy clear polish that builds a smooth hard coat on furniture — popular and economical.",
    advantages: [
      "Dries quickly so work moves along fast",
      "Hard, glossy finish at a moderate price",
      "Resists everyday scratches and mild heat",
      "Easy to apply by spray or brush and to recoat",
    ],
    bestFor: ["Furniture", "Doors & window frames", "Panelling", "Cabinet interiors"],
    thickness: ["1 L", "4 L", "20 L"],
    inside: [
      { label: "Melamine-modified resin", detail: "Resin that hardens to a clear, glossy film." },
      { label: "Solvents", detail: "Thin the polish for spraying, then evaporate as it dries." },
      { label: "Sealer undercoat", detail: "Fills the wood pores before the clear topcoat." },
    ],
    howMade:
      "Melamine and alkyd resins are dissolved in solvents with plasticisers and flow additives to give a smooth, fast-drying clear coat.",
    glue: "Melamine-alkyd resin",
    weight: "Liquid",
    ratings: { durability: 3, washability: 3, weatherResistance: 2, sheen: 4, lowOdour: 2, cost: 3 },
  },
  {
    id: "nc-lacquer",
    name: "NC Lacquer",
    short: "Classic nitrocellulose polish",
    standard: "Wood finishing",
    art: "finish",
    tone: ["#d4a876", "#94683a"],
    layerColors: ["#efe1c6", "#d9b07c", "#b9854f", "#94683a"],
    layers: 4,
    description:
      "A classic, quick-drying wood lacquer valued for its soft, natural look and easy repair.",
    advantages: [
      "Very fast drying — multiple coats in a day",
      "Warm, natural look that keeps the wood feeling real",
      "Easy to spot-repair and re-polish",
      "Economical for large furniture jobs",
    ],
    bestFor: ["Interior furniture", "Panelling", "Decorative woodwork", "Restoration"],
    thickness: ["1 L", "4 L", "20 L"],
    inside: [
      { label: "Nitrocellulose", detail: "Cellulose nitrate that forms a clear, quick-drying film." },
      { label: "Resins & plasticisers", detail: "Improve flexibility and adhesion." },
      { label: "Solvents", detail: "Strong fast-evaporating solvents that carry the lacquer." },
    ],
    howMade:
      "Nitrocellulose is dissolved in solvents with resins and plasticisers; each coat partially dissolves the last, blending into a single film.",
    glue: "Nitrocellulose",
    weight: "Liquid",
    ratings: { durability: 2, washability: 2, weatherResistance: 1, sheen: 4, lowOdour: 1, cost: 2 },
  },
  {
    id: "wood-stain",
    name: "Wood Stain",
    short: "Colour that lets the grain show",
    standard: "Wood colouring",
    art: "finish",
    tone: ["#a96b34", "#5e3513"],
    layerColors: ["#dcc39a", "#a96b34", "#7e4d22", "#5e3513"],
    layers: 4,
    description:
      "Penetrating colour that tints the wood without hiding the grain — applied before a clear PU, melamine or NC topcoat.",
    advantages: [
      "Shows off natural wood grain and character",
      "Soaks in, so it will not peel or flake like a paint",
      "Wide range of wood-tones from honey to ebony",
      "Evens out colour differences between boards",
    ],
    bestFor: ["Colour-matching veneers", "Staircases & railings", "Wooden doors", "Dining furniture"],
    thickness: ["200 ml", "1 L", "4 L"],
    inside: [
      { label: "Dyes / pigments", detail: "Colour that soaks into the wood fibres." },
      { label: "Solvent carrier", detail: "Takes the colour deep into the grain, then evaporates." },
      { label: "Binder (light)", detail: "A small amount of resin to fix the colour in place." },
    ],
    howMade:
      "Soluble dyes and fine pigments are dissolved in a solvent or water carrier with a trace of binder, giving a thin, penetrating liquid.",
    glue: "Light resin binder",
    weight: "Liquid",
    ratings: { durability: 3, washability: 2, weatherResistance: 2, sheen: 2, lowOdour: 2, cost: 2 },
  },
];

export const PAINT_BRANDS: BoardBrand[] = [
  {
    id: "asian-paints",
    name: "Asian Paints",
    tier: "Standard",
    tagline: "India's most trusted paint brand",
    about:
      "India's largest paint company, with a vast shade library, strong colour consultancy and a full range from wall paints to wood finishes.",
    whyWeUse: [
      "Huge shade range with accurate machine tinting",
      "Consistent quality from batch to batch",
      "Complete system — putty, primer, paint and wood finishes",
    ],
    products: [
      { typeId: "putty-primer" },
      { typeId: "interior-emulsion" },
      { typeId: "exterior-emulsion" },
      { typeId: "enamel" },
      { typeId: "pu-finish" },
      { typeId: "melamine-polish" },
      { typeId: "wood-stain" },
    ],
  },
  {
    id: "berger",
    name: "Berger",
    tier: "Standard",
    tagline: "Over 300 years of paint heritage",
    about:
      "A long-established paint maker with strong decorative and protective coatings, widely trusted across homes and commercial projects.",
    whyWeUse: [
      "Durable finishes that hold up to everyday use",
      "Good range in enamels and exterior coatings",
      "Reliable, well-supported dealer network",
    ],
    products: [
      { typeId: "putty-primer" },
      { typeId: "interior-emulsion" },
      { typeId: "exterior-emulsion" },
      { typeId: "enamel" },
      { typeId: "pu-finish" },
      { typeId: "wood-stain" },
    ],
  },
  {
    id: "mrf-wood-finishes",
    name: "MRF Wood Finishes",
    tier: "Standard",
    tagline: "Specialist coatings for wood",
    about:
      "A wood-finishing specialist offering PU, melamine and NC finishes, sealers and stains — the choice for polished furniture and joinery.",
    whyWeUse: [
      "Specialist range built for wood — not a side line",
      "Clear, deep finishes that show off the grain",
      "Matching sealers, stains and top coats from one system",
    ],
    products: [
      { typeId: "pu-finish" },
      { typeId: "melamine-polish" },
      { typeId: "nc-lacquer" },
      { typeId: "wood-stain" },
    ],
  },
];

export const PAINT_BRANDS_BY_NAME: Record<string, BoardBrand> = Object.fromEntries(
  PAINT_BRANDS.map((b) => [b.name, b])
);
export const PAINT_TYPES_BY_ID: Record<string, FullBoardType> = Object.fromEntries(
  PAINT_TYPES.map((t) => [t.id, t])
);
