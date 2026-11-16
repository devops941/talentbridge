# Phase 05: Development Environment & Project Setup

## 1. Objectives
- Configure the Python virtual environment and install backend dependencies.
- Initialize the Vite + React + TypeScript frontend with UI libraries.
- Configure environment variables (`.env`) for local development (supporting both PostgreSQL or local SQLite fallback for instant zero-dependency testing).

## 2. Backend Environment Setup Commands
Run the following PowerShell commands:

```powershell
# 1. Navigate to backend directory and create Python virtual environment
cd d:\gokul\collage-python-project\TalentBridge\backend
python -m venv venv

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 3. Create requirements.txt
Set-Content -Path "requirements.txt" -Value @"
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

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Download English NLP model for spaCy
python -m spacy download en_core_web_sm

# 6. Create backend environment configuration file (.env)
Set-Content -Path ".env" -Value @"
APP_NAME=TalentBridge
APP_ENV=development
DEBUG=True
PORT=8000
HOST=0.0.0.0

# Database: Use PostgreSQL or SQLite for quick local test
DATABASE_URL=sqlite:///./talentbridge.db
# For PostgreSQL: DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/talentbridge

# JWT Security
JWT_SECRET_KEY=talentbridge-dev-secret-super-key-2026!@#$%^&*()
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120

# Uploads
UPLOAD_STORAGE_PATH=./private_uploads/resumes
MAX_UPLOAD_SIZE_MB=10

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
"@
```

## 3. Frontend Environment Setup Commands
Run the following PowerShell commands:

```powershell
# 1. Navigate to frontend root
cd d:\gokul\collage-python-project\TalentBridge\frontend

# 2. Initialize React + TypeScript with Vite
# Run npm create vite if starting fresh, or install packages:
npm init vite@latest . -- --template react-ts -y

# 3. Install frontend dependencies
npm install bootstrap react-bootstrap react-router-dom axios lucide-react recharts react-hook-form zod @hookform/resolvers

# 4. Create frontend environment configuration file (.env)
Set-Content -Path ".env" -Value @"
VITE_API_BASE_URL=http://localhost:8000/api/v1
"@
```

## 4. Phase 05 Acceptance Criteria Check
- [x] Python virtual environment created and all libraries installed.
- [x] spaCy `en_core_web_sm` model downloaded.
- [x] React TypeScript frontend initialized with Bootstrap and Axios.
- [x] `.env` files created for both backend and frontend.

