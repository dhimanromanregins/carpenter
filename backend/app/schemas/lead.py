import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

LEAD_STATUSES = ("new", "contacted", "qualified", "won", "lost")

_DIGITS = re.compile(r"\D")


class LeadCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    phone: str = Field(max_length=32)
    email: EmailStr | None = None
    city: str | None = Field(default=None, max_length=64)

    service: str = Field(default="not-sure", max_length=64)
    property_type: str | None = Field(default=None, max_length=32)
    budget_range: str | None = Field(default=None, max_length=32)
    timeline: str | None = Field(default=None, max_length=32)
    message: str = Field(default="", max_length=2000)

    source: str = Field(default="website", max_length=32)
    utm_source: str | None = Field(default=None, max_length=64)
    utm_medium: str | None = Field(default=None, max_length=64)
    utm_campaign: str | None = Field(default=None, max_length=128)
    page_path: str | None = Field(default=None, max_length=256)

    @field_validator("name", "message", mode="before")
    @classmethod
    def _strip(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", "city", "property_type", "budget_range", "timeline", "utm_source", "utm_medium", "utm_campaign", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        return value

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, value: str) -> str:
        digits = _DIGITS.sub("", value)
        # Indian mobiles are 10 digits; allow a country code and other formats
        # up to 15 digits (E.164 maximum).
        if not 10 <= len(digits) <= 15:
            raise ValueError("Enter a valid phone number")
        return digits


class LeadOut(BaseModel):
    id: int
    created_at: datetime
    name: str
    phone: str
    email: str | None
    city: str | None
    service: str
    property_type: str | None
    budget_range: str | None
    timeline: str | None
    message: str
    source: str
    utm_source: str | None
    utm_medium: str | None
    utm_campaign: str | None
    page_path: str | None
    status: str


class LeadCreatedOut(BaseModel):
    """What the public form gets back — no stored PII echoed."""

    id: int
    created_at: datetime
    message: str = "Thanks! Our design consultant will call you shortly."
