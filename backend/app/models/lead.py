from datetime import datetime, timezone

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Lead(Base):
    """A marketing lead captured by the landing page at /free-design-consultation.

    Kept separate from ContactEnquiry: a lead carries qualification fields
    (service, budget, timeline) and campaign attribution, and is worked through
    a status pipeline by the sales team.
    """

    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)

    name: Mapped[str] = mapped_column(String(128))
    phone: Mapped[str] = mapped_column(String(32), index=True)
    email: Mapped[str | None] = mapped_column(String(256), default=None)
    city: Mapped[str | None] = mapped_column(String(64), default=None)

    service: Mapped[str] = mapped_column(String(64), default="not-sure")
    property_type: Mapped[str | None] = mapped_column(String(32), default=None)
    budget_range: Mapped[str | None] = mapped_column(String(32), default=None)
    timeline: Mapped[str | None] = mapped_column(String(32), default=None)
    message: Mapped[str] = mapped_column(Text, default="")

    # Campaign attribution — filled from the query string of the landing page.
    source: Mapped[str] = mapped_column(String(32), default="website")
    utm_source: Mapped[str | None] = mapped_column(String(64), default=None)
    utm_medium: Mapped[str | None] = mapped_column(String(64), default=None)
    utm_campaign: Mapped[str | None] = mapped_column(String(128), default=None)
    page_path: Mapped[str | None] = mapped_column(String(256), default=None)

    status: Mapped[str] = mapped_column(String(16), default="new", index=True)
