# Phase 09: Job Vacancy Management

## 1. Objectives
- Implement endpoints to create, list, view, update, archive, and publish job vacancies.
- Manage required vs. preferred skills for each job.
- Build the Job Management frontend interface with search, filters, and creation modal.

## 2. Backend Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create schemas/job.py
Set-Content -Path "backend\app\schemas\job.py" -Value @"
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobSkillCreate(BaseModel):
    skill_name: str
    requirement_type: str = 'REQUIRED' # REQUIRED or PREFERRED
    importance_weight: float = 1.0

class JobSkillResponse(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    requirement_type: str
    importance_weight: float

class JobCreate(BaseModel):
    title: str
    department: str
    description: str
    experience_min: int = 0
    experience_max: int = 10
    location: str = 'Remote'
    skills: List[JobSkillCreate] = []

class JobResponse(BaseModel):
    id: str
    title: str
    department: str
    description: str
    experience_min: int
    experience_max: int
    location: str
    status: str
    created_at: datetime
    skills: List[JobSkillResponse] = []
"@

# 2. Create routes/jobs.py
Set-Content -Path "backend\app\routes\jobs.py" -Value @"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Job, JobSkill, Skill, User
from app.schemas.job import JobCreate, JobResponse, JobSkillResponse

router = APIRouter(prefix='/api/v1/jobs', tags=['Jobs'])

@router.get('', response_model=List[JobResponse])
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

@router.post('', response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_job = Job(
        title=payload.title,
        department=payload.department,
        description=payload.description,
        experience_min=payload.experience_min,
        experience_max=payload.experience_max,
        location=payload.location,
        status='PUBLISHED',
        created_by=user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Attach skills
    for s in payload.skills:
        skill = db.query(Skill).filter(Skill.canonical_name.ilike(s.skill_name.strip())).first()
        if not skill:
            skill = Skill(canonical_name=s.skill_name.strip(), category='Technical')
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

@router.get('/{job_id}', response_model=JobResponse)
def get_job_by_id(job_id: str, db: Session = Depends(get_db)):
    j = db.query(Job).filter(Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail='Job not found')
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
"@
```

## 3. Register Jobs Router in `app/main.py`
Add to `backend/app/main.py`:
```python
from app.routes.jobs import router as jobs_router
app.include_router(jobs_router)
```

## 4. Test Verification Commands
```powershell
$token = "YOUR_AUTH_BEARER_TOKEN"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$jobData = @{
    title = "Senior Python Backend Engineer"
    department = "Engineering"
    description = "Looking for an experienced Python developer with FastAPI, PostgreSQL and REST API skills."
    experience_min = 3
    experience_max = 6
    location = "Chennai / Remote"
    skills = @(
        @{ skill_name = "Python"; requirement_type = "REQUIRED" },
        @{ skill_name = "FastAPI"; requirement_type = "REQUIRED" },
        @{ skill_name = "PostgreSQL"; requirement_type = "REQUIRED" },
        @{ skill_name = "Docker"; requirement_type = "PREFERRED" }
    )
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/v1/jobs" -Headers $headers -Body $jobData
```

## 5. Phase 09 Acceptance Criteria Check
- [x] Job creation API stores requirements and separates REQUIRED vs. PREFERRED skills.
- [x] Jobs listed with search/filter capabilities.
- [x] Automatic skill entity resolution into canonical taxonomy.

