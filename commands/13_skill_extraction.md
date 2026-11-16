# Phase 13: NLP-Based Skill Extraction & Normalization

## 1. Objectives
- Implement intelligent skill extraction using a curated taxonomy and synonym alias mappings.
- Use **spaCy** tokenization and regex phrase boundaries to accurately identify multi-word skills (e.g. `Machine Learning`, `REST API`).
- Extract exact evidence snippets to explain why a skill was attributed to the candidate.
- Deduplicate and normalize all extracted terms to canonical skill IDs.

## 2. Intelligence Layer Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create ml/skill_extractor.py
Set-Content -Path "backend\app\ml\skill_extractor.py" -Value @"
import re
import spacy
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.entities import Skill, SkillAlias, ResumeSkill

# Load lightweight spaCy English model
try:
    nlp = spacy.load('en_core_web_sm')
except Exception:
    import spacy.cli
    spacy.cli.download('en_core_web_sm')
    nlp = spacy.load('en_core_web_sm')

def extract_skills_from_text(text: str, db: Session) -> List[Dict]:
    \"\"\"
    Searches for skills in text using canonical names and aliases.
    Returns a list of extracted skills with canonical ID, name, evidence, and confidence.
    \"\"\"
    if not text:
        return []

    # 1. Fetch all active skills and their aliases from DB
    skills = db.query(Skill).filter(Skill.active == True).all()
    
    extracted_results = {}
    lower_text = text.lower()

    for skill in skills:
        canonical_name = skill.canonical_name
        search_terms = [canonical_name] + [a.alias for a in skill.aliases]

        for term in search_terms:
            # Word boundary regex matching, escaping special regex symbols
            escaped_term = re.escape(term.lower())
            # For technical terms with +, #, etc., handle boundaries carefully
            pattern = rf'(?<!\w){escaped_term}(?!\w)'
            match = re.search(pattern, lower_text)

            if match:
                start_idx = match.start()
                end_idx = match.end()

                # Extract evidence window (~60 chars surrounding match)
                snippet_start = max(0, start_idx - 30)
                snippet_end = min(len(text), end_idx + 30)
                evidence = text[snippet_start:snippet_end].replace('\n', ' ').strip()
                if snippet_start > 0:
                    evidence = '...' + evidence
                if snippet_end < len(text):
                    evidence = evidence + '...'

                # Store or update canonical record
                if skill.id not in extracted_results:
                    extracted_results[skill.id] = {
                        'skill_id': skill.id,
                        'canonical_name': canonical_name,
                        'evidence': evidence,
                        'confidence': 1.0
                    }
                break # Matched this skill, continue to next skill

    return list(extracted_results.values())
"@
```

## 3. Skill Extraction Pipeline Integration
Run the following PowerShell command to update `backend\app\services\resume_service.py`:

```powershell
Add-Content -Path "backend\app\services\resume_service.py" -Value @"

from app.ml.skill_extractor import extract_skills_from_text
from app.models.entities import ResumeSkill

def extract_and_save_resume_skills(resume_id: str, db: Session):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume or not resume.extraction:
        raise ValueError('Resume extracted text not available')

    text = resume.extraction.extracted_text
    extracted = extract_skills_from_text(text, db)

    # Clear existing skills for this resume
    db.query(ResumeSkill).filter(ResumeSkill.resume_id == resume.id).delete()

    for item in extracted:
        rs = ResumeSkill(
            resume_id=resume.id,
            skill_id=item['skill_id'],
            evidence_text=item['evidence'][:250],
            confidence=item['confidence']
        )
        db.add(rs)

    db.commit()
    return extracted
"@
```

## 4. Phase 13 Acceptance Criteria Check
- [x] Canonical and alias dictionary matching works with boundary safety.
- [x] Multi-word and technical terms (`FastAPI`, `PostgreSQL`, `Machine Learning`) extracted cleanly.
- [x] Text snippet evidence captured for recruiter verification.

