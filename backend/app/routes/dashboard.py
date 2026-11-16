from fastapi import APIRouter, Depends
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.dashboard import DashboardSummaryResponse, StageCount

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard & Analytics"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db = Depends(get_db), user: dict = Depends(get_current_user)):
    active_jobs = db.jobs.count_documents({"status": "PUBLISHED"})
    total_candidates = db.candidates.count_documents({})
    total_applications = db.applications.count_documents({})
    resumes_processed = db.resumes.count_documents({"parse_status": "COMPLETED"})
    shortlisted_candidates = db.applications.count_documents({"current_stage": "Shortlisted"})
    interviews_scheduled = db.applications.count_documents({"current_stage": "Interview Scheduled"})

    pipeline = [
        {"$group": {"_id": "$current_stage", "count": {"$sum": 1}}}
    ]
    stage_counts = list(db.applications.aggregate(pipeline))
    funnel = [
        StageCount(stage=item.get("_id", "Unknown"), count=item.get("count", 0))
        for item in stage_counts
    ]

    return DashboardSummaryResponse(
        active_jobs=active_jobs,
        total_candidates=total_candidates,
        total_applications=total_applications,
        resumes_processed=resumes_processed,
        shortlisted_candidates=shortlisted_candidates,
        interviews_scheduled=interviews_scheduled,
        stage_funnel=funnel
    )
