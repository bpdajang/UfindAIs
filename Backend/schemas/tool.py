from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


# Fields the Admin form collects (Admin.jsx)
class AIToolCreate(BaseModel):
    name: str
    description: str
    category:List[str] = []
    logo: Optional[str] = None        # logo URL  (field name matches sampleData)
    link: str                          # website URL (field name matches Admin.jsx)

    # Rich detail fields (for AIDetails.jsx)
    pricing: Optional[str] = "Freemium"
    pricingDetail: Optional[str] = None
    functions: Optional[List[str]] = []
    definition: Optional[str] = None
    keyFeatures: Optional[List[str]] = []
    whoIsUsing: Optional[str] = None
    whatMakesUnique: Optional[str] = None
    summary: Optional[str] = None
    featured: Optional[bool] = False


class AIToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[List[str]] = None
    logo: Optional[str] = None
    link: Optional[str] = None
    pricing: Optional[str] = None
    pricingDetail: Optional[str] = None
    functions: Optional[List[str]] = None
    definition: Optional[str] = None
    keyFeatures: Optional[List[str]] = None
    whoIsUsing: Optional[str] = None
    whatMakesUnique: Optional[str] = None
    summary: Optional[str] = None
    featured: Optional[bool] = None


# Full tool response — mirrors sampleData.js shape exactly
class AIToolOut(BaseModel):
    id: str
    name: str
    description: str
    # category in Mongo is stored as a single string in many places
    # (Explore page expects category to be a string for filtering).
    # Keep this as str to match the DB shape returned by routers/tools.py.
    category: List[str] = []
    logo: Optional[str] = None
    link: str                          # website URL
    pricing: Optional[str] = None
    pricingDetail: Optional[str] = None
    functions: List[str] = []
    definition: Optional[str] = None
    keyFeatures: List[str] = []
    whoIsUsing: Optional[str] = None
    whatMakesUnique: Optional[str] = None
    summary: Optional[str] = None
    featured: bool = False
    views: int = 0
    clicks: int = 0
    saves: int = 0
    created_at: datetime
