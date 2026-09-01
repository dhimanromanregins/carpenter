from pydantic import BaseModel


class KitchenRenderRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/png"
    description: str


class KitchenRenderResponse(BaseModel):
    image_data_url: str
