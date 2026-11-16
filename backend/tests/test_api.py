import pytest
from app.core.database import SessionLocal
from app.routes.auth import login
from app.routes.jobs import list_jobs
from app.routes.dashboard import get_dashboard_summary
from app.schemas.auth import LoginRequest
from app.models.entities import User

def test_login_success():
    db = SessionLocal()
    try:
        req = LoginRequest(email="admin@talentbridge.com", password="Admin@12345")
        res = login(req, db)
        assert res["access_token"] is not None
        assert res["role"] == "ADMIN"
    finally:
        db.close()

def test_jobs_list():
    db = SessionLocal()
    try:
        jobs = list_jobs(db=db)
        assert isinstance(jobs, list)
    finally:
        db.close()

def test_dashboard_summary():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@talentbridge.com").first()
        summary = get_dashboard_summary(db=db, user=admin_user)
        assert hasattr(summary, "active_jobs")
        assert hasattr(summary, "total_candidates")
        assert hasattr(summary, "stage_funnel")
    finally:
        db.close()
