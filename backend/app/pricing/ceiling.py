from sqlalchemy.orm import Session

from app.pricing.lookups import get_setting
from app.schemas.ceiling import CeilingCalculateRequest, CeilingCalculateResponse

# Editable via the "ceiling_rate_per_sqft" pricing_settings row; this is only
# the fallback if the row is missing.
DEFAULT_RATE_PER_SQFT = 250.0

DESCRIPTION = "Gypsum board false ceiling with standard finish — single tier, no Standard/Premium split."
INCLUDED_ITEMS = [
    "Gypsum board false ceiling",
    "Metal channel framing & fixing hardware",
    "POP/cove detailing as per design",
    "Primer coat finish (ready for paint)",
]


def calculate_ceiling(db: Session, request: CeilingCalculateRequest) -> CeilingCalculateResponse:
    area_sqft = round(request.area_sqft, 2)
    rate = float(get_setting(db, "ceiling_rate_per_sqft", DEFAULT_RATE_PER_SQFT))

    return CeilingCalculateResponse(
        area_sqft=area_sqft,
        rate_per_sqft=rate,
        total=round(area_sqft * rate, 2),
        description=DESCRIPTION,
        included_items=INCLUDED_ITEMS,
        currency="INR",
    )
