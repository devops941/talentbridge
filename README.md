# TalentBridge: Intelligent Candidate Screening & Transparent AI Ranking System

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cluster0-47A248.svg)](https://www.mongodb.com/atlas)
[![PyMuPDF](https://img.shields.io/badge/PyMuPDF-1.24+-FF6F00.svg)](https://pymupdf.readthedocs.io/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E.svg)](https://scikit-learn.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TalentBridge is an enterprise-grade, **Explainable Decision Support System (EDSS)** designed for modern talent acquisition and recruitment teams. It replaces opaque, black-box Applicant Tracking Systems (ATS) with a deterministic, mathematically transparent candidate screening and ranking engine.

By combining **PyMuPDF text ingestion**, an **NLP skill taxonomy engine**, **TF-IDF Cosine Similarity**, **MongoDB Atlas cloud persistence**, and an **interactive HTML5 Kanban pipeline with automated Gmail notifications**, TalentBridge empowers recruiters to make bias-free, data-backed hiring decisions in sub-second latency.

---

## 📑 Table of Contents
1. [Core Features & Functional Modules](#-core-features--functional-modules)
2. [Explainable AI Scoring Methodology (70/30 Formula)](#-explainable-ai-scoring-methodology-7030-formula)
3. [System Architecture](#-system-architecture)
4. [Technology Stack](#-technology-stack)
5. [Directory Structure](#-directory-structure)
6. [Environment Configuration (.env Guide)](#-environment-configuration-env-guide)
7. [Step-by-Step Installation & Run Guide](#-step-by-step-installation--run-guide)
8. [Database Seeding (5 Verified Records Per Module)](#-database-seeding-5-verified-records-per-module)
9. [Default Login Credentials](#-default-login-credentials)
10. [REST API Endpoint Reference](#-rest-api-endpoint-reference)
11. [Responsible AI & Ethical Governance](#-responsible-ai--ethical-governance)

---

## 🚀 Core Features & Functional Modules

The platform is organized into **6 core operational modules** plus a **Public Candidate Portal**:

### 1. 💼 Module 1: Job Vacancies (`/jobs`)
* Create, publish, view, and close departmental job openings.
* Define experience constraints (Min/Max years), location types (Remote, Hybrid, On-site).
* Interactive multi-skill selection with weighted importance (Required vs. Preferred).
* Dynamic lifecycle status management (`PUBLISHED`, `OPEN`, `CLOSED`).

### 2. 👥 Module 2: Candidates Directory (`/candidates`)
* Centralized master repository of candidate profiles.
* Tracks full candidate contact details (Name, Email, Phone, Location).
* Fast search and instant filtering by candidate name, location, and contact parameters.
* Direct linkage to submitted resumes and active job applications.

### 3. 📄 Module 3: PyMuPDF Resume Screening Studio (`/resumes`)
* **Executive 2-Column Screening Layout:** Candidate selector drawer on the left, deep-dive document inspection studio on the right.
* **PyMuPDF NLP Parsing Metrics:** Ingests candidate PDF resumes with sub-second text extraction speed (`< 0.45s`), page count, word count, and SHA-256 tamper-evident checksums.
* **Contextual Skill Mining with Evidence Highlights:** Automatically identifies technical skills (e.g., Python, FastAPI, Docker, PostgreSQL) and displays exact `<mark>` highlighted quote snippets from the resume where the skill was proven.
* **Raw Document Viewer:** Direct tab to inspect raw extracted text alongside raw JSON engine metadata.

### 4. 🏆 Module 4: Explainable AI Match & Ranking Studio (`/matching`)
* Eliminates synthetic sequence index matching by comparing candidates against job requirements using **normalized canonical skill names and synonym aliases**.
* **Leaderboard View:** Medal rankings (🥇 Gold, 🥈 Silver, 🥉 Bronze) with dynamic progress bars and score color tiers.
* **1-Click Recalculation:** Instant recalculation button to rescore candidates when job specifications change.
* **Deep Explainability Drawer:** Breaks down exact scores:
  * 70% Skill Coverage component (e.g., $3/3 = 100\%$).
  * 30% TF-IDF Cosine Similarity semantic component.
  * Side-by-side list of matched skills vs. missing vacancy requirements.

### 5. 🔀 Module 5: Interactive Kanban Recruitment Pipeline (`/pipeline`)
* **HTML5 Drag-and-Drop:** Intuitive Kanban board with 8 customizable stages:
  1. *Application Received*
  2. *Resume Review*
  3. *Shortlisted*
  4. *Interview Scheduled*
  5. *Interview Completed*
  6. *Selected / Offer*
  7. *On Hold*
  8. *Not Selected*
* **1-Click Empty-State Hydration:** "Score & Populate Pipeline" button to automatically score all unranked applicants and populate the board.
* **Real-Time Automated Gmail Notifications:** Automatically dispatches customized, professional status update emails via Gmail SMTP (`gokulnath2k24@gmail.com`) to the candidate whenever their card is dragged into a new stage.
* **Recruiter Feedback Modal:** 1 to 5 star rating system with interviewer review notes and full historical audit logs.

### 6. 📊 Module 6: Reports & Analytics Audit (`/reports`)
* **3 Recharts Visualizations:**
  * 📊 *Funnel Velocity Bar Chart:* Real-time candidate counts across hiring stages.
  * 🍩 *Match Quality Donut Chart:* Breakdown of High ($\ge 70\%$), Moderate ($50-69\%$), and Low ($< 50\%$) suitability tiers.
  * 📈 *Skill Demand vs. Supply Chart:* Vacancy required skills compared against applicant pool capabilities.
* **1-Click Shortlist CSV Export:** Exports candidate shortlist including ranks, scores, skill breakdowns, stage, and contact info.
* **Live Tamper-Evident System Audit Stream:** Displays immutable audit log events (Stage transitions, CSV exports, AI batch scorings, Vacancy approvals).

### 7. 🌐 Public Candidate Career Portal (`/`)
* Candidate-facing career landing page with search and department filtering.
* **3-Step Application Modal:**
  1. Contact Info (Name, Email, Phone, Location).
  2. Verified Email OTP authentication.
  3. PDF Resume Upload and real-time PyMuPDF ingestion.

---

## 🎯 Explainable AI Scoring Methodology (70/30 Formula)

TalentBridge rejects black-box opacity. Candidate suitability is computed using a deterministic, transparent formula:

$$\text{Final Suitability Score} = (0.70 \times \text{Skill Coverage Score}) + (0.30 \times \text{TF-IDF Cosine Similarity Score})$$

### 1. Skill Coverage Score (70% Weight)
* Evaluates the presence of required technical skills within candidate resume text using normalized canonical aliases.
$$\text{Skill Coverage Score} = \left(\frac{|\text{Matched Canonical Skills}|}{|\text{Total Required Skills}|}\right) \times 100$$

### 2. Semantic Text Similarity (30% Weight)
* Converts the vacancy job description and candidate resume text into Term Frequency-Inverse Document Frequency (TF-IDF) feature vectors (unigrams & bigrams, English stop-words removed).
* Computes the mathematical Cosine Similarity between vector representations:
$$\text{Cosine Similarity}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|} \times 100$$

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TALENTBRIDGE APPLICATION ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────────────────────┘

     [Candidate Public Portal]                [Recruiter Admin Studio]
       (Browse & Apply Modal)                 (Dashboard, Pipeline, etc.)
                 │                                        │
                 ▼                                        ▼
    ┌─────────────────────────────────────────────────────────────┐
    │           FRONTEND LAYER (React 18 + TypeScript + Vite)     │
    │  - AppLayout (Dark Navy Theme #0B1528 & Teal #00A896)       │
    │  - Bootstrap 5 + Lucide Icons + Recharts Data Visuals       │
    │  - HTML5 Drag-and-Drop Pipeline Kanban                      │
    └──────────────────────────────┬──────────────────────────────┘
                                   │ HTTP REST (JSON / Bearer JWT)
                                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              BACKEND LAYER (FastAPI + Python 3.12)          │
    │  - CORS Middleware & JWT RBAC (ADMIN, RECRUITER, MANAGER)   │
    │  - Modular APIRouters: auth, jobs, candidates, resumes,     │
    │    applications, pipeline, reports, candidate_auth          │
    └──────────────┬──────────────────────────────┬───────────────┘
                   │                              │
         PyMuPDF & ML Pipeline           SMTP Notifications
                   │                              │
                   ▼                              ▼
    ┌──────────────────────────────┐ ┌────────────────────────────┐
    │      INTELLIGENCE LAYER      │ │   EMAIL NOTIFICATION BUS   │
    │  - PyMuPDF PDF Text Parsing  │ │  - Gmail SMTP (TLS 587)    │
    │  - Canonical Skill Extractor │ │  - Stage Change Templates  │
    │  - TF-IDF Cosine Similarity  │ │  - Candidate Notifications │
    └──────────────┬───────────────┘ └────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │         DATABASE LAYER (MongoDB Atlas Cloud Cluster0)       │
    │  Collections: users, jobs, candidates, resumes,             │
    │  applications, match_results, candidate_reviews, audit_logs │
    └─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Component | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 18.3+ | Component-driven UI architecture |
| | TypeScript | 5.2+ | Strict type safety and schema validation |
| | Vite | 5.4+ | Lightning-fast HMR and bundle compilation |
| | Bootstrap | 5.3+ | Responsive grid and enterprise layout primitives |
| | Lucide React | 0.344+ | Clean, consistent enterprise icon system |
| | Recharts | 2.12+ | Composable SVG data visualizations |
| | Axios | 1.6+ | HTTP client with JWT auth interceptors |
| **Backend** | Python | 3.12+ | High-performance backend runtime |
| | FastAPI | 0.110+ | Asynchronous REST API framework |
| | Uvicorn | 0.28+ | ASGI production server |
| | Pydantic | 2.6+ | Data validation and settings management |
| | PyJWT & Passlib | 2.8+ / 1.7+ | JWT token generation & bcrypt password hashing |
| **Intelligence** | PyMuPDF (fitz) | 1.24+ | High-speed PDF text extraction and document metrics |
| | Scikit-Learn | 1.4+ | TF-IDF vectorization and cosine similarity matching |
| **Database** | MongoDB Atlas | Cluster0 (Cloud) | Scalable document storage |
| | PyMongo | 4.6+ | Python MongoDB driver |
| **Notifications** | Python `smtplib` | Built-in | Automated stage update emails via Gmail SMTP |

---

## 📁 Directory Structure

```
TalentBridge/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic BaseSettings & env loading
│   │   │   ├── database.py         # PyMongo client & index initialization
│   │   │   ├── email.py            # Gmail SMTP client & HTML email templates
│   │   │   ├── reset_and_seed_5.py # Seeding script (5 records per module)
│   │   │   ├── security.py         # Passlib bcrypt hashing & JWT tokens
│   │   │   └── seed.py             # User and taxonomy initial seeding
│   │   ├── ml/
│   │   │   ├── matcher.py          # 70/30 Explainable AI match scoring logic
│   │   │   ├── parser.py           # PyMuPDF PDF text extraction
│   │   │   ├── preprocessing.py    # Text cleaning, lowercasing, normalization
│   │   │   └── skill_extractor.py  # Canonical skill taxonomy mining
│   │   ├── models/
│   │   │   └── entities.py         # Data domain entity definitions
│   │   ├── routes/
│   │   │   ├── applications.py     # Application apply & ranking endpoints
│   │   │   ├── auth.py             # Recruiter JWT login & /me profile
│   │   │   ├── candidate_auth.py   # Public candidate OTP & resume submission
│   │   │   ├── candidates.py       # Candidate master CRUD
│   │   │   ├── dashboard.py        # Aggregated KPI summaries
│   │   │   ├── jobs.py             # Job opening lifecycle CRUD
│   │   │   ├── pipeline.py         # Kanban drag-and-drop & reviews
│   │   │   ├── reports.py          # Analytics summary, CSV export, audit logs
│   │   │   └── resumes.py          # PDF upload, PyMuPDF inspection, raw text
│   │   ├── schemas/                # Pydantic request & response schemas
│   │   └── main.py                 # FastAPI application factory & CORS setup
│   ├── private_uploads/resumes/    # Private PDF document storage
│   ├── .env                        # Active backend environment configuration
│   ├── .env.example                # Backend environment template
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/candidate/   # ApplyModal (3-step candidate application)
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx       # Sidebar (#0B1528), Topbar, User Footer
│   │   ├── pages/
│   │   │   ├── Candidates.tsx      # Candidate Directory table
│   │   │   ├── Dashboard.tsx       # KPI cards, medal leaderboard, funnel chart
│   │   │   ├── Home.tsx            # Public landing page & active job board
│   │   │   ├── JobVacancies.tsx    # Job management & vacancy creation modal
│   │   │   ├── Login.tsx           # Recruiter portal login with 1-click personas
│   │   │   ├── MatchingRanking.tsx # 70/30 leaderboard & explainability drawer
│   │   │   ├── Pipeline.tsx        # HTML5 Drag-and-drop Kanban recruitment board
│   │   │   ├── Reports.tsx         # Recharts charts, CSV export, live audit log
│   │   │   └── ResumeUpload.tsx    # PyMuPDF 2-column resume screening studio
│   │   ├── services/
│   │   │   └── api.ts              # Axios instance with auth interceptor
│   │   ├── App.tsx                 # Route declarations & role guards
│   │   ├── index.css               # Design tokens, color palette, animations
│   │   └── main.tsx                # React DOM entrypoint
│   ├── .env                        # Active frontend environment configuration
│   ├── .env.example                # Frontend environment template
│   ├── package.json                # NPM packages and build scripts
│   └── vite.config.ts              # Vite configuration
└── README.md                       # Comprehensive documentation
```

---

## ⚙️ Environment Configuration (.env Guide)

### 1. Backend Configuration (`backend/.env`)
Create a file at `backend/.env` (or copy from `backend/.env.example`):

```ini
# Application Settings
APP_NAME=TalentBridge
APP_ENV=development
DEBUG=True
PORT=8000
HOST=0.0.0.0

# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://user_gokul:Lfg0bsxrzs3njKeA@cluster0.uurxkmz.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=TalentBridge

# JWT Security & Session
JWT_SECRET_KEY=talentbridge-secret-super-key-2026-secure
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120

# Local Storage for Candidate Resumes
UPLOAD_STORAGE_PATH=./private_uploads/resumes
MAX_UPLOAD_SIZE_MB=10

# Allowed CORS Origins
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

# Automated Email Notifications (Gmail SMTP TLS)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=gokulnath2k24@gmail.com
SMTP_PASS=wgxsaunuedvpplfk
SMTP_FROM=gokulnath2k24@gmail.com
FROM_NAME=TalentBridge HR
```

#### Detailed Backend Key Explanation:
* `MONGO_URI`: The connection string for your MongoDB Atlas cluster.
* `JWT_SECRET_KEY`: High-entropy key used to sign and verify HMAC-SHA256 bearer tokens.
* `UPLOAD_STORAGE_PATH`: Directory where PDF resumes are stored safely.
* `SMTP_*`: Gmail SMTP credentials configured with a Google App Password (`wgxsaunuedvpplfk`) to dispatch stage progression notifications.

---

### 2. Frontend Configuration (`frontend/.env`)
Create a file at `frontend/.env` (or copy from `frontend/.env.example`):

```ini
# Backend REST API Endpoint
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🛠️ Step-by-Step Installation & Run Guide

### Prerequisites
* **Python:** 3.10, 3.11, or 3.12 installed (`python --version`)
* **Node.js:** 18.x or 20.x installed (`node --version`)
* **MongoDB:** An active MongoDB Atlas cluster URI or local MongoDB daemon.

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/TalentBridge.git
cd TalentBridge
```

---

### Step 2: Backend Setup
Open a terminal in the root directory:

```bash
# Navigate to backend
cd backend

# Create Python virtual environment (Optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install all required Python packages
pip install -r requirements.txt
```

---

### Step 3: Database Seeding (5 Records per Module)
To reset any stale records and populate **exactly 5 clean, realistic records across every module**, run the automated reset and seed script:

```bash
# Run from the backend directory
python -m app.core.reset_and_seed_5
```

Output should confirm:
```
Clearing existing collections in MongoDB Atlas...
Module 1: Seeded 5 Job Vacancies.
Module 2: Seeded 5 Candidates.
Module 3: Seeded 5 Resumes with real PDFs generated.
Module 4: Seeded 5 Applications.
Module 4: Computed & Seeded 5 Match Results.
Module 5: Seeded 5 Candidate Reviews.
Module 5: Seeded 5 Stage Transition Logs.
Module 6: Seeded 5 Compliance Audit Logs.
SUCCESS: All 6 Modules reset and populated with exactly 5 clean, verified records each!
```

---

### Step 4: Launch FastAPI Backend Server
```bash
# Run from backend directory
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **Swagger API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc API Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### Step 5: Frontend Setup & Dev Server
Open a **new terminal** in the root directory:

```bash
# Navigate to frontend
cd frontend

# Install Node.js dependencies
npm install

# Start Vite development server
npm run dev
```

* **Frontend Web Application:** [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Login Credentials

The application provides **1-Click Persona Switching** on the login page ([http://localhost:5173/login](http://localhost:5173/login)):

| Persona | Email Address | Password | Role Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@talentbridge.io` *(or `.com`)* | `Admin@123` *(or `Admin@12345`)* | Full Access (Jobs, Resumes, Scoring, Pipeline, Audit Logs, Settings) |
| **HR Recruiter** | `recruiter@talentbridge.io` *(or `.com`)* | `Recruiter@123` *(or `Recruiter@12345`)* | Candidate Screening, Drag-and-Drop Pipeline, Reviews, Matching |
| **HR Manager** | `manager@talentbridge.com` | `Manager@12345` | Shortlist Approvals, Pipeline Velocity & Analytics Reports |

---

## 📡 REST API Endpoint Reference

All endpoints are prefixed with `/api/v1`:

| Module | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Public | Authenticates user & returns JWT token |
| | `GET` | `/auth/me` | Bearer JWT | Returns authenticated user profile |
| **Jobs** | `GET` | `/jobs` | Public | Lists all active and published job vacancies |
| | `POST` | `/jobs` | Recruiter/Admin | Creates a new job opening with required skills |
| | `GET` | `/jobs/{job_id}` | Public | Retrieves specific job specification details |
| | `GET` | `/jobs/taxonomy/skills` | Public | Returns active canonical skills list |
| **Candidates**| `GET` | `/candidates` | Recruiter/Admin | Lists candidate directory profiles |
| | `POST` | `/candidates` | Recruiter/Admin | Creates a candidate profile |
| **Resumes** | `GET` | `/resumes` | Recruiter/Admin | Lists parsed resumes with status and checksum |
| | `GET` | `/resumes/{resume_id}` | Recruiter/Admin | Returns full PyMuPDF metadata & mined skills |
| | `GET` | `/resumes/{resume_id}/file`| Recruiter/Admin | Downloads original PDF resume from storage |
| **Matching** | `GET` | `/applications/job/{job_id}/rankings` | Recruiter/Admin | Computes 70/30 leaderboard for a job |
| | `POST` | `/applications/job/{job_id}/score-all` | Recruiter/Admin | Batch recalculates match scores for applicants |
| **Pipeline** | `PATCH` | `/pipeline/applications/{app_id}/stage` | Recruiter/Admin | Updates stage & triggers automated Gmail alert |
| | `GET` | `/pipeline/applications/{app_id}/reviews` | Recruiter/Admin | Fetches 1-5 star reviews and interviewer notes |
| | `POST` | `/pipeline/applications/{app_id}/reviews` | Recruiter/Admin | Appends interviewer feedback and rating |
| **Reports** | `GET` | `/reports/analytics-summary` | Recruiter/Admin | Aggregated funnel metrics & score tiers |
| | `GET` | `/reports/audit-logs` | Recruiter/Admin | Real-time system compliance audit trail |
| | `GET` | `/reports/export/shortlist` | Recruiter/Admin | Exports shortlisted candidate records to CSV |
| **Candidate** | `POST` | `/candidate-auth/send-otp` | Public | Generates and emails verification OTP |
| | `POST` | `/candidate-auth/apply` | Public | Verifies OTP and ingests PDF resume |

---

## 🛡️ Responsible AI & Ethical Governance

TalentBridge is engineered adhering to global AI fairness and HR governance standards:

1. **Zero Protected Characteristics:**
   * Demographic attributes such as candidate photo, age, gender, race, marital status, and address are strictly excluded from the mathematical scoring function.
2. **Deterministic & Explainable:**
   * No opaque neural net hallucinations. Recruiters can audit exactly why a candidate received an $82.8\%$ score down to the matched canonical skills and semantic cosine similarity.
3. **Recruiter Authority (Human-in-the-Loop):**
   * The AI functions purely as a decision-support copilot. Candidates are **never automatically rejected** by an algorithm; recruiters retain 100% final hiring authority.
4. **Tamper-Evident Auditability:**
   * All recruiter actions, stage advancements, and export operations are permanently logged to `audit_logs` for compliance review.

---

## 👨‍💻 Author & Contributions
* **Project Name:** TalentBridge AI Recruitment Platform
* **Repository:** [TalentBridge on GitHub](https://github.com/your-username/TalentBridge)
* **Lead Engineer:** Gokul Nath (`gokulnath2k24@gmail.com`)
* **License:** MIT License

*Empowering Fair, Fast, and Explainable Hiring Decisions.*

---

## 🚀 How to Run Backend & Frontend in Terminal

### Method 1: One-Command Launch (PowerShell)
From the root `TalentBridge` directory, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\run_full_system.ps1
```
*This will automatically launch the backend and frontend in separate console windows.*

You can also run the dedicated batch files:
* **Backend:** Double-click or run `.\run_backend.bat`
* **Frontend:** Double-click or run `.\run_frontend.bat`

---

### Method 2: Manual Terminal Execution (2 Windows)

#### 🔹 Terminal 1: Backend (FastAPI)
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
> *(If using virtual environment: `.\venv\Scripts\activate` first)*

#### 🔹 Terminal 2: Frontend (React / Vite)
```powershell
cd frontend
npm run dev
```

---

### 🌐 Default Access Points
* **Frontend Application:** http://localhost:5173
* **Backend API Swagger Docs:** http://127.0.0.1:8000/docs
* **Demo Admin Credentials:** `admin@talentbridge.com` / `Admin@12345`

