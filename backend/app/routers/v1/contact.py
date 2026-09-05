from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import success_response
from app.models import ContactEnquiry
from app.schemas.contact import ContactCreateRequest, ContactOut

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("")
def create_contact_enquiry(request: ContactCreateRequest, db: Session = Depends(get_db)):
    enquiry = ContactEnquiry(
        name=request.name.strip(),
        phone=request.phone.strip(),
        email=request.email,
        message=request.message.strip(),
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    return success_response(ContactOut.model_validate(enquiry, from_attributes=True), status_code=201)
