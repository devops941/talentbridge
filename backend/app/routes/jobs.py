from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Job, JobSkill, Skill, User
from app.schemas.job import JobCreate, JobResponse, JobSkillResponse

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse])
def list_jobs(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    jobs = query.order_by(Job.created_at.desc()).all()

    result = []
    for j in jobs:
        skill_res = [
            JobSkillResponse(
                id=js.id,
                skill_id=js.skill_id,
                skill_name=js.skill.canonical_name,
                requirement_type=js.requirement_type,
                importance_weight=js.importance_weight
            ) for js in j.skills
        ]
        result.append(JobResponse(
            id=j.id,
            title=j.title,
            department=j.department,
            description=j.description,
            experience_min=j.experience_min,
            experience_max=j.experience_max,
            location=j.location,
            status=j.status,
            created_at=j.created_at,
            skills=skill_res
        ))
    return result

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_job = Job(
        title=payload.title,
        department=payload.department,
        description=payload.description,
        experience_min=payload.experience_min,
        experience_max=payload.experience_max,
        location=payload.location,
        status="PUBLISHED",
        created_by=user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Attach skills
    for s in payload.skills:
        skill_name_clean = s.skill_name.strip()
        skill = db.query(Skill).filter(Skill.canonical_name.ilike(skill_name_clean)).first()
        if not skill:
            skill = Skill(canonical_name=skill_name_clean, category="Technical")
            db.add(skill)
            db.commit()
            db.refresh(skill)

        job_skill = JobSkill(
            job_id=new_job.id,
            skill_id=skill.id,
            requirement_type=s.requirement_type,
            importance_weight=s.importance_weight
        )
        db.add(job_skill)
    db.commit()
    db.refresh(new_job)
    return get_job_by_id(new_job.id, db)

@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: str, db: Session = Depends(get_db)):
    j = db.query(Job).filter(Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job vacancy not found")

    skill_res = [
        JobSkillResponse(
            id=js.id,
            skill_id=js.skill_id,
            skill_name=js.skill.canonical_name,
            requirement_type=js.requirement_type,
            importance_weight=js.importance_weight
        ) for js in j.skills
    ]
    return JobResponse(
        id=j.id,
        title=j.title,
        department=j.department,
        description=j.description,
        experience_min=j.experience_min,
        experience_max=j.experience_max,
        location=j.location,
        status=j.status,
        created_at=j.created_at,
        skills=skill_res
    )
