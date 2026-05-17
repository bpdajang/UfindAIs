from typing import Optional
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str          # "user" | "admin"
    verified: bool


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
