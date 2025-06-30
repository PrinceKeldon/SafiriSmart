
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import logging
import uuid

from database import get_db
from models import Operator
from schemas import OperatorResponse
from auth import get_current_admin_user, get_password_hash
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])

class CreateOperatorRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: str
    specializations: List[str] = []

class UpdateOperatorRequest(BaseModel):
    name: str = None
    email: EmailStr = None
    company: str = None
    specializations: List[str] = None
    is_active: bool = None

@router.post("/operators", response_model=OperatorResponse)
async def create_operator(
    request: CreateOperatorRequest,
    db: Session = Depends(get_db),
    current_admin: Operator = Depends(get_current_admin_user)
):
    """Create a new operator account (Admin only)"""
    try:
        # Check if operator with email already exists
        existing_operator = db.query(Operator).filter(Operator.email == request.email).first()
        if existing_operator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Operator with this email already exists"
            )
        
        # Create new operator
        password_hash = get_password_hash(request.password)
        new_operator = Operator(
            name=request.name,
            email=request.email,
            password_hash=password_hash,
            company=request.company,
            specializations=request.specializations,
            role='operator'  # Default role for new operators
        )
        
        db.add(new_operator)
        db.commit()
        db.refresh(new_operator)
        
        return OperatorResponse(
            id=new_operator.id,
            name=new_operator.name,
            email=new_operator.email,
            company=new_operator.company,
            role=new_operator.role,
            specializations=new_operator.specializations or [],
            is_active=new_operator.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create operator error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while creating operator"
        )

@router.get("/operators", response_model=List[OperatorResponse])
async def list_operators(
    db: Session = Depends(get_db),
    current_admin: Operator = Depends(get_current_admin_user)
):
    """List all operator accounts (Admin only)"""
    try:
        operators = db.query(Operator).all()
        return [
            OperatorResponse(
                id=op.id,
                name=op.name,
                email=op.email,
                company=op.company,
                role=op.role,
                specializations=op.specializations or [],
                is_active=op.is_active
            )
            for op in operators
        ]
    except Exception as e:
        logger.error(f"List operators error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching operators"
        )

@router.get("/operators/{operator_id}", response_model=OperatorResponse)
async def get_operator(
    operator_id: str,
    db: Session = Depends(get_db),
    current_admin: Operator = Depends(get_current_admin_user)
):
    """Get details of a specific operator (Admin only)"""
    try:
        operator = db.query(Operator).filter(Operator.id == uuid.UUID(operator_id)).first()
        if not operator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operator not found"
            )
        
        return OperatorResponse(
            id=operator.id,
            name=operator.name,
            email=operator.email,
            company=operator.company,
            role=operator.role,
            specializations=operator.specializations or [],
            is_active=operator.is_active
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get operator error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching operator"
        )

@router.put("/operators/{operator_id}", response_model=OperatorResponse)
async def update_operator(
    operator_id: str,
    request: UpdateOperatorRequest,
    db: Session = Depends(get_db),
    current_admin: Operator = Depends(get_current_admin_user)
):
    """Update an operator's details (Admin only)"""
    try:
        operator = db.query(Operator).filter(Operator.id == uuid.UUID(operator_id)).first()
        if not operator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operator not found"
            )
        
        # Update only provided fields
        if request.name is not None:
            operator.name = request.name
        if request.email is not None:
            operator.email = request.email
        if request.company is not None:
            operator.company = request.company
        if request.specializations is not None:
            operator.specializations = request.specializations
        if request.is_active is not None:
            operator.is_active = request.is_active
        
        db.commit()
        db.refresh(operator)
        
        return OperatorResponse(
            id=operator.id,
            name=operator.name,
            email=operator.email,
            company=operator.company,
            role=operator.role,
            specializations=operator.specializations or [],
            is_active=operator.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update operator error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating operator"
        )

@router.delete("/operators/{operator_id}")
async def delete_operator(
    operator_id: str,
    db: Session = Depends(get_db),
    current_admin: Operator = Depends(get_current_admin_user)
):
    """Delete an operator account (Admin only)"""
    try:
        operator = db.query(Operator).filter(Operator.id == uuid.UUID(operator_id)).first()
        if not operator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operator not found"
            )
        
        # Prevent admin from deleting themselves
        if operator.id == current_admin.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        db.delete(operator)
        db.commit()
        
        return {"message": "Operator deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete operator error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while deleting operator"
        )
