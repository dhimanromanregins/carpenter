from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import ApiError, success_response
from app.models import Quotation
from app.pricing.engine import calculate_quotation
from app.pricing.numbering import generate_quotation_number
from app.schemas.quotation_v1 import QuotationCalculateRequest, QuotationSavedOut, QuotationSaveRequest

router = APIRouter(prefix="/quotations", tags=["quotations"])


@router.post("/calculate")
def calculate(request: QuotationCalculateRequest, db: Session = Depends(get_db)):
    result = calculate_quotation(db, request)
    return success_response(result)


@router.post("")
def save_quotation(request: QuotationSaveRequest, db: Session = Depends(get_db)):
    calc_request = QuotationCalculateRequest(
        quotation_type=request.quotation_type,
        package_id=request.package_id,
        area=request.area,
        custom=request.custom,
    )
    result = calculate_quotation(db, calc_request)

    quotation_number = generate_quotation_number(db)
    quotation = Quotation(
        quotation_number=quotation_number,
        customer_name=request.customer_name,
        customer_phone=request.customer_phone,
        customer_email=request.customer_email,
        quotation_type=request.quotation_type,
        package_id=request.package_id,
        area_sqft=result.area_sqft,
        currency=result.currency,
        subtotal=result.subtotal,
        installation=result.installation,
        tax=result.tax,
        total=result.total,
        request_payload=calc_request.model_dump(mode="json"),
        response_payload=result.model_dump(mode="json"),
    )
    db.add(quotation)
    db.commit()
    db.refresh(quotation)

    return success_response(
        QuotationSavedOut(
            **result.model_dump(),
            id=quotation.id,
            quotation_number=quotation.quotation_number,
            created_at=quotation.created_at,
            customer_name=quotation.customer_name,
            customer_phone=quotation.customer_phone,
            customer_email=quotation.customer_email,
        ),
        status_code=201,
    )


@router.get("/{quotation_id}")
def get_quotation(quotation_id: int, db: Session = Depends(get_db)):
    quotation = db.get(Quotation, quotation_id)
    if quotation is None:
        raise ApiError("NOT_FOUND", f"No quotation with id {quotation_id}", 404)

    return success_response(
        QuotationSavedOut(
            **quotation.response_payload,
            id=quotation.id,
            quotation_number=quotation.quotation_number,
            created_at=quotation.created_at,
            customer_name=quotation.customer_name,
            customer_phone=quotation.customer_phone,
            customer_email=quotation.customer_email,
        )
    )
