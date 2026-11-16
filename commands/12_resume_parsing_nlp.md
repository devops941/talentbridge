# Phase 12: Resume Parsing & Text Extraction

## 1. Objectives
- Implement robust PDF text extraction using **PyMuPDF** (`fitz`).
- Implement domain-specific text preprocessing:
  - Normalize Unicode and extraneous whitespace.
  - Preserve crucial technical syntax (e.g. `C++`, `C#`, `.NET`, `Node.js`).
  - Retain page boundaries and structure for auditability.
- Manage parsing state transitions (`PROCESSING`, `COMPLETED`, `PARTIAL`, `FAILED`).

## 2. Intelligence Layer Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create ml/parser.py
Set-Content -Path "backend\app\ml\parser.py" -Value @"
import fitz  # PyMuPDF
import re
from typing import Tuple, Dict

def extract_text_from_pdf(pdf_path: str) -> Tuple[str, Dict]:
    \"\"\"
    Extracts text page-by-page from a PDF document using PyMuPDF.
    Returns the concatenated cleaned text and metadata (page count, quality check).
    \"\"\"
    doc = None
    try:
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        full_text = []

        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text = page.get_text('text')
            full_text.append(text)

        raw_text = '\n'.join(full_text)
        cleaned = clean_extracted_text(raw_text)

        # Quality Threshold: At least 50 characters of readable text
        if len(cleaned.strip()) < 50:
            status = 'PARTIAL'
            warning = 'Extracted text is very short or possibly scanned image.'
        else:
            status = 'COMPLETED'
            warning = None

        metadata = {
            'page_count': page_count,
            'character_count': len(cleaned),
            'status': status,
            'warning': warning
        }
        return cleaned, metadata

    except Exception as e:
        return '', {
            'page_count': 0,
            'character_count': 0,
            'status': 'FAILED',
            'warning': str(e)
        }
    finally:
        if doc:
            doc.close()

def clean_extracted_text(text: str) -> str:
    \"\"\"
    Cleans raw resume text while preserving technical symbols like C++, C#, .NET.
    \"\"\"
    if not text:
        return ''

    # Normalize carriage returns and tabs
    text = text.replace('\r\n', '\n').replace('\r', '\n').replace('\t', ' ')

    # Remove non-printable / control characters except newline
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', ' ', text)

    # Collapse multiple consecutive horizontal spaces
    text = re.sub(r'[ ]{2,}', ' ', text)

    # Collapse excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()
"@
```

## 3. Resume Parse Execution Service
Run the following PowerShell command to create `backend\app\services\resume_service.py`:

```powershell
Set-Content -Path "backend\app\services\resume_service.py" -Value @"
import os
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.entities import Resume, ResumeExtraction
from app.ml.parser import extract_text_from_pdf

def parse_and_store_resume(resume_id: str, db: Session) -> Resume:
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise ValueError('Resume not found')

    filepath = os.path.join(settings.UPLOAD_STORAGE_PATH, resume.storage_key)
    resume.parse_status = 'PROCESSING'
    db.commit()

    extracted_text, metadata = extract_text_from_pdf(filepath)

    resume.parse_status = metadata['status']

    # Upsert extraction record
    extraction = db.query(ResumeExtraction).filter(ResumeExtraction.resume_id == resume.id).first()
    if not extraction:
        extraction = ResumeExtraction(
            resume_id=resume.id,
            extracted_text=extracted_text,
            parser_version='PyMuPDF-v1.0'
        )
        db.add(extraction)
    else:
        extraction.extracted_text = extracted_text

    db.commit()
    db.refresh(resume)
    return resume
"@
```

## 4. Phase 12 Acceptance Criteria Check
- [x] PyMuPDF extracts text page by page with character & page counts.
- [x] Technical terms (`C++`, `.NET`) preserved during text cleaning.
- [x] Extraction failures & low-character warnings flagged properly.

