from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import (
    Application, Candidate, Job, Resume, ResumeSkill, MatchResult, MatchSkillDetail, User
)
from app.ml.matcher import calculate_match
from app.schemas.matching import MatchResultResponse

router = APIRouter(prefix="/api/v1/applications", tags=["Applications & Matching"])

@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_candidate_to_job(
    candidate_id: str,
    job_id: str,
    resume_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    existing = db.query(Application).filter(
        Application.candidate_id == candidate_id,
        Application.job_id == job_id
    ).first()
    if existing:
        return {"application_id": existing.id, "status": "already_applied"}

    app = Application(
        candidate_id=candidate_id,
        job_id=job_id,
        resume_id=resume_id,
        current_stage="Application Received"
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # Immediately calculate match for recruiter convenience
    calculate_application_match_internal(app.id, db)

    return {"application_id": app.id, "status": "created"}

def calculate_application_match_internal(application_id: str, db: Session):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        return None

    job = app.job
    resume = app.resume

    if not resume.extraction or not resume.extraction.extracted_text:
        return None

    req_skills = [
        {"skill_id": js.skill_id, "skill_name": js.skill.canonical_name}
        for js in job.skills if js.requirement_type == "REQUIRED"
    ]
    pref_skills = [
        {"skill_id": js.skill_id, "skill_name": js.skill.canonical_name}
        for js in job.skills if js.requirement_type == "PREFERRED"
    ]

    cand_skills = [
        {"skill_id": rs.skill_id, "canonical_name": rs.skill.canonical_name}
        for rs in resume.skills
    ]

    match_data = calculate_match(
        job_description=job.description,
        required_skills=req_skills,
        preferred_skills=pref_skills,
        resume_text=resume.extraction.extracted_text,
        candidate_skills=cand_skills
    )

    match_rec = db.query(MatchResult).filter(MatchResult.application_id == app.id).first()
    if not match_rec:
        match_rec = MatchResult(
            application_id=app.id,
            score=match_data["score"],
            skill_score=match_data["skill_score"],
            text_score=match_data["text_score"],
            model_version=match_data["model_version"],
            explanation=match_data["explanation"]
        )
        db.add(match_rec)
    else:
        match_rec.score = match_data["score"]
        match_rec.skill_score = match_data["skill_score"]
        match_rec.text_score = match_data["text_score"]
        match_rec.explanation = match_data["explanation"]

    db.commit()
    db.refresh(match_rec)
    return match_data

@router.post("/{application_id}/match", response_model=MatchResultResponse)
def trigger_application_matching(
    application_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if not app.resume.extraction or not app.resume.extraction.extracted_text:
        raise HTTPException(status_code=400, detail="Resume has not been parsed yet")

    calculate_application_match_internal(application_id, db)
    return get_application_match_result(application_id, db)

def get_application_match_result(application_id: str, db: Session) -> MatchResultResponse:
    app = db.query(Application).filter(Application.id == application_id).first()
    mr = db.query(MatchResult).filter(MatchResult.application_id == app.id).first()

    req_skills = [js.skill.canonical_name for js in app.job.skills if js.requirement_type == "REQUIRED"]
    cand_skills = [rs.skill.canonical_name for rs in app.resume.skills]
    matched = [s for s in req_skills if s in cand_skills]
    missing = [s for s in req_skills if s not in cand_skills]

    return MatchResultResponse(
        application_id=app.id,
        candidate_id=app.candidate.id,
        candidate_name=app.candidate.full_name,
        candidate_email=app.candidate.email,
        score=mr.score if mr else 0.0,
        skill_score=mr.skill_score if mr else 0.0,
        text_score=mr.text_score if mr else 0.0,
        model_version=mr.model_version if mr else "baseline-v1",
        explanation=mr.explanation if mr else "Pending match calculation",
        matched_skills=matched,
        missing_required_skills=missing,
        current_stage=app.current_stage,
        applied_at=app.applied_at
    )

@router.get("/job/{job_id}/rankings", response_model=List[MatchResultResponse])
def get_job_rankings(
    job_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    results = []

    for app in apps:
        mr = db.query(MatchResult).filter(MatchResult.application_id == app.id).first()
        if not mr:
            # compute on the fly
            calculate_application_match_internal(app.id, db)
            mr = db.query(MatchResult).filter(MatchResult.application_id == app.id).first()

        req_skills = [js.skill.canonical_name for js in app.job.skills if js.requirement_type == "REQUIRED"]
        cand_skills = [rs.skill.canonical_name for rs in app.resume.skills] if app.resume else []
        matched = [s for s in req_skills if s in cand_skills]
        missing = [s for s in req_skills if s not in cand_skills]

        results.append(MatchResultResponse(
            application_id=app.id,
            candidate_id=app.candidate.id,
            candidate_name=app.candidate.full_name,
            candidate_email=app.candidate.email,
            score=mr.score if mr else 0.0,
            skill_score=mr.skill_score if mr else 0.0,
            text_score=mr.text_score if mr else 0.0,
            model_version=mr.model_version if mr else "baseline-v1",
            explanation=mr.explanation if mr else "",
            matched_skills=matched,
            missing_required_skills=missing,
            current_stage=app.current_stage,
            applied_at=app.applied_at
        ))

    # Deterministic Tie-Breaker: Score DESC -> Skill Score DESC -> Applied At ASC
    results.sort(key=lambda x: (-x.score, -x.skill_score, x.applied_at))
    return results
