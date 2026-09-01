from datetime import datetime, timezone

from sqlalchemy import JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=_utcnow, onupdate=_utcnow)

    customer_name: Mapped[str] = mapped_column(String(128))
    customer_phone: Mapped[str] = mapped_column(String(32))
    customer_email: Mapped[str | None] = mapped_column(String(256), nullable=True)

    quotation_type: Mapped[str] = mapped_column(String(16))  # package | custom
    package_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    area_sqft: Mapped[float] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(8), default="INR")

    subtotal: Mapped[float] = mapped_column(Numeric(12, 2))
    installation: Mapped[float] = mapped_column(Numeric(12, 2))
    tax: Mapped[float] = mapped_column(Numeric(12, 2))
    total: Mapped[float] = mapped_column(Numeric(12, 2))

    request_payload: Mapped[dict] = mapped_column(JSON)
    response_payload: Mapped[dict] = mapped_column(JSON)
