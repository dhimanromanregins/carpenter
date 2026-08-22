export interface InspirationImage {
  src: string;
  title: string;
}

export interface InspirationCategory {
  slug: string;
  label: string;
  images: InspirationImage[];
}

export const WARDROBE_INSPIRATION_CREDIT =
  "Reference images curated for client inspiration only — not photos of our own completed projects.";

export const WARDROBE_INSPIRATION: InspirationCategory[] = [
  {
    slug: "sliding",
    label: "Sliding Door",
    images: [
      { src: "/wardrobe-inspiration/sliding/637638843872201466249.png", title: "Sliding Door Wardrobe Concept 1" },
      { src: "/wardrobe-inspiration/sliding/726638695062641668699.png", title: "Sliding Door Wardrobe Concept 2" },
      { src: "/wardrobe-inspiration/sliding/913638703019499425876.png", title: "Sliding Door Wardrobe Concept 3" },
      { src: "/wardrobe-inspiration/sliding/contemporary-sliding-wardrobe-design-in-golf-green-and-champagne.png", title: "Contemporary Sliding Wardrobe in Golf Green and Champagne" },
      { src: "/wardrobe-inspiration/sliding/contemporary-white-and-green-sliding-door-wardrobe-design.png", title: "Contemporary White and Green Sliding Door Wardrobe" },
      { src: "/wardrobe-inspiration/sliding/green-and-white-sliding-door-modern-wardrobe-design-with-loft.webp", title: "Green and White Sliding Door Wardrobe with Loft" },
      { src: "/wardrobe-inspiration/sliding/modern-sliding-wardrobe-design-in-white-and-lime-lacquered-glass.png", title: "Modern Sliding Wardrobe in White and Lime Lacquered Glass" },
      { src: "/wardrobe-inspiration/sliding/white-green-sliding-wardrobe-with-modern-touch.webp", title: "White & Green Sliding Wardrobe with Modern Touch" },
    ],
  },
  {
    slug: "swing",
    label: "Swing Door",
    images: [
      { src: "/wardrobe-inspiration/swing/114638582944029076283.png", title: "Swing Door Wardrobe Concept 1" },
      { src: "/wardrobe-inspiration/swing/2-door-modern-swing-wardrobe-design-in-trooper-with-gold-handles.png", title: "2-Door Modern Swing Wardrobe in Trooper with Gold Handles" },
      { src: "/wardrobe-inspiration/swing/3-door-olive-green-modern-swing-wardrobe-design-in-suede-finish.png", title: "3-Door Olive Green Swing Wardrobe in Suede Finish" },
      { src: "/wardrobe-inspiration/swing/383638703014393323413.png", title: "Swing Door Wardrobe Concept 2" },
      { src: "/wardrobe-inspiration/swing/443638696119494835341.png", title: "Swing Door Wardrobe Concept 3" },
      { src: "/wardrobe-inspiration/swing/491638705099275242279.png", title: "Swing Door Wardrobe Concept 4" },
      { src: "/wardrobe-inspiration/swing/classic-green-4-door-swing-wardrobe-design-with-matte-membrane-finish.png", title: "Classic Green 4-Door Swing Wardrobe, Matte Membrane Finish" },
      { src: "/wardrobe-inspiration/swing/contemporary-7-door-swing-wardrobe-design-in-dark-green-suede-laminate.png", title: "Contemporary 7-Door Swing Wardrobe in Dark Green Suede Laminate" },
      { src: "/wardrobe-inspiration/swing/contemporary-green-4-door-swing-wardrobe-design.png", title: "Contemporary Green 4-Door Swing Wardrobe" },
      { src: "/wardrobe-inspiration/swing/olive-green-contemporary-6-door-swing-wardrobe-design.png", title: "Olive Green Contemporary 6-Door Swing Wardrobe" },
      { src: "/wardrobe-inspiration/swing/shaker-style-4-door-forest-green-swing-wardrobe-design-with-matte-finish.png", title: "Shaker Style 4-Door Forest Green Swing Wardrobe" },
      { src: "/wardrobe-inspiration/swing/traditional-3-door-swing-wardrobe-design-in-green.png", title: "Traditional 3-Door Swing Wardrobe in Green" },
    ],
  },
  {
    slug: "hinged",
    label: "Hinged",
    images: [
      { src: "/wardrobe-inspiration/hinged/865637955624625449788.jpg", title: "Hinged Wardrobe Concept 1" },
      { src: "/wardrobe-inspiration/hinged/957638961426321701257.jpg", title: "Hinged Wardrobe Concept 2" },
      { src: "/wardrobe-inspiration/hinged/green-straight-hinged-modern-wardrobe-design-with-loft-and-dresser.webp", title: "Green Straight Hinged Wardrobe with Loft and Dresser" },
    ],
  },
  {
    slug: "open",
    label: "Open Storage",
    images: [
      { src: "/wardrobe-inspiration/open/multifunctional-green-and-white-wardrobe-design-with-open-storage.webp", title: "Multifunctional Green & White Wardrobe with Open Storage" },
    ],
  },
  {
    slug: "other",
    label: "Other Designs",
    images: [
      { src: "/wardrobe-inspiration/other/238638200163332228736.jpg", title: "Wardrobe Design Concept 1" },
      { src: "/wardrobe-inspiration/other/338638863678144249550.png", title: "Wardrobe Design Concept 2" },
      { src: "/wardrobe-inspiration/other/704638694694681829779.png", title: "Wardrobe Design Concept 3" },
      { src: "/wardrobe-inspiration/other/893638208678223079089.jpg", title: "Wardrobe Design Concept 4" },
      { src: "/wardrobe-inspiration/other/contemporary-green-and-white-wardrobe-design-with-attached-study-table.webp", title: "Contemporary Wardrobe with Attached Study Table" },
      { src: "/wardrobe-inspiration/other/modern-full-height-wardrobe-design-in-desert-green-finish.png", title: "Modern Full-Height Wardrobe in Desert Green Finish" },
    ],
  },
];
