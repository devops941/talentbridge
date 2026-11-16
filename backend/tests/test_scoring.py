import pytest
from app.ml.matcher import calculate_text_similarity, calculate_match

def test_text_similarity_identical():
    text = "Looking for Python and FastAPI engineer with PostgreSQL experience."
    score = calculate_text_similarity(text, text)
    assert score >= 99.0

def test_text_similarity_dissimilar():
    job = "Experienced Chef and Restaurant Kitchen Manager."
    resume = "Senior Software Engineer specializing in C++ and embedded systems."
    score = calculate_text_similarity(job, resume)
    assert score <= 10.0

def test_skill_coverage_and_combined_score():
    required = [
        {"skill_id": 1, "skill_name": "Python"},
        {"skill_id": 2, "skill_name": "Django"},
        {"skill_id": 3, "skill_name": "PostgreSQL"},
        {"skill_id": 4, "skill_name": "REST API"}
    ]
    candidate = [
        {"skill_id": 1, "canonical_name": "Python"},
        {"skill_id": 2, "canonical_name": "Django"},
        {"skill_id": 3, "canonical_name": "PostgreSQL"}
    ]
    # 3 of 4 = 75.0%
    match = calculate_match(
        job_description="Experienced Python developer with Django and PostgreSQL database skills.",
        required_skills=required,
        preferred_skills=[],
        resume_text="Python engineer with 4 years building Django backends on PostgreSQL database.",
        candidate_skills=candidate,
        skill_weight=0.70,
        text_weight=0.30
    )
    assert match["skill_score"] == 75.0
    assert "REST API" in match["missing_required_skills"]
    assert "Python" in match["matched_skills"]
    assert match["score"] > 52.5 # 0.70 * 75 = 52.5 + text similarity
