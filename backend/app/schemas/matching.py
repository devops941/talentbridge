from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class SkillEvidenceItem(BaseModel):
    skill_name: str
    canonical_name: str
    evidence_text: Optional[str] = ""

class MatchResultResponse(BaseModel):
    application_id: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    resume_id: Optional[str] = None
    score: float
    skill_score: float
    text_score: float
    model_version: str
    explanation: str
    matched_skills: List[str] = []
    matched_skill_details: List[Dict[str, Any]] = []
    missing_required_skills: List[str] = []
    current_stage: str
    applied_at: datetime
