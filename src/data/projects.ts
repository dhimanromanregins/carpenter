export interface ProjectPhase {
  image: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  category:
    | "Kitchen"
    | "Wardrobe"
    | "Living Room"
    | "Bedroom"
    | "Office"
    | "Staircase"
    | "Wall Design"
    | "Ceiling"
    | "Mandir";
  location?: string;
  year?: string;
  gradient?: string;
  image?: string;
  /** Reference/style image, not a photo of our own completed work. */
  sample?: boolean;
  size: "tall" | "wide" | "square";
  /** Phase-by-phase progress photos for a real, completed project. */
  phases?: ProjectPhase[];
  /** Materials and brands used on this project. */
  materials?: string[];
  /** Client story / how the project came together. */
  story?: string[];
  /** Slot reserved for a real project — swap image/phases/story/materials for the actual job before launch. */
  placeholder?: boolean;
}

export const PROJECT_CATEGORIES = [
  "All",
  "Kitchen",
  "Wardrobe",
  "Living Room",
  "Bedroom",
  "Office",
  "Staircase",
  "Wall Design",
  "Ceiling",
  "Mandir",
] as const;

export const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Modular Kitchen",
    category: "Kitchen",
    location: "Mohali, Sector 59",
    year: "2026",
    image: "/projects/mohali-sector-59-kitchen/front.png",
    size: "wide",
    story: [
      "This client found us through an Instagram ad — a few reels of our past kitchen work were enough to get them curious, but not enough to get them sure.",
      "When we sat down for the first meeting, they genuinely didn't know how they wanted their kitchen to look. They knew what they didn't want, but had no fixed style in mind — just a Pinterest board full of contradicting ideas.",
      "We spent that first session just listening — how the family cooks, who uses the kitchen and when, what frustrated them about their old one. From there we sketched a layout, walked them through material and finish options, and slowly the design took shape as something that felt like theirs, not a copy of a reel.",
      "By the time the shutters went on and the countertop was fitted, the confusion was long gone. The whole family walked in, and it was an instant, unanimous yes.",
    ],
    phases: [
      {
        image: "/projects/mohali-sector-59-kitchen/phase-1-civil-and-electrical.png",
        title: "Civil & Electrical",
        description:
          "Bare shell handover — plaster finished, electrical and plumbing points marked for the hob, chimney, sink and appliances before any carpentry begins.",
      },
      {
        image: "/projects/mohali-sector-59-kitchen/phase-2-working-drawing.png",
        title: "Working Drawing",
        description:
          "Hand-measured site drawing with elevations, cabinet-by-cabinet dimensions and section details, verified on site before fabrication.",
      },
      {
        image: "/projects/mohali-sector-59-kitchen/phase-3-carcass-installation.png",
        title: "Carcass Installation",
        description:
          "18mm HDMR board carcasses installed on site for the wall units, base units and tall unit, with shelving and wiring routed before shutters go on.",
      },
      {
        image: "/projects/mohali-sector-59-kitchen/phase-4-final-finish.png",
        title: "Final Finish",
        description:
          "Handleless laminate shutters, quartz countertop and marble-look backsplash, chimney, hob, sink and built-in oven fitted for the completed kitchen.",
      },
    ],
    materials: [
      "18mm HDMR board with laminate finish (shutters & carcass)",
      "Soft-close hinges & channels",
      "Quartz countertop with marble-look backsplash",
      "Built-in chimney, hob and oven",
      "Handleless gola-profile shutters",
    ],
  },
  {
    id: "p2",
    title: "Compact Galley Kitchen",
    category: "Kitchen",
    location: "Airbnb Rental Flat",
    year: "2026",
    image: "/projects/airbnb-rental-kitchen/front.png",
    size: "square",
    story: [
      "This one was for a client who runs a boutique Airbnb out of their flat — for them the kitchen wasn't just a place to cook, it had to hold up as one of the star photos in the listing and impress a new set of guests every few days.",
      "The brief was tight on paper and trickier in practice: keep the galley layout compact and functional for guests who'd never used the space before, but make it feel warm enough that people would actually want to cook in it instead of ordering in.",
      "We swapped closed wall cabinets for floating oak shelves with warm under-lighting, added brass fittings for a boutique touch, and kept the base cabinetry handleless and easy to wipe down between check-ins.",
      "It's since become one of the most-photographed corners of the listing — and the host tells us it gets a mention in guest reviews more often than the view does.",
    ],
    phases: [
      {
        image: "/projects/airbnb-rental-kitchen/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "Hand-drawn elevations, plan view and cabinet-by-cabinet details for the L-shaped layout, verified against site dimensions before fabrication began.",
      },
      {
        image: "/projects/airbnb-rental-kitchen/phase-2-shell-and-shelving.png",
        title: "Shell & Shelving",
        description:
          "Concrete countertop shell cast in place and floating oak shelves fixed to the wall, with electrical and plumbing points marked out before the cabinets go in.",
      },
      {
        image: "/projects/airbnb-rental-kitchen/phase-3-carcass-ready.png",
        title: "Carcass Ready",
        description:
          "Base carcasses roughed in below the countertop with plumbing stubbed out for the sink, ready for the cabinet fronts to be fixed.",
      },
      {
        image: "/projects/airbnb-rental-kitchen/phase-4-carpentry-and-fixing.png",
        title: "Carpentry & Fixing",
        description:
          "Cabinets, open shelving and the chimney hood fixed in place — the last stage before laminate and finishing go on.",
      },
      {
        image: "/projects/airbnb-rental-kitchen/front.png",
        title: "Final Styling",
        description:
          "Warm oak shelving styled with copper cookware and greenery, handleless cabinetry and brass fittings finished — ready to welcome guests.",
      },
    ],
    materials: [
      "18mm HDMR board with laminate finish (cabinets)",
      "Solid oak floating shelves",
      "Brass fittings & fixtures",
      "Soft-close hinges & channels",
      "Under-shelf LED strip lighting",
    ],
  },
  {
    id: "p3",
    title: "Navy Parallel Kitchen",
    category: "Kitchen",
    location: "High-Rise Apartment",
    year: "2026",
    image: "/projects/navy-parallel-kitchen/front.png",
    size: "square",
    story: [
      "This one belonged to a young couple in a high-rise apartment — a narrow parallel kitchen squeezed between a service balcony and the dining wall, barely wide enough to open a cabinet and the fridge door at the same time.",
      "Their first ask was almost apologetic: could we even do something nice with a shape this awkward? The layout worked against them, but the light pouring in through the balcony door didn't.",
      "We ran cabinetry the full length of both walls and pushed the storage into the depth instead of the width, then broke up the run with a navy-and-warm-white two-tone so the narrow kitchen read as a deliberate design choice, not a compromise.",
      "By the time the marble backsplash and brass pendant lights went in, the couple said it stopped feeling like the smallest room in the flat — now it's the first thing they show visitors.",
    ],
    phases: [
      {
        image: "/projects/navy-parallel-kitchen/phase-1-initial-construction.png",
        title: "Initial Construction",
        description:
          "Bare structure and rough work — carcass shells for both runs built in place, electrical and plumbing points marked out, balcony door left as the only light source.",
      },
      {
        image: "/projects/navy-parallel-kitchen/phase-2-carcass-and-lighting.png",
        title: "Carcass & Lighting",
        description:
          "Chimney, backsplash tiles and cove ceiling lighting installed, cabinet carcasses and drawer runners fixed on both walls ahead of shutters and countertop.",
      },
      {
        image: "/projects/navy-parallel-kitchen/front.png",
        title: "Final Styling",
        description:
          "Navy and warm-white two-tone shutters, marble-look backsplash, brass pendant lights and walnut open shelving finished — the narrow galley reborn.",
      },
    ],
    materials: [
      "18mm HDMR board with laminate finish (navy & warm-white two-tone)",
      "Marble-look quartz backsplash & countertop",
      "Brass pendant lighting",
      "Walnut open shelving",
      "Soft-close hinges & channels",
    ],
  },
  {
    id: "w1",
    title: "Sage Green Sliding Wardrobe",
    category: "Wardrobe",
    location: "Add location",
    year: "2026",
    image: "/projects/sage-green-wardrobe/front.png",
    size: "square",
    story: [
      "This client had just moved into a bigger home after years in a small rented flat, and for the first time had an actual room to give the wardrobe — before this, their clothes had lived out of suitcases and a single steel almirah.",
      "Their first instinct was to play it safe with plain white shutters. It was only after we walked them through swatches and mocked it up with a muted sage green against warm white that they said, 'okay, let's actually do something with it.'",
      "We split the run into loft units for out-of-season storage, added an open wood shelving column with LED strip lighting for perfume and accessories, and carried the sage tone into the drawers so the whole wall reads as one considered piece, not just a boxy cupboard.",
      "The first thing the client did once it was installed was send us a photo of their clothes finally hung up properly — no more suitcases on the floor.",
    ],
    phases: [
      {
        image: "/projects/sage-green-wardrobe/phase-1-carcass-and-shutters.png",
        title: "Carcass & Shutters",
        description:
          "Carcass assembled on site, loft shutters hung and hinged, hanging rods fitted — installation still underway with tools on the floor.",
      },
      {
        image: "/projects/sage-green-wardrobe/phase-2-fitting-check.png",
        title: "Fitting Check",
        description:
          "Carcass and loft shutters fixed in place and checked for alignment, ready for hardware and accessories to go in.",
      },
      {
        image: "/projects/sage-green-wardrobe/phase-3-hardware-and-accessories.png",
        title: "Hardware & Accessories",
        description:
          "Branded 18mm boards, soft-close hinges and a pull-out rail fitted inside the carcass before the open shelving column gets its finishing touch.",
      },
      {
        image: "/projects/sage-green-wardrobe/front.png",
        title: "Final Styling",
        description:
          "Sage green and warm white two-tone shutters, an open wood shelving column with LED lighting, and sage drawers finished for a wall that reads as one piece.",
      },
    ],
    materials: [
      "18mm branded board (Action Tesa) with laminate finish",
      "Sage green & warm white two-tone shutters",
      "Soft-close hinges & sliding channels",
      "Open shelving column with LED strip lighting",
      "Pull-out trouser/accessory rail",
    ],
  },
  {
    id: "w2",
    title: "Olive Wardrobe with Side Bench",
    category: "Wardrobe",
    location: "Add location",
    year: "2026",
    image: "/projects/olive-wardrobe-with-bench/front.png",
    size: "tall",
    story: [
      "This client was redoing their master bedroom and, almost as an afterthought, mentioned they'd always wanted a proper spot to sit while getting dressed — something between a walk-in closet and a hotel room.",
      "They came to the first meeting with a folder full of hinged-wardrobe photos, torn between playing it safe with plain white and doing something with a bit more personality — and couldn't quite decide either way.",
      "We settled on a moss-green laminate against a warm walnut interior, kept one bay open for display, and sized a low bench into the run at the same depth as the wardrobe so it reads as part of the piece, not an add-on.",
      "Now it's the first thing they use every morning — the bench for shoes, the open shelf for the watch and wallet they used to lose around the room.",
    ],
    phases: [
      {
        image: "/projects/olive-wardrobe-with-bench/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "Hand-drawn front, side and internal layout views with the full cutting list — 18mm HDMR board, green exterior laminate, plain HDMR interior — verified before fabrication.",
      },
      {
        image: "/projects/olive-wardrobe-with-bench/phase-2-carcass-installation.png",
        title: "Carcass Installation",
        description:
          "Wardrobe and bench carcasses assembled on site with hanging rods and drawer boxes fitted, ready for shutters and laminate finish.",
      },
      {
        image: "/projects/olive-wardrobe-with-bench/front.png",
        title: "Final Styling",
        description:
          "Moss-green hinged shutters with long aluminium handles, a warm walnut open shelf, and a matching side bench finished for the completed dressing corner.",
      },
    ],
    materials: [
      "18mm HDMR board with 1mm exterior laminate (green)",
      "Plain HDMR interior finish",
      "Soft-close hinges",
      "Telescopic drawer channels",
      "Aluminium hanging rod & long aluminium handles",
    ],
  },
  {
    id: "s3",
    title: "Contemporary Master Bedroom",
    category: "Bedroom",
    image: "/master-bedroom-inspiration/contemporary/contemporary-bedroom-design-with-a-king-size-bed-and-hanging-lights.png",
    sample: true,
    size: "tall",
  },
  {
    id: "lr1",
    title: "Stacked Stone TV Panel",
    category: "Living Room",
    location: "Add location",
    year: "2026",
    image: "/projects/stacked-stone-tv-panel/front.png",
    size: "square",
    story: [
      "This one came together for a family whose brief was simple: they wanted the TV wall to be the centerpiece of the room, not just a place to hang a screen — something that felt as good on a quiet evening as it did with the whole family over for a match.",
      "The material board started out entirely in a soft olive laminate. But once we set a stacked-stone sample next to dark walnut in front of them, the plan changed on the spot — they wanted the texture of real stone behind the screen instead.",
      "We kept storage running on both sides with backlit display niches for souvenirs, added a closed cabinet run below for the set-top box and console, and let the stone panel carry all the visual weight in the middle.",
      "It's since become the one wall in the house that gets photographed every festive season, stone texture and all.",
    ],
    phases: [
      {
        image: "/projects/stacked-stone-tv-panel/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "Full front, side and top-view layout for the 2400mm unit with a 1200×1400mm TV recess, open shelving and drawer details, verified before fabrication.",
      },
      {
        image: "/projects/stacked-stone-tv-panel/phase-2-carcass-installation.png",
        title: "Carcass Installation",
        description:
          "18mm ply carcass built on site — side display columns, open base cubbies and the recessed TV niche with its LED strip channel — ready for the feature panel and finish.",
      },
      {
        image: "/projects/stacked-stone-tv-panel/front.png",
        title: "Final Styling",
        description:
          "Stacked-stone feature backdrop with charcoal cabinetry and dark walnut display shelving, backlit niches and closed storage finished around the mounted screen.",
      },
    ],
    materials: [
      "18mm ply carcass",
      "Stacked natural stone feature panel",
      "Dark walnut laminate & charcoal cabinetry",
      "LED strip lighting (niche & recess)",
      "Soft-close hinges & channels",
    ],
  },
  {
    id: "lr2",
    title: "Fluted Ivory TV Panel",
    category: "Living Room",
    location: "Add location",
    year: "2026",
    image: "/projects/fluted-ivory-tv-panel/front.png",
    size: "square",
    story: [
      "This client's brief was almost the opposite of dramatic — they'd seen enough busy, over-accessorized TV walls online and wanted something that felt calm the moment you walked in, without going cold or empty.",
      "The tricky part was a built-in display case they wanted on one side, for a collection of glassware and travel souvenirs picked up over twenty years of marriage. They were nervous it would end up looking cluttered next to a minimal panel.",
      "We kept the main wall in a soft ivory laminate with a fluted light-wood insert behind where the screen sits, and gave the display case glass doors with warm backlighting so the collection reads as curated, not crowded.",
      "Walking in now, the first thing guests do is stop at the lit cabinet before they even notice the TV — exactly the reaction the couple wanted.",
    ],
    phases: [
      {
        image: "/projects/fluted-ivory-tv-panel/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "Full elevation, side view and section details for the 2400×2400mm unit with a 1200×1400mm TV recess, fluted panel insert and drawer detail, verified before fabrication.",
      },
      {
        image: "/projects/fluted-ivory-tv-panel/phase-2-carcass-installation.png",
        title: "Carcass Installation",
        description:
          "18mm ply carcass built on site with the open shelving column, base cubbies and fluted panel battens in place, ready for laminate and glass fronts.",
      },
      {
        image: "/projects/fluted-ivory-tv-panel/front.png",
        title: "Final Styling",
        description:
          "Ivory laminate with a fluted light-wood insert, a backlit glass display cabinet and a floating console finished around the mounted screen.",
      },
    ],
    materials: [
      "18mm ply carcass with 12mm back panel",
      "Off-white/ivory laminate finish",
      "Fluted/grooved light-wood panel insert",
      "Glass-front display cabinet with LED backlighting",
      "Soft-close hinges & drawer channels",
    ],
  },
  {
    id: "s5",
    title: "Executive Office Furniture",
    category: "Office",
    image: "/services/office-furniture.png",
    sample: true,
    size: "wide",
  },
  {
    id: "st1",
    title: "Floating Walnut Staircase",
    category: "Staircase",
    location: "Add location",
    year: "2026",
    image: "/projects/floating-walnut-staircase/front.png",
    size: "tall",
    story: [
      "This one was for a duplex where the builder had left the connecting staircase as a bare steel skeleton — structurally sound, but not something anyone wanted to walk up, and completely at odds with the rest of the finished apartment.",
      "The client's biggest worry was the view. They'd bought the flat for the skyline outside the living room window, and didn't want a staircase with solid balustrades and skirting cutting across it.",
      "We kept the black powder-coated steel stringer as the structure, added floating walnut treads to match the rest of the home's woodwork, and used a frameless glass balustrade instead of a solid rail so the skyline stays uninterrupted from the sofa.",
      "From across the room the staircase barely reads as there at all — until the evening lights come on and it turns into the room's second view.",
    ],
    phases: [
      {
        image: "/projects/floating-walnut-staircase/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "Elevation, section and connection details for the steel stringer — 10mm MS stringer plate, 6mm MS tread plate, black powder-coated matte finish — verified before fabrication.",
      },
      {
        image: "/projects/floating-walnut-staircase/phase-2-steel-structure.png",
        title: "Steel Structure",
        description:
          "Black steel stringer welded and anchored in place, floor to floor, as the bare structural skeleton before treads and balustrade go on.",
      },
      {
        image: "/projects/floating-walnut-staircase/front.png",
        title: "Final Styling",
        description:
          "Floating walnut treads fixed to the steel stringer with a frameless glass balustrade and warm accent lighting finished for the completed staircase.",
      },
    ],
    materials: [
      "MS steel stringer, 10mm plate, black powder-coated matte finish",
      "MS tread plate, 6mm, clad in walnut veneer",
      "Frameless toughened glass balustrade",
      "Stainless steel handrail brackets",
      "Warm LED accent lighting",
    ],
  },
  {
    id: "wd1",
    title: "Fluted Oak Corridor Wall",
    category: "Wall Design",
    location: "Add location",
    year: "2026",
    image: "/projects/fluted-oak-corridor-wall/front.png",
    size: "square",
    story: [
      "This was a plain connecting corridor between the bedrooms — the kind of space nobody budgets for because it's 'just a passage,' so it usually ends up as bare painted wall and a single tube light.",
      "The client almost skipped it entirely, until we pointed out it's the one wall every guest walks past on the way to every room in the house.",
      "We ran fluted oak panelling floor to ceiling in staggered widths and slotted in cylindrical wall sconces that wash light straight down the grooves, so the corridor reads as a design moment instead of a gap between rooms.",
      "It's now the first thing people comment on when they visit — for a wall that almost didn't get a budget.",
    ],
    materials: [
      "18mm MDF fluted/grooved wall panels, oak veneer finish",
      "Cylindrical wall sconces, warm LED",
      "Concealed mounting cleats",
    ],
  },
  {
    id: "wd2",
    title: "Brass Inlay Foyer Wall",
    category: "Wall Design",
    location: "Add location",
    year: "2026",
    image: "/projects/brass-inlay-foyer-wall/front.png",
    size: "square",
    story: [
      "This wall greets you the second you step through the front door — the client's only real brief was 'make it feel expensive without shouting about it.'",
      "Their first idea was plain marble cladding, the safe choice they'd seen in every other apartment in the building. We suggested breaking up an ivory textured finish with a hand-set brass inlay grid instead, and they weren't sure until they saw it lit up on a sample panel.",
      "We ran the brass lines asymmetrically rather than in a strict grid, paired it with a fluted wood return wall on the side, and let cove lighting wash the ceiling line so the whole foyer feels lit from within.",
      "Now people stop at the door for a second before they even take their shoes off — exactly the reaction the client was hoping for.",
    ],
    materials: [
      "Textured ivory wall finish over 18mm MDF backing panels",
      "Brass inlay strips, hairline finish",
      "Cove LED lighting",
    ],
  },
  {
    id: "cl1",
    title: "Cove-Lit False Ceiling",
    category: "Ceiling",
    location: "Add location",
    year: "2026",
    image: "/projects/cove-lit-false-ceiling/front.png",
    size: "wide",
    story: [
      "This room had a single centre light and nothing else — the kind of ceiling nobody notices until they're sitting under it every evening wondering why the room feels flat.",
      "The client's hesitation was real: they'd heard false ceilings 'eat into the height' and didn't want a small room feeling boxed in.",
      "We kept the drop to a shallow 8–9 inches, floated the ceiling's edge on a cove of hidden LED strip so it reads as light rather than a lowered slab, and added two pendant lights over the table for a warmer, layered glow instead of one harsh downlight.",
      "The client's first reaction walking back in was that the room looked taller, not smaller — the exact opposite of what they were afraid of.",
    ],
    phases: [
      {
        image: "/projects/cove-lit-false-ceiling/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "Layout plan and section for an 11'×9' room — 8 recessed downlights, 2 pendant points, a 6-inch cove for LED strip lighting and an 8–9 inch drop from the existing slab, verified before execution.",
      },
      {
        image: "/projects/cove-lit-false-ceiling/front.png",
        title: "Final Styling",
        description:
          "POP false ceiling finished in white with warm-white cove lighting, recessed downlights and two brass pendant lights fitted for the completed room.",
      },
    ],
    materials: [
      "POP & gypsum board false ceiling (POP & paint finish)",
      "Cove LED strip lighting, warm white (3000K)",
      "8 recessed LED downlights",
      "2 pendant lights",
    ],
  },
  {
    id: "cl2",
    title: "Dropped Panel Ceiling",
    category: "Ceiling",
    location: "Add location",
    year: "2026",
    image: "/projects/dropped-panel-ceiling/front.png",
    size: "wide",
    story: [
      "This client had already seen a friend's ceiling with cove lighting and multiple tiers and wanted the same glow — but their budget and timeline for this room didn't stretch to a full multi-level design.",
      "Instead of talking them out of the look, we simplified it: a single dropped centre panel, just a 2-inch step, with the cove doing all the work instead of extra tiers.",
      "We ran the cove around all four sides of the dropped panel and kept the downlights to the perimeter, off the panel itself, so the drop stays clean and shadow-free.",
      "The client got exactly the glow they were chasing from their friend's ceiling — at a fraction of the cost and the time.",
    ],
    phases: [
      {
        image: "/projects/dropped-panel-ceiling/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "Layout plan and cove detail for an 11'×9' room — single-level false ceiling with a 2-inch dropped centre panel, 6-inch cove and 7 perimeter downlights, verified before execution.",
      },
      {
        image: "/projects/dropped-panel-ceiling/front.png",
        title: "Final Styling",
        description:
          "POP false ceiling finished in white with a dropped centre panel outlined in warm-white cove lighting and perimeter downlights for the completed room.",
      },
    ],
    materials: [
      "POP & gypsum board false ceiling (POP & paint finish)",
      "Cove LED strip lighting, warm white (3000K)",
      "7 recessed LED downlights",
    ],
  },
  {
    id: "md1",
    title: "Walnut Om Mandir",
    category: "Mandir",
    location: "Add location",
    year: "2026",
    image: "/projects/walnut-om-mandir/front.png",
    size: "tall",
    story: [
      "This request came in almost as a footnote to a bigger renovation — 'oh, and we need a proper place for the mandir' — tucked into the wall between the living and dining areas where a hallway closet used to be.",
      "The first concept we sketched was bigger and more elaborate: a 7-foot arched niche in stone and marble, closer to a temple facade than a piece of furniture. The client loved it on paper, but it would've swallowed the passage and blown the budget for that corner.",
      "We scaled it back to a 5-foot walnut unit, kept glass-fronted side columns for lamps and prasad, and carved a backlit Om medallion into the back panel instead of a full marble arch — so it still felt like a shrine, not a cabinet.",
      "It's now the first thing family members touch on the way in and out of the house, every single morning.",
    ],
    phases: [
      {
        image: "/projects/walnut-om-mandir/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "The revised 5'×7'6\" layout — carved Om medallion backdrop, glass-fronted side shelves and a 4-drawer base — verified before fabrication.",
      },
      {
        image: "/projects/walnut-om-mandir/front.png",
        title: "Final Styling",
        description:
          "Walnut-finish cabinetry with a backlit carved Om medallion, glass display columns and brass hardware finished around the family idols.",
      },
    ],
    materials: [
      "Plywood carcass with walnut veneer finish",
      "Carved Om medallion back panel",
      "Glass-front display shelving with warm LED lighting",
      "Brass handles & fittings",
      "Soft-close hinges & drawer channels",
    ],
  },
  {
    id: "md2",
    title: "Arched Ivory Mandir",
    category: "Mandir",
    location: "Add location",
    year: "2026",
    image: "/projects/arched-ivory-mandir/front.png",
    size: "square",
    story: [
      "This one came from a couple redoing their entryway who were nervous about a mandir at all — they were going for a clean, all-ivory, almost hotel-lobby look through the rest of the home, and worried a traditional puja unit would clash with it.",
      "Rather than drop the arch — the one detail that reads as 'mandir' rather than 'cabinet' — we kept it, but built it in the same soft ivory laminate as the rest of the house and let a backlit cove do the ornamentation instead of carved stone or marble jali work.",
      "A fluted drawer front and glass-shelf side columns for lamps and prasad kept everything else minimal, so the idols would be the one standalone accent in the piece rather than the unit competing with them.",
      "Now it doesn't feel like a religious corner and a design scheme sitting side by side — it just feels like one home.",
    ],
    phases: [
      {
        image: "/projects/arched-ivory-mandir/phase-1-working-drawing.png",
        title: "Working Drawing",
        description:
          "7'×8' pooja unit layout with an arched niche, stone/marble platform shelf and fluted drawer front, verified before fabrication.",
      },
      {
        image: "/projects/arched-ivory-mandir/front.png",
        title: "Final Styling",
        description:
          "Ivory laminate cabinetry with a backlit arched niche, glass-fronted display columns and a fluted drawer front finished around the family idols.",
      },
    ],
    materials: [
      "Plywood carcass with ivory laminate/veneer finish",
      "Fluted drawer front",
      "Stone/marble platform shelf",
      "Warm LED cove & shelf lighting",
      "Brass knob hardware",
    ],
  },
];
