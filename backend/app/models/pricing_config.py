from sqlalchemy import JSON, Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Package(Base):
    __tablename__ = "packages"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)  # standard | premium | ultra_premium
    name: Mapped[str] = mapped_column(String(128))
    rate_per_sqft: Mapped[float] = mapped_column(Numeric(10, 2))
    included_items: Mapped[list] = mapped_column(JSON, default=list)
    description: Mapped[str] = mapped_column(String(1024), default="")
    display_order: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class PricingSetting(Base):
    __tablename__ = "pricing_settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value_json: Mapped[dict] = mapped_column(JSON)
    description: Mapped[str] = mapped_column(String(512), default="")
