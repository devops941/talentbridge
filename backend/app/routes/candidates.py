import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.candidate import CandidateCreate, CandidateResponse

router = APIRouter(prefix="/api/v1/candidates", tags=["Candidates"])

@router.get("", response_model=List[CandidateResponse])
def list_candidates(query: Optional[str] = None, db = Depends(get_db)):
    filter_q = {}
    if query:
        filter_q["$or"] = [
            {"full_name": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]
    cursor = db.candidates.find(filter_q).sort("created_at", -1)

    result = []
    for c in cursor:
        created_at = c.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif not isinstance(created_at, datetime):
            created_at = datetime.utcnow()

        result.append(CandidateResponse(
            id=str(c.get("id")),
            full_name=c.get("full_name"),
            email=c.get("email"),
            phone=c.get("phone"),
            location=c.get("location"),
            created_at=created_at,
            duplicate_warning=False
        ))
    return result

@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(payload: CandidateCreate, db = Depends(get_db), user: dict = Depends(get_current_user)):
    existing = db.candidates.find_one({"email": payload.email})
    if existing:
        created_at = existing.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif not isinstance(created_at, datetime):
            created_at = datetime.utcnow()

        return CandidateResponse(
            id=str(existing.get("id")),
            full_name=existing.get("full_name"),
            email=existing.get("email"),
            phone=existing.get("phone"),
            location=existing.get("location"),
            created_at=created_at,
            duplicate_warning=True
        )

    cand_id = str(uuid.uuid4())
    now = datetime.utcnow()
    doc = {
        "id": cand_id,
        "full_name": payload.full_name,
        "email": payload.email,
        "phone": payload.phone,
        "location": payload.location,
        "created_at": now
    }
    db.candidates.insert_one(doc)

    return CandidateResponse(
        id=cand_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        location=payload.location,
        created_at=now,
        duplicate_warning=False
    )

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str, db = Depends(get_db)):
    c = db.candidates.find_one({"id": candidate_id})
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    created_at = c.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    elif not isinstance(created_at, datetime):
        created_at = datetime.utcnow()

    return CandidateResponse(
        id=str(c.get("id")),
        full_name=c.get("full_name"),
        email=c.get("email"),
        phone=c.get("phone"),
        location=c.get("location"),
        created_at=created_at,
        duplicate_warning=False
    )
