from datetime import datetime, timezone

from sqlalchemy import JSON, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    slug: Mapped[str] = mapped_column(String(128), unique=True)
    description: Mapped[str] = mapped_column(String(1024), default="")
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=_utcnow, onupdate=_utcnow)


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    tier: Mapped[str] = mapped_column(String(16))  # STANDARD | LUXURY
    description: Mapped[str] = mapped_column(String(1024), default="")
    logo: Mapped[str] = mapped_column(String(512), default="")
    website: Mapped[str] = mapped_column(String(512), default="")
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=_utcnow, onupdate=_utcnow)

    category: Mapped["Category"] = relationship()


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(256))
    slug: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    description: Mapped[str] = mapped_column(String(2048), default="")
    tier: Mapped[str] = mapped_column(String(16))  # STANDARD | LUXURY
    grade: Mapped[str] = mapped_column(String(64), default="")
    unit: Mapped[str] = mapped_column(String(32))  # sqft | running_ft | piece
    base_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_per_sqft: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_per_running_ft: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_per_piece: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    image_url: Mapped[str] = mapped_column(String(512), default="")
    features: Mapped[dict] = mapped_column(JSON, default=dict)
    recommended_for: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=_utcnow, onupdate=_utcnow)

    brand: Mapped["Brand"] = relationship()
    category: Mapped["Category"] = relationship()
