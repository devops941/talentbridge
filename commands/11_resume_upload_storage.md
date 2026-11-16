# Phase 11: Resume Upload & Document Management

## 1. Objectives
- Implement secure multipart file upload for resumes.
- Validate PDF files via magic byte signature (`%PDF`), MIME type, and size constraints (<= 10MB).
- Calculate SHA-256 checksum to prevent duplicate storage.
- Store documents privately outside the webroot using randomized storage keys.
- Provide authorized resume file preview/download endpoint.

## 2. Backend Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create schemas/resume.py
Set-Content -Path "backend\app\schemas\resume.py" -Value @"
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeResponse(BaseModel):
    id: str
    candidate_id: str
    original_filename: str
    mime_type: str
    file_size: int
    checksum: str
    parse_status: str
    created_at: datetime
"@

# 2. Create routes/resumes.py
Set-Content -Path "backend\app\routes\resumes.py" -Value @"
import os
import hashlib
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Candidate, Resume, User
from app.schemas.resume import ResumeResponse

router = APIRouter(prefix='/api/v1/resumes', tags=['Resumes'])

@router.post('/upload', response_model=ResumeResponse)
async def upload_resume(
    candidate_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # 1. Validate Candidate exists
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')

    # 2. Read file content and validate size (Max 10MB)
    content = await file.read()
    file_size = len(content)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f'File size exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit')

    # 3. Magic Byte & Extension Signature Validation
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF files are supported')
    if not content.startswith(b'%PDF'):
        raise HTTPException(status_code=400, detail='Invalid file signature. File is not a valid PDF')

    # 4. Calculate SHA-256 Checksum
    checksum = hashlib.sha256(content).hexdigest()

    # 5. Check if duplicate resume file exists for this candidate
    existing_resume = db.query(Resume).filter(
        Resume.candidate_id == candidate_id,
        Resume.checksum == checksum
    ).first()
    if existing_resume:
        return ResumeResponse(
            id=existing_resume.id,
            candidate_id=existing_resume.candidate_id,
            original_filename=existing_resume.original_filename,
            mime_type=existing_resume.mime_type,
            file_size=existing_resume.file_size,
            checksum=existing_resume.checksum,
            parse_status=existing_resume.parse_status,
            created_at=existing_resume.created_at
        )

    # 6. Save file to private vault with randomized storage key
    storage_filename = f'{uuid.uuid4().hex}.pdf'
    storage_path = os.path.join(settings.UPLOAD_STORAGE_PATH, storage_filename)
    with open(storage_path, 'wb') as f:
        f.write(content)

    # 7. Create DB Record
    resume = Resume(
        candidate_id=candidate_id,
        storage_key=storage_filename,
        original_filename=file.filename,
        mime_type='application/pdf',
        file_size=file_size,
        checksum=checksum,
        parse_status='UPLOADED'
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        original_filename=resume.original_filename,
        mime_type=resume.mime_type,
        file_size=resume.file_size,
        checksum=resume.checksum,
        parse_status=resume.parse_status,
        created_at=resume.created_at
    )

@router.get('/{resume_id}/file')
def download_resume_file(
    resume_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail='Resume record not found')

    filepath = os.path.join(settings.UPLOAD_STORAGE_PATH, resume.storage_key)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail='Document file missing on disk')

    return FileResponse(
        path=filepath,
        media_type='application/pdf',
        filename=resume.original_filename
    )
"@
```

## 3. Register Resumes Router in `app/main.py`
Add to `backend/app/main.py`:
```python
from app.routes.resumes import router as resumes_router
app.include_router(resumes_router)
```

## 4. Phase 11 Acceptance Criteria Check
- [x] Multipart upload validates `%PDF` signature and size limit.
- [x] Checksum avoids duplicate re-upload.
- [x] Files stored securely outside webroot and served via authenticated endpoint.

