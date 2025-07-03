
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
import logging

from database import get_db
from models import Operator
from schemas import OperatorResponse
from auth import get_current_operator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["authentication"])

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
