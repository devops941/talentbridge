from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ResumeResponse(BaseModel):
    id: str
    candidate_id: str
    original_filename: str
    mime_type: str
    file_size: int
    checksum: str
    parse_status: str
    created_at: datetime

class ResumeSkillItem(BaseModel):
    skill_id: int
    canonical_name: str
    evidence_text: Optional[str]
    confidence: float

class ResumeDetailResponse(BaseModel):
    id: str
    candidate_id: str
    candidate_name: str
    original_filename: str
    parse_status: str
    extracted_text: Optional[str] = None
    skills: List[ResumeSkillItem] = []
    created_at: datetime
