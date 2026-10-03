/**
 * Board & plywood catalogue.
 *
 * Board *types* hold the technical facts and advantages (shared by every brand);
 * each brand lists which types it offers. To show a real product photo, set
 * `image` on a brand's product entry (put the file under /public/boards/...).
 * Until then the catalogue renders a generated illustration of the board type.
 *
 * NOTE: the per-brand range below is a general summary — confirm it against each
 * brand's current catalogue before publishing.
 */

export type BoardArtKind =
  | "plywood"
  | "blockboard"
  | "mdf"
  | "hdhmr"
  | "particle"
  | "door"
  | "gypsum"
  | "perforated"
  | "tile"
  | "channel"
  | "cement"
  | "paint"
  | "finish"
  | "plank";

export interface BoardType {
  id: string;
  name: string;
  short: string;
  standard: string;
  art: BoardArtKind;
  /** Face tone, light → dark, used by the generated illustration. */
  tone: [string, string];
  layers: number;
  /** Optional edge-section layer colours, top to bottom (paint / finish / plank art). */
  layerColors?: string[];
  description: string;
  advantages: string[];
  bestFor: string[];
  thickness: string[];
}

export interface BoardLayer {
  label: string;
  detail: string;
}

/** 1 (low) - 5 (high). For `cost`, 5 = most expensive. */
export interface BoardRatings {
  waterResistance: number;
  strength: number;
  screwHolding: number;
  smoothFinish: number;
  termiteProtection: number;
  fireResistance: number;
  cost: number;
}

export interface BoardTypeDetail {
  /** What is physically inside the board, face to core to face. */
  inside: BoardLayer[];
  howMade: string;
  glue: string;
  weight: string;
  ratings: Record<string, number>;
}

export interface BrandProduct {
  typeId: string;
  /** Optional marketing name of the product line, e.g. "Club Prime". */
  productName?: string;
  /** Optional real photo (e.g. "/boards/century-ply/bwp.jpg"). */
  image?: string;
}

export interface BoardBrand {
  id: string;
  name: string;
  tier: "Luxury" | "Standard";
  tagline: string;
  about: string;
  whyWeUse: string[];
  products: BrandProduct[];
}

const BASE_TYPES: BoardType[] = [
  {
    id: "bwp",
    name: "BWP Marine Plywood",
    short: "Boiling Water Proof",
    standard: "IS 710 · Marine grade",
    art: "plywood",
    tone: ["#c98f5a", "#8a5a30"],
    layers: 9,
    description:
      "The highest grade of plywood. Phenolic-bonded layers survive prolonged contact with water, which makes it the safe choice for wet zones.",
    advantages: [
      "Boiling-water-proof glue line — no delamination in wet areas",
      "Treated against termites and borers",
      "Highest strength and screw-holding of all plywood",
      "Stays flat; resists warping and swelling",
      "Long service life — built to outlast the home's renovation cycle",
    ],
    bestFor: ["Kitchen carcass", "Bathroom vanities", "Sink units", "Balcony & exterior-facing joinery"],
    thickness: ["6 mm", "9 mm", "12 mm", "16 mm", "19 mm", "25 mm"],
  },
  {
    id: "bwr",
    name: "BWR Plywood",
    short: "Boiling Water Resistant",
    standard: "IS 303 · BWR grade",
    art: "plywood",
    tone: ["#d3a06a", "#9a6a3c"],
    layers: 7,
    description:
      "A dependable all-rounder with strong water resistance — the sweet spot between performance and price for most interiors.",
    advantages: [
      "Resists humidity and occasional water exposure",
      "Termite and borer treated",
      "Strong, stable and holds screws and hinges well",
      "Takes laminate, veneer and paint cleanly",
    ],
    bestFor: ["Wardrobes", "Kitchen shutters", "Wall panelling", "Storage units"],
    thickness: ["6 mm", "9 mm", "12 mm", "16 mm", "19 mm"],
  },
  {
    id: "mr",
    name: "MR Plywood",
    short: "Moisture Resistant",
    standard: "IS 303 · MR grade",
    art: "plywood",
    tone: ["#deb27e", "#a97a4a"],
    layers: 5,
    description:
      "Economical, good-looking plywood for dry interior spaces where water contact isn't a concern.",
    advantages: [
      "Cost-effective for large dry-area jobs",
      "Smooth, uniform face for laminates and veneers",
      "Light and easy to work with on site",
      "Good dimensional stability in normal indoor humidity",
    ],
    bestFor: ["Bedroom wardrobes", "TV units", "False-ceiling framing", "Study tables"],
    thickness: ["6 mm", "9 mm", "12 mm", "16 mm", "19 mm"],
  },
  {
    id: "blockboard",
    name: "Block Board",
    short: "Solid wood-strip core",
    standard: "IS 1659",
    art: "blockboard",
    tone: ["#d8aa72", "#a4743f"],
    layers: 3,
    description:
      "A core of solid softwood strips sandwiched between veneers — rigid, flat and excellent over long spans.",
    advantages: [
      "Very rigid — resists sagging on long shelves",
      "Superb screw and nail holding",
      "Flat, smooth face with minimal telegraphing",
      "Lighter than solid wood for the same stiffness",
    ],
    bestFor: ["Long shelves", "Table tops", "Doors & partitions", "Beds & platforms"],
    thickness: ["12 mm", "16 mm", "19 mm", "25 mm"],
  },
  {
    id: "mdf",
    name: "MDF",
    short: "Medium Density Fibreboard",
    standard: "IS 12406",
    art: "mdf",
    tone: ["#c9ab82", "#a58660"],
    layers: 1,
    description:
      "A dense, uniform fibreboard with no grain — the best base for painted finishes, routed profiles and CNC cut designs.",
    advantages: [
      "Perfectly smooth face for paint, PU and lacquer finishes",
      "Machines cleanly — jali, fluting and moulded profiles",
      "No knots, voids or grain direction",
      "Consistent thickness and density",
    ],
    bestFor: ["Painted panels", "Fluted & CNC wall design", "Decorative mouldings", "Dry-area cabinetry"],
    thickness: ["6 mm", "9 mm", "12 mm", "18 mm"],
  },
  {
    id: "hdhmr",
    name: "HDHMR Board",
    short: "High Density High Moisture Resistant",
    standard: "IS 14587 class",
    art: "hdhmr",
    tone: ["#bf9c70", "#8f6e46"],
    layers: 1,
    description:
      "A very dense, moisture-resistant engineered board — a strong modern alternative to plywood for laminate-finished furniture.",
    advantages: [
      "High density — excellent screw-holding",
      "Moisture-resistant core that doesn't swell in humid kitchens",
      "Void-free, uniform and smooth for laminates",
      "Works well with CNC and routed profiles",
    ],
    bestFor: ["Modular kitchens", "Wardrobes", "TV panels", "Bathroom storage"],
    thickness: ["8 mm", "12 mm", "16 mm", "18 mm"],
  },
  {
    id: "flush-door",
    name: "Flush Doors",
    short: "Ready-to-finish door shutters",
    standard: "IS 2202",
    art: "door",
    tone: ["#cf9d66", "#94653a"],
    layers: 3,
    description:
      "Solid-core flush shutters with a rigid frame — a flat, clean base for laminate, veneer or paint.",
    advantages: [
      "Flat, warp-resistant solid core",
      "Termite-treated frame",
      "Clean, smooth face for any finish",
      "Good sound and impact performance",
    ],
    bestFor: ["Bedroom doors", "Bathroom doors", "Utility & store rooms"],
    thickness: ["30 mm", "35 mm", "40 mm"],
  },
  {
    id: "fr-ply",
    name: "Fire-Retardant Plywood",
    short: "FR treated plywood",
    standard: "IS 5509",
    art: "plywood",
    tone: ["#b98a62", "#7d5230"],
    layers: 9,
    description:
      "Plywood treated with fire-retardant chemicals so it slows the spread of flame - specified for commercial spaces and safety-conscious homes.",
    advantages: [
      "Slows flame spread and reduces smoke build-up",
      "Retains plywood strength and screw-holding",
      "Meets fire-safety requirements for offices, hotels and clinics",
      "Termite and borer treated as standard",
    ],
    bestFor: ["Commercial interiors", "Hotels & restaurants", "Panelling near kitchens", "Modular office furniture"],
    thickness: ["9 mm", "12 mm", "16 mm", "19 mm"],
  },
  {
    id: "prelam",
    name: "Pre-Laminated Board",
    short: "Factory-laminated MDF / particle board",
    standard: "IS 12823",
    art: "particle",
    tone: ["#e1dccf", "#bdb6a4"],
    layers: 1,
    description:
      "MDF or particle board with a decorative laminate already bonded to both faces at the factory - quick to install with a consistent finish.",
    advantages: [
      "Finished surface straight from the factory - no on-site laminating",
      "Uniform colour and pattern across every sheet",
      "Scratch and stain resistant melamine surface",
      "Faster installation and lower labour cost",
    ],
    bestFor: ["Office workstations", "Wardrobe interiors", "Shelving", "Budget modular furniture"],
    thickness: ["8 mm", "12 mm", "16 mm", "18 mm"],
  },
  {
    id: "particle",
    name: "Particle Board",
    short: "Engineered wood-chip board",
    standard: "IS 3087",
    art: "particle",
    tone: ["#d9bd96", "#b89868"],
    layers: 1,
    description:
      "Budget-friendly engineered board, ideal as a base for pre-laminated finishes in dry rooms.",
    advantages: [
      "Most economical option for dry-area furniture",
      "Flat, uniform and consistent",
      "Available pre-laminated for quick installs",
    ],
    bestFor: ["Office furniture", "Study units", "Dry-room storage"],
    thickness: ["12 mm", "16 mm", "18 mm"],
  },
];


const DETAILS: Record<string, BoardTypeDetail> = {
  bwp: {
    inside: [
      { label: "Face veneer", detail: "Selected hardwood veneer, smooth-peeled and sanded for laminating." },
      { label: "Core veneers (7 plies)", detail: "Thin hardwood veneers stacked with alternating grain direction so the board resists bending and splitting." },
      { label: "Phenolic glue lines", detail: "Phenol-formaldehyde resin between every ply - cured under heat, it does not soften in boiling water." },
      { label: "Back veneer", detail: "Matching veneer on the reverse keeps the sheet balanced and flat." },
    ],
    howMade: "Logs are peeled into thin veneers, dried, treated against termites and borers, coated with phenolic resin and pressed hot at high pressure into a single dense sheet.",
    glue: "Phenol-formaldehyde (PF)",
    weight: "Heavy",
    ratings: { waterResistance: 5, strength: 5, screwHolding: 5, smoothFinish: 4, termiteProtection: 5, fireResistance: 2, cost: 5 },
  },
  bwr: {
    inside: [
      { label: "Face veneer", detail: "Hardwood face veneer suitable for laminate or veneer finishing." },
      { label: "Core veneers (5-7 plies)", detail: "Cross-laminated hardwood or mixed-wood veneers for balanced strength." },
      { label: "Water-resistant glue lines", detail: "Phenolic-based resin that withstands humidity and short boiling-water exposure." },
      { label: "Back veneer", detail: "Balancing veneer on the reverse." },
    ],
    howMade: "Same peel-dry-press process as marine plywood, with a slightly lighter resin load and veneer grade - a strong board at a gentler price.",
    glue: "Water-resistant phenolic resin",
    weight: "Medium-heavy",
    ratings: { waterResistance: 4, strength: 4, screwHolding: 4, smoothFinish: 4, termiteProtection: 4, fireResistance: 2, cost: 4 },
  },
  mr: {
    inside: [
      { label: "Face veneer", detail: "Smooth hardwood or softwood face veneer." },
      { label: "Core veneers (3-5 plies)", detail: "Cross-laid veneers, typically softer woods - lighter and easier to cut." },
      { label: "Urea-formaldehyde glue", detail: "Bonds well in dry, normal-humidity rooms but is not designed for water contact." },
      { label: "Back veneer", detail: "Balancing veneer on the reverse." },
    ],
    howMade: "Veneers are peeled, dried, glued with urea-formaldehyde resin and pressed. The glue resists humidity but not standing water.",
    glue: "Urea-formaldehyde (UF)",
    weight: "Medium",
    ratings: { waterResistance: 2, strength: 3, screwHolding: 3, smoothFinish: 4, termiteProtection: 3, fireResistance: 2, cost: 2 },
  },
  blockboard: {
    inside: [
      { label: "Face veneer", detail: "Thin veneer on each outer face - the surface you laminate or polish." },
      { label: "Cross-band veneer", detail: "A second veneer laid across the grain to lock the core in place." },
      { label: "Core of solid wood strips", detail: "Softwood strips (typically 20-25 mm wide) glued edge to edge. This is what gives the board its rigidity." },
      { label: "Cross-band + back veneer", detail: "Mirror layers on the other side keep the board flat." },
    ],
    howMade: "Softwood strips are glued edge to edge to form the core, then sandwiched between cross-band and face veneers and pressed flat.",
    glue: "UF or MR-grade resin",
    weight: "Light-medium",
    ratings: { waterResistance: 2, strength: 4, screwHolding: 4, smoothFinish: 3, termiteProtection: 3, fireResistance: 2, cost: 3 },
  },
  mdf: {
    inside: [
      { label: "Dense fibre surface", detail: "Fine, sanded wood fibres on both faces - the smooth skin that takes paint and CNC cutting." },
      { label: "Fibre core", detail: "Wood chips are broken down into fibres, mixed with resin and wax, and compressed into a uniform, grain-free core." },
      { label: "Resin binder", detail: "Urea-formaldehyde resin (or low-emission E1/E0 variants) holds the fibres together." },
    ],
    howMade: "Wood is steamed and refined into fine fibres, blended with resin and wax, formed into a mat and hot-pressed to a consistent density.",
    glue: "Urea-formaldehyde (E1 / low-emission)",
    weight: "Heavy",
    ratings: { waterResistance: 1, strength: 3, screwHolding: 2, smoothFinish: 5, termiteProtection: 2, fireResistance: 2, cost: 2 },
  },
  hdhmr: {
    inside: [
      { label: "Dense fibre surface", detail: "Extra-smooth, compacted faces ready for laminates without telegraphing." },
      { label: "High-density fibre core", detail: "Fibres compressed to roughly 850 kg/m3 or more - denser and tougher than standard MDF." },
      { label: "Moisture-resistant resin + wax", detail: "A water-repelling resin system slows moisture uptake so the board does not swell in humid rooms." },
    ],
    howMade: "Made like MDF but pressed to a much higher density with moisture-resistant resin and additives, giving a hard, void-free board.",
    glue: "Moisture-resistant resin (MUF / pMDI blends)",
    weight: "Very heavy",
    ratings: { waterResistance: 4, strength: 4, screwHolding: 4, smoothFinish: 5, termiteProtection: 3, fireResistance: 2, cost: 4 },
  },
  "flush-door": {
    inside: [
      { label: "Skin (face panel)", detail: "Thin plywood, MDF or HDF skin glued to each face - the surface you finish." },
      { label: "Solid core", detail: "Block-board strips or particle/wood core filling the shutter for weight, strength and sound insulation." },
      { label: "Hardwood frame (stiles & rails)", detail: "A solid wood frame around the edge for hinge and lock fixing." },
    ],
    howMade: "A framed core is glued and pressed between two skins, then edge-banded and sanded flat.",
    glue: "Urea or phenolic resin (varies by grade)",
    weight: "Heavy",
    ratings: { waterResistance: 2, strength: 4, screwHolding: 4, smoothFinish: 4, termiteProtection: 3, fireResistance: 2, cost: 3 },
  },
  "fr-ply": {
    inside: [
      { label: "Face veneer", detail: "Hardwood veneer treated with fire-retardant chemicals." },
      { label: "Core veneers", detail: "Cross-laid veneers impregnated with fire-retardant salts before pressing." },
      { label: "Phenolic glue lines", detail: "Water-resistant bonding, with retardant added to the resin." },
      { label: "Back veneer", detail: "Matching treated veneer on the reverse." },
    ],
    howMade: "Veneers are treated with fire-retardant chemicals, dried, glued with phenolic resin and pressed - the char layer forms slowly and slows flame spread.",
    glue: "Phenolic resin with fire-retardant additives",
    weight: "Heavy",
    ratings: { waterResistance: 3, strength: 4, screwHolding: 4, smoothFinish: 4, termiteProtection: 4, fireResistance: 5, cost: 5 },
  },
  prelam: {
    inside: [
      { label: "Decorative melamine layer", detail: "A printed paper (wood grain, solid colour) soaked in melamine resin - hard, scratch and stain resistant." },
      { label: "MDF or particle-board core", detail: "The structural base the laminate is bonded to." },
      { label: "Balancing layer", detail: "A laminate on the reverse keeps the board from bowing." },
    ],
    howMade: "Melamine-impregnated paper is hot-pressed directly onto the board in the factory, bonding the finish into the surface.",
    glue: "Melamine resin (bonded under heat and pressure)",
    weight: "Medium-heavy",
    ratings: { waterResistance: 2, strength: 2, screwHolding: 2, smoothFinish: 4, termiteProtection: 2, fireResistance: 2, cost: 2 },
  },
  particle: {
    inside: [
      { label: "Fine surface chips", detail: "Small, dense wood particles on the face for a smoother finish." },
      { label: "Coarse core chips", detail: "Larger wood chips in the middle make the board light and economical." },
      { label: "Resin binder", detail: "Urea-formaldehyde glue bonds the chips under pressure." },
    ],
    howMade: "Wood chips and shavings are dried, blended with resin, spread into a mat in layers (fine outside, coarse inside) and hot-pressed.",
    glue: "Urea-formaldehyde (UF)",
    weight: "Light-medium",
    ratings: { waterResistance: 1, strength: 2, screwHolding: 2, smoothFinish: 3, termiteProtection: 1, fireResistance: 1, cost: 1 },
  },
};

export type FullBoardType = BoardType & BoardTypeDetail;

export const BOARD_TYPES: FullBoardType[] = BASE_TYPES.map((t) => ({ ...t, ...DETAILS[t.id] }));

export const BOARD_BRANDS: BoardBrand[] = [
  {
    id: "century-ply",
    name: "Century Ply",
    tier: "Luxury",
    tagline: "India's most trusted name in plywood",
    about:
      "One of India's largest plywood makers, known for its consistent quality, strong warranty backing and a wide range from marine-grade plywood to doors.",
    whyWeUse: [
      "Consistent, graded quality across every sheet",
      "Premium finish that takes laminates and veneers cleanly",
      "Strong brand warranty on our installations",
    ],
    products: [
      { typeId: "bwp" },
      { typeId: "bwr" },
      { typeId: "mr" },
      { typeId: "blockboard" },
      { typeId: "mdf" },
      { typeId: "flush-door" },
      { typeId: "hdhmr" },
      { typeId: "fr-ply" },
      { typeId: "prelam" },
    ],
  },
  {
    id: "greenply",
    name: "Greenply",
    tier: "Standard",
    tagline: "Eco-conscious plywood and panels",
    about:
      "A major Indian wood-panel brand with a broad range of plywood, MDF and doors, and a strong focus on sustainable, low-emission products.",
    whyWeUse: [
      "Wide range, so each space gets the right grade",
      "Reliable moisture and borer protection",
      "Good value for dependable performance",
    ],
    products: [
      { typeId: "bwp" },
      { typeId: "bwr" },
      { typeId: "mr" },
      { typeId: "blockboard" },
      { typeId: "mdf" },
      { typeId: "flush-door" },
      { typeId: "hdhmr" },
      { typeId: "fr-ply" },
      { typeId: "prelam" },
    ],
  },
  {
    id: "kitply",
    name: "Kitply",
    tier: "Standard",
    tagline: "Decades of plywood expertise",
    about:
      "A long-established plywood brand favoured by carpenters for its workability and dependable bonding.",
    whyWeUse: [
      "Easy to cut, shape and finish on site",
      "Dependable glue bond across the range",
      "Competitive price for large wardrobe and storage jobs",
    ],
    products: [
      { typeId: "bwp" },
      { typeId: "bwr" },
      { typeId: "mr" },
      { typeId: "blockboard" },
      { typeId: "flush-door" },
      { typeId: "hdhmr" },
      { typeId: "fr-ply" },
      { typeId: "mdf" },
    ],
  },
  {
    id: "archidply",
    name: "Archidply",
    tier: "Standard",
    tagline: "Plywood, doors and decorative panels",
    about:
      "An established name offering plywood, flush doors and decorative panels with a focus on architects and interior professionals.",
    whyWeUse: [
      "Smooth faces that suit premium laminate finishes",
      "Good range of door and panel products",
      "Solid performance in everyday home interiors",
    ],
    products: [
      { typeId: "bwp" },
      { typeId: "bwr" },
      { typeId: "mr" },
      { typeId: "blockboard" },
      { typeId: "flush-door" },
      { typeId: "hdhmr" },
      { typeId: "fr-ply" },
      { typeId: "mdf" },
    ],
  },
  {
    id: "action-tesa",
    name: "Action Tesa",
    tier: "Standard",
    tagline: "Engineered wood for modern interiors",
    about:
      "A well-known manufacturer of plywood, block boards, MDF and particle boards across residential and commercial projects.",
    whyWeUse: [
      "Wide range from plywood to engineered boards",
      "Consistent thickness and finish",
      "Strong value for high-volume interior work",
    ],
    products: [
      { typeId: "bwp" },
      { typeId: "bwr" },
      { typeId: "mr" },
      { typeId: "blockboard" },
      { typeId: "mdf" },
      { typeId: "particle" },
      { typeId: "hdhmr" },
      { typeId: "fr-ply" },
      { typeId: "flush-door" },
      { typeId: "prelam" },
    ],
  },
];

export const BOARD_BRANDS_BY_NAME: Record<string, BoardBrand> = Object.fromEntries(
  BOARD_BRANDS.map((b) => [b.name, b])
);
export const BOARD_TYPES_BY_ID: Record<string, FullBoardType> = Object.fromEntries(
  BOARD_TYPES.map((t) => [t.id, t])
);
