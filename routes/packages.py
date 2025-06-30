
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_operator
from models import Operator
from schemas import OperatorPackageCreate, OperatorPackageUpdate, OperatorPackageResponse
import crud
import uuid

router = APIRouter(prefix="/api/operator/packages", tags=["packages"])

@router.post("/", response_model=OperatorPackageResponse)
async def create_package(
    package_data: OperatorPackageCreate,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Create a new operator package"""
    package = crud.create_operator_package(db, current_operator.id, package_data)
    return package

@router.get("/", response_model=list[OperatorPackageResponse])
async def get_packages(
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Get all packages for the authenticated operator"""
    packages = crud.get_operator_packages(db, current_operator.id)
    return packages

@router.get("/{package_id}", response_model=OperatorPackageResponse)
async def get_package(
    package_id: uuid.UUID,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Get a specific package"""
    package = crud.get_operator_package_by_id(db, package_id, current_operator.id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    return package

@router.put("/{package_id}", response_model=OperatorPackageResponse)
async def update_package(
    package_id: uuid.UUID,
    package_data: OperatorPackageUpdate,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Update a package"""
    package = crud.update_operator_package(db, package_id, current_operator.id, package_data)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    return package

@router.delete("/{package_id}")
async def delete_package(
    package_id: uuid.UUID,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Delete a package"""
    success = crud.delete_operator_package(db, package_id, current_operator.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    return {"message": "Package deleted successfully"}
