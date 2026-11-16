import os
import uuid
import hashlib
from datetime import datetime, timedelta
import fitz  # PyMuPDF
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash
from app.ml.matcher import calculate_match

def create_resume_pdf(filename: str, name: str, email: str, phone: str, location: str, summary: str, skills_text: str, experience_paragraphs: list) -> str:
    """Generates a clean PDF resume using PyMuPDF and writes to storage path."""
    os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_STORAGE_PATH, filename)

    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4 size in points

    # Header
    page.insert_text((50, 60), name, fontsize=20, fontname="helv", color=(0.04, 0.08, 0.16))
    page.insert_text((50, 80), f"{email}  |  {phone}  |  {location}", fontsize=10, fontname="helv", color=(0.3, 0.4, 0.5))

    # Line separator
    page.draw_line((50, 92), (545, 92), color=(0.0, 0.66, 0.59), width=1.5)

    y = 115
    # Professional Summary
    page.insert_text((50, y), "PROFESSIONAL SUMMARY", fontsize=12, fontname="helv", color=(0.0, 0.66, 0.59))
    y += 18
    rect = fitz.Rect(50, y, 545, y + 50)
    page.insert_textbox(rect, summary, fontsize=10, fontname="helv", color=(0.15, 0.15, 0.15))
    y += 55

    # Core Competencies / Technical Skills
    page.insert_text((50, y), "TECHNICAL SKILLS & COMPETENCIES", fontsize=12, fontname="helv", color=(0.0, 0.66, 0.59))
    y += 18
    rect = fitz.Rect(50, y, 545, y + 40)
    page.insert_textbox(rect, skills_text, fontsize=10, fontname="helv", color=(0.15, 0.15, 0.15))
    y += 45

    # Work Experience
    page.insert_text((50, y), "PROFESSIONAL EXPERIENCE", fontsize=12, fontname="helv", color=(0.0, 0.66, 0.59))
    y += 18
    for exp_title, exp_text in experience_paragraphs:
        page.insert_text((50, y), exp_title, fontsize=11, fontname="helv", color=(0.08, 0.15, 0.25))
        y += 15
        rect = fitz.Rect(50, y, 545, y + 55)
        page.insert_textbox(rect, exp_text, fontsize=9.5, fontname="helv", color=(0.25, 0.25, 0.25))
        y += 65

    # Education
    page.insert_text((50, y), "EDUCATION & CERTIFICATIONS", fontsize=12, fontname="helv", color=(0.0, 0.66, 0.59))
    y += 18
    edu_text = "Bachelor of Technology in Computer Science & Engineering\nFirst Class with Distinction | Verified Academic Record"
    rect = fitz.Rect(50, y, 545, y + 35)
    page.insert_textbox(rect, edu_text, fontsize=9.5, fontname="helv", color=(0.25, 0.25, 0.25))

    doc.save(file_path)
    doc.close()
    return file_path

def reset_and_seed_5_records():
    db = get_db()
    print("Clearing existing collections in MongoDB Atlas...")
    
    # 1. Clear existing operational collections
    db.jobs.delete_many({})
    db.candidates.delete_many({})
    db.resumes.delete_many({})
    db.applications.delete_many({})
    db.match_results.delete_many({})
    db.candidate_reviews.delete_many({})
    db.application_stage_history.delete_many({})
    db.audit_logs.delete_many({})
    print("All previous records cleared successfully.")

    # 2. Ensure Users Exist with Both Email Domains
    users_to_ensure = [
        ("System Administrator", "admin@talentbridge.io", "Admin@123", "ADMIN"),
        ("System Administrator", "admin@talentbridge.com", "Admin@12345", "ADMIN"),
        ("Priya Recruiter", "recruiter@talentbridge.io", "Recruiter@123", "HR_RECRUITER"),
        ("Priya Recruiter", "recruiter@talentbridge.com", "Recruiter@12345", "HR_RECRUITER"),
    ]
    for name, email, raw_pwd, role in users_to_ensure:
        existing = db.users.find_one({"email": email})
        if not existing:
            db.users.insert_one({
                "id": str(uuid.uuid4()),
                "name": name,
                "email": email,
                "password_hash": get_password_hash(raw_pwd),
                "role": role,
                "status": "ACTIVE",
                "created_at": datetime.utcnow()
            })
            print(f"Created user: {email} ({role})")

    now = datetime.utcnow()

    # ==========================================
    # MODULE 1: Exactly 5 Job Vacancies
    # ==========================================
    # Primary job is the newest (created_at = now) so it is the default selection
    jobs_seed = [
        {
            "id": str(uuid.uuid4()),
            "title": "Senior Python & AI Backend Engineer",
            "department": "Engineering & Technology",
            "description": "Architect high-throughput REST APIs and AI inference pipelines using Python, FastAPI, and PostgreSQL. Deploy microservices with Docker on Linux and build machine learning components with explainability.",
            "experience_min": 3,
            "experience_max": 7,
            "location": "Chennai, Tamil Nadu",
            "status": "PUBLISHED",
            "created_at": now,
            "skills": [
                {"skill_name": "Python", "requirement_type": "REQUIRED", "importance_weight": 1.2},
                {"skill_name": "FastAPI", "requirement_type": "REQUIRED", "importance_weight": 1.1},
                {"skill_name": "PostgreSQL", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "Docker", "requirement_type": "PREFERRED", "importance_weight": 0.9},
                {"skill_name": "Machine Learning", "requirement_type": "PREFERRED", "importance_weight": 0.8},
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Senior React & TypeScript Frontend Engineer",
            "department": "Product & Design",
            "description": "Build high-performance web applications using React, TypeScript, and modern state management. Implement pixel-perfect responsive layouts with HTML5 and CSS3.",
            "experience_min": 4,
            "experience_max": 8,
            "location": "Bangalore, Karnataka",
            "status": "PUBLISHED",
            "created_at": now - timedelta(days=1),
            "skills": [
                {"skill_name": "React", "requirement_type": "REQUIRED", "importance_weight": 1.2},
                {"skill_name": "TypeScript", "requirement_type": "REQUIRED", "importance_weight": 1.1},
                {"skill_name": "JavaScript", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "HTML5", "requirement_type": "PREFERRED", "importance_weight": 0.9},
                {"skill_name": "CSS3", "requirement_type": "PREFERRED", "importance_weight": 0.8},
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Cloud DevOps & Kubernetes Architect",
            "department": "Infrastructure & Cloud",
            "description": "Design secure cloud infrastructure on AWS. Manage containerized clusters with Docker and Kubernetes, build robust CI/CD pipelines with Git, and automate Linux server operations.",
            "experience_min": 5,
            "experience_max": 10,
            "location": "Hyderabad, Telangana",
            "status": "PUBLISHED",
            "created_at": now - timedelta(days=2),
            "skills": [
                {"skill_name": "Docker", "requirement_type": "REQUIRED", "importance_weight": 1.2},
                {"skill_name": "AWS", "requirement_type": "REQUIRED", "importance_weight": 1.2},
                {"skill_name": "Linux", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "Git", "requirement_type": "PREFERRED", "importance_weight": 0.9},
                {"skill_name": "SQL", "requirement_type": "PREFERRED", "importance_weight": 0.8},
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Machine Learning & NLP Research Scientist",
            "department": "Artificial Intelligence",
            "description": "Research, train, and fine-tune NLP models for automated document intelligence. Utilize Python, Machine Learning frameworks, Natural Language Processing, and MongoDB for unstructured data.",
            "experience_min": 2,
            "experience_max": 6,
            "location": "Chennai, Tamil Nadu",
            "status": "PUBLISHED",
            "created_at": now - timedelta(days=3),
            "skills": [
                {"skill_name": "Machine Learning", "requirement_type": "REQUIRED", "importance_weight": 1.2},
                {"skill_name": "Natural Language Processing", "requirement_type": "REQUIRED", "importance_weight": 1.2},
                {"skill_name": "Python", "requirement_type": "REQUIRED", "importance_weight": 1.1},
                {"skill_name": "REST API", "requirement_type": "PREFERRED", "importance_weight": 0.9},
                {"skill_name": "MongoDB", "requirement_type": "PREFERRED", "importance_weight": 0.8},
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Full Stack Python & Django Developer",
            "department": "Engineering & Technology",
            "description": "Build end-to-end enterprise portal solutions utilizing Django, Python, PostgreSQL, and React. Implement secure authentication, REST APIs, and automated test suites.",
            "experience_min": 2,
            "experience_max": 5,
            "location": "Coimbatore, Tamil Nadu",
            "status": "PUBLISHED",
            "created_at": now - timedelta(days=4),
            "skills": [
                {"skill_name": "Django", "requirement_type": "REQUIRED", "importance_weight": 1.1},
                {"skill_name": "Python", "requirement_type": "REQUIRED", "importance_weight": 1.1},
                {"skill_name": "PostgreSQL", "requirement_type": "REQUIRED", "importance_weight": 1.0},
                {"skill_name": "React", "requirement_type": "PREFERRED", "importance_weight": 0.9},
                {"skill_name": "REST API", "requirement_type": "PREFERRED", "importance_weight": 0.8},
            ]
        }
    ]
    db.jobs.insert_many(jobs_seed)
    print(f"Module 1: Seeded {len(jobs_seed)} Job Vacancies.")
    primary_job = jobs_seed[0]

    # ==========================================
    # MODULE 2 & 3: Exactly 5 Candidates & 5 Resumes
    # ==========================================
    candidates_info = [
        {
            "name": "Gokul Nath",
            "email": "gokulnath2k24@gmail.com",
            "phone": "+91 98765 43210",
            "location": "Chennai, Tamil Nadu",
            "summary": "Accomplished Senior Python & AI Backend Engineer with 5+ years of experience engineering high-throughput microservices using FastAPI, Python, PostgreSQL, Docker, and Machine Learning algorithms.",
            "skills_str": "Python, FastAPI, PostgreSQL, Docker, Machine Learning, REST API, Git, Linux, SQL",
            "skills_list": [
                {"canonical_name": "Python", "evidence_text": "Extensive 5+ years building backend systems using Python with high test coverage.", "confidence": 1.0},
                {"canonical_name": "FastAPI", "evidence_text": "Developed asynchronous REST APIs using FastAPI handling 10,000 req/sec.", "confidence": 1.0},
                {"canonical_name": "PostgreSQL", "evidence_text": "Designed relational schemas and optimized queries in PostgreSQL database.", "confidence": 0.95},
                {"canonical_name": "Docker", "evidence_text": "Containerized backend services using Docker and orchestrated multi-stage builds.", "confidence": 0.92},
                {"canonical_name": "Machine Learning", "evidence_text": "Trained and deployed Machine Learning models for predictive candidate ranking.", "confidence": 0.90},
                {"canonical_name": "REST API", "evidence_text": "Built secure, authenticated REST API endpoints with OAuth2 and JWT.", "confidence": 0.95},
            ],
            "experience": [
                ("Lead Backend Engineer - NovaTech Solutions (2022 - Present)",
                 "Architected scalable backend infrastructure using Python and FastAPI. Implemented distributed data processing pipelines with PostgreSQL and Docker containers."),
                ("Software Engineer - Apex Software (2019 - 2022)",
                 "Developed microservices and REST APIs in Python. Reduced query latency by 45% using optimized PostgreSQL indexing and caching.")
            ]
        },
        {
            "name": "Priya Sharma",
            "email": "priya.sharma@talentbridge.io",
            "phone": "+91 98450 11223",
            "location": "Bangalore, Karnataka",
            "summary": "Full Stack Software Engineer proficient in React, TypeScript, Python, and REST API integration with 4 years of experience delivering scalable web applications.",
            "skills_str": "React, TypeScript, JavaScript, Python, REST API, HTML5, CSS3, Git",
            "skills_list": [
                {"canonical_name": "Python", "evidence_text": "Built Python backend integration services and automated unit test suites.", "confidence": 0.92},
                {"canonical_name": "React", "evidence_text": "Engineered enterprise UI dashboards using React 18 and state management.", "confidence": 0.98},
                {"canonical_name": "TypeScript", "evidence_text": "Refactored codebase to strict TypeScript, eliminating runtime type errors.", "confidence": 0.95},
                {"canonical_name": "REST API", "evidence_text": "Consumed and designed REST API endpoints for seamless UI data binding.", "confidence": 0.90},
                {"canonical_name": "FastAPI", "evidence_text": "Collaborated with backend team to integrate FastAPI response schemas.", "confidence": 0.85},
            ],
            "experience": [
                ("Senior Frontend Engineer - CloudScale Labs (2021 - Present)",
                 "Designed responsive dashboard modules using React, TypeScript, and modern CSS3. Integrated REST APIs with real-time websocket updates."),
                ("UI Developer - Infowave Systems (2019 - 2021)",
                 "Constructed modular UI component libraries using React and JavaScript. Collaborated with Python backend engineers on API contracts.")
            ]
        },
        {
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@talentbridge.io",
            "phone": "+91 97110 33445",
            "location": "Hyderabad, Telangana",
            "summary": "DevOps & Cloud Engineer specializing in Docker, AWS, Linux, and backend scripting in Python. 6+ years managing robust CI/CD pipelines and infrastructure.",
            "skills_str": "Docker, AWS, Linux, Python, Git, SQL, PostgreSQL",
            "skills_list": [
                {"canonical_name": "Docker", "evidence_text": "Engineered multi-stage Docker containerization pipelines for cloud deployments.", "confidence": 0.98},
                {"canonical_name": "AWS", "evidence_text": "Managed EC2, S3, and RDS deployments on Amazon Web Services (AWS).", "confidence": 0.95},
                {"canonical_name": "Linux", "evidence_text": "Automated server provisioning and bash scripting on Ubuntu and RedHat Linux.", "confidence": 0.94},
                {"canonical_name": "Python", "evidence_text": "Automated deployment verification and health monitoring scripts in Python.", "confidence": 0.88},
                {"canonical_name": "PostgreSQL", "evidence_text": "Maintained high-availability PostgreSQL database clusters on AWS RDS.", "confidence": 0.85},
            ],
            "experience": [
                ("Staff DevOps Engineer - InfraCloud Tech (2020 - Present)",
                 "Orchestrated container deployments with Docker across AWS cloud. Built automated CI/CD workflows using Git and Linux shell scripts."),
                ("Cloud Systems Engineer - Horizon Data (2018 - 2020)",
                 "Maintained production Linux infrastructure and automated database backup routines on PostgreSQL.")
            ]
        },
        {
            "name": "Ananya Iyer",
            "email": "ananya.iyer@talentbridge.io",
            "phone": "+91 99201 55667",
            "location": "Chennai, Tamil Nadu",
            "summary": "Data Scientist and NLP Specialist with 3+ years experience building machine learning algorithms, text extraction pipelines, and statistical analysis models.",
            "skills_str": "Machine Learning, Natural Language Processing, Python, MongoDB, SQL",
            "skills_list": [
                {"canonical_name": "Python", "evidence_text": "Developed NLP and data processing pipelines using Python scientific libraries.", "confidence": 0.96},
                {"canonical_name": "Machine Learning", "evidence_text": "Engineered supervised and unsupervised Machine Learning classification models.", "confidence": 0.94},
                {"canonical_name": "Natural Language Processing", "evidence_text": "Implemented Natural Language Processing pipelines for keyword and entity mining.", "confidence": 0.95},
                {"canonical_name": "MongoDB", "evidence_text": "Stored and queried unstructured document text in MongoDB database.", "confidence": 0.88},
            ],
            "experience": [
                ("AI Research Associate - Cognition Works (2021 - Present)",
                 "Built Natural Language Processing algorithms for resume skill extraction and document classification in Python."),
                ("Data Analyst - Quantix Analytics (2020 - 2021)",
                 "Analyzed behavioral datasets and built predictive Machine Learning models using scikit-learn and Python.")
            ]
        },
        {
            "name": "Karthik Verma",
            "email": "karthik.verma@talentbridge.io",
            "phone": "+91 98332 77889",
            "location": "Coimbatore, Tamil Nadu",
            "summary": "Full Stack Web Developer with 2.5 years of experience building web applications using Django, Python, HTML5, CSS3, and PostgreSQL.",
            "skills_str": "Django, Python, PostgreSQL, HTML5, CSS3, Git",
            "skills_list": [
                {"canonical_name": "Django", "evidence_text": "Engineered customer portal backends using Django and Django REST Framework.", "confidence": 0.95},
                {"canonical_name": "Python", "evidence_text": "Wrote object-oriented business logic and automated test suites in Python.", "confidence": 0.90},
                {"canonical_name": "PostgreSQL", "evidence_text": "Managed application models and database migrations using PostgreSQL.", "confidence": 0.88},
                {"canonical_name": "HTML5", "evidence_text": "Built responsive templates compliant with HTML5 and accessibility standards.", "confidence": 0.90},
                {"canonical_name": "CSS3", "evidence_text": "Styled frontend interfaces with modern CSS3 flexbox and responsive grids.", "confidence": 0.88},
            ],
            "experience": [
                ("Junior Web Developer - CodeCraft Solutions (2021 - Present)",
                 "Developed internal portals with Django and Python. Designed relational models in PostgreSQL and styled responsive pages with CSS3."),
                ("Software Intern - WebSphere Labs (2020 - 2021)",
                 "Assisted senior engineers in writing Python scripts and executing test cases.")
            ]
        }
    ]

    candidates_docs = []
    resumes_docs = []

    for idx, c in enumerate(candidates_info):
        c_id = str(uuid.uuid4())
        cand_created = now - timedelta(days=12 - idx*2)
        candidates_docs.append({
            "id": c_id,
            "full_name": c["name"],
            "email": c["email"],
            "phone": c["phone"],
            "location": c["location"],
            "created_at": cand_created
        })

        # Generate physical PDF resume in storage
        safe_fname = f"resume_{c['name'].replace(' ', '_').lower()}.pdf"
        file_path = create_resume_pdf(
            filename=safe_fname,
            name=c["name"],
            email=c["email"],
            phone=c["phone"],
            location=c["location"],
            summary=c["summary"],
            skills_text=c["skills_str"],
            experience_paragraphs=c["experience"]
        )

        with open(file_path, "rb") as f:
            pdf_bytes = f.read()
        f_size = len(pdf_bytes)
        f_checksum = hashlib.sha256(pdf_bytes).hexdigest()

        # Combine text for matching
        full_text = f"{c['name']}\n{c['summary']}\nTechnical Skills: {c['skills_str']}\n" + "\n".join([f"{e[0]}\n{e[1]}" for e in c["experience"]])

        r_id = str(uuid.uuid4())
        resumes_docs.append({
            "id": r_id,
            "candidate_id": c_id,
            "original_filename": f"{c['name'].replace(' ', '_')}_Resume.pdf",
            "storage_key": safe_fname,
            "mime_type": "application/pdf",
            "file_size": f_size,
            "checksum": f_checksum,
            "parse_status": "COMPLETED",
            "extracted_text": full_text,
            "skills": [
                {
                    "skill_id": s_idx + 1,
                    "canonical_name": sk["canonical_name"],
                    "evidence_text": sk["evidence_text"],
                    "confidence": sk["confidence"]
                }
                for s_idx, sk in enumerate(c["skills_list"])
            ],
            "page_count": 1,
            "word_count": len(full_text.split()),
            "created_at": cand_created + timedelta(minutes=5)
        })

    db.candidates.insert_many(candidates_docs)
    print(f"Module 2: Seeded {len(candidates_docs)} Candidates.")

    db.resumes.insert_many(resumes_docs)
    print(f"Module 3: Seeded {len(resumes_docs)} Resumes with real PDFs generated.")

    # ==========================================
    # MODULE 4 & 5: Exactly 5 Applications across 5 Funnel Stages + AI Matching
    # ==========================================
    # We assign each of the 5 candidates to Job 1 (Senior Python & AI Backend Engineer)
    # in 5 distinct recruitment stages:
    # 1. Gokul Nath -> "Selected" (Score ~92%)
    # 2. Priya Sharma -> "Interview Scheduled" (Score ~81%)
    # 3. Rajesh Kumar -> "Shortlisted" (Score ~74%)
    # 4. Ananya Iyer -> "Resume Under Review" (Score ~68%)
    # 5. Karthik Verma -> "Application Received" (Score ~56%)

    assigned_stages = [
        "Selected",
        "Interview Scheduled",
        "Shortlisted",
        "Resume Under Review",
        "Application Received"
    ]

    reviews_seed = [
        ("Selected after flawless live coding and system design review. Top performer.", 5),
        ("Excellent problem solving demonstrated. Progressed to Technical Architecture interview panel.", 4),
        ("Strong DevOps background, proficient in Python and Docker. Shortlisted for technical round.", 4),
        ("Solid NLP research capabilities. Currently under technical resume review.", 3),
        ("Fresh application received. Candidate profile under initial screening queue.", 3),
    ]

    applications_docs = []
    match_results_docs = []
    reviews_docs = []
    stage_history_docs = []

    req_skills = [
        {"skill_name": s["skill_name"]}
        for s in primary_job["skills"]
        if s["requirement_type"] == "REQUIRED"
    ]
    pref_skills = [
        {"skill_name": s["skill_name"]}
        for s in primary_job["skills"]
        if s["requirement_type"] == "PREFERRED"
    ]

    for idx in range(5):
        cand = candidates_docs[idx]
        res = resumes_docs[idx]
        cand_info = candidates_info[idx]
        stg = assigned_stages[idx]

        app_id = str(uuid.uuid4())
        app_time = now - timedelta(days=5 - idx, hours=2)

        applications_docs.append({
            "id": app_id,
            "candidate_id": cand["id"],
            "job_id": primary_job["id"],
            "resume_id": res["id"],
            "current_stage": stg,
            "applied_at": app_time,
            "updated_at": now - timedelta(hours=idx)
        })

        # Calculate exact AI match score using matcher engine
        cand_skills_for_match = [
            {"canonical_name": sk["canonical_name"], "evidence_text": sk["evidence_text"]}
            for sk in cand_info["skills_list"]
        ]
        match_data = calculate_match(
            job_description=primary_job["description"],
            required_skills=req_skills,
            preferred_skills=pref_skills,
            resume_text=res["extracted_text"],
            candidate_skills=cand_skills_for_match
        )

        match_results_docs.append({
            "application_id": app_id,
            "score": match_data["score"],
            "skill_score": match_data["skill_score"],
            "text_score": match_data["text_score"],
            "model_version": match_data["model_version"],
            "explanation": match_data["explanation"],
            "matched_skills": match_data["matched_skills"],
            "matched_skill_details": match_data.get("matched_skill_details", []),
            "missing_required_skills": match_data["missing_required_skills"],
            "updated_at": now - timedelta(hours=idx)
        })

        # Candidate Review
        rev_text, rev_stars = reviews_seed[idx]
        reviews_docs.append({
            "id": str(uuid.uuid4()),
            "application_id": app_id,
            "reviewer_id": "system-hr-admin",
            "reviewer_name": "Priya Recruiter",
            "rating": rev_stars,
            "notes": rev_text,
            "created_at": now - timedelta(hours=idx, minutes=15)
        })

        # Stage History
        stage_history_docs.append({
            "id": str(uuid.uuid4()),
            "application_id": app_id,
            "from_stage": "Application Received" if stg != "Application Received" else "Portal Submission",
            "to_stage": stg,
            "changed_by": "system-hr-admin",
            "changed_by_name": "Priya Recruiter",
            "changed_at": now - timedelta(hours=idx)
        })

    db.applications.insert_many(applications_docs)
    print(f"Module 4: Seeded {len(applications_docs)} Applications.")

    db.match_results.insert_many(match_results_docs)
    print(f"Module 4: Computed & Seeded {len(match_results_docs)} Match Results.")

    db.candidate_reviews.insert_many(reviews_docs)
    print(f"Module 5: Seeded {len(reviews_docs)} Candidate Reviews.")

    db.application_stage_history.insert_many(stage_history_docs)
    print(f"Module 5: Seeded {len(stage_history_docs)} Stage Transition Logs.")

    # ==========================================
    # MODULE 6: Exactly 5 System Audit Logs
    # ==========================================
    audit_logs_seed = [
        {
            "id": str(uuid.uuid4()),
            "actor_id": "hr-recruiter-01",
            "actor_name": "Priya Recruiter",
            "action": "CANDIDATE_SELECTED",
            "entity_type": "APPLICATION",
            "entity_id": applications_docs[0]["id"],
            "metadata_json": "Gokul Nath selected and formal offer extended for Senior Python & AI Backend Engineer role.",
            "created_at": now - timedelta(hours=1)
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": "hr-recruiter-01",
            "actor_name": "Priya Recruiter",
            "action": "INTERVIEW_SCHEDULED",
            "entity_type": "APPLICATION",
            "entity_id": applications_docs[1]["id"],
            "metadata_json": "Scheduled Technical Architecture panel interview with Priya Sharma.",
            "created_at": now - timedelta(hours=3)
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": "hr-recruiter-01",
            "actor_name": "Priya Recruiter",
            "action": "CANDIDATE_SHORTLISTED",
            "entity_type": "APPLICATION",
            "entity_id": applications_docs[2]["id"],
            "metadata_json": "Rajesh Kumar promoted to Shortlisted stage after verified Docker and AWS skill match.",
            "created_at": now - timedelta(hours=6)
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": "talentbridge-ai-engine",
            "actor_name": "AI Decision Support",
            "action": "AI_BATCH_SCORING",
            "entity_type": "JOB",
            "entity_id": primary_job["id"],
            "metadata_json": "Computed deterministic 70% Skill Coverage and 30% TF-IDF Cosine Similarity for 5 candidates.",
            "created_at": now - timedelta(hours=12)
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": "admin-system-01",
            "actor_name": "System Administrator",
            "action": "JOB_PUBLISHED",
            "entity_type": "JOB",
            "entity_id": primary_job["id"],
            "metadata_json": "Approved and published Senior Python & AI Backend Engineer requisition to portal.",
            "created_at": now - timedelta(days=1)
        }
    ]
    db.audit_logs.insert_many(audit_logs_seed)
    print(f"Module 6: Seeded {len(audit_logs_seed)} Compliance Audit Logs.")

    print("\nSUCCESS: All 6 Modules reset and populated with exactly 5 clean, verified records each!")

if __name__ == "__main__":
    reset_and_seed_5_records()
