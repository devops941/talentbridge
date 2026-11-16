import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from app.core.database import get_db
from app.core.security import get_current_user
from app.ml.matcher import calculate_match
from app.schemas.matching import MatchResultResponse

router = APIRouter(prefix="/api/v1/applications", tags=["Applications & Matching"])

@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_candidate_to_job(
    candidate_id: str,
    job_id: str,
    resume_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    existing = db.applications.find_one({
        "candidate_id": candidate_id,
        "job_id": job_id
    })
    if existing:
        return {"application_id": str(existing.get("id")), "status": "already_applied"}

    app_id = str(uuid.uuid4())
    now = datetime.utcnow()
    app_doc = {
        "id": app_id,
        "candidate_id": candidate_id,
        "job_id": job_id,
        "resume_id": resume_id,
        "current_stage": "Application Received",
        "applied_at": now
    }
    db.applications.insert_one(app_doc)

    # Immediately calculate match for recruiter convenience
    calculate_application_match_internal(app_id, db)

    return {"application_id": app_id, "status": "created"}

def calculate_application_match_internal(application_id: str, db):
    app = db.applications.find_one({"id": application_id})
    if not app:
        return None

    job = db.jobs.find_one({"id": app.get("job_id")})
    resume = db.resumes.find_one({"id": app.get("resume_id")})

    if not job or not resume:
        return None

    extracted_text = resume.get("extracted_text", "")
    job_description = job.get("description", "")

    req_skills = [
        {"skill_name": s.get("skill_name")}
        for s in job.get("skills", [])
        if s.get("requirement_type") == "REQUIRED"
    ]
    pref_skills = [
        {"skill_name": s.get("skill_name")}
        for s in job.get("skills", [])
        if s.get("requirement_type") == "PREFERRED"
    ]

    cand_skills = [
        {
            "canonical_name": s.get("canonical_name"),
            "evidence_text": s.get("evidence_text", "")
        }
        for s in resume.get("skills", [])
    ]

    match_data = calculate_match(
        job_description=job_description,
        required_skills=req_skills,
        preferred_skills=pref_skills,
        resume_text=extracted_text,
        candidate_skills=cand_skills
    )

    now = datetime.utcnow()
    db.match_results.update_one(
        {"application_id": application_id},
        {"$set": {
            "application_id": application_id,
            "score": match_data["score"],
            "skill_score": match_data["skill_score"],
            "text_score": match_data["text_score"],
            "model_version": match_data["model_version"],
            "explanation": match_data["explanation"],
            "matched_skills": match_data["matched_skills"],
            "matched_skill_details": match_data.get("matched_skill_details", []),
            "missing_required_skills": match_data["missing_required_skills"],
            "updated_at": now
        }},
        upsert=True
    )
    return match_data

def get_application_match_result(application_id: str, db) -> MatchResultResponse:
    app = db.applications.find_one({"id": application_id})
    mr = db.match_results.find_one({"application_id": application_id})
    cand = db.candidates.find_one({"id": app.get("candidate_id")}) if app else None

    applied_at = app.get("applied_at") if app else datetime.utcnow()
    if isinstance(applied_at, str):
        applied_at = datetime.fromisoformat(applied_at)
    elif not isinstance(applied_at, datetime):
        applied_at = datetime.utcnow()

    return MatchResultResponse(
        application_id=app.get("id", ""),
        candidate_id=cand.get("id") if cand else "",
        candidate_name=cand.get("full_name") if cand else "Candidate",
        candidate_email=cand.get("email") if cand else "",
        resume_id=app.get("resume_id") if app else None,
        score=mr.get("score", 0.0) if mr else 0.0,
        skill_score=mr.get("skill_score", 0.0) if mr else 0.0,
        text_score=mr.get("text_score", 0.0) if mr else 0.0,
        model_version=mr.get("model_version", "deterministic-nlp-v2") if mr else "deterministic-nlp-v2",
        explanation=mr.get("explanation", "") if mr else "Pending match calculation",
        matched_skills=mr.get("matched_skills", []) if mr else [],
        matched_skill_details=mr.get("matched_skill_details", []) if mr else [],
        missing_required_skills=mr.get("missing_required_skills", []) if mr else [],
        current_stage=app.get("current_stage", "Application Received") if app else "Application Received",
        applied_at=applied_at
    )

@router.post("/{application_id}/match", response_model=MatchResultResponse)
def trigger_application_matching(
    application_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    app = db.applications.find_one({"id": application_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    calculate_application_match_internal(application_id, db)
    return get_application_match_result(application_id, db)

@router.get("/job/{job_id}/rankings", response_model=List[MatchResultResponse])
def get_job_rankings(
    job_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    apps = list(db.applications.find({"job_id": job_id}))
    results = []

    for app in apps:
        app_id = app.get("id")
        mr = db.match_results.find_one({"application_id": app_id})
        if not mr:
            calculate_application_match_internal(app_id, db)
            mr = db.match_results.find_one({"application_id": app_id})

        cand = db.candidates.find_one({"id": app.get("candidate_id")})
        applied_at = app.get("applied_at")
        if isinstance(applied_at, str):
            applied_at = datetime.fromisoformat(applied_at)
        elif not isinstance(applied_at, datetime):
            applied_at = datetime.utcnow()

        results.append(MatchResultResponse(
            application_id=app_id,
            candidate_id=cand.get("id") if cand else "",
            candidate_name=cand.get("full_name") if cand else "Candidate",
            candidate_email=cand.get("email") if cand else "",
            resume_id=app.get("resume_id"),
            score=mr.get("score", 0.0) if mr else 0.0,
            skill_score=mr.get("skill_score", 0.0) if mr else 0.0,
            text_score=mr.get("text_score", 0.0) if mr else 0.0,
            model_version=mr.get("model_version", "deterministic-nlp-v2") if mr else "deterministic-nlp-v2",
            explanation=mr.get("explanation", "") if mr else "",
            matched_skills=mr.get("matched_skills", []) if mr else [],
            matched_skill_details=mr.get("matched_skill_details", []) if mr else [],
            missing_required_skills=mr.get("missing_required_skills", []) if mr else [],
            current_stage=app.get("current_stage", "Application Received"),
            applied_at=applied_at
        ))

    # Deterministic Tie-Breaker: Score DESC -> Skill Score DESC -> Applied At ASC
    results.sort(key=lambda x: (-x.score, -x.skill_score, x.applied_at))
    return results

@router.post("/job/{job_id}/score-all", response_model=List[MatchResultResponse])
def recalculate_all_job_rankings(
    job_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Recalculates match scores for all existing applicants of this job.
    Also links any candidate with an uploaded resume who isn't applied yet,
    allowing the recruiter to evaluate the entire candidate pool in 1 click.
    """
    job = db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")

    # 1. Recalculate existing applications
    existing_apps = list(db.applications.find({"job_id": job_id}))
    existing_candidate_ids = {a.get("candidate_id") for a in existing_apps}

    for app in existing_apps:
        calculate_application_match_internal(app.get("id"), db)

    # 2. Check all candidates with parsed resumes
    all_resumes = list(db.resumes.find().sort("created_at", -1))
    seen_candidates = set()

    for r in all_resumes:
        c_id = r.get("candidate_id")
        if c_id and c_id not in seen_candidates and c_id not in existing_candidate_ids:
            seen_candidates.add(c_id)
            # Create application link
            new_app_id = str(uuid.uuid4())
            now = datetime.utcnow()
            db.applications.insert_one({
                "id": new_app_id,
                "candidate_id": c_id,
                "job_id": job_id,
                "resume_id": r.get("id"),
                "current_stage": "Application Received",
                "applied_at": now
            })
            calculate_application_match_internal(new_app_id, db)

    return get_job_rankings(job_id, db, user)

@router.post("/job/{job_id}/evaluate-candidate", response_model=MatchResultResponse)
def evaluate_single_candidate(
    job_id: str,
    candidate_id: str = Body(..., embed=True),
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Links a specific candidate to this job opening and returns their score immediately.
    """
    resume = db.resumes.find_one({"candidate_id": candidate_id}, sort=[("created_at", -1)])
    if not resume:
        raise HTTPException(status_code=400, detail="Candidate does not have an uploaded resume.")

    app = db.applications.find_one({"candidate_id": candidate_id, "job_id": job_id})
    if not app:
        app_id = str(uuid.uuid4())
        now = datetime.utcnow()
        app = {
            "id": app_id,
            "candidate_id": candidate_id,
            "job_id": job_id,
            "resume_id": resume.get("id"),
            "current_stage": "Application Received",
            "applied_at": now
        }
        db.applications.insert_one(app)
    else:
        app_id = app.get("id")

    calculate_application_match_internal(app_id, db)
    return get_application_match_result(app_id, db)
