from sqlalchemy.orm import Session

from app.envelope import ApiError
from app.models import Package
from app.pricing.totals import compute_totals
from app.schemas.packages import PackageOut
from app.schemas.quotation_v1 import QuoteLineItem, QuotationCalculateRequest, QuotationCalculateResponse


def calculate_package(db: Session, request: QuotationCalculateRequest) -> QuotationCalculateResponse:
    package = db.get(Package, request.package_id)
    if package is None or not package.is_active:
        raise ApiError("PACKAGE_NOT_FOUND", f"No active package with id '{request.package_id}'", 404)

    area_sqft = request.area.area_sqft
    rate = float(package.rate_per_sqft)
    line_total = round(area_sqft * rate, 2)

    line_items = [
        QuoteLineItem(
            role="package",
            label=package.name,
            subtotal=line_total,
            detail={"rate_per_sqft": rate, "included_items": package.included_items or []},
        )
    ]

    subtotal, installation, tax, total = compute_totals(db, line_items)

    return QuotationCalculateResponse(
        quotation_type="package",
        package=PackageOut.from_model(package),
        area_sqft=area_sqft,
        line_items=line_items,
        subtotal=subtotal,
        installation=installation,
        tax=tax,
        total=total,
        currency="INR",
    )
