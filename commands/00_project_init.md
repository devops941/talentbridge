# Phase 00: Project Initialization & Feasibility Study

## 1. Objectives
- Establish the baseline project repository for **TalentBridge**.
- Set up directory conventions, `.gitignore`, initial documentation, and development issue tracker.
- Confirm project boundaries: text-based PDF resumes, English language, decision-support ranking without autonomous decisions.

## 2. Directory Structure Setup Commands
Run the following PowerShell commands from `d:\gokul\collage-python-project\TalentBridge`:

```powershell
# 1. Initialize Git repository
git init

# 2. Create the baseline project folder structure
New-Item -ItemType Directory -Force -Path "backend\app\core"
New-Item -ItemType Directory -Force -Path "backend\app\models"
New-Item -ItemType Directory -Force -Path "backend\app\schemas"
New-Item -ItemType Directory -Force -Path "backend\app\routes"
New-Item -ItemType Directory -Force -Path "backend\app\controllers"
New-Item -ItemType Directory -Force -Path "backend\app\services"
New-Item -ItemType Directory -Force -Path "backend\app\repositories"
New-Item -ItemType Directory -Force -Path "backend\app\ml"
New-Item -ItemType Directory -Force -Path "backend\migrations"
New-Item -ItemType Directory -Force -Path "backend\tests"
New-Item -ItemType Directory -Force -Path "backend\private_uploads\resumes"

New-Item -ItemType Directory -Force -Path "frontend\src\components\common"
New-Item -ItemType Directory -Force -Path "frontend\src\layouts"
New-Item -ItemType Directory -Force -Path "frontend\src\modules"
New-Item -ItemType Directory -Force -Path "frontend\src\pages"
New-Item -ItemType Directory -Force -Path "frontend\src\routes"
New-Item -ItemType Directory -Force -Path "frontend\src\services"
New-Item -ItemType Directory -Force -Path "frontend\src\hooks"
New-Item -ItemType Directory -Force -Path "frontend\src\types"

New-Item -ItemType Directory -Force -Path "docs\architecture"
New-Item -ItemType Directory -Force -Path "docs\srs"
New-Item -ItemType Directory -Force -Path "data\sample_resumes"
New-Item -ItemType Directory -Force -Path "data\skill_dictionary"
```

## 3. Create Root `.gitignore`
```powershell
Set-Content -Path ".gitignore" -Value @"
# Python
__pycache__/
*.py[cod]
*$py.class
*.env
.venv/
env/
venv/
*.sqlite3

# Node / Frontend
node_modules/
dist/
.vite/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Uploads & Private Files
backend/private_uploads/resumes/*
!backend/private_uploads/resumes/.gitkeep

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
Desktop.ini
.DS_Store
"@

# Create .gitkeep in private uploads
New-Item -ItemType File -Force -Path "backend\private_uploads\resumes\.gitkeep"
```

## 4. Create Project `README.md`
```powershell
Set-Content -Path "README.md" -Value @"
# TalentBridge: Intelligent Candidate Screening and Ranking System

TalentBridge is an AI-assisted recruitment support application designed to parse candidate resumes, extract job-relevant skills, and rank candidate profiles against job requirements using transparent, explainable scoring metrics.

## Technology Stack
- **Frontend:** React.js, TypeScript, Vite, Bootstrap 5, Recharts
- **Backend:** Python 3.10+, FastAPI, Pydantic, SQLAlchemy
- **Database:** PostgreSQL
- **Intelligence Layer:** PyMuPDF, spaCy, Scikit-learn (TF-IDF Cosine Similarity)

## Key Principles
- Decision Support Only: Never makes autonomous hiring/rejection decisions.
- Transparent Scoring: 70% Skill Coverage + 30% Text Cosine Similarity.
- Data Privacy: Secure storage of candidate resumes with restricted access.
"@
```

## 5. Phase 00 Acceptance Criteria Check
- [x] Git repository initialized.
- [x] Standard folder structure created.
- [x] `.gitignore` and `README.md` in place.
- [x] Private upload directory secured from git commits.

