# ==============================================================================
# TalentBridge: Automated Project Scaffolding & Setup Script
# Run with: powershell -ExecutionPolicy Bypass -File .\commands\quick_start.ps1
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting TalentBridge Full Project Setup & Scaffolding  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Project Directory Creation
Write-Host "`n[Step 1/5] Creating project directory structure..." -ForegroundColor Yellow

$dirs = @(
    "backend\app\core",
    "backend\app\models",
    "backend\app\schemas",
    "backend\app\routes",
    "backend\app\controllers",
    "backend\app\services",
    "backend\app\repositories",
    "backend\app\ml",
    "backend\migrations",
    "backend\tests",
    "backend\private_uploads\resumes",
    "frontend\src\components\common",
    "frontend\src\layouts",
    "frontend\src\modules",
    "frontend\src\pages",
    "frontend\src\routes",
    "frontend\src\services",
    "frontend\src\hooks",
    "frontend\src\types",
    "docs\architecture",
    "docs\srs",
    "data\sample_resumes",
    "data\skill_dictionary"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "  [+] Created: $dir" -ForegroundColor Gray
    }
}

New-Item -ItemType File -Force -Path "backend\private_uploads\resumes\.gitkeep" | Out-Null

# 2. Setup requirements.txt in backend
Write-Host "`n[Step 2/5] Creating backend requirements.txt and .env..." -ForegroundColor Yellow

Set-Content -Path "backend\requirements.txt" -Value @"
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
pydantic>=2.6.0
pydantic-settings>=2.1.0
sqlalchemy>=2.0.25
psycopg[binary]>=3.1.18
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
pymupdf>=1.23.8
spacy>=3.7.2
scikit-learn>=1.4.0
pytest>=8.0.0
requests>=2.31.0
reportlab>=4.1.0
"@

Set-Content -Path "backend\.env" -Value @"
APP_NAME=TalentBridge
APP_ENV=development
DEBUG=True
PORT=8000
HOST=0.0.0.0
DATABASE_URL=sqlite:///./talentbridge.db
JWT_SECRET_KEY=talentbridge-secret-super-key-2026-secure
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
UPLOAD_STORAGE_PATH=./private_uploads/resumes
MAX_UPLOAD_SIZE_MB=10
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
"@

# 3. Create Root .gitignore & README.md
Write-Host "`n[Step 3/5] Creating .gitignore and README.md..." -ForegroundColor Yellow

Set-Content -Path ".gitignore" -Value @"
__pycache__/
*.py[cod]
.venv/
venv/
*.sqlite3
node_modules/
dist/
.vite/
backend/private_uploads/resumes/*
!backend/private_uploads/resumes/.gitkeep
.vscode/
.idea/
"@

Set-Content -Path "README.md" -Value @"
# TalentBridge: Intelligent Candidate Screening and Ranking System

TalentBridge is an AI-assisted recruitment support application designed to parse candidate resumes, extract job-relevant skills, and rank candidate profiles against job requirements using transparent, explainable scoring metrics.

## Technology Stack
- **Frontend:** React.js, TypeScript, Vite, Bootstrap 5, Recharts
- **Backend:** Python 3.10+, FastAPI, Pydantic, SQLAlchemy
- **Database:** PostgreSQL / SQLite
- **Intelligence Layer:** PyMuPDF, spaCy, Scikit-learn (TF-IDF Cosine Similarity)
"@

Write-Host "`n[Step 4/5] Checking Python & Node environments..." -ForegroundColor Yellow
python --version
node --version

Write-Host "`n[Step 5/5] Setup Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor White
Write-Host " 1. Run backend setup: cd backend; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt" -ForegroundColor White
Write-Host " 2. Run seed script: python app/core/seed.py" -ForegroundColor White
Write-Host " 3. Start API server: uvicorn app.main:app --reload" -ForegroundColor White
Write-Host " 4. Read details in commands\MASTER_EXECUTION_PLAN.md" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

