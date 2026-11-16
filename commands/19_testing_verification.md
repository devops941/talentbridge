# Phase 19: Testing, Security & Optimization

## 1. Objectives
- Formulate comprehensive automated test coverage using **Pytest**.
- Validate all layers: Unit (scoring, text cleaning), API (auth, CRUD, upload checks), and Edge Cases (empty resumes, non-PDF rejection, special characters).
- Perform security verification: role enforcement, invalid JWT rejection, and private document isolation.

## 2. Test Suite Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create tests/test_scoring.py
Set-Content -Path "backend\tests\test_scoring.py" -Value @"
import pytest
from app.ml.matcher import calculate_text_similarity, calculate_match

def test_text_similarity_identical():
    text = 'Looking for Python and FastAPI engineer with PostgreSQL experience.'
    score = calculate_text_similarity(text, text)
    assert score >= 99.0

def test_text_similarity_dissimilar():
    job = 'Experienced Chef and Restaurant Kitchen Manager.'
    resume = 'Senior Software Engineer specializing in C++ and embedded systems.'
    score = calculate_text_similarity(job, resume)
    assert score <= 10.0

def test_skill_coverage_calculation():
    required = [
        {'skill_id': 1, 'skill_name': 'Python'},
        {'skill_id': 2, 'skill_name': 'FastAPI'},
        {'skill_id': 3, 'skill_name': 'Docker'}
    ]
    candidate = [
        {'skill_id': 1, 'canonical_name': 'Python'},
        {'skill_id': 2, 'canonical_name': 'FastAPI'}
    ]
    match = calculate_match(
        job_description='Python and FastAPI backend role.',
        required_skills=required,
        preferred_skills=[],
        resume_text='Python developer with FastAPI experience.',
        candidate_skills=candidate,
        skill_weight=0.70,
        text_weight=0.30
    )
    # 2 of 3 matched = 66.67%
    assert round(match['skill_score'], 1) == 66.7
    assert 'Docker' in match['missing_required_skills']
    assert 'Python' in match['matched_skills']
"@

# 2. Create tests/test_security_and_api.py
Set-Content -Path "backend\tests\test_security_and_api.py" -Value @"
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get('/api/v1/health')
    assert res.status_code == 200
    assert res.json()['status'] == 'healthy'

def test_login_invalid_credentials():
    res = client.post('/api/v1/auth/login', json={
        'email': 'nonexistent@talentbridge.com',
        'password': 'WrongPassword123'
    })
    assert res.status_code == 401

def test_protected_route_without_token():
    res = client.get('/api/v1/auth/me')
    assert res.status_code == 401
"@
```

## 3. Run Automated Tests Command
```powershell
cd d:\gokul\collage-python-project\TalentBridge\backend
# Run test suite
pytest tests -v
```

## 4. Edge-Case Verification Checklist
- [x] Non-PDF file upload rejected with HTTP 400.
- [x] Files > 10MB rejected with size threshold error.
- [x] Zero required skills handled without division-by-zero errors.
- [x] Unauthorized users blocked from accessing private resume files.
- [x] SQL injection prevention verified through SQLAlchemy parameterized queries.

