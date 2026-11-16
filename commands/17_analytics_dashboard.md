# Phase 17: Dashboard & Recruitment Analytics

## 1. Objectives
- Implement real-time recruitment metric aggregation for HR Recruiters and Managers.
- Compute KPIs: Total Open Vacancies, Total Candidate Profiles, Resumes Processed, Shortlisted Applications, and Interviews.
- Supply distribution breakdown per recruitment stage for interactive Recharts visualizations.

## 2. Backend Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create schemas/dashboard.py
Set-Content -Path "backend\app\schemas\dashboard.py" -Value @"
from pydantic import BaseModel
from typing import List, Dict

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
"@

# 2. Create routes/dashboard.py
Set-Content -Path "backend\app\routes\dashboard.py" -Value @"
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Job, Candidate, Resume, Application, User
from app.schemas.dashboard import DashboardSummaryResponse, StageCount

router = APIRouter(prefix='/api/v1/dashboard', tags=['Dashboard & Analytics'])

@router.get('/summary', response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    active_jobs = db.query(Job).filter(Job.status == 'PUBLISHED').count()
    total_candidates = db.query(Candidate).count()
    total_applications = db.query(Application).count()
    resumes_processed = db.query(Resume).filter(Resume.parse_status == 'COMPLETED').count()
    shortlisted_candidates = db.query(Application).filter(Application.current_stage == 'Shortlisted').count()
    interviews_scheduled = db.query(Application).filter(Application.current_stage == 'Interview Scheduled').count()

    # Aggregate by stage
    stage_counts = (
        db.query(Application.current_stage, func.count(Application.id))
        .group_by(Application.current_stage)
        .all()
    )

    funnel = [StageCount(stage=s, count=c) for s, c in stage_counts]

    return DashboardSummaryResponse(
        active_jobs=active_jobs,
        total_candidates=total_candidates,
        total_applications=total_applications,
        resumes_processed=resumes_processed,
        shortlisted_candidates=shortlisted_candidates,
        interviews_scheduled=interviews_scheduled,
        stage_funnel=funnel
    )
"@
```

## 3. Register Dashboard Router in `app/main.py`
Add to `backend/app/main.py`:
```python
from app.routes.dashboard import router as dashboard_router
app.include_router(dashboard_router)
```

## 4. Phase 17 Acceptance Criteria Check
- [x] Aggregated KPIs calculate accurately directly from database tables.
- [x] Stage funnel data structured for frontend charting widgets.
- [x] Metrics reconcile with underlying application counts.

