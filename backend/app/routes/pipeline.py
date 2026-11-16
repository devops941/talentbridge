from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import (
    Application, ApplicationStageHistory, CandidateReview, User
)
from app.schemas.pipeline import (
    StageUpdateRequest, ReviewCreateRequest, ReviewResponse, StageHistoryResponse
)

router = APIRouter(prefix="/api/v1/pipeline", tags=["Recruitment Pipeline & Review"])

ALLOWED_STAGES = [
    "Application Received",
    "Resume Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Interview Completed",
    "Selected",
    "Not Selected",
    "On Hold"
]

@router.patch("/applications/{application_id}/stage")
def update_application_stage(
    application_id: str,
    payload: StageUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if payload.to_stage not in ALLOWED_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of {ALLOWED_STAGES}")

    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_stage = app.current_stage
    app.current_stage = payload.to_stage

    # Record stage history
    history = ApplicationStageHistory(
        application_id=app.id,
        from_stage=old_stage,
        to_stage=payload.to_stage,
        changed_by=user.id
    )
    db.add(history)
    db.commit()

    return {"message": f"Application stage updated to {payload.to_stage}"}

@router.post("/applications/{application_id}/reviews")
def add_candidate_review(
    application_id: str,
    payload: ReviewCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    review = CandidateReview(
        application_id=app.id,
        reviewer_id=user.id,
        rating=payload.rating,
        notes=payload.notes
    )
    db.add(review)
    db.commit()
    return {"message": "Candidate review added successfully"}

@router.get("/applications/{application_id}/history", response_model=List[StageHistoryResponse])
def get_stage_history(
    application_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    records = db.query(ApplicationStageHistory).filter(
        ApplicationStageHistory.application_id == application_id
    ).order_by(ApplicationStageHistory.changed_at.asc()).all()

    return [
        StageHistoryResponse(
            id=r.id,
            from_stage=r.from_stage,
            to_stage=r.to_stage,
            changed_by_name=db.query(User).filter(User.id == r.changed_by).first().name,
            changed_at=r.changed_at
        ) for r in records
    ]
