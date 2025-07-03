
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from models import Operator
from database import get_db
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase JWT verification
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

security = HTTPBearer()

def verify_token(token: str) -> Optional[dict]:
    """Verify Supabase-issued JWT token"""
    try:
        if not SUPABASE_JWT_SECRET:
            raise ValueError("SUPABASE_JWT_SECRET environment variable not set")
        
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    except Exception:
        return None

def get_current_operator(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Operator:
    """Extract and validate Supabase JWT, then fetch operator from database"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise credentials_exception
    
    # Extract user ID from Supabase JWT (sub claim contains user UUID)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # First try to find operator by ID, then by email as fallback
    operator = db.query(Operator).filter(Operator.id == user_id).first()
    if operator is None:
        # Fallback: try to find by email if available in JWT
        email = payload.get("email")
        if email:
            operator = db.query(Operator).filter(Operator.email == email).first()
    
    if operator is None or not operator.is_active:
        raise credentials_exception
    
    return operator

def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Operator:
    operator = get_current_operator(credentials, db)
    
    if operator.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return operator
