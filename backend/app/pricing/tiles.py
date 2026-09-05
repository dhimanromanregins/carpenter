from sqlalchemy.orm import Session

from app.pricing.lookups import get_setting
from app.schemas.tiles import TileCalculateRequest, TileCalculateResponse, TileInstallationMethod, TileTier, TileTierOption

# Editable via the "tiles_<tier>_rate_per_sqft" / "tiles_chemical_extra_per_sqft"
# pricing_settings rows; these are only the fallback if a row is missing.
DEFAULT_BASE_RATE_PER_SQFT: dict[TileTier, float] = {"standard": 120.0, "premium": 150.0}
DEFAULT_CHEMICAL_EXTRA_PER_SQFT = 10.0

TIER_INFO: dict[TileTier, dict] = {
    "standard": {
        "name": "Premium",
        "description": "Reliable, premium-grade vitrified tile flooring.",
        "included_items": [
            "Premium vitrified tiles",
            "Tile fixing as per selected method (cement or chemical adhesive)",
            "Tile grouting",
            "Skirting as per site requirement",
        ],
    },
    "premium": {
        "name": "Ultra Premium",
        "description": "Ultra premium tile quality and finish for a richer look.",
        "included_items": [
            "Ultra premium vitrified tiles, superior finish",
            "Tile fixing as per selected method (cement or chemical adhesive)",
            "Ultra premium tile grouting",
            "Skirting as per site requirement",
        ],
    },
}

TILE_TIERS: list[TileTier] = ["standard", "premium"]

INSTALLATION_METHOD_LABELS: dict[TileInstallationMethod, str] = {
    "cement": "Cement Fixing",
    "chemical": "Chemical Fixing",
}


def calculate_tiles(db: Session, request: TileCalculateRequest) -> TileCalculateResponse:
    area_sqft = round(request.area_sqft, 2)
    chemical_extra = float(get_setting(db, "tiles_chemical_extra_per_sqft", DEFAULT_CHEMICAL_EXTRA_PER_SQFT))
    extra = chemical_extra if request.installation_method == "chemical" else 0.0

    tiers = []
    for tier in TILE_TIERS:
        base_rate = float(get_setting(db, f"tiles_{tier}_rate_per_sqft", DEFAULT_BASE_RATE_PER_SQFT[tier]))
        rate = base_rate + extra
        info = TIER_INFO[tier]
        tiers.append(
            TileTierOption(
                tier=tier,
                name=info["name"],
                base_rate_per_sqft=base_rate,
                installation_extra_per_sqft=extra,
                rate_per_sqft=rate,
                total=round(area_sqft * rate, 2),
                description=info["description"],
                included_items=info["included_items"],
            )
        )

    return TileCalculateResponse(
        area_sqft=area_sqft, installation_method=request.installation_method, tiers=tiers, currency="INR"
    )


def get_tier_option(db: Session, area_sqft: float, installation_method: TileInstallationMethod, tier: TileTier) -> TileTierOption:
    result = calculate_tiles(db, TileCalculateRequest(area_sqft=area_sqft, installation_method=installation_method))
    return next(option for option in result.tiers if option.tier == tier)
