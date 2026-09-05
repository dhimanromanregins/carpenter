from sqlalchemy.orm import Session

from app.pricing.lookups import get_setting
from app.schemas.wardrobe import WardrobeCalculateRequest, WardrobeCalculateResponse, WardrobeTier, WardrobeTierOption

# Editable via the "wardrobe_<tier>_rate_per_sqft" pricing_settings rows; these
# are only the fallback if a row is missing.
DEFAULT_RATE_PER_SQFT: dict[WardrobeTier, float] = {"standard": 1200.0, "premium": 1400.0, "acrylic": 1500.0}

# Spec content isn't business-editable pricing data (like the rates above),
# so it lives in code rather than pricing_settings — same split as the
# Kitchen Package rows vs. their rate_per_sqft.
TIER_INFO: dict[WardrobeTier, dict] = {
    "standard": {
        "name": "Standard",
        "description": "Reliable, market-standard wardrobe build.",
        "included_items": [
            "HDHMR board carcass",
            "0.8mm laminate shutter finish",
            "Standard hinges & channels (Fevicol-grade)",
            "Standard edge banding",
            "Basic screws & fasteners",
        ],
    },
    "premium": {
        "name": "Premium",
        "description": "Upgraded laminate finish and hardware for a richer look.",
        "included_items": [
            "Action Tesa HDHMR board carcass",
            "1mm laminate shutter finish",
            "Premium hardware brand (Hettich / Hafle / Ebco) — soft-close hinges & channels",
            "Premium edge banding",
            "Standard screws & fasteners",
        ],
    },
    "acrylic": {
        "name": "Acrylic",
        "description": "High-gloss acrylic shutters for a modern, reflective finish.",
        "included_items": [
            "Action Tesa HDHMR board carcass",
            "1mm high-gloss acrylic shutter finish",
            "Premium hardware brand (Hettich / Hafle / Ebco) — soft-close hinges & channels",
            "Premium edge banding",
            "Standard screws & fasteners",
        ],
    },
}

WARDROBE_TIERS: list[WardrobeTier] = ["standard", "premium", "acrylic"]


def calculate_wardrobe(db: Session, request: WardrobeCalculateRequest) -> WardrobeCalculateResponse:
    area_sqft = round(request.area_sqft, 2)

    tiers = []
    for tier in WARDROBE_TIERS:
        rate = float(get_setting(db, f"wardrobe_{tier}_rate_per_sqft", DEFAULT_RATE_PER_SQFT[tier]))
        info = TIER_INFO[tier]
        tiers.append(
            WardrobeTierOption(
                tier=tier,
                name=info["name"],
                rate_per_sqft=rate,
                total=round(area_sqft * rate, 2),
                description=info["description"],
                included_items=info["included_items"],
            )
        )

    return WardrobeCalculateResponse(area_sqft=area_sqft, tiers=tiers, currency="INR")


def get_tier_option(db: Session, area_sqft: float, tier: WardrobeTier) -> WardrobeTierOption:
    result = calculate_wardrobe(db, WardrobeCalculateRequest(area_sqft=area_sqft))
    return next(option for option in result.tiers if option.tier == tier)
