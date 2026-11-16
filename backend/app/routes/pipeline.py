import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.pipeline import (
    StageUpdateRequest, ReviewCreateRequest, ReviewResponse, StageHistoryResponse
)
from app.core.email import send_stage_update_email

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
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    if payload.to_stage not in ALLOWED_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of {ALLOWED_STAGES}")

    app = db.applications.find_one({"id": application_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_stage = app.get("current_stage", "Application Received")
    now = datetime.utcnow()

    db.applications.update_one(
        {"id": application_id},
        {"$set": {"current_stage": payload.to_stage, "updated_at": now}}
    )

    # Insert stage history
    db.application_stage_history.insert_one({
        "id": str(uuid.uuid4()),
        "application_id": application_id,
        "from_stage": old_stage,
        "to_stage": payload.to_stage,
        "changed_by": str(user.get("id")),
        "changed_by_name": user.get("name", "Recruiter"),
        "changed_at": now
    })

    # Log into system audit logs
    db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_id": str(user.get("id")),
        "actor_name": user.get("name", "Recruiter"),
        "action": "STAGE_TRANSITION",
        "entity_type": "APPLICATION",
        "entity_id": application_id,
        "metadata_json": f"Moved candidate to '{payload.to_stage}' (from '{old_stage}')",
        "created_at": now
    })

    # Dispatch automated email notification to candidate
    candidate = db.candidates.find_one({"id": app.get("candidate_id")})
    job = db.jobs.find_one({"id": app.get("job_id")})
    if candidate and candidate.get("email") and job:
        try:
            send_stage_update_email(
                to_email=candidate.get("email"),
                candidate_name=candidate.get("full_name", ""),
                job_title=job.get("title", "Position"),
                new_stage=payload.to_stage,
                notes=payload.notes
            )
        except Exception as e:
            print(f"Failed to dispatch stage update email: {e}")

    return {"message": f"Application stage updated to {payload.to_stage}"}

@router.post("/applications/{application_id}/reviews")
def add_candidate_review(
    application_id: str,
    payload: ReviewCreateRequest,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    app = db.applications.find_one({"id": application_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.utcnow()
    db.candidate_reviews.insert_one({
        "id": str(uuid.uuid4()),
        "application_id": application_id,
        "reviewer_id": str(user.get("id")),
        "reviewer_name": user.get("name", "Recruiter"),
        "rating": payload.rating,
        "notes": payload.notes,
        "created_at": now
    })

    return {"message": "Candidate review added successfully"}

@router.get("/applications/{application_id}/reviews", response_model=List[ReviewResponse])
def get_candidate_reviews(
    application_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    cursor = db.candidate_reviews.find({"application_id": application_id}).sort("created_at", -1)
    results = []
    for r in cursor:
        created_at = r.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif not isinstance(created_at, datetime):
            created_at = datetime.utcnow()

        results.append(ReviewResponse(
            id=str(r.get("id", uuid.uuid4().hex)),
            reviewer_name=r.get("reviewer_name", "Interviewer"),
            rating=int(r.get("rating", 3)),
            notes=r.get("notes", ""),
            created_at=created_at
        ))
    return results

@router.get("/applications/{application_id}/history", response_model=List[StageHistoryResponse])
def get_stage_history(
    application_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    cursor = db.application_stage_history.find({"application_id": application_id}).sort("changed_at", 1)
    results = []
    for r in cursor:
        changed_at = r.get("changed_at")
        if isinstance(changed_at, str):
            changed_at = datetime.fromisoformat(changed_at)
        elif not isinstance(changed_at, datetime):
            changed_at = datetime.utcnow()

        results.append(StageHistoryResponse(
            id=str(r.get("id", uuid.uuid4().hex)),
            from_stage=r.get("from_stage"),
            to_stage=r.get("to_stage"),
            changed_by_name=r.get("changed_by_name", "Recruiter"),
            changed_at=changed_at
        ))
    return results
