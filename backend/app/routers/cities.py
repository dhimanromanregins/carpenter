from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.envelope import success_response
from app.models import City
from app.schemas.catalog import CityOut

router = APIRouter(tags=["cities"])


@router.get("/cities")
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(City).filter(City.is_active.is_(True)).order_by(City.name).all()
    return success_response([CityOut.model_validate(c) for c in cities])
