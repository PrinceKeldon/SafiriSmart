
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/tourmaster_b2b")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Email
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USER: str = os.getenv("EMAIL_USER", "notifications@yourcompany.com")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "app-password")
    
    # AI Core Service
    AI_CORE_SERVICE_URL: str = os.getenv("AI_CORE_SERVICE_URL", "http://localhost:8000")
    AI_CORE_SERVICE_API_KEY: str = os.getenv("AI_CORE_SERVICE_API_KEY", "your-ai-service-key")
    
    # API
    API_V1_STR: str = "/api"

settings = Settings()
