from fastapi import APIRouter
from math import sqrt

from app.envelope import success_response
from app.pricing.units import to_feet
from app.schemas.area import AreaCalculateRequest, AreaCalculateResponse

router = APIRouter(tags=["area"])


@router.post("/area/calculate")
def calculate_area(request: AreaCalculateRequest):
    if request.mode == "total_area":
        area_sqft = round(request.area_sqft, 2)
        running_feet = round(2 * sqrt(area_sqft), 1)
        response = AreaCalculateResponse(
            mode="total_area",
            area_sqft=area_sqft,
            running_feet=running_feet,
            running_feet_state="ESTIMATED",
        )
    else:
        length_ft = to_feet(request.length, request.unit)
        width_ft = to_feet(request.width, request.unit)
        area_sqft = round(length_ft * width_ft, 2)
        running_feet = round(length_ft + width_ft, 1)
        response = AreaCalculateResponse(
            mode="dimensions",
            area_sqft=area_sqft,
            running_feet=running_feet,
            running_feet_state="CUSTOMER_PROVIDED",
        )

    return success_response(response)
