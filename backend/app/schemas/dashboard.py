from pydantic import BaseModel
from typing import List

class StageCount(BaseModel):
    stage: str
    count: int

class DashboardSummaryResponse(BaseModel):
    active_jobs: int
    total_candidates: int
    total_applications: int
    resumes_processed: int
    shortlisted_candidates: int
    interviews_scheduled: int
    stage_funnel: List[StageCount]

