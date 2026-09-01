from typing import Literal

from pydantic import BaseModel


class BoardOut(BaseModel):
    id: int
    brand_name: str
    name: str
    board_type: str
    thickness: str | None
    price_per_sqft: float
    image_url: str
    description: str


class ShutterOut(BaseModel):
    id: int
    brand_name: str
    name: str
    finish_type: str
    price_per_sqft: float
    image_url: str
    description: str


class GlassCabinetOut(BaseModel):
    id: int
    name: str
    pricing_mode: Literal["FLAT_PER_CABINET", "PER_SQFT"]
    price: float
    description: str


class PantryTypeOut(BaseModel):
    id: int
    pantry_type: Literal["SINGLE", "DOUBLE", "TRIPLE"]
    name: str
    base_price: float
    description: str


class HardwareBrandOut(BaseModel):
    id: int
    name: str
    slug: str
    logo: str
    tier: str


class HardwareProductOut(BaseModel):
    id: int
    category: str  # HINGES | DRAWER_CHANNELS | PANTRY | LIFT_UP | OTHER
    brand_id: int
    brand_name: str
    name: str
    unit: str
    price: float


class RollingShutterOut(BaseModel):
    id: int
    name: str
    price_per_sqft: float
    description: str


class ScrewOut(BaseModel):
    id: int
    brand_name: str
    name: str
    price_per_piece: float
    description: str


class LightingOut(BaseModel):
    id: int
    brand_name: str
    name: str
    price_per_piece: float
    image_url: str
    description: str
