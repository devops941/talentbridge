import os
import shutil
import uuid
import hashlib
from app.core.database import SessionLocal, engine
from app.models.entities import (
    Base, Job, JobSkill, Skill, Candidate, Resume, ResumeExtraction,
    ResumeSkill, Application, MatchResult, CandidateReview, ApplicationStageHistory, User
)
from app.ml.parser import extract_text_from_pdf
from app.ml.skill_extractor import extract_skills_from_text
from app.ml.matcher import calculate_match

def run_demo_seeding():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter_by(email="admin@talentbridge.com").first()
        if not admin_user:
            print("Please run app.core.seed first!")
            return

        print("=== Step 1: Creating Demo Job Openings ===")
        # 1. Job 1: Senior Python Backend Engineer
        job1 = db.query(Job).filter_by(title="Senior Python Backend Engineer").first()
        if not job1:
            job1 = Job(
                title="Senior Python Backend Engineer",
                department="Engineering",
                description="Looking for an experienced Senior Python developer to design and build high-performance microservices and REST APIs using FastAPI and PostgreSQL database. Familiarity with Docker is a plus.",
                experience_min=3,
                experience_max=6,
                location="Chennai / Remote",
                status="PUBLISHED",
                created_by=admin_user.id
            )
            db.add(job1)
            db.commit()
            db.refresh(job1)

            # Attach Required & Preferred Skills
            skill_configs = [
                ("Python", "REQUIRED", 1.0),
                ("FastAPI", "REQUIRED", 1.0),
                ("PostgreSQL", "REQUIRED", 1.0),
                ("REST API", "REQUIRED", 1.0),
                ("Docker", "PREFERRED", 0.5),
            ]
            for sk_name, req_type, weight in skill_configs:
                sk = db.query(Skill).filter_by(canonical_name=sk_name).first()
                if sk:
                    db.add(JobSkill(job_id=job1.id, skill_id=sk.id, requirement_type=req_type, importance_weight=weight))
            db.commit()
            print(f"Created Job: {job1.title}")

        # 2. Job 2: Frontend React Developer
        job2 = db.query(Job).filter_by(title="Frontend React Developer").first()
        if not job2:
            job2 = Job(
                title="Frontend React Developer",
                department="Engineering",
                description="Seeking a talented Frontend Engineer skilled in React, TypeScript, HTML5 and CSS3 to craft beautiful, responsive recruiter dashboards and interactive web applications.",
                experience_min=2,
                experience_max=5,
                location="Bengaluru / Hybrid",
                status="PUBLISHED",
                created_by=admin_user.id
            )
            db.add(job2)
            db.commit()
            db.refresh(job2)

            skill_configs2 = [
                ("React", "REQUIRED", 1.0),
                ("TypeScript", "REQUIRED", 1.0),
                ("JavaScript", "REQUIRED", 1.0),
                ("HTML5", "PREFERRED", 0.5),
                ("Docker", "PREFERRED", 0.5),
            ]
            for sk_name, req_type, weight in skill_configs2:
                sk = db.query(Skill).filter_by(canonical_name=sk_name).first()
                if sk:
                    db.add(JobSkill(job_id=job2.id, skill_id=sk.id, requirement_type=req_type, importance_weight=weight))
            db.commit()
            print(f"Created Job: {job2.title}")

        print("\n=== Step 2: Creating Candidates & Ingesting Resumes ===")
        candidates_data = [
            (
                "John Doe",
                "john.doe@email.com",
                "+91 98765 43210",
                "Chennai, India",
                "../data/sample_resumes/John_Doe_Python_Backend.pdf",
                job1
            ),
            (
                "Jane Smith",
                "jane.smith@email.com",
                "+91 91234 56789",
                "Bengaluru, India",
                "../data/sample_resumes/Jane_Smith_Frontend_Dev.pdf",
                job1  # Jane also applies to compare ranking
            )
        ]

        os.makedirs("./private_uploads/resumes", exist_ok=True)

        for name, email, phone, loc, pdf_src, target_job in candidates_data:
            cand = db.query(Candidate).filter_by(email=email).first()
            if not cand:
                cand = Candidate(full_name=name, email=email, phone=phone, location=loc)
                db.add(cand)
                db.commit()
                db.refresh(cand)

            if os.path.exists(pdf_src):
                with open(pdf_src, "rb") as f:
                    content = f.read()
                checksum = hashlib.sha256(content).hexdigest()

                res_rec = db.query(Resume).filter_by(candidate_id=cand.id, checksum=checksum).first()
                if not res_rec:
                    storage_filename = f"{uuid.uuid4().hex}.pdf"
                    storage_path = os.path.join("./private_uploads/resumes", storage_filename)
                    with open(storage_path, "wb") as f:
                        f.write(content)

                    res_rec = Resume(
                        candidate_id=cand.id,
                        storage_key=storage_filename,
                        original_filename=os.path.basename(pdf_src),
                        mime_type="application/pdf",
                        file_size=len(content),
                        checksum=checksum,
                        parse_status="COMPLETED"
                    )
                    db.add(res_rec)
                    db.commit()
                    db.refresh(res_rec)

                    # Extract text & skills
                    text, meta = extract_text_from_pdf(storage_path)
                    extraction = ResumeExtraction(
                        resume_id=res_rec.id,
                        extracted_text=text,
                        parser_version="PyMuPDF-v1.0"
                    )
                    db.add(extraction)
                    db.commit()

                    skills_found = extract_skills_from_text(text, db)
                    for sf in skills_found:
                        db.add(ResumeSkill(
                            resume_id=res_rec.id,
                            skill_id=sf["skill_id"],
                            evidence_text=sf["evidence"][:250],
                            confidence=1.0
                        ))
                    db.commit()
                    print(f"Ingested and parsed resume for {name}: {len(skills_found)} skills identified.")

                # Create Job Application
                app = db.query(Application).filter_by(candidate_id=cand.id, job_id=target_job.id).first()
                if not app:
                    app = Application(
                        candidate_id=cand.id,
                        job_id=target_job.id,
                        resume_id=res_rec.id,
                        current_stage="Interview Scheduled" if name == "John Doe" else "Resume Under Review"
                    )
                    db.add(app)
                    db.commit()
                    db.refresh(app)

                    # Calculate Match Result
                    req_skills = [
                        {"skill_id": js.skill_id, "skill_name": js.skill.canonical_name}
                        for js in target_job.skills if js.requirement_type == "REQUIRED"
                    ]
                    cand_skills = [
                        {"skill_id": rs.skill_id, "canonical_name": rs.skill.canonical_name}
                        for rs in res_rec.skills
                    ]
                    match_res = calculate_match(
                        job_description=target_job.description,
                        required_skills=req_skills,
                        preferred_skills=[],
                        resume_text=res_rec.extraction.extracted_text,
                        candidate_skills=cand_skills
                    )

                    mr = MatchResult(
                        application_id=app.id,
                        score=match_res["score"],
                        skill_score=match_res["skill_score"],
                        text_score=match_res["text_score"],
                        model_version=match_res["model_version"],
                        explanation=match_res["explanation"]
                    )
                    db.add(mr)
                    db.commit()

                    # Add sample recruiter review for John Doe
                    if name == "John Doe":
                        db.add(CandidateReview(
                            application_id=app.id,
                            reviewer_id=admin_user.id,
                            rating=5,
                            notes="Solid experience in FastAPI microservices and PostgreSQL relational design. Clear technical communication during screening."
                        ))
                        db.add(ApplicationStageHistory(
                            application_id=app.id,
                            from_stage="Application Received",
                            to_stage="Interview Scheduled",
                            changed_by=admin_user.id
                        ))
                        db.commit()

                    print(f"Application created for {name} -> Suitability Score: {match_res['score']}% (Skill: {match_res['skill_score']}%, Text: {match_res['text_score']}%)")

        print("\n=== Demo seeding completed successfully! ===")
    finally:
        db.close()

if __name__ == "__main__":
    run_demo_seeding()

