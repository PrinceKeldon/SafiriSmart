
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

# Supabase PostgreSQL connection
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres"
)

# Create SQLAlchemy engine with Supabase connection
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Database dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create database tables (tables already exist in Supabase)"""
    # Tables are already created via Supabase migration
    # This function is kept for compatibility
    pass

# Health check function
def check_db_connection():
    """Check database connection health"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception:
        return False
