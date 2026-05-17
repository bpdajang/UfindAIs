from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


# SubmitAI.jsx collects: name, category, description
# We also accept an optional contact email
class SubmissionCreate(BaseModel):
    name: str
    category: str
    description: str
    submitted_by_email: Optional[EmailStr] = None


class SubmissionOut(BaseModel):
    id: str
    name: str
    category: str
    description: str
    submitted_by_email: Optional[str] = None
    status: str          # pending | approved | rejected
    created_at: datetime
