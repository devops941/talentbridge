import io
import csv
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.core.database import get_db
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/api/v1/reports", tags=["Reports & Audit"])

@router.get("/job/{job_id}/shortlist/csv")
def export_shortlist_csv(
    job_id: str,
    db = Depends(get_db),
    user: dict = Depends(require_roles(["ADMIN", "HR_MANAGER", "HR_RECRUITER"]))
):
    job = db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")

    apps = list(db.applications.find({"job_id": job_id}))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Application ID", "Candidate Name", "Email", "Phone",
        "Match Score", "Skill Score", "Text Score", "Current Stage", "Applied Date"
    ])

    for a in apps:
        app_id = a.get("id")
        mr = db.match_results.find_one({"application_id": app_id})
        cand = db.candidates.find_one({"id": a.get("candidate_id")})

        score = mr.get("score", 0.0) if mr else 0.0
        s_score = mr.get("skill_score", 0.0) if mr else 0.0
        t_score = mr.get("text_score", 0.0) if mr else 0.0

        applied_at = a.get("applied_at")
        if isinstance(applied_at, datetime):
            applied_str = applied_at.strftime("%Y-%m-%d %H:%M")
        else:
            applied_str = str(applied_at)

        writer.writerow([
            app_id,
            cand.get("full_name") if cand else "Candidate",
            cand.get("email") if cand else "",
            cand.get("phone", "N/A") if cand else "N/A",
            score,
            s_score,
            t_score,
            a.get("current_stage", "Application Received"),
            applied_str
        ])

    now = datetime.utcnow()
    db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_id": str(user.get("id")),
        "action": "EXPORT_SHORTLIST_CSV",
        "entity_type": "JOB",
        "entity_id": job_id,
        "metadata_json": f"Exported {len(apps)} candidate records",
        "created_at": now
    })

    safe_title = job.get("title", "Job").replace(" ", "_")
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=shortlist_{safe_title}.csv"
    return response

@router.get("/audit-logs")
def get_audit_logs(
    db = Depends(get_db),
    user: dict = Depends(require_roles(["ADMIN", "HR_MANAGER"]))
):
    cursor = db.audit_logs.find().sort("created_at", -1).limit(100)
    results = []
    for idx, l in enumerate(cursor):
        created_at = l.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif not isinstance(created_at, datetime):
            created_at = datetime.utcnow()

        results.append({
            "id": idx + 1,
            "actor_id": l.get("actor_id"),
            "action": l.get("action"),
            "entity_type": l.get("entity_type"),
            "entity_id": l.get("entity_id"),
            "metadata": l.get("metadata_json"),
            "created_at": created_at
        })
    return results
