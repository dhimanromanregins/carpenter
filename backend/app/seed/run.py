from sqlalchemy.orm import Session

from app.models import Brand, Category, City, Package, PricingSetting, Product
from app.seed import data


def seed_all(db: Session) -> None:
    if db.query(Package).count() > 0:
        return  # already seeded

    category_by_code: dict[str, Category] = {}
    for row in data.CATEGORIES:
        category = Category(code=row["code"], name=row["name"], slug=row["slug"], description="")
        db.add(category)
        category_by_code[row["code"]] = category
    db.flush()

    brand_by_slug: dict[str, Brand] = {}
    for slug, name, category_code, tier in data.BRANDS:
        brand = Brand(
            name=name,
            slug=slug,
            category_id=category_by_code[category_code].id,
            tier=tier,
            description="",
            logo="",
            website="",
            is_active=True,
        )
        db.add(brand)
        brand_by_slug[slug] = brand
    db.flush()

    for slug, name, brand_slug, category_code, tier, grade, unit, price_field, price, features in data.PRODUCTS:
        product = Product(
            brand_id=brand_by_slug[brand_slug].id,
            category_id=category_by_code[category_code].id,
            name=name,
            slug=slug,
            description="",
            tier=tier,
            grade=grade,
            unit=unit,
            image_url="",
            features=features,
            recommended_for=[],
            is_active=True,
        )
        setattr(product, price_field, price)
        db.add(product)

    for package_id, name, rate, included_items, description, display_order in data.PACKAGES:
        db.add(
            Package(
                id=package_id,
                name=name,
                rate_per_sqft=rate,
                included_items=included_items,
                description=description,
                display_order=display_order,
                is_active=True,
            )
        )

    for key, value, description in data.PRICING_SETTINGS:
        db.add(PricingSetting(key=key, value_json=value, description=description))

    for row in data.CITIES:
        db.add(City(name=row["name"], region=row["region"], state=row["state"], is_active=True))

    db.commit()


if __name__ == "__main__":
    from app.database import Base, SessionLocal, engine

    Base.metadata.create_all(engine)
    session = SessionLocal()
    try:
        seed_all(session)
    finally:
        session.close()
