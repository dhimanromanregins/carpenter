from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import ApiError, success_response
from app.models import Quotation
from app.pdf.ceiling import build_ceiling_pdf
from app.pricing.ceiling import calculate_ceiling
from app.pricing.numbering import generate_quotation_number
from app.schemas.ceiling import CeilingCalculateRequest, CeilingSaveRequest, CeilingSavedOut

router = APIRouter(prefix="/ceiling", tags=["ceiling"])


def _get_ceiling_quotation(db: Session, quotation_id: int) -> Quotation:
    quotation = db.get(Quotation, quotation_id)
    if quotation is None or quotation.quotation_type != "ceiling":
        raise ApiError("NOT_FOUND", f"No ceiling quotation with id {quotation_id}", 404)
    return quotation


def _to_saved_out(quotation: Quotation) -> CeilingSavedOut:
    payload = quotation.response_payload
    return CeilingSavedOut(
        id=quotation.id,
        quotation_number=quotation.quotation_number,
        created_at=quotation.created_at,
        customer_name=quotation.customer_name,
        customer_phone=quotation.customer_phone,
        customer_email=quotation.customer_email,
        customer_address=payload.get("customer_address", ""),
        area_sqft=float(quotation.area_sqft),
        rate_per_sqft=payload["rate_per_sqft"],
        total=float(quotation.total),
        description=payload["description"],
        included_items=payload["included_items"],
        currency=quotation.currency,
    )


@router.post("/calculate")
def calculate(request: CeilingCalculateRequest, db: Session = Depends(get_db)):
    result = calculate_ceiling(db, request)
    return success_response(result)


@router.post("/quotes")
def save_quotation(request: CeilingSaveRequest, db: Session = Depends(get_db)):
    option = calculate_ceiling(db, CeilingCalculateRequest(area_sqft=request.area_sqft))

    quotation = Quotation(
        quotation_number=generate_quotation_number(db),
        customer_name=request.customer_name,
        customer_phone=request.customer_phone,
        customer_email=request.customer_email,
        quotation_type="ceiling",
        package_id=None,
        area_sqft=request.area_sqft,
        currency="INR",
        subtotal=option.total,
        installation=0,
        tax=0,
        total=option.total,
        request_payload=request.model_dump(mode="json"),
        response_payload={
            "rate_per_sqft": option.rate_per_sqft,
            "description": option.description,
            "included_items": option.included_items,
            "customer_address": request.customer_address,
        },
    )
    db.add(quotation)
    db.commit()
    db.refresh(quotation)

    return success_response(_to_saved_out(quotation), status_code=201)


@router.get("/quotes/{quotation_id}")
def get_ceiling_quotation(quotation_id: int, db: Session = Depends(get_db)):
    quotation = _get_ceiling_quotation(db, quotation_id)
    return success_response(_to_saved_out(quotation))


@router.get("/quotes/{quotation_id}/pdf")
def get_ceiling_quotation_pdf(quotation_id: int, db: Session = Depends(get_db)):
    quotation = _get_ceiling_quotation(db, quotation_id)
    pdf_bytes = build_ceiling_pdf(quotation)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{quotation.quotation_number}.pdf"'},
    )
