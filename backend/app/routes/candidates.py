from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Candidate
from app.schemas.candidate import CandidateCreate, CandidateResponse

router = APIRouter(prefix="/api/v1/candidates", tags=["Candidates"])

@router.get("", response_model=List[CandidateResponse])
def list_candidates(query: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Candidate)
    if query:
        q = q.filter(
            (Candidate.full_name.ilike(f"%{query}%")) |
            (Candidate.email.ilike(f"%{query}%"))
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

@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
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

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return CandidateResponse(
        id=c.id,
        full_name=c.full_name,
        email=c.email,
        phone=c.phone,
        location=c.location,
        created_at=c.created_at
    )
