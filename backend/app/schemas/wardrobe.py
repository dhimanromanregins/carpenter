from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr

WardrobeTier = Literal["standard", "premium", "acrylic"]


class WardrobeCalculateRequest(BaseModel):
    area_sqft: float


class WardrobeTierOption(BaseModel):
    tier: WardrobeTier
    name: str
    rate_per_sqft: float
    total: float
    description: str
    included_items: list[str]


class WardrobeCalculateResponse(BaseModel):
    area_sqft: float
    tiers: list[WardrobeTierOption]
    currency: str = "INR"


class WardrobeSaveRequest(BaseModel):
    area_sqft: float
    tier: WardrobeTier
    customer_name: str
    customer_phone: str
    customer_email: EmailStr | None = None
    customer_address: str


class WardrobeSavedOut(BaseModel):
    id: int
    quotation_number: str
    created_at: datetime
    customer_name: str
    customer_phone: str
    customer_email: str | None
    customer_address: str
    area_sqft: float
    tier: WardrobeTier
    tier_name: str
    rate_per_sqft: float
    total: float
    description: str
    included_items: list[str]
    currency: str = "INR"
