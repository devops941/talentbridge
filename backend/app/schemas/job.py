from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobSkillCreate(BaseModel):
    skill_name: str
    requirement_type: str = 'REQUIRED'  # REQUIRED or PREFERRED
    importance_weight: float = 1.0

class JobSkillResponse(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    requirement_type: str
    importance_weight: float

class JobCreate(BaseModel):
    title: str
    department: str
    description: str
    experience_min: int = 0
    experience_max: int = 10
    location: str = 'Remote'
    skills: List[JobSkillCreate] = []

class JobResponse(BaseModel):
    id: str
    title: str
    department: str
    description: str
    experience_min: int
    experience_max: int
    location: str
    status: str
    created_at: datetime
    skills: List[JobSkillResponse] = []
