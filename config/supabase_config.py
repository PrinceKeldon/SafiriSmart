
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class SupabaseConfig:
    """Supabase configuration for the application"""
    
    # Supabase Project Configuration
    PROJECT_ID = "gjhuxgjheaywfwrpctah"
    SUPABASE_URL = "https://gjhuxgjheaywfwrpctah.supabase.co"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHV4Z2poZWF5d2Z3cnBjdGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODM3ODQsImV4cCI6MjA2Njg1OTc4NH0.UrqW99pZe9X7maAcXlw5EdKX445CRngOkAAn13b4euQ"
    
    # Service Role Key (for backend operations)
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # Database Connection
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        f"postgresql://postgres:{os.getenv('SUPABASE_DB_PASSWORD')}@db.{PROJECT_ID}.supabase.co:5432/postgres"
    )
    
    @classmethod
    def get_headers(cls, use_service_role: bool = False) -> dict:
        """Get headers for Supabase API requests"""
        key = cls.SUPABASE_SERVICE_ROLE_KEY if use_service_role else cls.SUPABASE_ANON_KEY
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate that all required configuration is present"""
        required_for_backend = [
            cls.SUPABASE_SERVICE_ROLE_KEY,
            cls.DATABASE_URL
        ]
        return all(config is not None for config in required_for_backend)

# Initialize configuration
supabase_config = SupabaseConfig()
