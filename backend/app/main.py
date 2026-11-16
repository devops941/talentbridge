import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_mongo_indexes
from app.routes.auth import router as auth_router
from app.routes.jobs import router as jobs_router
from app.routes.candidates import router as candidates_router
from app.routes.resumes import router as resumes_router
from app.routes.applications import router as applications_router
from app.routes.pipeline import router as pipeline_router
from app.routes.dashboard import router as dashboard_router
from app.routes.reports import router as reports_router

# Ensure local private upload storage directory exists
os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)

# Initialize MongoDB collection indexes
init_mongo_indexes()

app = FastAPI(
    title=settings.APP_NAME,
    description="TalentBridge: Intelligent Candidate Screening and Ranking REST API (MongoDB Atlas)",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
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
        "database": "MongoDB Atlas",
        "cluster": "Cluster0",
        "environment": settings.APP_ENV,
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
