import os
import hashlib
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.resume import ResumeResponse, ResumeDetailResponse, ResumeSkillItem
from app.ml.parser import extract_text_from_pdf
from app.ml.skill_extractor import extract_skills_from_text

router = APIRouter(prefix="/api/v1/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    candidate_id: str = Form(...),
    file: UploadFile = File(...),
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    candidate = db.candidates.find_one({"id": candidate_id})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    content = await file.read()
    file_size = len(content)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    if not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file signature")

    checksum = hashlib.sha256(content).hexdigest()

    existing = db.resumes.find_one({"candidate_id": candidate_id, "checksum": checksum})
    if existing:
        created_at = existing.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif not isinstance(created_at, datetime):
            created_at = datetime.utcnow()

        return ResumeResponse(
            id=str(existing.get("id")),
            candidate_id=existing.get("candidate_id"),
            original_filename=existing.get("original_filename"),
            mime_type=existing.get("mime_type", "application/pdf"),
            file_size=existing.get("file_size"),
            checksum=existing.get("checksum"),
            parse_status=existing.get("parse_status"),
            created_at=created_at
        )

    storage_filename = f"{uuid.uuid4().hex}.pdf"
    os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)
    storage_path = os.path.join(settings.UPLOAD_STORAGE_PATH, storage_filename)
    with open(storage_path, "wb") as f:
        f.write(content)

    resume_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # Extract text & skills
    text, meta = extract_text_from_pdf(storage_path)
    skills_found = extract_skills_from_text(text, db)

    skills_data = [
        {
            "skill_id": idx + 1,
            "canonical_name": s["canonical_name"],
            "evidence_text": s["evidence"][:250],
            "confidence": 1.0
        } for idx, s in enumerate(skills_found)
    ]

    resume_doc = {
        "id": resume_id,
        "candidate_id": candidate_id,
        "storage_key": storage_filename,
        "original_filename": file.filename,
        "mime_type": "application/pdf",
        "file_size": file_size,
        "checksum": checksum,
        "parse_status": meta["status"],
        "extracted_text": text,
        "skills": skills_data,
        "created_at": now
    }
    db.resumes.insert_one(resume_doc)

    return ResumeResponse(
        id=resume_id,
        candidate_id=candidate_id,
        original_filename=file.filename,
        mime_type="application/pdf",
        file_size=file_size,
        checksum=checksum,
        parse_status=meta["status"],
        created_at=now
    )

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume_details(
    resume_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    resume = db.resumes.find_one({"id": resume_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found")

    candidate = db.candidates.find_one({"id": resume.get("candidate_id")})
    cand_name = candidate.get("full_name") if candidate else "Candidate"

    skills_list = [
        ResumeSkillItem(
            skill_id=s.get("skill_id", idx + 1),
            canonical_name=s.get("canonical_name"),
            evidence_text=s.get("evidence_text"),
            confidence=s.get("confidence", 1.0)
        ) for idx, s in enumerate(resume.get("skills", []))
    ]

    created_at = resume.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    elif not isinstance(created_at, datetime):
        created_at = datetime.utcnow()

    return ResumeDetailResponse(
        id=str(resume.get("id")),
        candidate_id=resume.get("candidate_id"),
        candidate_name=cand_name,
        original_filename=resume.get("original_filename"),
        parse_status=resume.get("parse_status"),
        extracted_text=resume.get("extracted_text"),
        skills=skills_list,
        created_at=created_at
    )

@router.get("/{resume_id}/file")
def view_resume_file(
    resume_id: str,
    db = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    resume = db.resumes.find_one({"id": resume_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    filepath = os.path.join(settings.UPLOAD_STORAGE_PATH, resume.get("storage_key"))
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found on storage")

    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=resume.get("original_filename")
    )
