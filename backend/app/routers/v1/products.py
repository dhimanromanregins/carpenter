from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import ApiError, success_response
from app.models import Brand, Category, Product
from app.schemas.products_v1 import (
    BoardOut,
    GlassCabinetOut,
    HardwareBrandOut,
    HardwareProductOut,
    LightingOut,
    PantryTypeOut,
    RollingShutterOut,
    ScrewOut,
    ShutterOut,
)

router = APIRouter(prefix="/products", tags=["products"])

HARDWARE_CATEGORY_CODES = {
    "HINGES": "HARDWARE_HINGES",
    "DRAWER_CHANNELS": "HARDWARE_DRAWER_CHANNELS",
    "PANTRY": "HARDWARE_PANTRY",
    "LIFT_UP": "HARDWARE_LIFT_UP",
    "OTHER": "HARDWARE_OTHER",
}


def _active_products_in_category(db: Session, category_code: str) -> list[Product]:
    return (
        db.query(Product)
        .join(Product.category)
        .filter(Product.category.has(code=category_code), Product.is_active.is_(True))
        .order_by(Product.name)
        .all()
    )


@router.get("/boards")
def list_boards(db: Session = Depends(get_db)):
    products = _active_products_in_category(db, "BOARD")
    return success_response(
        [
            BoardOut(
                id=p.id,
                brand_name=p.brand.name,
                name=p.name,
                board_type=p.grade,
                thickness=(p.features or {}).get("thickness"),
                price_per_sqft=float(p.price_per_sqft or 0),
                image_url=p.image_url,
                description=p.description,
            )
            for p in products
        ]
    )


@router.get("/shutters")
def list_shutters(db: Session = Depends(get_db)):
    products = _active_products_in_category(db, "SHUTTER")
    return success_response(
        [
            ShutterOut(
                id=p.id,
                brand_name=p.brand.name,
                name=p.name,
                finish_type=(p.features or {}).get("finish_type", ""),
                price_per_sqft=float(p.price_per_sqft or 0),
                image_url=p.image_url,
                description=p.description,
            )
            for p in products
        ]
    )


@router.get("/glass-cabinets")
def list_glass_cabinets(db: Session = Depends(get_db)):
    products = _active_products_in_category(db, "GLASS_CABINET")
    out = []
    for p in products:
        if p.unit == "piece":
            out.append(GlassCabinetOut(id=p.id, name=p.name, pricing_mode="FLAT_PER_CABINET", price=float(p.price_per_piece or 0), description=p.description))
        else:
            out.append(GlassCabinetOut(id=p.id, name=p.name, pricing_mode="PER_SQFT", price=float(p.price_per_sqft or 0), description=p.description))
    return success_response(out)


@router.get("/pantry-types")
def list_pantry_types(db: Session = Depends(get_db)):
    products = _active_products_in_category(db, "PANTRY")
    return success_response(
        [
            PantryTypeOut(
                id=p.id,
                pantry_type=(p.features or {}).get("pantry_type", "SINGLE"),
                name=p.name,
                base_price=float(p.price_per_piece or 0),
                description=p.description,
            )
            for p in products
        ]
    )


@router.get("/hardware-brands")
def list_hardware_brands(db: Session = Depends(get_db)):
    brand_ids = (
        db.query(Product.brand_id)
        .join(Product.category)
        .filter(Category.code.in_(HARDWARE_CATEGORY_CODES.values()), Product.is_active.is_(True))
        .distinct()
        .all()
    )
    ids = [row[0] for row in brand_ids]
    brands = db.query(Brand).filter(Brand.id.in_(ids), Brand.is_active.is_(True)).order_by(Brand.name).all()
    return success_response([HardwareBrandOut(id=b.id, name=b.name, slug=b.slug, logo=b.logo, tier=b.tier) for b in brands])


@router.get("/hardware")
def list_hardware(
    category: str = Query(..., description="HINGES | DRAWER_CHANNELS | PANTRY | LIFT_UP | OTHER"),
    brand_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    category_code = HARDWARE_CATEGORY_CODES.get(category.upper())
    if category_code is None:
        raise ApiError("INVALID_CATEGORY", f"Unknown hardware category '{category}'", 400)

    query = db.query(Product).join(Product.category).filter(Product.category.has(code=category_code), Product.is_active.is_(True))
    if brand_id is not None:
        query = query.filter(Product.brand_id == brand_id)
    products = query.order_by(Product.name).all()

    return success_response(
        [
            HardwareProductOut(
                id=p.id,
                category=category.upper(),
                brand_id=p.brand_id,
                brand_name=p.brand.name,
                name=p.name,
                unit=p.unit,
                price=float(p.price_per_running_ft or p.price_per_piece or 0),
            )
            for p in products
        ]
    )


@router.get("/rolling-shutters")
def list_rolling_shutters(db: Session = Depends(get_db)):
    products = _active_products_in_category(db, "ROLLING_SHUTTER")
    return success_response(
        [RollingShutterOut(id=p.id, name=p.name, price_per_sqft=float(p.price_per_sqft or 0), description=p.description) for p in products]
    )


@router.get("/screws")
def list_screws(db: Session = Depends(get_db)):
    products = _active_products_in_category(db, "SCREW")
    return success_response(
        [
            ScrewOut(id=p.id, brand_name=p.brand.name, name=p.name, price_per_piece=float(p.price_per_piece or 0), description=p.description)
            for p in products
        ]
    )


@router.get("/lighting")
def list_lighting(db: Session = Depends(get_db)):
    products = _active_products_in_category(db, "LIGHTING")
    return success_response(
        [
            LightingOut(
                id=p.id,
                brand_name=p.brand.name,
                name=p.name,
                price_per_piece=float(p.price_per_piece or 0),
                image_url=p.image_url,
                description=p.description,
            )
            for p in products
        ]
    )
