from typing import Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def normalize_skill(name: str) -> str:
    """Normalize skill name for robust semantic comparison."""
    if not name:
        return ""
    n = name.strip().lower()
    synonyms = {
        "react.js": "react",
        "reactjs": "react",
        "node": "node.js",
        "nodejs": "node.js",
        "postgres": "postgresql",
        "py": "python",
        "python3": "python",
        "typescript": "typescript",
        "ts": "typescript",
        "javascript": "javascript",
        "js": "javascript",
        "fast api": "fastapi",
        "restful api": "rest api",
        "rest apis": "rest api",
        "restful apis": "rest api",
        "docker container": "docker",
        "k8s": "kubernetes",
        "aws cloud": "aws",
        "amazon web services": "aws",
    }
    return synonyms.get(n, n)

def calculate_text_similarity(job_description: str, resume_text: str) -> float:
    """
    Computes TF-IDF Cosine Similarity between Job Description and Resume Text.
    Returns similarity mapped to a 0.0 - 100.0 scale.
    """
    if not job_description or not resume_text:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        tfidf_matrix = vectorizer.fit_transform([job_description, resume_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(sim) * 100.0, 2)
    except Exception:
        return 0.0

def calculate_match(
    job_description: str,
    required_skills: List[Dict],
    preferred_skills: List[Dict],
    resume_text: str,
    candidate_skills: List[Dict],
    skill_weight: float = 0.70,
    text_weight: float = 0.30
) -> Dict:
    """
    Calculates candidate match score against a job specification:
    Final Score = (skill_weight * Skill Coverage) + (text_weight * TF-IDF Cosine Sim)
    Compares skills by true normalized canonical names.
    """
    # Build candidate skills lookup dictionary
    cand_skill_map = {}
    for s in candidate_skills:
        name = s.get("canonical_name") or s.get("skill_name") or ""
        norm = normalize_skill(name)
        if norm:
            cand_skill_map[norm] = {
                "canonical_name": name,
                "evidence": s.get("evidence_text") or s.get("evidence") or ""
            }

    matched_skills = []
    matched_skill_details = []
    missing_skills = []

    for req in required_skills:
        req_name = req.get("skill_name") or req.get("canonical_name") or ""
        norm_req = normalize_skill(req_name)
        if norm_req in cand_skill_map:
            matched_skills.append(req_name)
            matched_skill_details.append({
                "skill_name": req_name,
                "canonical_name": cand_skill_map[norm_req]["canonical_name"],
                "evidence_text": cand_skill_map[norm_req]["evidence"]
            })
        else:
            missing_skills.append(req_name)

    # 1. Skill Coverage Score (0 - 100)
    if required_skills:
        skill_coverage_score = round((len(matched_skills) / len(required_skills)) * 100.0, 2)
    else:
        skill_coverage_score = 100.0

    # 2. Text Similarity Score (0 - 100)
    text_score = calculate_text_similarity(job_description, resume_text)

    # 3. Final Combined Score (0 - 100)
    final_score = round((skill_weight * skill_coverage_score) + (text_weight * text_score), 2)

    explanation = (
        f"{len(matched_skills)} of {len(required_skills)} required skills verified ({skill_coverage_score}% coverage). Text similarity: {text_score}%."
        if required_skills else f"No required skills designated. Text similarity: {text_score}%."
    )

    return {
        'score': final_score,
        'skill_score': skill_coverage_score,
        'text_score': text_score,
        'matched_skills': matched_skills,
        'matched_skill_details': matched_skill_details,
        'missing_required_skills': missing_skills,
        'model_version': 'deterministic-nlp-v2',
        'explanation': explanation
    }
