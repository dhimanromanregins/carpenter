from datetime import datetime

from pydantic import BaseModel, EmailStr


class CeilingCalculateRequest(BaseModel):
    area_sqft: float


class CeilingCalculateResponse(BaseModel):
    area_sqft: float
    rate_per_sqft: float
    total: float
    description: str
    included_items: list[str]
    currency: str = "INR"


class CeilingSaveRequest(BaseModel):
    area_sqft: float
    customer_name: str
    customer_phone: str
    customer_email: EmailStr | None = None
    customer_address: str


class CeilingSavedOut(BaseModel):
    id: int
    quotation_number: str
    created_at: datetime
    customer_name: str
    customer_phone: str
    customer_email: str | None
    customer_address: str
    area_sqft: float
    rate_per_sqft: float
    total: float
    description: str
    included_items: list[str]
    currency: str = "INR"
