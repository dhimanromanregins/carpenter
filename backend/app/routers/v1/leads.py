from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.envelope import ApiError, success_response
from app.models import Lead
from app.schemas.lead import LEAD_STATUSES, LeadCreatedOut, LeadCreateRequest, LeadOut

router = APIRouter(prefix="/leads", tags=["leads"])


def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    """Guards the read endpoints — leads are customer PII.

    ADMIN_API_KEY is unset by default, which keeps these endpoints closed
    rather than open.
    """
    if not settings.admin_api_key:
        raise ApiError("ADMIN_DISABLED", "Admin access is not configured.", 403)
    if x_admin_key != settings.admin_api_key:
        raise ApiError("UNAUTHORIZED", "Invalid admin key.", 401)


@router.post("")
def create_lead(request: LeadCreateRequest, db: Session = Depends(get_db)):
    lead = Lead(**request.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)

    return success_response(
        LeadCreatedOut(id=lead.id, created_at=lead.created_at),
        status_code=201,
    )


@router.get("", dependencies=[Depends(require_admin)])
def list_leads(
    db: Session = Depends(get_db),
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(Lead)
    if status:
        if status not in LEAD_STATUSES:
            raise ApiError("INVALID_STATUS", f"status must be one of {', '.join(LEAD_STATUSES)}", 400)
        query = query.filter(Lead.status == status)

    total = query.count()
    leads = query.order_by(Lead.created_at.desc()).offset(offset).limit(limit).all()

    return success_response(
        {
            "total": total,
            "items": [LeadOut.model_validate(lead, from_attributes=True) for lead in leads],
        }
    )


@router.patch("/{lead_id}/status", dependencies=[Depends(require_admin)])
def update_lead_status(lead_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    if status not in LEAD_STATUSES:
        raise ApiError("INVALID_STATUS", f"status must be one of {', '.join(LEAD_STATUSES)}", 400)

    lead = db.get(Lead, lead_id)
    if lead is None:
        raise ApiError("NOT_FOUND", "Lead not found.", 404)

    lead.status = status
    db.commit()
    db.refresh(lead)

    return success_response(LeadOut.model_validate(lead, from_attributes=True))
