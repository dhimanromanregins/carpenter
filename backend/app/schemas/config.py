from pydantic import BaseModel


class QuotationConfigOut(BaseModel):
    currency: str = "INR"
    dimension_units: list[str] = ["FEET", "INCHES", "METERS", "CENTIMETERS"]
    quotation_types: list[str] = ["package", "custom"]
    hardware_categories: list[str] = ["HINGES", "DRAWER_CHANNELS", "PANTRY", "LIFT_UP", "OTHER"]
    pantry_types: list[str] = ["SINGLE", "DOUBLE", "TRIPLE"]
    installation_pct: float
    tax_pct: float
