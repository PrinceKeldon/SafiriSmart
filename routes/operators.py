
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_operator
from models import Operator
from schemas import OperatorProfileResponse, OperatorProfileUpdate
import crud

router = APIRouter(prefix="/api/operator", tags=["operators"])

@router.get("/profile", response_model=OperatorProfileResponse)
async def get_operator_profile(
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Get the authenticated operator's profile"""
    operator = crud.get_operator_profile(db, current_operator.id)
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator profile not found"
        )
    return operator

@router.put("/profile", response_model=OperatorProfileResponse)
async def update_operator_profile(
    profile_data: OperatorProfileUpdate,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Update the authenticated operator's profile"""
    operator = crud.update_operator_profile(db, current_operator.id, profile_data)
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator profile not found"
        )
    return operator
