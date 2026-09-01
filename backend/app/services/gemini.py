import base64

import httpx

from app.config import settings
from app.envelope import ApiError

GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

RENDER_PROMPT = (
    "You are a professional interior visualization artist. The attached image is a rough "
    "preview from a 3D kitchen configurator that a user just designed. Produce a photorealistic, "
    "professionally rendered visualization of this EXACT kitchen: keep the same layout/shape, the "
    "same camera framing, and the same cabinet, countertop, appliance, hardware, floor, backsplash "
    "and wall colors described below. Add realistic materials, textures, shadows and lighting — do "
    "not change the layout, proportions, or color choices.\n\nKitchen specification:\n{description}"
)


async def render_kitchen_design(image_bytes: bytes, mime_type: str, description: str) -> tuple[bytes, str]:
    if not settings.gemini_api_key:
        raise ApiError("GEMINI_NOT_CONFIGURED", "GEMINI_API_KEY is not set on the server.", 500)

    url = GEMINI_URL_TEMPLATE.format(model=settings.gemini_image_model)
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": RENDER_PROMPT.format(description=description)},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64.b64encode(image_bytes).decode("ascii"),
                        }
                    },
                ]
            }
        ],
    }

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            resp = await client.post(
                url,
                headers={"x-goog-api-key": settings.gemini_api_key},
                json=payload,
            )
        except httpx.RequestError as exc:
            raise ApiError("GEMINI_UNREACHABLE", f"Could not reach Gemini: {exc}", 502) from exc

    if resp.status_code != 200:
        raise ApiError(
            "GEMINI_ERROR",
            f"Gemini request failed ({resp.status_code}): {resp.text[:300]}",
            502,
        )

    body = resp.json()
    try:
        parts = body["candidates"][0]["content"]["parts"]
        for part in parts:
            inline_data = part.get("inline_data") or part.get("inlineData")
            if inline_data:
                image_data = base64.b64decode(inline_data["data"])
                out_mime = inline_data.get("mime_type") or inline_data.get("mimeType") or "image/png"
                return image_data, out_mime
        raise KeyError("no inline_data part in response")
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise ApiError("GEMINI_BAD_RESPONSE", f"Gemini did not return an image: {exc}", 502) from exc
