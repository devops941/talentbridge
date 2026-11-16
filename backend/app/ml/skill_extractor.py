import re
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.entities import Skill

def extract_skills_from_text(text: str, db: Session) -> List[Dict]:
    """
    Extracts canonical skills from resume text using exact/phrase matching
    against the curated skill taxonomy and approved synonym aliases.
    Captures ~60 character evidence windows for recruiter explainability.
    """
    if not text:
        return []

    skills = db.query(Skill).filter(Skill.active == True).all()
    extracted_results = {}
    lower_text = text.lower()

    for skill in skills:
        canonical_name = skill.canonical_name
        search_terms = [canonical_name] + [a.alias for a in skill.aliases]

        for term in search_terms:
            term_clean = term.strip().lower()
            if not term_clean:
                continue

            escaped_term = re.escape(term_clean)
            # Use negative lookbehind and lookahead to respect word boundaries
            pattern = rf'(?<![a-zA-Z0-9]){escaped_term}(?![a-zA-Z0-9])'
            match = re.search(pattern, lower_text)

            if match:
                start_idx = match.start()
                end_idx = match.end()

                # Extract evidence window (~30 chars before and after match)
                snippet_start = max(0, start_idx - 30)
                snippet_end = min(len(text), end_idx + 30)
                evidence = text[snippet_start:snippet_end].replace('\n', ' ').strip()
                if snippet_start > 0:
                    evidence = '...' + evidence
                if snippet_end < len(text):
                    evidence = evidence + '...'

                if skill.id not in extracted_results:
                    extracted_results[skill.id] = {
                        'skill_id': skill.id,
                        'canonical_name': canonical_name,
                        'matched_alias': term,
                        'evidence': evidence,
                        'confidence': 1.0
                    }
                break

    return list(extracted_results.values())
