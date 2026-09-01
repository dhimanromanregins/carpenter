from typing import Literal

from pydantic import BaseModel, model_validator

DimensionUnit = Literal["FEET", "INCHES", "METERS", "CENTIMETERS"]
AreaMode = Literal["total_area", "dimensions"]
RunningFeetState = Literal["CUSTOMER_PROVIDED", "ESTIMATED"]


class AreaCalculateRequest(BaseModel):
    mode: AreaMode
    area_sqft: float | None = None
    length: float | None = None
    width: float | None = None
    unit: DimensionUnit | None = None

    @model_validator(mode="after")
    def _check_required_fields(self) -> "AreaCalculateRequest":
        if self.mode == "total_area" and self.area_sqft is None:
            raise ValueError("area_sqft is required when mode is 'total_area'")
        if self.mode == "dimensions" and (self.length is None or self.width is None or self.unit is None):
            raise ValueError("length, width and unit are required when mode is 'dimensions'")
        return self


class AreaCalculateResponse(BaseModel):
    mode: AreaMode
    area_sqft: float
    running_feet: float
    running_feet_state: RunningFeetState
