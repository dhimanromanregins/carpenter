from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.schemas.area import DimensionUnit
from app.schemas.packages import PackageOut

QuotationType = Literal["package", "custom"]


class AreaInput(BaseModel):
    area_sqft: float
    running_feet: float | None = None


class GlassCabinetCustomItem(BaseModel):
    width: float
    height: float
    unit: DimensionUnit
    quantity: int = 1


class GlassCabinetSelection(BaseModel):
    enabled: bool = False
    standard_quantity: int = 0
    custom_items: list[GlassCabinetCustomItem] = Field(default_factory=list)


class PantrySelection(BaseModel):
    enabled: bool = False
    pantry_type_id: int | None = None


class HardwareSelection(BaseModel):
    use_brand_throughout: bool = False
    brand_id: int | None = None
    hinges_product_id: int | None = None
    drawer_channels_product_id: int | None = None
    pantry_product_id: int | None = None
    lift_up_product_id: int | None = None
    other_product_id: int | None = None


class RollingShutterSelection(BaseModel):
    enabled: bool = False
    product_id: int | None = None
    quantity: int = 1
    width: float | None = None
    height: float | None = None
    unit: DimensionUnit | None = None


class LightingItem(BaseModel):
    product_id: int
    quantity: int = 1


class CustomQuotationInput(BaseModel):
    board_id: int | None = None
    shutter_id: int | None = None
    shutter_area_sqft: float | None = None
    glass_cabinets: GlassCabinetSelection = Field(default_factory=GlassCabinetSelection)
    pantry: PantrySelection = Field(default_factory=PantrySelection)
    hardware: HardwareSelection = Field(default_factory=HardwareSelection)
    rolling_shutter: RollingShutterSelection = Field(default_factory=RollingShutterSelection)
    screw_id: int | None = None
    lighting: list[LightingItem] = Field(default_factory=list)


class QuotationCalculateRequest(BaseModel):
    quotation_type: QuotationType
    package_id: str | None = None
    area: AreaInput
    custom: CustomQuotationInput | None = None

    @model_validator(mode="after")
    def _check_required_fields(self) -> "QuotationCalculateRequest":
        if self.quotation_type == "package" and not self.package_id:
            raise ValueError("package_id is required when quotation_type is 'package'")
        if self.quotation_type == "custom" and self.custom is None:
            self.custom = CustomQuotationInput()
        return self


class QuoteLineItem(BaseModel):
    role: str
    label: str
    subtotal: float
    detail: dict[str, Any] = Field(default_factory=dict)


class QuotationCalculateResponse(BaseModel):
    quotation_type: QuotationType
    package: PackageOut | None = None
    area_sqft: float
    line_items: list[QuoteLineItem]
    subtotal: float
    installation: float
    tax: float
    total: float
    currency: str = "INR"


class QuotationSaveRequest(QuotationCalculateRequest):
    customer_name: str
    customer_phone: str
    customer_email: EmailStr | None = None


class QuotationSavedOut(QuotationCalculateResponse):
    id: int
    quotation_number: str
    created_at: datetime
    customer_name: str
    customer_phone: str
    customer_email: str | None
