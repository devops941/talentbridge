import io
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.entities import Job, Application, MatchResult, User, AuditLog

router = APIRouter(prefix="/api/v1/reports", tags=["Reports & Audit"])

@router.get("/job/{job_id}/shortlist/csv")
def export_shortlist_csv(
    job_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["ADMIN", "HR_MANAGER", "HR_RECRUITER"]))
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    apps = db.query(Application).filter(Application.job_id == job_id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Application ID", "Candidate Name", "Email", "Phone",
        "Match Score", "Skill Score", "Text Score", "Current Stage", "Applied Date"
    ])

    for a in apps:
        mr = db.query(MatchResult).filter(MatchResult.application_id == a.id).first()
        score = mr.score if mr else 0.0
        s_score = mr.skill_score if mr else 0.0
        t_score = mr.text_score if mr else 0.0

        writer.writerow([
            a.id,
            a.candidate.full_name,
            a.candidate.email,
            a.candidate.phone or "N/A",
            score,
            s_score,
            t_score,
            a.current_stage,
            a.applied_at.strftime("%Y-%m-%d %H:%M")
        ])

    audit = AuditLog(
        actor_id=user.id,
        action="EXPORT_SHORTLIST_CSV",
        entity_type="JOB",
        entity_id=job.id,
        metadata_json=f"Exported {len(apps)} candidate records"
    )
    db.add(audit)
    db.commit()

    safe_title = job.title.replace(" ", "_")
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=shortlist_{safe_title}.csv"
    return response

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["ADMIN", "HR_MANAGER"]))
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "actor_id": l.actor_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "metadata": l.metadata_json,
            "created_at": l.created_at
        } for l in logs
    ]
