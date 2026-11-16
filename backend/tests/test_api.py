import pytest
from app.core.database import get_db
from app.routes.auth import login
from app.routes.jobs import list_jobs
from app.routes.dashboard import get_dashboard_summary
from app.schemas.auth import LoginRequest

def test_login_success():
    db = get_db()
    req = LoginRequest(email="admin@talentbridge.com", password="Admin@12345")
    res = login(req, db)
    assert res["access_token"] is not None
    assert res["role"] == "ADMIN"

def test_jobs_list():
    db = get_db()
    jobs = list_jobs(db=db)
    assert isinstance(jobs, list)
    assert len(jobs) >= 2

def test_dashboard_summary():
    db = get_db()
    admin_user = db.users.find_one({"email": "admin@talentbridge.com"})
    summary = get_dashboard_summary(db=db, user=admin_user)
    assert summary.active_jobs >= 2
    assert summary.total_candidates >= 2
    assert summary.resumes_processed >= 2
    assert len(summary.stage_funnel) >= 1
