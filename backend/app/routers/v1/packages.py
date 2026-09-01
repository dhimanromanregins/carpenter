from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import success_response
from app.models import Package
from app.schemas.packages import PackageOut

router = APIRouter(tags=["packages"])


@router.get("/packages")
def list_packages(db: Session = Depends(get_db)):
    packages = db.query(Package).filter(Package.is_active.is_(True)).order_by(Package.display_order).all()
    return success_response([PackageOut.from_model(p) for p in packages])
