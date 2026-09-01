from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import success_response
from app.pricing.lookups import get_setting
from app.schemas.config import QuotationConfigOut

router = APIRouter(tags=["config"])


@router.get("/quotation/config")
def get_quotation_config(db: Session = Depends(get_db)):
    config = QuotationConfigOut(
        installation_pct=float(get_setting(db, "installation_pct", 0.10)),
        tax_pct=float(get_setting(db, "tax_pct", 0.18)),
    )
    return success_response(config)
