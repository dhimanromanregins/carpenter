from sqlalchemy.orm import Session

from app.pricing.custom import calculate_custom
from app.pricing.package import calculate_package
from app.schemas.quotation_v1 import QuotationCalculateRequest, QuotationCalculateResponse


def calculate_quotation(db: Session, request: QuotationCalculateRequest) -> QuotationCalculateResponse:
    if request.quotation_type == "package":
        return calculate_package(db, request)
    return calculate_custom(db, request)
