
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
import logging

from database import get_db
from models import Operator
from schemas import LoginRequest, LoginResponse, OperatorResponse
from auth import authenticate_operator, create_access_token, get_current_operator
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate tour operator and return JWT token"""
    try:
        operator = authenticate_operator(db, request.email, request.password)
        if not operator:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not operator.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": operator.email, "role": operator.role}, expires_delta=access_token_expires
        )
        
        return LoginResponse(
            success=True,
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "operator": {
                    "id": str(operator.id),
                    "name": operator.name,
                    "email": operator.email,
                    "company": operator.company,
                    "role": operator.role,
                    "specializations": operator.specializations or []
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@router.get("/me", response_model=OperatorResponse)
async def get_current_user(current_operator: Operator = Depends(get_current_operator)):
    """Get current authenticated operator details"""
    return OperatorResponse(
        id=current_operator.id,
        name=current_operator.name,
        email=current_operator.email,
        company=current_operator.company,
        role=current_operator.role,
        specializations=current_operator.specializations or [],
        is_active=current_operator.is_active
    )
