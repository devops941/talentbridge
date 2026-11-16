from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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
    """
    candidate_skill_ids = {s['skill_id'] for s in candidate_skills}
    required_skill_ids = {s['skill_id'] for s in required_skills}

    matched_required_ids = required_skill_ids.intersection(candidate_skill_ids)
    missing_required_ids = required_skill_ids.difference(candidate_skill_ids)

    # 1. Skill Coverage Score (0 - 100)
    if required_skill_ids:
        skill_coverage_score = round((len(matched_required_ids) / len(required_skill_ids)) * 100.0, 2)
    else:
        skill_coverage_score = 0.0

    # 2. Text Similarity Score (0 - 100)
    text_score = calculate_text_similarity(job_description, resume_text)

    # 3. Final Combined Score (0 - 100)
    final_score = round((skill_weight * skill_coverage_score) + (text_weight * text_score), 2)

    # Human-readable labels for explainability
    matched_skills = [s['skill_name'] for s in required_skills if s['skill_id'] in matched_required_ids]
    missing_skills = [s['skill_name'] for s in required_skills if s['skill_id'] in missing_required_ids]

    explanation = (
        f"{len(matched_skills)} of {len(required_skills)} required skills were identified in the resume."
        if required_skills else "No required skills configured for this job opening."
    )

    return {
        'score': final_score,
        'skill_score': skill_coverage_score,
        'text_score': text_score,
        'matched_skills': matched_skills,
        'missing_required_skills': missing_skills,
        'model_version': 'baseline-v1',
        'explanation': explanation
    }

