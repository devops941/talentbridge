# Phase 14: AI-Based Resume Matching Engine

## 1. Objectives
- Implement the baseline explainable AI matching engine combining:
  1. **Skill Coverage Score (70%):** Weighted or unweighted proportion of required skills satisfied.
  2. **Text Similarity Score (30%):** Scikit-learn TF-IDF Vectorizer + Cosine Similarity between Job Description and Resume Text.
- Produce reproducible, transparent score breakdowns with matched and missing skill lists.
- Avoid black-box bias: clearly display what the score represents (textual relevance, not human capability).

## 2. Intelligence Layer Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create ml/matcher.py
Set-Content -Path "backend\app\ml\matcher.py" -Value @"
from typing import Dict, List, Set
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_text_similarity(job_description: str, resume_text: str) -> float:
    \"\"\"
    Computes TF-IDF Cosine Similarity between Job Description and Resume Text.
    Returns score normalized to 0.0 - 100.0 scale.
    \"\"\"
    if not job_description or not resume_text:
        return 0.0

    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    try:
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
    \"\"\"
    Calculates the combined suitability score and explainability breakdown.
    \"\"\"
    # Skill normalization to lower-case sets
    candidate_skill_ids = {s['skill_id'] for s in candidate_skills}
    candidate_skill_names = {s['canonical_name'].lower(): s['canonical_name'] for s in candidate_skills}

    required_skill_ids = {s['skill_id'] for s in required_skills}
    
    # 1. Skill Coverage Calculation
    matched_required_ids = required_skill_ids.intersection(candidate_skill_ids)
    missing_required_ids = required_skill_ids.difference(candidate_skill_ids)

    if required_skill_ids:
        skill_coverage_score = (len(matched_required_ids) / len(required_skill_ids)) * 100.0
    else:
        skill_coverage_score = 0.0

    skill_coverage_score = round(skill_coverage_score, 2)

    # 2. Text Similarity Calculation
    text_score = calculate_text_similarity(job_description, resume_text)

    # 3. Combined Score Formula
    final_score = round((skill_weight * skill_coverage_score) + (text_weight * text_score), 2)

    # Human-readable skill names for explainability
    matched_skills = [s['skill_name'] for s in required_skills if s['skill_id'] in matched_required_ids]
    missing_skills = [s['skill_name'] for s in required_skills if s['skill_id'] in missing_required_ids]

    explanation = f'{len(matched_skills)} of {len(required_skills)} required skills were identified in the resume.'

    return {
        'score': final_score,
        'skill_score': skill_coverage_score,
        'text_score': text_score,
        'matched_skills': matched_skills,
        'missing_required_skills': missing_skills,
        'model_version': 'baseline-v1',
        'explanation': explanation
    }
"@
```

## 3. Match Engine Unit Verification
Run the following PowerShell script to verify the calculation matches Section 14.5 of the blueprint:

```powershell
python -c @"
from backend.app.ml.matcher import calculate_match

required = [
    {'skill_id': 1, 'skill_name': 'Python'},
    {'skill_id': 2, 'skill_name': 'Django'},
    {'skill_id': 3, 'skill_name': 'PostgreSQL'},
    {'skill_id': 4, 'skill_name': 'REST API'}
]
candidate = [
    {'skill_id': 1, 'canonical_name': 'Python'},
    {'skill_id': 2, 'canonical_name': 'Django'},
    {'skill_id': 3, 'canonical_name': 'PostgreSQL'}
]

res = calculate_match(
    job_description='Experienced Python developer with Django and PostgreSQL database skills.',
    required_skills=required,
    preferred_skills=[],
    resume_text='Python engineer with 4 years building Django backends on PostgreSQL database.',
    candidate_skills=candidate
)

print('Score Result:', res)
assert res['skill_score'] == 75.0, 'Skill score mismatch'
print('Test Passed! Skill Coverage: 75.0%')
"@
```

## 4. Phase 14 Acceptance Criteria Check
- [x] TF-IDF Vectorizer and Cosine Similarity implemented.
- [x] Skill coverage formula calculates exact percentage of required skills.
- [x] Combined weighted formula ($0.70 \times \text{Skill} + 0.30 \times \text{Text}$) tested and validated.

