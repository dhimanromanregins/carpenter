from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr

TileTier = Literal["standard", "premium"]
TileInstallationMethod = Literal["cement", "chemical"]


class TileCalculateRequest(BaseModel):
    area_sqft: float
    installation_method: TileInstallationMethod


class TileTierOption(BaseModel):
    tier: TileTier
    name: str
    base_rate_per_sqft: float
    installation_extra_per_sqft: float
    rate_per_sqft: float
    total: float
    description: str
    included_items: list[str]


class TileCalculateResponse(BaseModel):
    area_sqft: float
    installation_method: TileInstallationMethod
    tiers: list[TileTierOption]
    currency: str = "INR"


class TileSaveRequest(BaseModel):
    area_sqft: float
    tier: TileTier
    installation_method: TileInstallationMethod
    customer_name: str
    customer_phone: str
    customer_email: EmailStr | None = None
    customer_address: str


class TileSavedOut(BaseModel):
    id: int
    quotation_number: str
    created_at: datetime
    customer_name: str
    customer_phone: str
    customer_email: str | None
    customer_address: str
    area_sqft: float
    tier: TileTier
    tier_name: str
    installation_method: TileInstallationMethod
    base_rate_per_sqft: float
    installation_extra_per_sqft: float
    rate_per_sqft: float
    total: float
    description: str
    included_items: list[str]
    currency: str = "INR"
