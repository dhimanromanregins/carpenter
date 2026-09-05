from datetime import datetime

from pydantic import BaseModel, EmailStr


class ContactCreateRequest(BaseModel):
    name: str
    phone: str
    email: EmailStr
    message: str = ""


class ContactOut(BaseModel):
    id: int
    created_at: datetime
    name: str
    phone: str
    email: str
    message: str
