export interface MaterialBrand {
  name: string;
  tier: "Standard" | "Luxury";
}

export interface MaterialCategory {
  id: string;
  title: string;
  description: string;
  brands: MaterialBrand[];
}

export const MATERIALS: MaterialCategory[] = [
  {
    id: "boards",
    title: "Boards & Plywood",
    description: "100% branded, BWP-grade boards only — we never use low-quality or unbranded material.",
    brands: [
      { name: "Century Ply", tier: "Luxury" },
      { name: "Action Tesa", tier: "Standard" },
      { name: "Greenply", tier: "Standard" },
      { name: "Kitply", tier: "Standard" },
      { name: "Archidply", tier: "Standard" },
    ],
  },
  {
    id: "hardware",
    title: "Hardware & Fittings",
    description: "Soft-close hinges, channels and handles engineered to last a lifetime of daily use.",
    brands: [
      { name: "Hettich", tier: "Luxury" },
      { name: "Häfele", tier: "Luxury" },
      { name: "Blum", tier: "Luxury" },
      { name: "Ebco", tier: "Standard" },
    ],
  },
  {
    id: "laminates",
    title: "Laminates & Veneers",
    description: "Scratch-resistant, richly textured surface finishes for wardrobes, kitchens, TV panels and wall panelling.",
    brands: [
      { name: "Merino", tier: "Luxury" },
      { name: "Greenlam", tier: "Standard" },
      { name: "Century Laminates", tier: "Standard" },
      { name: "Virgo", tier: "Standard" },
    ],
  },
  {
    id: "kitchen",
    title: "Modular Kitchen",
    description: "Premium countertops, sinks, hobs and chimneys for a truly chef-grade kitchen.",
    brands: [
      { name: "Pokarna Quartz", tier: "Luxury" },
      { name: "Caesarstone", tier: "Luxury" },
      { name: "Franke", tier: "Luxury" },
      { name: "Elica", tier: "Standard" },
      { name: "Faber", tier: "Standard" },
    ],
  },
  {
    id: "flooring",
    title: "Wood Flooring",
    description: "Engineered and laminate flooring finished to a mirror-grade luxury.",
    brands: [
      { name: "Pergo", tier: "Luxury" },
      { name: "Greenlam Flooring", tier: "Standard" },
      { name: "Action Tesa Flooring", tier: "Standard" },
    ],
  },
  {
    id: "ceiling",
    title: "Gypsum & False Ceiling",
    description: "Fire-rated, moisture-resistant boards for durable, long-lasting ceiling work.",
    brands: [
      { name: "Saint-Gobain Gyproc", tier: "Luxury" },
      { name: "USG Boral", tier: "Standard" },
      { name: "India Gypsum", tier: "Standard" },
    ],
  },
  {
    id: "paints",
    title: "Paints & Polish",
    description: "Durable, low-VOC paints and wood finishes for a flawless final coat.",
    brands: [
      { name: "Asian Paints", tier: "Standard" },
      { name: "Berger", tier: "Standard" },
      { name: "MRF Wood Finishes", tier: "Standard" },
    ],
  },
  {
    id: "adhesives",
    title: "Adhesives",
    description: "Industrial-grade bonding for joinery that holds for decades.",
    brands: [{ name: "Fevicol", tier: "Standard" }],
  },
];
