import os
import hashlib
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Candidate, Resume, ResumeExtraction, ResumeSkill, Skill, User
from app.schemas.resume import ResumeResponse, ResumeDetailResponse, ResumeSkillItem
from app.ml.parser import extract_text_from_pdf
from app.ml.skill_extractor import extract_skills_from_text

router = APIRouter(prefix="/api/v1/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    candidate_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    content = await file.read()
    file_size = len(content)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    if not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file signature")

    checksum = hashlib.sha256(content).hexdigest()

    existing = db.query(Resume).filter(
        Resume.candidate_id == candidate_id,
        Resume.checksum == checksum
    ).first()
    if existing:
        return existing

    storage_filename = f"{uuid.uuid4().hex}.pdf"
    os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)
    storage_path = os.path.join(settings.UPLOAD_STORAGE_PATH, storage_filename)
    with open(storage_path, "wb") as f:
        f.write(content)

    resume = Resume(
        candidate_id=candidate_id,
        storage_key=storage_filename,
        original_filename=file.filename,
        mime_type="application/pdf",
        file_size=file_size,
        checksum=checksum,
        parse_status="UPLOADED"
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Automatically trigger extraction & skill mining
    process_resume_internal(resume.id, db)

    return resume

def process_resume_internal(resume_id: str, db: Session):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        return

    filepath = os.path.join(settings.UPLOAD_STORAGE_PATH, resume.storage_key)
    resume.parse_status = "PROCESSING"
    db.commit()

    text, meta = extract_text_from_pdf(filepath)
    resume.parse_status = meta["status"]

    extraction = db.query(ResumeExtraction).filter(ResumeExtraction.resume_id == resume.id).first()
    if not extraction:
        extraction = ResumeExtraction(
            resume_id=resume.id,
            extracted_text=text,
            parser_version="PyMuPDF-v1.0"
        )
        db.add(extraction)
    else:
        extraction.extracted_text = text

    # Extract Skills
    skills = extract_skills_from_text(text, db)
    db.query(ResumeSkill).filter(ResumeSkill.resume_id == resume.id).delete()

    for s in skills:
        rs = ResumeSkill(
            resume_id=resume.id,
            skill_id=s["skill_id"],
            evidence_text=s["evidence"][:250],
            confidence=s["confidence"]
        )
        db.add(rs)

    db.commit()
    db.refresh(resume)

@router.post("/{resume_id}/process", response_model=ResumeResponse)
def trigger_resume_process(
    resume_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    process_resume_internal(resume_id, db)
    return resume

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume_details(
    resume_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    skills_list = [
        ResumeSkillItem(
            skill_id=rs.skill_id,
            canonical_name=rs.skill.canonical_name,
            evidence_text=rs.evidence_text,
            confidence=rs.confidence
        ) for rs in resume.skills
    ]

    return ResumeDetailResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        candidate_name=resume.candidate.full_name,
        original_filename=resume.original_filename,
        parse_status=resume.parse_status,
        extracted_text=resume.extraction.extracted_text if resume.extraction else None,
        skills=skills_list,
        created_at=resume.created_at
    )

@router.get("/{resume_id}/file")
def view_resume_file(
    resume_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    filepath = os.path.join(settings.UPLOAD_STORAGE_PATH, resume.storage_key)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found on storage")

    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=resume.original_filename
    )
