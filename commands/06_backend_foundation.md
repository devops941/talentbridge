# Phase 06: Backend Foundation & API Architecture

## 1. Objectives
- Construct the FastAPI application entrypoint with versioned route mounting (`/api/v1`).
- Configure database engine and session dependency.
- Implement structured exception handling, request logging, and health check endpoints.

## 2. Implementation Commands & Source Files
Run the following PowerShell commands to generate backend foundation files:

```powershell
# 1. Create core/config.py
Set-Content -Path "backend\app\core\config.py" -Value @"
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = 'TalentBridge'
    APP_ENV: str = 'development'
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = '0.0.0.0'
    DATABASE_URL: str = 'sqlite:///./talentbridge.db'
    JWT_SECRET_KEY: str = 'talentbridge-dev-secret-key-2026'
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    UPLOAD_STORAGE_PATH: str = './private_uploads/resumes'
    MAX_UPLOAD_SIZE_MB: int = 10
    CORS_ORIGINS: List[str] = ['http://localhost:5173', 'http://localhost:3000']

    class Config:
        env_file = '.env'
        extra = 'ignore'

settings = Settings()
"@

# 2. Create core/database.py
Set-Content -Path "backend\app\core\database.py" -Value @"
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

connect_args = {'check_same_thread': False} if 'sqlite' in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"@

# 3. Create app/main.py
Set-Content -Path "backend\app\main.py" -Value @"
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.models.entities import Base
import os

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description='Intelligent Candidate Screening and Ranking System REST API',
    version='1.0.0'
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/health', tags=['Health'])
@app.get('/api/v1/health', tags=['Health'])
def health_check():
    return {
        'status': 'healthy',
        'application': settings.APP_NAME,
        'environment': settings.APP_ENV,
        'version': '1.0.0'
    }

# Import and mount routers (will be added in following phases)
# from app.routes import auth, jobs, candidates, resumes, applications, dashboard
"@
```

## 3. Verify Backend Startup Command
```powershell
cd d:\gokul\collage-python-project\TalentBridge\backend
# Start backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Test the health check in a separate terminal:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/health"
```
Expected output:
```json
{
  "status": "healthy",
  "application": "TalentBridge",
  "environment": "development",
  "version": "1.0.0"
}
```

## 4. Phase 06 Acceptance Criteria Check
- [x] Application settings and database connection configured.
- [x] FastAPI server starts and returns 200 OK on `/api/v1/health`.
- [x] Automatic OpenAPI documentation available at `http://127.0.0.1:8000/docs`.

