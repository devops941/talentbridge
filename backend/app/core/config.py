from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "TalentBridge"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # MongoDB Atlas
    MONGO_URI: str = "mongodb+srv://user_gokul:Lfg0bsxrzs3njKeA@cluster0.uurxkmz.mongodb.net/?retryWrites=true&w=majority"
    MONGO_DB_NAME: str = "TalentBridge"

    # JWT Security
    JWT_SECRET_KEY: str = "talentbridge-secret-super-key-2026-secure"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # Uploads
    UPLOAD_STORAGE_PATH: str = "./private_uploads/resumes"
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"]

    # Email SMTP (Gmail)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "gokulnath2k24@gmail.com"
    SMTP_PASS: str = "wgxsaunuedvpplfk"
    SMTP_FROM: str = "gokulnath2k24@gmail.com"
    FROM_NAME: str = "Gokul"

    class Config:
        env_file = ".env"
        extra = "ignore"
        env_prefix = "TB_"

settings = Settings()
