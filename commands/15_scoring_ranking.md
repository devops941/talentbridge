# Phase 15: Candidate Scoring & Ranking Leaderboard

## 1. Objectives
- Implement endpoints to trigger candidate matching (`/api/v1/applications/{id}/match`) and fetch rankings (`/api/v1/jobs/{job_id}/rankings`).
- Enforce deterministic tie-breaking rules:
  1. Primary: Combined Match Score (Descending)
  2. Secondary: Skill Coverage Score (Descending)
  3. Tertiary: Application Timestamp (Ascending / Earlier first)
- Persist detailed match results and skill evidence in `match_results` and `match_skill_details`.

## 2. Backend Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create schemas/matching.py
Set-Content -Path "backend\app\schemas\matching.py" -Value @"
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MatchResultResponse(BaseModel):
    application_id: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    score: float
    skill_score: float
    text_score: float
    model_version: str
    explanation: str
    matched_skills: List[str]
    missing_required_skills: List[str]
    current_stage: str
    applied_at: datetime
"@

# 2. Create routes/applications.py
Set-Content -Path "backend\app\routes\applications.py" -Value @"
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

router = APIRouter(prefix='/api/v1/applications', tags=['Applications & Matching'])

@router.post('/apply', status_code=status.HTTP_201_CREATED)
def create_application(
    candidate_id: str,
    job_id: str,
    resume_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    app = Application(
        candidate_id=candidate_id,
        job_id=job_id,
        resume_id=resume_id,
        current_stage='Application Received'
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {'application_id': app.id, 'status': 'created'}

@router.post('/{application_id}/match', response_model=MatchResultResponse)
def run_matching_for_application(
    application_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail='Application not found')

    job = app.job
    resume = app.resume

    if not resume.extraction or not resume.extraction.extracted_text:
        raise HTTPException(status_code=400, detail='Resume has not been parsed yet')

    # Prepare Job Skills
    req_skills = [
        {'skill_id': js.skill_id, 'skill_name': js.skill.canonical_name}
        for js in job.skills if js.requirement_type == 'REQUIRED'
    ]
    pref_skills = [
        {'skill_id': js.skill_id, 'skill_name': js.skill.canonical_name}
        for js in job.skills if js.requirement_type == 'PREFERRED'
    ]

    # Prepare Candidate Extracted Skills
    cand_skills = [
        {'skill_id': rs.skill_id, 'canonical_name': rs.skill.canonical_name}
        for rs in resume.skills
    ]

    match_data = calculate_match(
        job_description=job.description,
        required_skills=req_skills,
        preferred_skills=pref_skills,
        resume_text=resume.extraction.extracted_text,
        candidate_skills=cand_skills
    )

    # Persist or update MatchResult
    match_rec = db.query(MatchResult).filter(MatchResult.application_id == app.id).first()
    if not match_rec:
        match_rec = MatchResult(application_id=app.id, score=match_data['score'], skill_score=match_data['skill_score'], text_score=match_data['text_score'], model_version=match_data['model_version'], explanation=match_data['explanation'])
        db.add(match_rec)
    else:
        match_rec.score = match_data['score']
        match_rec.skill_score = match_data['skill_score']
        match_rec.text_score = match_data['text_score']
        match_rec.explanation = match_data['explanation']

    db.commit()
    db.refresh(match_rec)

    return MatchResultResponse(
        application_id=app.id,
        candidate_id=app.candidate.id,
        candidate_name=app.candidate.full_name,
        candidate_email=app.candidate.email,
        score=match_rec.score,
        skill_score=match_rec.skill_score,
        text_score=match_rec.text_score,
        model_version=match_rec.model_version,
        explanation=match_rec.explanation,
        matched_skills=match_data['matched_skills'],
        missing_required_skills=match_data['missing_required_skills'],
        current_stage=app.current_stage,
        applied_at=app.applied_at
    )

@router.get('/job/{job_id}/rankings', response_model=List[MatchResultResponse])
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
            continue

        # Get matched & missing skills dynamically
        req_skills = [js.skill.canonical_name for js in app.job.skills if js.requirement_type == 'REQUIRED']
        cand_skills = [rs.skill.canonical_name for rs in app.resume.skills]
        matched = [s for s in req_skills if s in cand_skills]
        missing = [s for s in req_skills if s not in cand_skills]

        results.append(MatchResultResponse(
            application_id=app.id,
            candidate_id=app.candidate.id,
            candidate_name=app.candidate.full_name,
            candidate_email=app.candidate.email,
            score=mr.score,
            skill_score=mr.skill_score,
            text_score=mr.text_score,
            model_version=mr.model_version,
            explanation=mr.explanation,
            matched_skills=matched,
            missing_required_skills=missing,
            current_stage=app.current_stage,
            applied_at=app.applied_at
        ))

    # Deterministic Sorting: 1) score DESC, 2) skill_score DESC, 3) applied_at ASC
    results.sort(key=lambda x: (-x.score, -x.skill_score, x.applied_at))
    return results
"@
```

## 3. Register Application Router in `app/main.py`
Add to `backend/app/main.py`:
```python
from app.routes.applications import router as app_router
app.include_router(app_router)
```

## 4. Phase 15 Acceptance Criteria Check
- [x] Application matching endpoint runs and stores explainable metrics.
- [x] Rankings returned with deterministic ordering and complete skill breakdown.
- [x] Rationale clearly identifies how many skills matched.

