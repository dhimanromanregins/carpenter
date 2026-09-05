from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import ApiError, success_response
from app.models import Quotation
from app.pdf.wardrobe import build_wardrobe_pdf
from app.pricing.numbering import generate_quotation_number
from app.pricing.wardrobe import calculate_wardrobe, get_tier_option
from app.schemas.wardrobe import WardrobeCalculateRequest, WardrobeSaveRequest, WardrobeSavedOut

router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])


def _get_wardrobe_quotation(db: Session, quotation_id: int) -> Quotation:
    quotation = db.get(Quotation, quotation_id)
    if quotation is None or quotation.quotation_type != "wardrobe":
        raise ApiError("NOT_FOUND", f"No wardrobe quotation with id {quotation_id}", 404)
    return quotation


def _to_saved_out(quotation: Quotation) -> WardrobeSavedOut:
    payload = quotation.response_payload
    return WardrobeSavedOut(
        id=quotation.id,
        quotation_number=quotation.quotation_number,
        created_at=quotation.created_at,
        customer_name=quotation.customer_name,
        customer_phone=quotation.customer_phone,
        customer_email=quotation.customer_email,
        customer_address=payload.get("customer_address", ""),
        area_sqft=float(quotation.area_sqft),
        tier=payload["tier"],
        tier_name=payload["tier_name"],
        rate_per_sqft=payload["rate_per_sqft"],
        total=float(quotation.total),
        description=payload["description"],
        included_items=payload["included_items"],
        currency=quotation.currency,
    )


@router.post("/calculate")
def calculate(request: WardrobeCalculateRequest, db: Session = Depends(get_db)):
    result = calculate_wardrobe(db, request)
    return success_response(result)


@router.post("/quotes")
def save_quotation(request: WardrobeSaveRequest, db: Session = Depends(get_db)):
    option = get_tier_option(db, request.area_sqft, request.tier)

    quotation = Quotation(
        quotation_number=generate_quotation_number(db),
        customer_name=request.customer_name,
        customer_phone=request.customer_phone,
        customer_email=request.customer_email,
        quotation_type="wardrobe",
        package_id=request.tier,
        area_sqft=request.area_sqft,
        currency="INR",
        subtotal=option.total,
        installation=0,
        tax=0,
        total=option.total,
        request_payload=request.model_dump(mode="json"),
        response_payload={
            "tier": option.tier,
            "tier_name": option.name,
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
def get_wardrobe_quotation(quotation_id: int, db: Session = Depends(get_db)):
    quotation = _get_wardrobe_quotation(db, quotation_id)
    return success_response(_to_saved_out(quotation))


@router.get("/quotes/{quotation_id}/pdf")
def get_wardrobe_quotation_pdf(quotation_id: int, db: Session = Depends(get_db)):
    quotation = _get_wardrobe_quotation(db, quotation_id)
    pdf_bytes = build_wardrobe_pdf(quotation)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{quotation.quotation_number}.pdf"'},
    )
