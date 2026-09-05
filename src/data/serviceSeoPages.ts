export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceHighlight {
  title: string;
  description: string;
}

export interface ServiceGalleryImage {
  src: string;
  caption: string;
}

export interface ServiceSeoPageContent {
  slug: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  intro: string[];
  highlightsTitle: string;
  highlights: ServiceHighlight[];
  gallery: ServiceGalleryImage[];
  galleryNote: string;
  whyChooseUsTitle: string;
  whyChooseUs: ServiceHighlight[];
  faqs: ServiceFaq[];
}

export const SERVICE_SEO_PAGES: ServiceSeoPageContent[] = [
  {
    slug: "modular-kitchen-chandigarh",
    eyebrow: "Modular Kitchens in Chandigarh",
    metaTitle: "Modular Kitchen Design in Chandigarh — L-Shaped, U-Shaped & Island Layouts",
    metaDescription:
      "Modular kitchen design and installation in Chandigarh — L-shaped, U-shaped, parallel and island layouts, built to fit Sector-home kitchen alcoves or a bare-shell apartment. Get an instant price estimate.",
    heroHeadline: "Modular Kitchen Design in Chandigarh",
    heroSubtext: "L-shaped, U-shaped, parallel and island layouts — designed to fit a Sector-home kitchen alcove as easily as a new apartment shell.",
    heroImage: "/projects/navy-parallel-kitchen/front.png",
    intro: [
      "Most Chandigarh kitchens fall into one of two very different starting points. In an older Sector home, the kitchen is usually a fixed alcove — a set footprint that hasn't changed shape since the house was built, with a gas point and drainage line that we design around rather than move. In a newer apartment near the IT Park or the extended Sectors toward Mullanpur, the kitchen is closer to a blank shell, and the layout is only limited by the room's own dimensions.",
      "We design for both. That means the same 'modular kitchen' conversation looks different depending on which one you're starting from — a retrofit in a Sector-33 kitchen alcove is a different design problem to a full build in a Sector-82 apartment, even though both end up as a modular kitchen with soft-close hardware and a laminate or acrylic finish.",
    ],
    highlightsTitle: "Kitchen Layouts We Design",
    highlights: [
      {
        title: "L-Shaped Kitchens",
        description:
          "The most common fit for a Sector-home kitchen alcove — two adjacent walls used efficiently without needing extra floor area, with the sink and hob split across the corner for a workable triangle.",
      },
      {
        title: "U-Shaped Kitchens",
        description:
          "Three walls of counter and storage for kitchens with more depth — common in some of Chandigarh's larger independent houses and older Sector kothis with a dedicated kitchen room rather than an alcove.",
      },
      {
        title: "Parallel Kitchens",
        description:
          "Two facing counters connected by a walkway — a good fit for the narrower, elongated kitchen shape found in many mid-size Chandigarh apartments and Sector homes.",
      },
      {
        title: "Island Kitchens",
        description:
          "Needs real floor area to work, which rules it out for most older Sector kitchens — but it's increasingly requested in Chandigarh's newer, larger apartment developments.",
      },
    ],
    gallery: [
      { src: "/projects/navy-parallel-kitchen/front.png", caption: "Parallel kitchen layout — from our portfolio" },
      { src: "/projects/airbnb-rental-kitchen/front.png", caption: "Compact galley kitchen fit-out — from our portfolio" },
      { src: "/projects/mohali-sector-59-kitchen/front.png", caption: "Completed L-shaped modular kitchen, Mohali Sector 59" },
    ],
    galleryNote: "A sample of our completed kitchen work across the tricity. Tell us your Sector and kitchen size and we'll advise on which layout actually fits.",
    whyChooseUsTitle: "Why Choose Dhiman Interiors for Your Chandigarh Kitchen",
    whyChooseUs: [
      {
        title: "We don't touch structural walls",
        description: "Every Chandigarh kitchen design works within the Estate Office's building bylaws — no load-bearing changes, no approvals headache.",
      },
      {
        title: "Real board and finish options",
        description: "HDHMR and BWR-grade boards, with laminate, PU, acrylic, veneer, membrane or glass shutter finishes — chosen for your budget and use, not a single default.",
      },
      {
        title: "Instant online pricing",
        description: "Get a price range for your exact kitchen area before you book a site visit — no waiting on a callback for a ballpark number.",
      },
      {
        title: "Experience across Sector vintages",
        description: "Older alcove kitchens and newer bare-shell apartments need different design approaches — we've worked on both across Chandigarh.",
      },
    ],
    faqs: [
      {
        question: "How much does a modular kitchen cost in Chandigarh?",
        answer: "It depends on your kitchen's area, board grade and shutter finish. Use our instant quote calculator to get an accurate estimate based on your kitchen's actual size — it takes about a minute.",
      },
      {
        question: "What kitchen layouts do you offer?",
        answer: "L-shaped, U-shaped, parallel and island layouts. Which one fits depends on your kitchen's dimensions — we'll tell you honestly during the site visit if a layout you want isn't realistic for the space.",
      },
      {
        question: "Can you fit a modular kitchen into an older Chandigarh Sector home?",
        answer: "Yes — this is most of our Chandigarh kitchen work. We design around the existing alcove, gas point and drainage line rather than requiring structural changes.",
      },
      {
        question: "What board and finish options are available?",
        answer: "HDHMR and BWR-grade carcass boards, with laminate, PU, acrylic, veneer, membrane or glass shutter finishes, plus a choice of hardware brands for hinges and drawer channels.",
      },
      {
        question: "Do you offer soft-close hardware?",
        answer: "Yes, soft-close hinges and drawer channels are available across our hardware brand options.",
      },
    ],
  },
  {
    slug: "custom-wardrobe-design",
    eyebrow: "Custom Wardrobe Design",
    metaTitle: "Custom Wardrobe Design — Sliding & Hinged Wardrobes",
    metaDescription:
      "Custom sliding and hinged wardrobe design across Zirakpur, Chandigarh, Mohali and Panchkula. Standard, Premium and Acrylic finishes, built to your exact room dimensions. Get an instant price estimate.",
    heroHeadline: "Custom Wardrobe Design",
    heroSubtext: "Sliding and hinged wardrobes built to your exact wall dimensions — not a standard size padded out with extra shelving.",
    heroImage: "/projects/sage-green-wardrobe/front.png",
    intro: [
      "A wardrobe bought off a catalogue is sized for an average room, not yours. Most bedrooms across the tricity have an odd wall width, an unexpected beam, or a door swing that eats into usable space — and a standard-size unit either leaves a gap or doesn't fit at all. We measure the actual wall and build to it, which is the main reason a custom wardrobe ends up holding noticeably more than a bought one of the same rough size.",
      "We offer this as a straightforward online estimate: pick your area (by entering the wall dimensions or a total square footage), choose a finish tier, and see standard and premium pricing side by side before you ever book a site visit. No back-and-forth for a ballpark number.",
    ],
    highlightsTitle: "Wardrobe Types We Build",
    highlights: [
      {
        title: "Sliding Door Wardrobes",
        description:
          "No door-swing clearance needed, which makes them the better fit for smaller bedrooms or wardrobes placed close to a bed or window.",
      },
      {
        title: "Hinged Door Wardrobes",
        description:
          "The more traditional format, with full access to every shelf at once — usually the right call where there's enough floor clearance for the doors to open.",
      },
      {
        title: "Walk-In Wardrobes & Dressing Areas",
        description:
          "For larger bedrooms or a dedicated dressing room, built with open shelving, hanging space and a mirror unit rather than a single wall of shutters.",
      },
      {
        title: "Internal Organisers",
        description:
          "Pull-out trouser racks, jewellery trays, shoe racks and drawer dividers — the detail that decides whether a wardrobe actually stays organised after the first month.",
      },
    ],
    gallery: [
      { src: "/projects/sage-green-wardrobe/front.png", caption: "Sliding wardrobe with sage-green shutters — from our portfolio" },
      { src: "/projects/olive-wardrobe-with-bench/front.png", caption: "Wardrobe with built-in bench seating — from our portfolio" },
      { src: "/wardrobe-inspiration/sliding/637638843872201466249.png", caption: "Sliding wardrobe — reference image for inspiration, not one of our own projects" },
    ],
    galleryNote: "A sample of our completed wardrobe work, plus a reference image for style inspiration only.",
    whyChooseUsTitle: "Why Choose Dhiman Interiors for Your Wardrobe",
    whyChooseUs: [
      {
        title: "Three clear finish tiers",
        description: "Standard (0.8mm laminate), Premium (Action Tesa HDHMR board, 1mm laminate, premium hardware) or Acrylic (high-gloss finish) — see all three priced side by side.",
      },
      {
        title: "Built to your wall, not a template",
        description: "We measure your actual room before finalising the design, so the wardrobe uses the full width and height available.",
      },
      {
        title: "Instant online pricing",
        description: "Enter your area and get a real price for each finish tier immediately — no waiting for a callback.",
      },
      {
        title: "Serving the whole tricity",
        description: "Zirakpur, Chandigarh, Mohali and Panchkula — one studio, one team, consistent quality across every project.",
      },
    ],
    faqs: [
      {
        question: "What wardrobe finishes do you offer?",
        answer: "Three tiers: Standard (HDHMR board, 0.8mm laminate finish, standard hardware), Premium (Action Tesa HDHMR board, 1mm laminate, premium hardware brand), and Acrylic (Action Tesa HDHMR board, high-gloss 1mm acrylic finish, premium hardware).",
      },
      {
        question: "How is wardrobe pricing calculated?",
        answer: "By area — enter your wardrobe's square footage (or its length and width) in our online calculator and get an instant price for each finish tier.",
      },
      {
        question: "Sliding or hinged doors — which is better?",
        answer: "Sliding doors suit tighter spaces since they need no swing clearance; hinged doors give full access to every shelf at once and usually cost less. We'll advise based on your room during the site visit.",
      },
      {
        question: "Do you build walk-in wardrobes?",
        answer: "Yes, where the room has the space — open shelving, hanging space and a dedicated dressing area rather than a single wall of shutters.",
      },
      {
        question: "Which areas do you serve?",
        answer: "Zirakpur, Chandigarh, Mohali and Panchkula. See our dedicated pages for each city for local details.",
      },
    ],
  },
];

export function getServiceSeoPage(slug: string | undefined): ServiceSeoPageContent | undefined {
  return SERVICE_SEO_PAGES.find((p) => p.slug === slug);
}
