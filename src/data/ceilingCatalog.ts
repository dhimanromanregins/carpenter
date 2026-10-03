/**
 * Gypsum & false-ceiling catalogue — same shape as the board catalogue so the
 * same catalogue modal renders it. To show a real product photo, set `image`
 * on a brand product (files go under /public/ceiling/...).
 *
 * NOTE: the per-brand range is a general summary — confirm it against each
 * brand's current catalogue before publishing.
 */
import type { BoardBrand, FullBoardType } from "./boardCatalog";

export const CEILING_RATING_ROWS = [
  { key: "moistureResistance", label: "Moisture resistance" },
  { key: "fireResistance", label: "Fire resistance" },
  { key: "soundAbsorption", label: "Sound absorption" },
  { key: "impactStrength", label: "Impact strength" },
  { key: "finishQuality", label: "Smooth finish" },
  { key: "cost", label: "Price level" },
];

export const CEILING_TYPES: FullBoardType[] = [
  {
    id: "gypsum-regular",
    name: "Regular Gypsum Board",
    short: "Standard plasterboard",
    standard: "IS 2095 · Plain",
    art: "gypsum",
    tone: ["#f3efe6", "#cfc8b8"],
    layers: 3,
    description:
      "The everyday plasterboard for false ceilings and partitions in dry rooms — smooth, light and quick to install.",
    advantages: [
      "Perfectly smooth, seamless finish once jointed and painted",
      "Lightweight — low load on the slab",
      "Fast, clean dry installation with minimal curing time",
      "Easy to cut for coves, curves and recessed lighting",
      "Most economical gypsum option",
    ],
    bestFor: ["Bedrooms", "Living rooms", "Offices", "Cove & peripheral ceilings"],
    thickness: ["9.5 mm", "12.5 mm", "15 mm"],
    inside: [
      { label: "Face paper", detail: "Strong, smooth ivory paper — the surface that takes joint compound and paint." },
      { label: "Gypsum core", detail: "Set gypsum (calcium sulphate dihydrate) mixed with a little starch and fibre; it holds chemically-bound water, which is why it resists fire." },
      { label: "Back paper", detail: "Brown liner paper that wraps the edges and gives the board its tensile strength." },
    ],
    howMade:
      "A wet gypsum slurry is spread between two sheets of paper on a continuous line, sets hard within minutes, is cut to length and dried in a kiln.",
    glue: "Gypsum crystals bonded to paper (no added resin)",
    weight: "Light",
    ratings: { moistureResistance: 1, fireResistance: 3, soundAbsorption: 2, impactStrength: 2, finishQuality: 5, cost: 1 },
  },
  {
    id: "gypsum-mr",
    name: "Moisture-Resistant Gypsum Board",
    short: "Green board for humid areas",
    standard: "IS 2095 · Moisture resistant",
    art: "gypsum",
    tone: ["#d9e5d2", "#aebfa4"],
    layers: 3,
    description:
      "Plasterboard with a water-repellent core and treated paper — made for bathrooms, kitchens and humid coastal climates.",
    advantages: [
      "Water-repellent core slows moisture absorption",
      "Treated paper resists swelling and sagging in humidity",
      "Suitable for bathroom and kitchen ceilings",
      "Same smooth finish and easy installation as regular board",
    ],
    bestFor: ["Bathrooms", "Kitchens", "Utility areas", "Balcony ceilings (covered)"],
    thickness: ["9.5 mm", "12.5 mm"],
    inside: [
      { label: "Water-repellent face paper", detail: "Treated paper (usually green) that sheds moisture." },
      { label: "Hydrophobic gypsum core", detail: "Gypsum with silicone or wax additives that reduce water uptake." },
      { label: "Treated back paper", detail: "Back liner treated the same way so the whole board resists humidity." },
    ],
    howMade:
      "Made like regular plasterboard, but the slurry includes water-repellent additives and the paper is treated for moisture resistance.",
    glue: "Gypsum crystals + water-repellent additives",
    weight: "Light–medium",
    ratings: { moistureResistance: 4, fireResistance: 3, soundAbsorption: 2, impactStrength: 2, finishQuality: 5, cost: 2 },
  },
  {
    id: "gypsum-fr",
    name: "Fire-Resistant Gypsum Board",
    short: "Fire-rated (Type X) board",
    standard: "IS 2095 · Fire resistant",
    art: "gypsum",
    tone: ["#f0d7d2", "#cba39b"],
    layers: 3,
    description:
      "Plasterboard with a glass-fibre-reinforced core that stays intact in fire, giving crucial extra minutes of protection.",
    advantages: [
      "Core holds together under heat — slower fire spread",
      "Helps meet fire-rating requirements in commercial buildings",
      "Water in the gypsum core delays temperature rise on the far side",
      "Also stiffer, with better impact strength than regular board",
    ],
    bestFor: ["Offices & hotels", "Corridors & stair lobbies", "Plant rooms", "Kitchens"],
    thickness: ["12.5 mm", "15 mm"],
    inside: [
      { label: "Face paper", detail: "Pink or red paper that marks the board as fire-rated." },
      { label: "Reinforced gypsum core", detail: "Gypsum with glass fibres and vermiculite that stop the core from cracking and falling away in fire." },
      { label: "Back paper", detail: "Strong liner paper." },
    ],
    howMade:
      "Glass fibres and special additives are blended into the gypsum slurry, so the core keeps its shape when heated.",
    glue: "Gypsum crystals + glass fibre reinforcement",
    weight: "Medium",
    ratings: { moistureResistance: 2, fireResistance: 5, soundAbsorption: 3, impactStrength: 3, finishQuality: 5, cost: 3 },
  },
  {
    id: "gypsum-acoustic",
    name: "Acoustic Perforated Gypsum Board",
    short: "Sound-absorbing ceiling board",
    standard: "EN 14190 class",
    art: "perforated",
    tone: ["#f3efe6", "#9d9585"],
    layers: 3,
    description:
      "Decorative boards with a pattern of holes backed by an acoustic fleece — they soak up echo while keeping a clean, seamless look.",
    advantages: [
      "Reduces echo and reverberation in large rooms",
      "Pattern of round, square or slotted perforations is a design feature",
      "Seamless look once jointed, no visible tile grid",
      "Same fire performance as the base gypsum board",
    ],
    bestFor: ["Home theatres", "Conference rooms", "Restaurants", "Large living halls"],
    thickness: ["12.5 mm"],
    inside: [
      { label: "Perforated face", detail: "Gypsum face with machined holes in a regular pattern." },
      { label: "Gypsum core", detail: "Standard gypsum board core." },
      { label: "Acoustic fleece (back)", detail: "A non-woven fabric laminated to the back that lets sound in while hiding the void." },
    ],
    howMade:
      "Standard gypsum board is machine-perforated to a set hole pattern and an acoustic fleece is bonded to the back.",
    glue: "Gypsum core + acoustic fleece (bonded)",
    weight: "Medium",
    ratings: { moistureResistance: 1, fireResistance: 3, soundAbsorption: 5, impactStrength: 2, finishQuality: 4, cost: 4 },
  },
  {
    id: "gypsum-tile",
    name: "Gypsum Ceiling Tiles",
    short: "Lay-in grid ceiling tiles",
    standard: "Lay-in 595 × 595 mm",
    art: "tile",
    tone: ["#f6f3ec", "#d7d0c0"],
    layers: 3,
    description:
      "Ready-finished tiles that drop into a metal grid — the fastest way to build a false ceiling with easy access to services above.",
    advantages: [
      "Pre-finished surface — no painting or jointing needed",
      "Lift-out tiles give easy access to wiring and ducts",
      "Quick, low-mess installation",
      "Individual tiles can be replaced if damaged",
    ],
    bestFor: ["Offices", "Shops & showrooms", "Clinics", "Basements & service areas"],
    thickness: ["9 mm", "12 mm"],
    inside: [
      { label: "Decorative vinyl or paper face", detail: "A factory-applied finish, often with an embossed pattern." },
      { label: "Gypsum core", detail: "Dense gypsum slab that gives the tile weight and stability." },
      { label: "Foil or paper back", detail: "Backing that adds rigidity and keeps the tile flat." },
    ],
    howMade:
      "Gypsum boards are cut to modular size, laminated with a decorative face and the edges finished to sit on a T-grid.",
    glue: "Gypsum core + adhesive-bonded vinyl face",
    weight: "Light–medium",
    ratings: { moistureResistance: 2, fireResistance: 3, soundAbsorption: 3, impactStrength: 2, finishQuality: 4, cost: 2 },
  },
  {
    id: "cement-board",
    name: "Fibre-Cement Board",
    short: "Water-proof cement sheet",
    standard: "IS 14862",
    art: "cement",
    tone: ["#cfcfcb", "#a3a39d"],
    layers: 1,
    description:
      "A rigid cement-and-cellulose sheet that shrugs off water — used where plasterboard would fail, such as wet areas and covered exteriors.",
    advantages: [
      "Fully water-resistant — will not swell or rot",
      "Excellent fire performance — non-combustible",
      "Strong and impact-resistant",
      "Good base for paint, tiles and textured finishes",
    ],
    bestFor: ["Bathroom ceilings", "Covered balconies", "Soffits", "Utility & wet rooms"],
    thickness: ["6 mm", "8 mm", "10 mm", "12 mm"],
    inside: [
      { label: "Cement matrix", detail: "Portland cement and fine sand — gives hardness and water-proof strength." },
      { label: "Cellulose fibres", detail: "Wood-pulp fibres run through the sheet to stop it cracking." },
      { label: "Autoclave-cured core", detail: "Steam-cured under pressure, which makes the board dimensionally stable." },
    ],
    howMade:
      "A cement, silica and cellulose-fibre slurry is formed into thin layers, pressed into a sheet and cured in a high-pressure steam autoclave.",
    glue: "Cement hydration (no added resin)",
    weight: "Heavy",
    ratings: { moistureResistance: 5, fireResistance: 5, soundAbsorption: 2, impactStrength: 5, finishQuality: 3, cost: 4 },
  },
  {
    id: "gi-framing",
    name: "GI Ceiling Framing",
    short: "Galvanised steel channels",
    standard: "Zinc-coated GI sections",
    art: "channel",
    tone: ["#d7dde2", "#8c959d"],
    layers: 1,
    description:
      "The hidden skeleton of every false ceiling — galvanised steel channels hung from the slab that the boards are screwed to.",
    advantages: [
      "Zinc coating protects against rust and corrosion",
      "Straight, true and dimensionally accurate",
      "Does not warp, swell or get eaten by termites like timber",
      "Non-combustible and long lasting",
    ],
    bestFor: ["All gypsum false ceilings", "Partitions", "Bulkheads & coves", "Large-span ceilings"],
    thickness: ["0.5 mm", "0.55 mm"],
    inside: [
      { label: "Zinc coating", detail: "A thin sacrificial zinc layer on both faces that corrodes first, protecting the steel." },
      { label: "Steel strip", detail: "Cold-formed mild-steel sheet roll-formed into a channel profile." },
      { label: "Rolled stiffening ribs", detail: "Ribs and flanges formed into the profile to add stiffness without extra weight." },
    ],
    howMade:
      "Galvanised steel coil is slit and roll-formed into C- and U-shaped channels, then cut to length and punched for fixings.",
    glue: "Not applicable (mechanical fixing with screws)",
    weight: "Light",
    ratings: { moistureResistance: 4, fireResistance: 5, soundAbsorption: 1, impactStrength: 4, finishQuality: 2, cost: 3 },
  },
];

export const CEILING_BRANDS: BoardBrand[] = [
  {
    id: "saint-gobain-gyproc",
    name: "Saint-Gobain Gyproc",
    tier: "Luxury",
    tagline: "India's leading gypsum and false-ceiling systems",
    about:
      "A global building-materials name and one of India's biggest drywall brands, offering a complete system of boards, framing and finishing compounds.",
    whyWeUse: [
      "Complete tested system — boards, steel framing and jointing from one maker",
      "Consistent quality for a flawless, crack-free finish",
      "Wide range, including fire-rated and acoustic boards",
    ],
    products: [
      { typeId: "gypsum-regular" },
      { typeId: "gypsum-mr" },
      { typeId: "gypsum-fr" },
      { typeId: "gypsum-acoustic" },
      { typeId: "gypsum-tile" },
      { typeId: "cement-board" },
      { typeId: "gi-framing" },
    ],
  },
  {
    id: "usg-boral",
    name: "USG Boral",
    tier: "Standard",
    tagline: "Gypsum boards and ceiling systems",
    about:
      "A well-known drywall and ceiling manufacturer with a strong focus on commercial and residential interiors.",
    whyWeUse: [
      "Reliable board quality and straight edges",
      "Good range from regular to fire-rated boards",
      "Dependable performance on large ceiling jobs",
    ],
    products: [
      { typeId: "gypsum-regular" },
      { typeId: "gypsum-mr" },
      { typeId: "gypsum-fr" },
      { typeId: "gypsum-acoustic" },
      { typeId: "gypsum-tile" },
      { typeId: "gi-framing" },
    ],
  },
  {
    id: "india-gypsum",
    name: "India Gypsum",
    tier: "Standard",
    tagline: "Gypsum products for everyday interiors",
    about:
      "An established Indian gypsum manufacturer supplying boards and tiles for homes and offices.",
    whyWeUse: [
      "Good value for everyday residential ceilings",
      "Smooth, paint-ready board surface",
      "Easy availability and quick delivery",
    ],
    products: [
      { typeId: "gypsum-regular" },
      { typeId: "gypsum-mr" },
      { typeId: "gypsum-fr" },
      { typeId: "gypsum-tile" },
    ],
  },
];

export const CEILING_BRANDS_BY_NAME: Record<string, BoardBrand> = Object.fromEntries(
  CEILING_BRANDS.map((b) => [b.name, b])
);
export const CEILING_TYPES_BY_ID: Record<string, FullBoardType> = Object.fromEntries(
  CEILING_TYPES.map((t) => [t.id, t])
);
