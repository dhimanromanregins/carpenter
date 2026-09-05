# Placeholder business data — every price/brand/product here is an editable
# starting point, not a real price list.

CATEGORIES = [
    {"code": "BOARD", "name": "Carcass Board", "slug": "board"},
    {"code": "SHUTTER", "name": "Shutter / Laminate Finish", "slug": "shutter"},
    {"code": "GLASS_CABINET", "name": "Glass Cabinets", "slug": "glass-cabinet"},
    {"code": "PANTRY", "name": "Pantry Unit", "slug": "pantry"},
    {"code": "HARDWARE_HINGES", "name": "Hinges", "slug": "hardware-hinges"},
    {"code": "HARDWARE_DRAWER_CHANNELS", "name": "Drawer Channels", "slug": "hardware-drawer-channels"},
    {"code": "HARDWARE_PANTRY", "name": "Pantry Hardware", "slug": "hardware-pantry"},
    {"code": "HARDWARE_LIFT_UP", "name": "Lift-Up Systems", "slug": "hardware-lift-up"},
    {"code": "HARDWARE_OTHER", "name": "Other Hardware", "slug": "hardware-other"},
    {"code": "ROLLING_SHUTTER", "name": "Rolling Shutter", "slug": "rolling-shutter"},
    {"code": "SCREW", "name": "Screws & Fasteners", "slug": "screw"},
    {"code": "LIGHTING", "name": "Kitchen Lighting", "slug": "lighting"},
]

# (slug, name, primary_category_code, tier)
BRANDS = [
    ("fevicol", "Fevicol", "HARDWARE_OTHER", "STANDARD"),
    ("hettich", "Hettich", "HARDWARE_HINGES", "LUXURY"),
    ("hafle", "Hafle", "HARDWARE_HINGES", "LUXURY"),
    ("ebco", "Ebco", "HARDWARE_HINGES", "LUXURY"),
    ("action-tesa", "Action Tesa", "BOARD", "STANDARD"),
    ("century-ply", "Century Ply", "BOARD", "STANDARD"),
    ("greenply", "Greenply", "BOARD", "LUXURY"),
    ("merino", "Merino", "SHUTTER", "STANDARD"),
    ("greenlam", "Greenlam", "SHUTTER", "LUXURY"),
    ("stanley", "Stanley", "SCREW", "STANDARD"),
    ("gkw", "GKW", "SCREW", "STANDARD"),
    ("studio-standard", "Studio Standard", "PANTRY", "STANDARD"),
]

# (slug, name, brand_slug, category_code, tier, grade, unit, price_field, price, features)
PRODUCTS = [
    # Boards
    ("action-tesa-hdhmr", "Action Tesa HDHMR Board", "action-tesa", "BOARD", "STANDARD", "HDHMR", "sqft", "price_per_sqft", 95, {"thickness": "18mm"}),
    ("century-ply-mr", "Century Ply MR Grade Board", "century-ply", "BOARD", "STANDARD", "MR", "sqft", "price_per_sqft", 110, {"thickness": "18mm"}),
    ("greenply-marine", "Greenply Marine Ply Board", "greenply", "BOARD", "LUXURY", "BWP", "sqft", "price_per_sqft", 165, {"thickness": "19mm"}),
    # Shutters — one per finish type
    ("merino-laminate", "Merino Laminate Shutter", "merino", "SHUTTER", "STANDARD", "", "sqft", "price_per_sqft", 180, {"finish_type": "Laminate"}),
    ("greenlam-acrylic", "Greenlam Acrylic Shutter", "greenlam", "SHUTTER", "LUXURY", "", "sqft", "price_per_sqft", 320, {"finish_type": "Acrylic"}),
    ("merino-pu", "Merino PU Finish Shutter", "merino", "SHUTTER", "STANDARD", "", "sqft", "price_per_sqft", 280, {"finish_type": "PU"}),
    ("greenlam-veneer", "Greenlam Veneer Shutter", "greenlam", "SHUTTER", "LUXURY", "", "sqft", "price_per_sqft", 350, {"finish_type": "Veneer"}),
    ("merino-membrane", "Merino Membrane Shutter", "merino", "SHUTTER", "STANDARD", "", "sqft", "price_per_sqft", 210, {"finish_type": "Membrane"}),
    ("greenlam-glass", "Greenlam Glass Shutter", "greenlam", "SHUTTER", "LUXURY", "", "sqft", "price_per_sqft", 300, {"finish_type": "Glass"}),
    # Glass cabinets
    ("standard-glass-cabinet", "Standard Glass Cabinet", "studio-standard", "GLASS_CABINET", "STANDARD", "", "piece", "price_per_piece", 7000, {}),
    ("custom-glass-cabinet", "Custom Glass Cabinet", "studio-standard", "GLASS_CABINET", "STANDARD", "", "sqft", "price_per_sqft", 850, {}),
    # Pantry types
    ("pantry-single", "Pantry Unit - Single", "studio-standard", "PANTRY", "STANDARD", "", "piece", "price_per_piece", 12000, {"pantry_type": "SINGLE"}),
    ("pantry-double", "Pantry Unit - Double", "studio-standard", "PANTRY", "STANDARD", "", "piece", "price_per_piece", 20000, {"pantry_type": "DOUBLE"}),
    ("pantry-triple", "Pantry Unit - Triple", "studio-standard", "PANTRY", "LUXURY", "", "piece", "price_per_piece", 28000, {"pantry_type": "TRIPLE"}),
    # Hardware — 4 brands x 5 sub-categories, all priced per running ft (a
    # simplification: lift-up/other hardware would realistically be priced
    # per-unit in a real system, but a uniform running-ft basis keeps the
    # placeholder pricing engine consistent across all 4 general categories).
    ("fevicol-hinges", "Fevicol Hinges", "fevicol", "HARDWARE_HINGES", "STANDARD", "", "running_ft", "price_per_running_ft", 120, {}),
    ("hettich-hinges", "Hettich Hinges", "hettich", "HARDWARE_HINGES", "LUXURY", "", "running_ft", "price_per_running_ft", 320, {}),
    ("hafle-hinges", "Hafle Hinges", "hafle", "HARDWARE_HINGES", "LUXURY", "", "running_ft", "price_per_running_ft", 300, {}),
    ("ebco-hinges", "Ebco Hinges", "ebco", "HARDWARE_HINGES", "LUXURY", "", "running_ft", "price_per_running_ft", 280, {}),
    ("fevicol-drawer-channels", "Fevicol Drawer Channels", "fevicol", "HARDWARE_DRAWER_CHANNELS", "STANDARD", "", "running_ft", "price_per_running_ft", 150, {}),
    ("hettich-drawer-channels", "Hettich Drawer Channels", "hettich", "HARDWARE_DRAWER_CHANNELS", "LUXURY", "", "running_ft", "price_per_running_ft", 380, {}),
    ("hafle-drawer-channels", "Hafle Drawer Channels", "hafle", "HARDWARE_DRAWER_CHANNELS", "LUXURY", "", "running_ft", "price_per_running_ft", 360, {}),
    ("ebco-drawer-channels", "Ebco Drawer Channels", "ebco", "HARDWARE_DRAWER_CHANNELS", "LUXURY", "", "running_ft", "price_per_running_ft", 340, {}),
    ("fevicol-pantry-hardware", "Fevicol Pantry Hardware", "fevicol", "HARDWARE_PANTRY", "STANDARD", "", "piece", "price_per_piece", 2500, {}),
    ("hettich-pantry-hardware", "Hettich Pantry Hardware", "hettich", "HARDWARE_PANTRY", "LUXURY", "", "piece", "price_per_piece", 8500, {}),
    ("hafle-pantry-hardware", "Hafle Pantry Hardware", "hafle", "HARDWARE_PANTRY", "LUXURY", "", "piece", "price_per_piece", 7800, {}),
    ("ebco-pantry-hardware", "Ebco Pantry Hardware", "ebco", "HARDWARE_PANTRY", "LUXURY", "", "piece", "price_per_piece", 6200, {}),
    ("fevicol-lift-up", "Fevicol Lift-Up System", "fevicol", "HARDWARE_LIFT_UP", "STANDARD", "", "running_ft", "price_per_running_ft", 200, {}),
    ("hettich-lift-up", "Hettich Lift-Up System", "hettich", "HARDWARE_LIFT_UP", "LUXURY", "", "running_ft", "price_per_running_ft", 500, {}),
    ("hafle-lift-up", "Hafle Lift-Up System", "hafle", "HARDWARE_LIFT_UP", "LUXURY", "", "running_ft", "price_per_running_ft", 480, {}),
    ("ebco-lift-up", "Ebco Lift-Up System", "ebco", "HARDWARE_LIFT_UP", "LUXURY", "", "running_ft", "price_per_running_ft", 450, {}),
    ("fevicol-other-hardware", "Fevicol Other Hardware", "fevicol", "HARDWARE_OTHER", "STANDARD", "", "running_ft", "price_per_running_ft", 100, {}),
    ("hettich-other-hardware", "Hettich Other Hardware", "hettich", "HARDWARE_OTHER", "LUXURY", "", "running_ft", "price_per_running_ft", 250, {}),
    ("hafle-other-hardware", "Hafle Other Hardware", "hafle", "HARDWARE_OTHER", "LUXURY", "", "running_ft", "price_per_running_ft", 230, {}),
    ("ebco-other-hardware", "Ebco Other Hardware", "ebco", "HARDWARE_OTHER", "LUXURY", "", "running_ft", "price_per_running_ft", 220, {}),
    # Rolling shutters
    ("studio-rolling-shutter", "Aluminium Rolling Shutter", "studio-standard", "ROLLING_SHUTTER", "STANDARD", "", "sqft", "price_per_sqft", 450, {}),
    ("premium-rolling-shutter", "Premium PVC Rolling Shutter", "studio-standard", "ROLLING_SHUTTER", "LUXURY", "", "sqft", "price_per_sqft", 650, {}),
    # Screws
    ("fevicol-screws-fasteners", "Fevicol Screws & Fasteners", "fevicol", "SCREW", "STANDARD", "", "piece", "price_per_piece", 800, {}),
    ("gkw-screws", "GKW Screws & Fasteners", "gkw", "SCREW", "STANDARD", "", "piece", "price_per_piece", 950, {}),
    ("stanley-screws", "Stanley Screws & Fasteners", "stanley", "SCREW", "STANDARD", "", "piece", "price_per_piece", 1100, {}),
    # Lighting
    ("led-strip-light", "LED Strip Light", "studio-standard", "LIGHTING", "STANDARD", "", "piece", "price_per_piece", 1500, {}),
    ("profile-light", "Profile Light", "studio-standard", "LIGHTING", "STANDARD", "", "piece", "price_per_piece", 2200, {}),
    ("cabinet-spotlight", "Cabinet Spotlight", "studio-standard", "LIGHTING", "LUXURY", "", "piece", "price_per_piece", 1800, {}),
]

# (id, name, rate_per_sqft, included_items, description, display_order)
PACKAGES = [
    (
        "standard",
        "Standard Kitchen",
        1800,
        [
            "Standard-grade carcass board (BWR/MR)",
            "Standard hardware (Fevicol-grade fittings)",
            "Standard laminate shutter finish",
            "Basic screws & fasteners",
        ],
        "Reliable, market-standard kitchen build.",
        1,
    ),
    (
        "premium",
        "Premium Kitchen",
        2200,
        [
            "Upgraded board grade",
            "Choice of premium hardware brand (Hettich / Hafle / Ebco)",
            "PU/acrylic shutter finish options",
            "Soft-close fittings",
        ],
        "Premium hardware brand of your choice, upgraded finishes.",
        2,
    ),
    (
        "ultra_premium",
        "Ultra Premium Kitchen",
        2400,
        [
            "Top-grade board and finishes",
            "Premium hardware brand bundled",
            "Premium lighting package",
            "Rolling shutter included",
        ],
        "Fully loaded — premium hardware, lighting, and rolling shutters bundled in.",
        3,
    ),
]

PRICING_SETTINGS = [
    ("installation_pct", 0.10, "Installation fee as a fraction of subtotal"),
    ("tax_pct", 0.18, "Tax as a fraction of (subtotal + installation)"),
    ("default_board_product_slug", "action-tesa-hdhmr", "Fallback board product when none is selected"),
    ("default_shutter_product_slug", "merino-laminate", "Fallback shutter product when none is selected"),
    ("default_screw_product_slug", "fevicol-screws-fasteners", "Fallback screw product when none is selected"),
    ("default_hardware_hinges_product_slug", "fevicol-hinges", "Fallback hinges product"),
    ("default_hardware_drawer_channels_product_slug", "fevicol-drawer-channels", "Fallback drawer-channel product"),
    ("default_hardware_pantry_product_slug", "fevicol-pantry-hardware", "Fallback pantry-hardware product"),
    ("default_hardware_lift_up_product_slug", "fevicol-lift-up", "Fallback lift-up product"),
    ("default_hardware_other_product_slug", "fevicol-other-hardware", "Fallback other-hardware product"),
    ("default_glass_cabinet_standard_slug", "standard-glass-cabinet", "Standard glass cabinet product"),
    ("default_glass_cabinet_custom_slug", "custom-glass-cabinet", "Custom-size glass cabinet rate product"),
    ("default_rolling_shutter_product_slug", "studio-rolling-shutter", "Fallback rolling shutter product"),
    ("wardrobe_standard_rate_per_sqft", 1200, "Wardrobe Standard finish rate per sq.ft."),
    ("wardrobe_premium_rate_per_sqft", 1400, "Wardrobe Premium finish rate per sq.ft."),
    ("wardrobe_acrylic_rate_per_sqft", 1500, "Wardrobe Acrylic finish rate per sq.ft."),
    ("tiles_standard_rate_per_sqft", 120, "Tiles & Flooring Standard finish rate per sq.ft."),
    ("tiles_premium_rate_per_sqft", 150, "Tiles & Flooring Premium finish rate per sq.ft."),
    ("tiles_chemical_extra_per_sqft", 10, "Extra charge per sq.ft when chemical adhesive fixing is chosen"),
    ("ceiling_rate_per_sqft", 250, "False ceiling rate per sq.ft. (single tier, no Standard/Premium split)"),
]

CITIES = [
    {"name": "Chandigarh", "region": "North", "state": "Chandigarh"},
    {"name": "Mohali", "region": "North", "state": "Punjab"},
    {"name": "Panchkula", "region": "North", "state": "Haryana"},
    {"name": "Zirakpur", "region": "North", "state": "Punjab"},
    {"name": "Delhi", "region": "North", "state": "Delhi"},
]
