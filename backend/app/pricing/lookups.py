from sqlalchemy.orm import Session

from app.models import Brand, PricingSetting, Product


def get_setting(db: Session, key: str, default=None):
    row = db.get(PricingSetting, key)
    return row.value_json if row is not None else default


def get_product(db: Session, product_id: int | None) -> Product | None:
    if product_id is None:
        return None
    return db.get(Product, product_id)


def get_default_product(db: Session, slug_setting_key: str) -> Product | None:
    slug = get_setting(db, slug_setting_key)
    if not slug:
        return None
    return db.query(Product).filter(Product.slug == slug).first()


def resolve_product(db: Session, product_id: int | None, default_slug_setting_key: str) -> Product | None:
    """Use the requested product if it resolves; otherwise fall back to the
    seeded default for this role. Never raises — calculate must always
    return a usable price even with an unfilled/invalid selection."""
    product = get_product(db, product_id)
    if product is not None and product.is_active:
        return product
    return get_default_product(db, default_slug_setting_key)


def resolve_brand_by_slug(db: Session, slug: str | None) -> Brand | None:
    if not slug:
        return None
    return db.query(Brand).filter(Brand.slug == slug.lower()).first()


def resolve_brand_product(db: Session, brand: Brand | None, category_code: str) -> Product | None:
    if brand is None:
        return None
    return (
        db.query(Product)
        .join(Product.category)
        .filter(Product.brand_id == brand.id, Product.category.has(code=category_code), Product.is_active.is_(True))
        .first()
    )


def price_of(product: Product | None, field: str) -> float:
    if product is None:
        return 0.0
    value = getattr(product, field, None)
    return float(value) if value is not None else 0.0
