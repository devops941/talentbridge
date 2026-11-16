from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Job, Candidate, Resume, Application, User
from app.schemas.dashboard import DashboardSummaryResponse, StageCount

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard & Analytics"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    active_jobs = db.query(Job).filter(Job.status == "PUBLISHED").count()
    total_candidates = db.query(Candidate).count()
    total_applications = db.query(Application).count()
    resumes_processed = db.query(Resume).filter(Resume.parse_status == "COMPLETED").count()
    shortlisted_candidates = db.query(Application).filter(Application.current_stage == "Shortlisted").count()
    interviews_scheduled = db.query(Application).filter(Application.current_stage == "Interview Scheduled").count()

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
