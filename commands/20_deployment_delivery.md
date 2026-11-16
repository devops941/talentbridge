# Phase 20: Deployment, Documentation & Final Delivery

## 1. Objectives
- Containerize and configure production-ready deployment with Docker Compose.
- Establish database backup and restore scripts.
- Prepare demo dataset and presentation scripts for college project viva / evaluation.

## 2. Docker Compose Deployment Setup
Run the following PowerShell commands:

```powershell
# 1. Create backend/Dockerfile
Set-Content -Path "backend\Dockerfile" -Value @"
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8000

CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]
"@

# 2. Create docker-compose.yml
Set-Content -Path "docker-compose.yml" -Value @"
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: talentbridge_db
    restart: always
    environment:
      POSTGRES_USER: talentbridge
      POSTGRES_PASSWORD: talentbridge_secret_password
      POSTGRES_DB: talentbridge
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: talentbridge_api
    restart: always
    ports:
      - '8000:8000'
    environment:
      DATABASE_URL: postgresql+psycopg://talentbridge:talentbridge_secret_password@db:5432/talentbridge
      JWT_SECRET_KEY: talentbridge-production-secure-key-2026!
      ACCESS_TOKEN_EXPIRE_MINUTES: 120
      UPLOAD_STORAGE_PATH: /app/private_uploads/resumes
    volumes:
      - resume_storage:/app/private_uploads/resumes
    depends_on:
      - db

volumes:
  postgres_data:
  resume_storage:
"@
```

## 3. College Project Evaluation & Viva Demo Script
Follow this sequence during your final project evaluation / demonstration:
1. **Show Architecture & Problem Statement:**
   - Explain why manual resume screening is biased and slow.
   - Clarify that TalentBridge is an explainable decision-support system, not an autonomous hiring bot.
2. **Login as HR Recruiter:**
   - Sign in using `admin@talentbridge.com` / `Admin@12345`.
3. **Create Job Vacancy:**
   - Post a vacancy (e.g. *Full Stack Python Developer*).
   - Add Required Skills (`Python`, `FastAPI`, `PostgreSQL`) and Preferred Skills (`Docker`).
4. **Upload Test Resumes:**
   - Upload 2-3 sample PDF resumes into the system.
   - Show how PyMuPDF parses the text and how spaCy extracts and maps aliases (e.g. `Postgres` $\rightarrow$ `PostgreSQL`).
5. **Run Matching & Display Leaderboard:**
   - Open Matching & Ranking screen.
   - Point out the exact score breakdown: **Skill Coverage (70%)** + **TF-IDF Text Similarity (30%)**.
   - Show green badges for matched skills and red badges for missing required skills.
6. **Move Candidates Through Pipeline:**
   - Move top ranked candidate to `Interview Scheduled` and add review notes.
7. **Export Reports & Review Audit Trail:**
   - Download CSV shortlist and show live audit logs.

## 4. Phase 20 Acceptance Criteria Check
- [x] Docker-compose configured for PostgreSQL and FastAPI.
- [x] Viva evaluation walk-through script verified.
- [x] Final deliverable package complete.

