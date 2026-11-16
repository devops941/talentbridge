# TalentBridge - Master Implementation Plan & Execution Roadmap

> **Project Name:** TalentBridge – Intelligent Candidate Screening and Ranking System  
> **Source Blueprint:** `TalentBridge-implementation docuement.pdf` (Version 1.0)  
> **Target Level:** Medium – College/Academic Full Stack + NLP/ML  
> **Stack:** React (Vite + TypeScript + Bootstrap 5) + Python (FastAPI + PostgreSQL + SQLAlchemy) + Intelligence (PyMuPDF + spaCy + Scikit-learn TF-IDF)

---

## 1. Executive Summary & Architecture Overview

TalentBridge is an explainable decision-support recruitment system designed to help HR teams screen and rank candidate resumes against job vacancies. It uses transparent metrics (Skill Coverage + TF-IDF Cosine Similarity) instead of a black-box model.

```
+-----------------------------------------------------------------------------------+
|                                  PRESENTATION                                     |
|               React 18 + Vite + TypeScript + Bootstrap 5 + Recharts               |
+-----------------------------------------+-----------------------------------------+
                                          | JSON REST APIs & Multipart Upload
+-----------------------------------------v-----------------------------------------+
|                               FASTAPI BACKEND                                     |
|          Auth (JWT/Bcrypt) | CORS | Controllers | Services | Repositories         |
+--------------------+--------------------+--------------------+--------------------+
                     |                    |                    |
+--------------------v-----+  +-----------v----------+  +------v--------------------+
|     INTELLIGENCE LAYER   |  |   DATABASE STORAGE   |  |   PRIVATE FILE STORAGE    |
| - PyMuPDF (PDF Parser)   |  | PostgreSQL           |  | Local Private Vault       |
| - spaCy (Skill Extractor)|  | SQLAlchemy ORM       |  | SHA-256 Validated PDFs    |
| - Scikit-learn (TF-IDF)  |  | Alembic Migrations   |  | Strict Role Auth Checks   |
| - Explainable Ranking    |  +----------------------+  +---------------------------+
+--------------------------+
```

---

## 2. Core Scoring & Matching Formula

The baseline algorithm combines deterministic skill coverage with textual TF-IDF cosine similarity:

$$\text{Final Score} = (0.70 \times \text{Skill Coverage Score}) + (0.30 \times \text{Text Similarity Score})$$

Where:
- **Skill Coverage Score (0 - 100):**
  $$\text{Skill Coverage} = \left(\frac{\text{Matched Required Skills}}{\text{Total Required Skills}}\right) \times 100$$
- **Text Similarity Score (0 - 100):**
  Cosine similarity between TF-IDF vector of Job Description and TF-IDF vector of Resume extracted text, multiplied by 100.
- **Deterministic Tie-Breaker:** Higher Skill Coverage $\rightarrow$ Earlier Application Date.
- **Explainability:** Returns exact lists of `matched_skills`, `missing_required_skills`, and human-readable rationale (e.g., *"3 of 4 required skills were identified"*).

---

## 3. Database Schema Blueprint (15 Core Tables)

1. `users`: Auth credentials, roles, status, created_at.
2. `roles`: Role definitions (`ADMIN`, `HR_RECRUITER`, `HR_MANAGER`).
3. `permissions`: Granular permission keys (`job:create`, `resume:view`, etc.).
4. `role_permissions`: Role-to-permission mapping table.
5. `jobs`: Vacancy details, department, experience min/max, status.
6. `job_skills`: Required vs. preferred skills with weights.
7. `skills`: Canonical skill taxonomy (`Python`, `PostgreSQL`, `FastAPI`, etc.).
8. `skill_aliases`: Synonym mapping (e.g., `Postgres` $\rightarrow$ `PostgreSQL`).
9. `candidates`: Candidate master record (name, email, phone, location).
10. `resumes`: PDF metadata, storage path, SHA-256 checksum, parse status.
11. `resume_extractions`: Extracted raw text, page count, parser version.
12. `resume_skills`: Extracted skills linked to resume with evidence snippets.
13. `applications`: Links candidate + job + resume with recruitment stage.
14. `match_results`: Calculated scores, breakdown, model version.
15. `match_skill_details`: Granular match status per skill with evidence.
16. `candidate_reviews`: Recruiter notes, star rating, reviewer ID.
17. `application_stage_history`: Audit trail of candidate workflow stages.
18. `notifications`: In-app system & workflow alerts.
19. `audit_logs`: Immutable logs of sensitive actions.

---

## 4. Phase-by-Phase Roadmap Index

In the `commands/` directory, each phase has a dedicated command guide:

| Phase | Phase Name | Command File | Purpose |
|:---:|:---|:---|:---|
| **Phase 00** | Project Initialization & Feasibility | `00_project_init.md` | Create workspace repo, folders, README & git |
| **Phase 01** | Requirement Analysis & SRS | `01_srs_requirements.md` | Define use cases, user journeys & constraints |
| **Phase 02** | System Architecture & Technical Design | `02_architecture_design.md` | Define service boundaries, DFDs & API conventions |
| **Phase 03** | UI/UX Design & Prototyping | `03_ui_ux_prototype.md` | Theme, typography, layout tokens & component specs |
| **Phase 04** | Database Design & Schema Development | `04_database_schema.md` | PostgreSQL models, Alembic migrations & seed data |
| **Phase 05** | Development Environment & Project Setup | `05_dev_environment_setup.md` | Python venv, FastAPI, Vite React TS & scripts |
| **Phase 06** | Backend Foundation & API Architecture | `06_backend_foundation.md` | Base app, middleware, DB engine & health endpoints |
| **Phase 07** | Authentication & Authorization | `07_auth_and_rbac.md` | JWT auth, Bcrypt passwords, RBAC guard dependencies |
| **Phase 08** | Frontend Foundation & Layout | `08_frontend_foundation.md` | App routing, Navbar, Sidebar, Auth context & Axios |
| **Phase 09** | Job Vacancy Management | `09_job_management.md` | Job CRUD, required/preferred skills & state machine |
| **Phase 10** | Candidate Management | `10_candidate_management.md` | Candidate directory, deduplication warnings & profiles |
| **Phase 11** | Resume Upload & Document Management | `11_resume_upload_storage.md` | Secure PDF upload, SHA-256 hash, private storage |
| **Phase 12** | Resume Parsing & Text Extraction | `12_resume_parsing_nlp.md` | PyMuPDF text extractor & cleaning engine |
| **Phase 13** | NLP-Based Skill Extraction | `13_skill_extraction.md` | spaCy matcher, canonical dictionary & evidence capture |
| **Phase 14** | AI-Based Resume Matching Engine | `14_matching_engine.md` | TF-IDF Vectorizer + Cosine Similarity + Coverage |
| **Phase 15** | Candidate Scoring & Ranking | `15_scoring_ranking.md` | Explainable ranking leaderboard & tie-breaker logic |
| **Phase 16** | HR Review & Recruitment Pipeline | `16_recruiter_pipeline.md` | Kanban / Stage table, reviews, rating & stage history |
| **Phase 17** | Dashboard & Recruitment Analytics | `17_analytics_dashboard.md` | KPI metrics, Recharts stage charts & statistics |
| **Phase 18** | Reports, Notifications & Audit Logs | `18_reports_audit_logs.md` | CSV/PDF export, in-app alerts & security audit logs |
| **Phase 19** | Testing, Security & Optimization | `19_testing_verification.md` | Pytest test suite, PDF edge-cases, validation tests |
| **Phase 20** | Deployment, Documentation & Delivery | `20_deployment_delivery.md` | Docker-compose, production env, docs & demo script |

---

## 5. Quick Start Instructions

To run the automated environment setup immediately:
```powershell
# From the TalentBridge root directory:
powershell -ExecutionPolicy Bypass -File .\commands\quick_start.ps1
```
Or follow the phase guides step-by-step starting from `commands/00_project_init.md`.

