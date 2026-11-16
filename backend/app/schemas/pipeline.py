from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime

class StageUpdateRequest(BaseModel):
    to_stage: str
    notes: Optional[str] = None

class ReviewCreateRequest(BaseModel):
    rating: int = 3
    notes: str

class ReviewResponse(BaseModel):
    id: str
    reviewer_name: str
    rating: int
    notes: str
    created_at: datetime

class StageHistoryResponse(BaseModel):
    id: str
    from_stage: Optional[str] = None
    to_stage: str
    changed_by_name: str
    changed_at: datetime
