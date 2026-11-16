import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.models.entities import Base
from app.routes.auth import router as auth_router
from app.routes.jobs import router as jobs_router
from app.routes.candidates import router as candidates_router
from app.routes.resumes import router as resumes_router
from app.routes.applications import router as applications_router
from app.routes.pipeline import router as pipeline_router
from app.routes.dashboard import router as dashboard_router
from app.routes.reports import router as reports_router

# Ensure tables and upload directory exist
Base.metadata.create_all(bind=engine)
os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Candidate Screening and Ranking System REST API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(candidates_router)
app.include_router(resumes_router)
app.include_router(applications_router)
app.include_router(pipeline_router)
app.include_router(dashboard_router)
app.include_router(reports_router)

@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "application": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
