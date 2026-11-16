from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MatchResultResponse(BaseModel):
    application_id: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    score: float
    skill_score: float
    text_score: float
    model_version: str
    explanation: str
    matched_skills: List[str]
    missing_required_skills: List[str]
    current_stage: str
    applied_at: datetime

