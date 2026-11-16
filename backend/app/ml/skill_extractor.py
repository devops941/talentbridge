import re
from typing import List, Dict

def extract_skills_from_text(text: str, db) -> List[Dict]:
    """
    Extracts canonical skills from resume text using exact/phrase matching
    against the curated skill taxonomy and approved synonym aliases stored in MongoDB.
    Captures ~60 character evidence windows for recruiter explainability.
    """
    if not text:
        return []

    skills = list(db.skills.find({"active": True}))
    extracted_results = {}
    lower_text = text.lower()

    for skill in skills:
        canonical_name = skill.get("canonical_name", "")
        aliases = skill.get("aliases", [])
        search_terms = [canonical_name] + aliases

        for term in search_terms:
            term_clean = term.strip().lower()
            if not term_clean:
                continue

            escaped_term = re.escape(term_clean)
            # Use lookbehind and lookahead to respect word boundaries
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

                skill_id = str(skill.get("id") or skill.get("_id"))
                if skill_id not in extracted_results:
                    extracted_results[skill_id] = {
                        'skill_id': skill_id,
                        'canonical_name': canonical_name,
                        'matched_alias': term,
                        'evidence': evidence,
                        'confidence': 1.0
                    }
                break

    return list(extracted_results.values())
