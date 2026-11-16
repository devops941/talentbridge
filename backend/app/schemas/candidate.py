from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CandidateCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None

class CandidateResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str]
    location: Optional[str]
    created_at: datetime
    duplicate_warning: bool = False
