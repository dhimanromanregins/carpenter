import base64
import binascii

from fastapi import APIRouter

from app.envelope import ApiError, success_response
from app.schemas.design import KitchenRenderRequest, KitchenRenderResponse
from app.services.gemini import render_kitchen_design

router = APIRouter(tags=["design"])

MAX_IMAGE_BYTES = 8 * 1024 * 1024


@router.post("/design/render-from-layout")
async def render_from_layout(request: KitchenRenderRequest):
    if not request.description.strip():
        raise ApiError("MISSING_DESCRIPTION", "A design description is required.", 400)

    try:
        image_bytes = base64.b64decode(request.image_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ApiError("INVALID_IMAGE", "Could not decode the uploaded image.", 400) from exc

    if not image_bytes:
        raise ApiError("EMPTY_FILE", "The uploaded image is empty.", 400)
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise ApiError("FILE_TOO_LARGE", "Image must be 8MB or smaller.", 400)

    rendered_bytes, out_mime = await render_kitchen_design(image_bytes, request.mime_type, request.description)
    data_url = f"data:{out_mime};base64,{base64.b64encode(rendered_bytes).decode('ascii')}"
    return success_response(KitchenRenderResponse(image_data_url=data_url))
