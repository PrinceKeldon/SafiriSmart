
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Operator, OperatorPackage
from schemas import PublicOperatorResponse
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/operators", tags=["public-operators"])

@router.get("/public", response_model=List[PublicOperatorResponse])
async def get_public_operators(db: Session = Depends(get_db)):
    """Get all active operators with their top packages - publicly accessible"""
    try:
        # Fetch all active operators
        operators = db.query(Operator).filter(Operator.is_active == True).all()
        
        result = []
        for operator in operators:
            # Get top 3-5 packages for each operator
            top_packages = db.query(OperatorPackage).filter(
                OperatorPackage.operator_id == operator.id
            ).order_by(OperatorPackage.created_at.desc()).limit(5).all()
            
            operator_data = PublicOperatorResponse(
                id=operator.id,
                company_name=operator.company_name or operator.company,
                description=operator.description or f"Professional safari operator specializing in {', '.join(operator.specializations or ['wildlife safaris'])}",
                specializations=operator.specializations or [],
                top_packages=[
                    {
                        "id": str(package.id),
                        "package_name": package.package_name,
                        "description": package.description or "Custom safari package",
                        "budget_tier": package.budget_tier,
                        "min_duration": package.min_duration,
                        "max_duration": package.max_duration,
                        "estimated_cost_per_person_per_day": float(package.estimated_cost_per_person_per_day)
                    }
                    for package in top_packages
                ]
            )
            result.append(operator_data)
        
        logger.info(f"Returning {len(result)} active operators")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching public operators: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching operators: {str(e)}"
        )
