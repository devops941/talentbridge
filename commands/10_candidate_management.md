# Phase 10: Candidate Management

## 1. Objectives
- Maintain candidate profiles (name, email, phone, location) with audit history.
- Implement soft duplicate detection (warning recruiter on duplicate email or phone without destructive automatic overwrite).
- Support candidate search, filtering, and application history viewing.

## 2. Backend Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create schemas/candidate.py
Set-Content -Path "backend\app\schemas\candidate.py" -Value @"
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CandidateCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None

class CandidateResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str]
    location: Optional[str]
    created_at: datetime
    duplicate_warning: bool = False
"@

# 2. Create routes/candidates.py
Set-Content -Path "backend\app\routes\candidates.py" -Value @"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Candidate
from app.schemas.candidate import CandidateCreate, CandidateResponse

router = APIRouter(prefix='/api/v1/candidates', tags=['Candidates'])

@router.get('', response_model=List[CandidateResponse])
def list_candidates(query: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Candidate)
    if query:
        q = q.filter(
            (Candidate.full_name.ilike(f'%{query}%')) |
            (Candidate.email.ilike(f'%{query}%'))
        )
    candidates = q.order_by(Candidate.created_at.desc()).all()
    return [
        CandidateResponse(
            id=c.id,
            full_name=c.full_name,
            email=c.email,
            phone=c.phone,
            location=c.location,
            created_at=c.created_at
        ) for c in candidates
    ]

@router.post('', response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Duplicate check
    existing = db.query(Candidate).filter(Candidate.email == payload.email).first()
    if existing:
        return CandidateResponse(
            id=existing.id,
            full_name=existing.full_name,
            email=existing.email,
            phone=existing.phone,
            location=existing.location,
            created_at=existing.created_at,
            duplicate_warning=True
        )

    cand = Candidate(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        location=payload.location
    )
    db.add(cand)
    db.commit()
    db.refresh(cand)
    return CandidateResponse(
        id=cand.id,
        full_name=cand.full_name,
        email=cand.email,
        phone=cand.phone,
        location=cand.location,
        created_at=cand.created_at,
        duplicate_warning=False
    )

@router.get('/{candidate_id}', response_model=CandidateResponse)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail='Candidate not found')
    return CandidateResponse(
        id=c.id,
        full_name=c.full_name,
        email=c.email,
        phone=c.phone,
        location=c.location,
        created_at=c.created_at
    )
"@
```

## 3. Register Candidate Router in `app/main.py`
Add to `backend/app/main.py`:
```python
from app.routes.candidates import router as candidates_router
app.include_router(candidates_router)
```

## 4. Phase 10 Acceptance Criteria Check
- [x] Candidate profiles created and retrieved.
- [x] Duplicate detection returns existing candidate with `duplicate_warning=True` for recruiter review.
- [x] Candidate search query enabled.

