import os
import uuid
import hashlib
from datetime import datetime
from app.core.database import get_db, init_mongo_indexes
from app.core.security import get_password_hash
from app.ml.parser import extract_text_from_pdf
from app.ml.skill_extractor import extract_skills_from_text
from app.ml.matcher import calculate_match

def seed_mongo():
    db = get_db()
    init_mongo_indexes()
    print("Connecting to MongoDB Atlas Database: TalentBridge...")

    # 1. Seed Users
    print("\n--- Seeding Users ---")
    users_data = [
        ("System Administrator", "admin@talentbridge.com", "Admin@12345", "ADMIN"),
        ("Priya Recruiter", "recruiter@talentbridge.com", "Recruiter@12345", "HR_RECRUITER"),
        ("Rajesh Manager", "manager@talentbridge.com", "Manager@12345", "HR_MANAGER"),
    ]

    for name, email, pwd, role in users_data:
        existing = db.users.find_one({"email": email})
        if not existing:
            db.users.insert_one({
                "id": str(uuid.uuid4()),
                "name": name,
                "email": email,
                "password_hash": get_password_hash(pwd),
                "role": role,
                "status": "ACTIVE",
                "created_at": datetime.utcnow()
            })
            print(f"Created User: {email} ({role})")
        else:
            print(f"User exists: {email}")

    admin_user = db.users.find_one({"email": "admin@talentbridge.com"})

    # 2. Seed Skills Taxonomy
    print("\n--- Seeding Skill Taxonomy ---")
    initial_skills = [
        ("Python", ["py", "python3", "python 3"]),
        ("FastAPI", ["fast api", "fastapi framework"]),
        ("PostgreSQL", ["postgres", "psql", "postgresql db", "postgres db"]),
        ("React", ["reactjs", "react.js", "react 18"]),
        ("TypeScript", ["ts", "typescript lang"]),
        ("JavaScript", ["js", "es6", "vanilla js"]),
        ("Docker", ["docker-ce", "containerization", "docker containers"]),
        ("SQL", ["relational database", "structured query language", "rdbms"]),
        ("Git", ["github", "gitlab", "version control", "git flow"]),
        ("Machine Learning", ["ml", "scikit-learn", "sklearn", "supervised learning"]),
        ("Natural Language Processing", ["nlp", "spacy", "nltk", "text processing"]),
        ("REST API", ["restful", "restful api", "web api"]),
        ("Node.js", ["nodejs", "node js"]),
        ("MongoDB", ["mongo", "mongodb atlas"]),
        ("Linux", ["ubuntu", "bash scripting", "unix"]),
        ("HTML5", ["html", "semantic html"]),
        ("CSS3", ["css", "bootstrap", "tailwind"]),
        ("Django", ["django framework", "django rest framework", "drf"]),
        ("Flask", ["flask framework"]),
        ("AWS", ["amazon web services", "ec2", "s3"])
    ]

    for canonical, aliases in initial_skills:
        existing_skill = db.skills.find_one({"canonical_name": canonical})
        if not existing_skill:
            db.skills.insert_one({
                "id": str(uuid.uuid4()),
                "canonical_name": canonical,
                "aliases": aliases,
                "category": "Technical",
                "active": True
            })
    print(f"Seeded {len(initial_skills)} technical skills with synonym aliases into MongoDB.")

    # 3. Seed Job Openings
    print("\n--- Seeding Job Openings ---")
    job1 = db.jobs.find_one({"title": "Senior Python Backend Engineer"})
    if not job1:
        job1_id = str(uuid.uuid4())
        job1 = {
            "id": job1_id,
            "title": "Senior Python Backend Engineer",
            "department": "Engineering",
            "description": "Looking for an experienced Senior Python developer to design and build high-performance microservices and REST APIs using FastAPI and PostgreSQL database. Familiarity with Docker is a plus.",
            "experience_min": 3,
            "experience_max": 6,
            "location": "Chennai / Remote",
            "status": "PUBLISHED",
            "created_by": str(admin_user.get("id")),
            "created_at": datetime.utcnow(),
            "skills": [
                {"skill_name": "Python", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "FastAPI", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "PostgreSQL", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "REST API", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "Docker", "requirement_type": "PREFERRED", "importance_weight": 0.5},
            ]
        }
        db.jobs.insert_one(job1)
        print(f"Created Job Opening: {job1['title']}")

    job2 = db.jobs.find_one({"title": "Frontend React Developer"})
    if not job2:
        job2_id = str(uuid.uuid4())
        job2 = {
            "id": job2_id,
            "title": "Frontend React Developer",
            "department": "Engineering",
            "description": "Seeking a talented Frontend Engineer skilled in React, TypeScript, HTML5 and CSS3 to craft beautiful, responsive recruiter dashboards and interactive web applications.",
            "experience_min": 2,
            "experience_max": 5,
            "location": "Bengaluru / Hybrid",
            "status": "PUBLISHED",
            "created_by": str(admin_user.get("id")),
            "created_at": datetime.utcnow(),
            "skills": [
                {"skill_name": "React", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "TypeScript", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "JavaScript", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "HTML5", "requirement_type": "PREFERRED", "importance_weight": 0.5},
                {"skill_name": "Docker", "requirement_type": "PREFERRED", "importance_weight": 0.5},
            ]
        }
        db.jobs.insert_one(job2)
        print(f"Created Job Opening: {job2['title']}")

    # 4. Ingest Candidates & PDF Resumes
    print("\n--- Seeding Candidates & PDF Resumes ---")
    candidates_list = [
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
            job1
        )
    ]

    os.makedirs("./private_uploads/resumes", exist_ok=True)

    for name, email, phone, loc, pdf_path, target_job in candidates_list:
        cand = db.candidates.find_one({"email": email})
        if not cand:
            cand_id = str(uuid.uuid4())
            cand = {
                "id": cand_id,
                "full_name": name,
                "email": email,
                "phone": phone,
                "location": loc,
                "created_at": datetime.utcnow()
            }
            db.candidates.insert_one(cand)
        else:
            cand_id = cand["id"]

        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                content = f.read()
            checksum = hashlib.sha256(content).hexdigest()

            resume = db.resumes.find_one({"candidate_id": cand_id, "checksum": checksum})
            if not resume:
                resume_id = str(uuid.uuid4())
                storage_filename = f"{uuid.uuid4().hex}.pdf"
                storage_path = os.path.join("./private_uploads/resumes", storage_filename)
                with open(storage_path, "wb") as f:
                    f.write(content)

                text, meta = extract_text_from_pdf(storage_path)
                skills_found = extract_skills_from_text(text, db)

                skills_data = [
                    {
                        "skill_id": idx + 1,
                        "canonical_name": sf["canonical_name"],
                        "evidence_text": sf["evidence"][:250],
                        "confidence": 1.0
                    } for idx, sf in enumerate(skills_found)
                ]

                resume = {
                    "id": resume_id,
                    "candidate_id": cand_id,
                    "storage_key": storage_filename,
                    "original_filename": os.path.basename(pdf_path),
                    "mime_type": "application/pdf",
                    "file_size": len(content),
                    "checksum": checksum,
                    "parse_status": meta["status"],
                    "extracted_text": text,
                    "skills": skills_data,
                    "created_at": datetime.utcnow()
                }
                db.resumes.insert_one(resume)
                print(f"Extracted & saved resume for {name}: {len(skills_found)} skills detected.")

            # Create Job Application
            app = db.applications.find_one({"candidate_id": cand_id, "job_id": target_job["id"]})
            if not app:
                app_id = str(uuid.uuid4())
                stage = "Interview Scheduled" if name == "John Doe" else "Resume Under Review"
                app = {
                    "id": app_id,
                    "candidate_id": cand_id,
                    "job_id": target_job["id"],
                    "resume_id": resume["id"],
                    "current_stage": stage,
                    "applied_at": datetime.utcnow()
                }
                db.applications.insert_one(app)

                # Calculate Match Result
                req_skills = [
                    {"skill_id": idx + 1, "skill_name": s["skill_name"]}
                    for idx, s in enumerate(target_job["skills"])
                    if s.get("requirement_type") == "REQUIRED"
                ]
                cand_skills = [
                    {"skill_id": s["skill_id"], "canonical_name": s["canonical_name"]}
                    for s in resume["skills"]
                ]
                match_res = calculate_match(
                    job_description=target_job["description"],
                    required_skills=req_skills,
                    preferred_skills=[],
                    resume_text=resume["extracted_text"],
                    candidate_skills=cand_skills
                )

                db.match_results.update_one(
                    {"application_id": app_id},
                    {"$set": {
                        "application_id": app_id,
                        "score": match_res["score"],
                        "skill_score": match_res["skill_score"],
                        "text_score": match_res["text_score"],
                        "model_version": match_res["model_version"],
                        "explanation": match_res["explanation"],
                        "matched_skills": match_res["matched_skills"],
                        "missing_required_skills": match_res["missing_required_skills"],
                        "updated_at": datetime.utcnow()
                    }},
                    upsert=True
                )

                if name == "John Doe":
                    db.candidate_reviews.insert_one({
                        "id": str(uuid.uuid4()),
                        "application_id": app_id,
                        "reviewer_id": str(admin_user["id"]),
                        "reviewer_name": admin_user["name"],
                        "rating": 5,
                        "notes": "Solid experience in FastAPI microservices and PostgreSQL database design. Communication skills verified.",
                        "created_at": datetime.utcnow()
                    })
                    db.application_stage_history.insert_one({
                        "id": str(uuid.uuid4()),
                        "application_id": app_id,
                        "from_stage": "Application Received",
                        "to_stage": "Interview Scheduled",
                        "changed_by": str(admin_user["id"]),
                        "changed_by_name": admin_user["name"],
                        "changed_at": datetime.utcnow()
                    })

                print(f"Match computed for {name} -> Final Score: {match_res['score']}% (Skill Coverage: {match_res['skill_score']}%, Text: {match_res['text_score']}%)")

    print("\n✅ MongoDB Atlas Seeding Successfully Completed!")
    print("Database 'TalentBridge' is now populated with full collections.")

if __name__ == "__main__":
    seed_mongo()

