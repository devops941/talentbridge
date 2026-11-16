import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.job import JobCreate, JobResponse, JobSkillResponse

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse])
def list_jobs(status: Optional[str] = None, db = Depends(get_db)):
    filter_q = {}
    if status:
        filter_q["status"] = status
    cursor = db.jobs.find(filter_q).sort("created_at", -1)

    result = []
    for j in cursor:
        skills_res = [
            JobSkillResponse(
                id=idx + 1,
                skill_id=idx + 1,
                skill_name=s.get("skill_name"),
                requirement_type=s.get("requirement_type", "REQUIRED"),
                importance_weight=float(s.get("importance_weight", 1.0))
            ) for idx, s in enumerate(j.get("skills", []))
        ]
        created_at = j.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif not isinstance(created_at, datetime):
            created_at = datetime.utcnow()

        result.append(JobResponse(
            id=str(j.get("id")),
            title=j.get("title"),
            department=j.get("department"),
            description=j.get("description"),
            experience_min=j.get("experience_min", 0),
            experience_max=j.get("experience_max", 10),
            location=j.get("location", "Remote"),
            status=j.get("status", "PUBLISHED"),
            created_at=created_at,
            skills=skills_res
        ))
    return result

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db = Depends(get_db), user: dict = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    skills_data = []

    for s in payload.skills:
        name_clean = s.skill_name.strip()
        skills_data.append({
            "skill_name": name_clean,
            "requirement_type": s.requirement_type,
            "importance_weight": s.importance_weight
        })
        # Check if skill exists in taxonomy; if not, add it
        existing_skill = db.skills.find_one({"canonical_name": {"$regex": f"^{name_clean}$", "$options": "i"}})
        if not existing_skill:
            db.skills.insert_one({
                "id": str(uuid.uuid4()),
                "canonical_name": name_clean,
                "category": "Technical",
                "active": True,
                "aliases": []
            })

    now = datetime.utcnow()
    job_doc = {
        "id": job_id,
        "title": payload.title,
        "department": payload.department,
        "description": payload.description,
        "experience_min": payload.experience_min,
        "experience_max": payload.experience_max,
        "location": payload.location,
        "status": "PUBLISHED",
        "created_by": str(user.get("id")),
        "created_at": now,
        "skills": skills_data
    }
    db.jobs.insert_one(job_doc)
    return get_job_by_id(job_id, db)

@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: str, db = Depends(get_db)):
    j = db.jobs.find_one({"id": job_id})
    if not j:
        raise HTTPException(status_code=404, detail="Job opening not found")

    skills_res = [
        JobSkillResponse(
            id=idx + 1,
            skill_id=idx + 1,
            skill_name=s.get("skill_name"),
            requirement_type=s.get("requirement_type", "REQUIRED"),
            importance_weight=float(s.get("importance_weight", 1.0))
        ) for idx, s in enumerate(j.get("skills", []))
    ]
    created_at = j.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    elif not isinstance(created_at, datetime):
        created_at = datetime.utcnow()

    return JobResponse(
        id=str(j.get("id")),
        title=j.get("title"),
        department=j.get("department"),
        description=j.get("description"),
        experience_min=j.get("experience_min", 0),
        experience_max=j.get("experience_max", 10),
        location=j.get("location", "Remote"),
        status=j.get("status", "PUBLISHED"),
        created_at=created_at,
        skills=skills_res
    )
