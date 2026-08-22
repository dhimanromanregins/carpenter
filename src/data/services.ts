export interface Service {
  id: string;
  title: string;
  description: string;
  index: string;
  image?: string;
}

export const SERVICES: Service[] = [
  {
    id: "wardrobes",
    title: "Luxury Wardrobes",
    description: "Walk-in closets and sliding wardrobes tailored to your space, finished in premium veneers.",
    index: "01",
    image: "/wardrobe-inspiration/sliding/green-and-white-sliding-door-modern-wardrobe-design-with-loft.webp",
  },
  {
    id: "kitchen",
    title: "Modular Kitchen",
    description: "Ergonomic, chef-grade kitchens with soft-close fittings and imported hardware.",
    index: "02",
    image: "/kitchen-inspiration/l-shaped/modern-l-shaped-kitchen-design-with-beige-cabinets.webp",
  },
  {
    id: "tv-panels",
    title: "TV Panels",
    description: "Statement entertainment units blending wood grain with backlit stone and metal inlays.",
    index: "03",
    image: "/tv-panel-inspiration/walnut-wood/contemporary-tv-unit-design-with-timber-slat-wall-and-glass-cabinet.webp",
  },
  {
    id: "bedroom",
    title: "Bedroom Interiors",
    description: "Serene, tactile bedroom suites designed around rest, storage and quiet luxury.",
    index: "04",
    image: "/master-bedroom-inspiration/modern/modern-bedroom-design-with-a-double-bed-and-a-wooden-dresser.webp",
  },
  {
    id: "office",
    title: "Office Furniture",
    description: "Executive desks, storage systems and boardroom tables crafted for modern workspaces.",
    index: "05",
    image: "/services/office-furniture.png",
  },
  {
    id: "false-ceiling",
    title: "False Ceiling",
    description: "Layered gypsum and wood ceiling designs with integrated cove and profile lighting.",
    index: "06",
    image: "/ceiling-inspiration/gypsum-pop/geometric-gypsum-rectangular-ceiling-design-for-the-kitchen.webp",
  },
  {
    id: "wall-panels",
    title: "Wall Panels",
    description: "Textured fluted and veneer wall panelling that adds depth and warmth to any room.",
    index: "07",
    image: "/tv-panel-inspiration/walnut-wood/dark-walnut-contemporary-tv-unit-design-with-wooden-slat-wall-and-storage.webp",
  },
  {
    id: "flooring",
    title: "Wood Flooring",
    description: "Engineered and solid wood flooring, finished and polished to a mirror-grade luxury.",
    index: "08",
    image: "/services/wood-flooring.png",
  },
];
