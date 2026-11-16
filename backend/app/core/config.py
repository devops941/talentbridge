import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "TalentBridge"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DATABASE_URL: str = "sqlite:///./talentbridge.db"
    JWT_SECRET_KEY: str = "talentbridge-secret-super-key-2026-secure"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    UPLOAD_STORAGE_PATH: str = "./private_uploads/resumes"
    MAX_UPLOAD_SIZE_MB: int = 10
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"
        env_prefix = "TB_"

settings = Settings()
