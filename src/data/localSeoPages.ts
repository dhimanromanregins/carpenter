export interface LocalFaq {
  question: string;
  answer: string;
}

export interface LocalServiceBlurb {
  title: string;
  description: string;
  /** Optional deep-link to a dedicated service page, e.g. /modular-kitchen-chandigarh. */
  learnMoreHref?: string;
}

export interface LocalGalleryImage {
  src: string;
  caption: string;
}

export interface LocalSeoPageContent {
  slug: string;
  city: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  intro: string[];
  services: LocalServiceBlurb[];
  gallery: LocalGalleryImage[];
  galleryNote: string;
  whyChooseUs: LocalServiceBlurb[];
  faqs: LocalFaq[];
}

export const LOCAL_SEO_PAGES: LocalSeoPageContent[] = [
  {
    slug: "zirakpur",
    city: "Zirakpur",
    metaTitle: "Interior Designer in Zirakpur — Modular Kitchens & Custom Carpentry",
    metaDescription:
      "Dhiman Interiors is a Zirakpur-based interior design and carpentry studio on Highland Marg. Modular kitchens, wardrobes, custom carpentry and TV panels, with local site visits and a real studio you can walk into.",
    heroHeadline: "Interior Designer in Zirakpur",
    heroSubtext: "Modular kitchens, wardrobes and custom carpentry from a studio that's actually in Zirakpur — not a call centre routing you to someone two cities away.",
    heroImage: "/projects/navy-parallel-kitchen/front.png",
    intro: [
      "Dhiman Interiors is based right here in Zirakpur — our studio sits on Highland Marg, off the Patiala highway. That matters more than it sounds: when you're renovating a kitchen or building out a new wardrobe, half the friction in a project comes from a design team that's twenty minutes late for a site visit, or unreachable when a hardware delivery doesn't match what was ordered. We're a short drive from most of Zirakpur — VIP Road, Patiala Road, Peer Muchalla, Dhakoli, Baltana — so site visits, material swatch checks and the inevitable mid-project question happen in person, not over three days of WhatsApp back-and-forth.",
      "Most of our Zirakpur work is a mix of independent houses and builder floors along the newer residential stretches, plus a growing number of apartment complexes on VIP Road. Both come with more usable floor area than you'd get in an older Chandigarh Sector home, which changes how we design — there's more room to plan an island kitchen or a proper walk-in wardrobe instead of squeezing storage into leftover space.",
    ],
    services: [
      {
        title: "Modular Kitchens",
        description:
          "Zirakpur's newer independent houses and builder floors tend to have generously sized kitchens compared to older tricity housing stock — we design around that extra floor area with L-shaped, parallel and island layouts, rather than defaulting to a standard template because that's what fits.",
      },
      {
        title: "Wardrobes",
        description:
          "Sliding and hinged wardrobes built to the exact wall dimensions of your room, with internal layouts planned around what you actually own — not a generic shelf-and-rod split that leaves half the space unused.",
        learnMoreHref: "/custom-wardrobe-design",
      },
      {
        title: "Custom Carpentry",
        description:
          "Study units, crockery units, pooja units and staircase storage — one-off carpentry pieces measured and built for your specific room, not picked off a catalogue.",
      },
      {
        title: "TV Panels",
        description:
          "Media wall units that hide the cable clutter and route wiring properly, finished in wood veneer, stone or backlit panels to match the rest of the room.",
      },
    ],
    gallery: [
      { src: "/projects/navy-parallel-kitchen/front.png", caption: "Parallel kitchen layout — from our portfolio" },
      { src: "/projects/sage-green-wardrobe/front.png", caption: "Sliding wardrobe with sage-green shutters — from our portfolio" },
      { src: "/projects/stacked-stone-tv-panel/front.png", caption: "Stacked-stone TV panel — from our portfolio" },
    ],
    galleryNote: "A sample of our completed carpentry work. Get in touch and we'll walk you through projects closer to your part of Zirakpur.",
    whyChooseUs: [
      {
        title: "A studio you can actually visit",
        description: "Highland Marg, off the Patiala highway — come see board and laminate samples in person before you commit to a finish.",
      },
      {
        title: "Fast site visits",
        description: "Being based in Zirakpur means we're typically on-site within a day or two of your enquiry, not scheduling around a two-hour commute.",
      },
      {
        title: "We measure for your space, not a template",
        description: "Every kitchen and wardrobe is designed against your actual wall dimensions and how you use the room — not resized from a standard layout.",
      },
      {
        title: "One point of contact, start to finish",
        description: "The same team that measures your site handles design, execution and the final walkthrough — no handoffs between departments.",
      },
    ],
    faqs: [
      {
        question: "Do you have a showroom I can visit in Zirakpur?",
        answer: "Yes — our studio is on Highland Marg, off the Patiala highway. You're welcome to come look at board, laminate and hardware samples before deciding on a finish.",
      },
      {
        question: "Which areas around Zirakpur do you cover?",
        answer: "VIP Road, Patiala Road, Peer Muchalla, Dhakoli, Baltana and the surrounding residential sectors. If you're just outside this area, get in touch — we cover the wider tricity region too.",
      },
      {
        question: "How soon can you do a site visit?",
        answer: "Since we're based locally, we can usually schedule a measurement visit within a day or two of your enquiry.",
      },
      {
        question: "Do you work on both independent houses and apartments?",
        answer: "Yes — Zirakpur has a mix of both, and we design differently for each. Independent houses usually give us more floor area to plan with; apartments need tighter, more efficient layouts.",
      },
      {
        question: "Can I get an instant estimate before booking a site visit?",
        answer: "Yes — use the Get a Free Quote button below to get an instant price range for your kitchen, wardrobe, flooring or ceiling based on your area, before you commit to a site visit.",
      },
    ],
  },
  {
    slug: "chandigarh",
    city: "Chandigarh",
    metaTitle: "Interior Designer in Chandigarh — Kitchens & Carpentry for Sector Homes",
    metaDescription:
      "Interior design and modular kitchen carpentry for Chandigarh's Sector homes and newer apartments, working within the city's building bylaws. Modular kitchens, wardrobes, custom carpentry and TV panels.",
    heroHeadline: "Interior Designer in Chandigarh",
    heroSubtext: "Kitchens and carpentry designed to fit Chandigarh's Sector-home layouts and building bylaws — not a one-size-fits-all template.",
    heroImage: "/projects/airbnb-rental-kitchen/front.png",
    intro: [
      "Chandigarh's Sector homes weren't built with modular kitchens or walk-in wardrobes in mind. Le Corbusier's grid gave the city clean streets and fixed plot sizes, not flexible floor plans — and the Estate Office's building bylaws are strict about structural changes, especially in the older, lower-numbered Sectors. Most of the interior work we do here works within an existing structure: fitting a full kitchen into a kitchen alcove that hasn't changed size since the house was built decades ago, or converting an underused box room into a proper wardrobe and dressing space.",
      "The newer end of Chandigarh — high-rises around the IT Park and the extended Sectors toward Mullanpur — is a different problem entirely: bare or semi-finished apartments where everything from kitchen carcass to wardrobe needs to be built from scratch, closer to what we do in Mohali. We work across both ends: older Sector homes needing a careful retrofit, and newer apartments needing a full fit-out.",
    ],
    services: [
      {
        title: "Modular Kitchens",
        description:
          "For Sector homes, we design to fit the existing kitchen footprint without touching load-bearing walls — often the biggest gain is smarter storage within the same square footage. For newer IT Park apartments, we build the full modular kitchen from a bare shell.",
        learnMoreHref: "/modular-kitchen-chandigarh",
      },
      {
        title: "Wardrobes",
        description:
          "Converting an existing wardrobe niche or a spare box room into proper sliding or hinged storage, sized to what Chandigarh's older homes actually have to offer — usually less wall width than newer construction, so layout planning matters more.",
        learnMoreHref: "/custom-wardrobe-design",
      },
      {
        title: "Custom Carpentry",
        description:
          "Study units, pooja units and storage pieces built around fixed room dimensions and existing electrical points, since rewiring inside an older Sector home usually isn't worth the disruption for a small carpentry job.",
      },
      {
        title: "TV Panels",
        description:
          "Media walls for both the classic Chandigarh drawing room and newer apartment living rooms — finish and scale chosen to suit the room's proportions rather than a single default size.",
      },
    ],
    gallery: [
      { src: "/projects/airbnb-rental-kitchen/front.png", caption: "Compact galley kitchen fit-out — from our portfolio" },
      { src: "/projects/olive-wardrobe-with-bench/front.png", caption: "Wardrobe with built-in bench seating — from our portfolio" },
      { src: "/projects/fluted-ivory-tv-panel/front.png", caption: "Fluted ivory TV panel — from our portfolio" },
    ],
    galleryNote: "A sample of our completed carpentry work. Tell us your Sector and we'll advise on what's realistic within Chandigarh's building norms.",
    whyChooseUs: [
      {
        title: "We work within Chandigarh's bylaws",
        description: "No structural changes, no shortcuts that create problems at resale or with the Estate Office — every design respects what can and can't be altered.",
      },
      {
        title: "Experience across Sector vintages",
        description: "Older Sector homes and newer IT Park apartments need genuinely different approaches — we don't apply the same playbook to both.",
      },
      {
        title: "Retrofits without full demolition",
        description: "Most of our Chandigarh kitchen work happens without touching plumbing or electrical risers, which keeps cost and disruption down.",
      },
      {
        title: "Straightforward, itemised pricing",
        description: "You'll know what board, hardware and finish you're paying for before work starts — no vague lump-sum quotes.",
      },
    ],
    faqs: [
      {
        question: "Can you work within Chandigarh's building bylaws?",
        answer: "Yes — we don't alter load-bearing walls or structural elements. Our designs work within the existing shell of your home, which is how most interior work in Chandigarh's Sectors has to be done anyway.",
      },
      {
        question: "Do you work on older Sector homes as well as new apartments?",
        answer: "Both. Older Sector homes usually need a careful retrofit around an existing layout; newer apartments near the IT Park often need a full fit-out from a bare shell.",
      },
      {
        question: "Can you renovate just the kitchen without touching the rest of the house?",
        answer: "Yes, that's the majority of our Chandigarh work — a contained kitchen or wardrobe project that doesn't require opening up other rooms.",
      },
      {
        question: "Do I need society or RWA approval for interior work in a Chandigarh apartment?",
        answer: "For non-structural interior carpentry, most societies don't require formal approval, but it varies by building. We'll flag it during the site visit if your specific society needs a heads-up.",
      },
      {
        question: "Can I get an instant estimate before booking a site visit?",
        answer: "Yes — use the Get a Free Quote button below to get an instant price range for your kitchen, wardrobe, flooring or ceiling based on your area.",
      },
    ],
  },
  {
    slug: "mohali",
    city: "Mohali",
    metaTitle: "Interior Designer in Mohali — Kitchen & Wardrobe Fit-Outs for New Apartments",
    metaDescription:
      "Full interior fit-outs for Mohali's builder-delivered apartments and group housing societies. Real completed project in Mohali Sector 59. Modular kitchens, wardrobes, custom carpentry and TV panels.",
    heroHeadline: "Interior Designer in Mohali",
    heroSubtext: "Full kitchen and wardrobe fit-outs for Mohali's new apartments — built from the bare shell your builder handed over.",
    heroImage: "/projects/mohali-sector-59-kitchen/front.png",
    intro: [
      "Mohali's growth has mostly happened in group housing societies — the towers along Airport Road, IT City and the Sector 66–125 belt that came with SAS Nagar's IT-sector boom. Almost every one of these apartments is handed over as a bare or semi-finished shell: electrical points and plumbing stubbed in by the builder, everything else — kitchen, wardrobes, false ceiling — left for the owner to fit out. That's a very different starting point from an older Chandigarh Sector home, and it's the majority of the work we do in Mohali.",
      "We completed a full modular kitchen fit-out in Mohali, Sector 59, in 2026 — start to finish, from the bare shell the builder delivered to a working L-shaped kitchen with soft-close hardware. It's a real project with real progress photos below, not a rendering.",
    ],
    services: [
      {
        title: "Modular Kitchens",
        description:
          "Full kitchen builds from a bare shell — carcass, shutters, countertop and hardware — sized to match the kitchen footprint your builder actually gave you, which varies noticeably between towers even within the same society.",
      },
      {
        title: "Wardrobes",
        description:
          "Sliding or hinged wardrobes built into bedroom alcoves that are standard across a tower's floor plan, so we can usually plan the layout from your builder's floor plan before we even visit.",
        learnMoreHref: "/custom-wardrobe-design",
      },
      {
        title: "Custom Carpentry",
        description:
          "Study units, TV consoles and storage pieces that work with the compact room dimensions typical of newer Mohali apartments, where every square foot is planned for.",
      },
      {
        title: "TV Panels",
        description:
          "Media walls sized for apartment-format living rooms, with wiring routed cleanly through the wall rather than left exposed along the skirting.",
      },
    ],
    gallery: [
      { src: "/projects/mohali-sector-59-kitchen/front.png", caption: "Completed kitchen — Mohali, Sector 59 (2026)" },
      { src: "/projects/mohali-sector-59-kitchen/phase-2-working-drawing.png", caption: "Working drawing stage — Mohali, Sector 59" },
      { src: "/projects/mohali-sector-59-kitchen/phase-4-final-finish.png", caption: "Final finish — Mohali, Sector 59" },
    ],
    galleryNote: "This is a real, completed project in Mohali, Sector 59 — not a reference image. See the full phase-by-phase story on our Projects page.",
    whyChooseUs: [
      {
        title: "We've built in Mohali before",
        description: "A completed kitchen fit-out in Sector 59 means we already understand builder floor plans and bare-shell handover in this market.",
      },
      {
        title: "Built around possession timelines",
        description: "We know Mohali buyers are usually working against a possession or move-in date, and we plan the build schedule around that.",
      },
      {
        title: "Familiar with GMADA society norms",
        description: "Group housing societies in Mohali often have their own material-movement and work-hour rules — we plan around them rather than finding out on day one.",
      },
      {
        title: "One quote, no surprise add-ons",
        description: "Bare-shell fit-outs can balloon in cost if scope isn't nailed down early — we itemise everything before work starts.",
      },
    ],
    faqs: [
      {
        question: "Do you work with builder-delivered bare-shell flats?",
        answer: "Yes — most of our Mohali work starts from exactly this: a bare or semi-finished shell with only electrical and plumbing points in place.",
      },
      {
        question: "Can you complete the interior before our possession or move-in date?",
        answer: "We plan the build schedule around your possession date wherever possible — tell us the date during the site visit and we'll confirm what's realistic.",
      },
      {
        question: "Do you have experience with Mohali's group housing societies?",
        answer: "Yes, including GMADA-developed societies — we're used to planning around material-movement timings and society work-hour rules.",
      },
      {
        question: "Can I see a real Mohali project you've completed?",
        answer: "Yes — our Mohali, Sector 59 kitchen is a fully completed, real project. Phase-by-phase photos are above and on our Projects page.",
      },
      {
        question: "Can I get an instant estimate before booking a site visit?",
        answer: "Yes — use the Get a Free Quote button below to get an instant price range for your kitchen, wardrobe, flooring or ceiling based on your area.",
      },
    ],
  },
  {
    slug: "panchkula",
    city: "Panchkula",
    metaTitle: "Interior Designer in Panchkula — Custom Carpentry for Independent Houses & Villas",
    metaDescription:
      "Interior design and custom carpentry for Panchkula's independent houses, kothis and larger-format homes. Modular kitchens, wardrobes, custom carpentry and TV panels for multi-room, multi-generational projects.",
    heroHeadline: "Interior Designer in Panchkula",
    heroSubtext: "Custom carpentry scaled for Panchkula's independent houses and kothis — bigger kitchens, bigger wardrobes, whole-house projects.",
    heroImage: "/projects/olive-wardrobe-with-bench/front.png",
    intro: [
      "Panchkula's housing stock skews larger than most of the tricity — independent houses and kothis across its Sectors tend to sit on bigger plots than their Chandigarh or Mohali equivalents, and a lot of homes here are multi-generational, with two or three families' worth of storage needs under one roof. That changes the brief: instead of a single kitchen or one wardrobe, we're often planning four or five wardrobes across different bedrooms, a kitchen with an island rather than a galley layout, and a TV wall sized for a genuinely large drawing room.",
      "We also see more traditional-meets-modern requests here than in newer apartment markets — clients wanting contemporary functionality (soft-close drawers, proper wardrobe organisers, a TV panel that actually hides the wiring) without losing the more classic look a larger, older-style home calls for.",
    ],
    services: [
      {
        title: "Modular Kitchens",
        description:
          "Panchkula's independent houses often have room for an island or a full U-shaped layout — we design for the extra floor area instead of defaulting to a compact apartment-style kitchen.",
      },
      {
        title: "Wardrobes",
        description:
          "Multi-bedroom, multi-generational homes usually mean planning several wardrobes at once, each sized to the occupant — a teenager's room and a grandparent's room don't need the same internal layout.",
        learnMoreHref: "/custom-wardrobe-design",
      },
      {
        title: "Custom Carpentry",
        description:
          "Larger drawing rooms and dining areas call for bigger crockery units, sideboards and study spaces — proportioned to the room rather than scaled down to fit an apartment-sized template.",
      },
      {
        title: "TV Panels",
        description:
          "Media walls built for genuinely large living rooms, often combined with display shelving and stone or veneer detailing that a smaller apartment room wouldn't have space for.",
      },
    ],
    gallery: [
      { src: "/projects/olive-wardrobe-with-bench/front.png", caption: "Wardrobe with built-in bench seating — from our portfolio" },
      { src: "/projects/navy-parallel-kitchen/front.png", caption: "Larger parallel kitchen layout — from our portfolio" },
      { src: "/projects/stacked-stone-tv-panel/front.png", caption: "Stacked-stone TV panel for a large drawing room — from our portfolio" },
    ],
    galleryNote: "A sample of our completed carpentry work. For multi-room or whole-house projects, we scope each space individually during the site visit.",
    whyChooseUs: [
      {
        title: "We scope whole-house projects, not just one room",
        description: "Multi-bedroom, multi-generational homes need a coordinated plan across rooms — we design the full brief, not one wardrobe in isolation.",
      },
      {
        title: "Built for larger floor plans",
        description: "Island kitchens, walk-in wardrobes and oversized TV walls need different structural and hardware choices than compact apartment carpentry — we plan for the scale from the start.",
      },
      {
        title: "One team across every room",
        description: "The same design and execution team handles every room in the house, so finishes and hardware stay consistent from the kitchen to the last bedroom.",
      },
      {
        title: "Clear, room-by-room pricing",
        description: "On multi-room projects, you get an itemised cost per room — so you can sequence the work, or hold off on a room, without redoing the whole quote.",
      },
    ],
    faqs: [
      {
        question: "Do you take on full-house interior projects, not just one room?",
        answer: "Yes — a lot of our Panchkula work is exactly this: kitchen, multiple wardrobes and living-room carpentry planned together as one project.",
      },
      {
        question: "Can you design a kitchen with an island, not just a straight or L-shaped layout?",
        answer: "Yes, where the room allows it — Panchkula's larger kitchens often have the floor area for an island, and we'll tell you honestly if yours doesn't.",
      },
      {
        question: "Which areas of Panchkula do you serve?",
        answer: "Panchkula's Sectors, MDC, and the surrounding independent-house neighbourhoods. Get in touch and we'll confirm for your specific address.",
      },
      {
        question: "Can you match a traditional look with modern storage functionality?",
        answer: "Yes — this is one of the most common briefs we get in Panchkula: soft-close hardware and proper internal organisers, without the room looking like a builder-flat template.",
      },
      {
        question: "Can I get an instant estimate before booking a site visit?",
        answer: "Yes — use the Get a Free Quote button below to get an instant price range for your kitchen, wardrobe, flooring or ceiling based on your area.",
      },
    ],
  },
];

export function getLocalSeoPage(slug: string | undefined): LocalSeoPageContent | undefined {
  return LOCAL_SEO_PAGES.find((p) => p.slug === slug);
}
