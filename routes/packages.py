
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any
import logging

from database import get_db
from models import Operator, OperatorPackage
from schemas import *
from auth import get_current_operator
from crud import *

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/packages", tags=["packages"])

@router.get("/match")
async def match_packages(
    duration: Optional[int] = Query(None),
    budget_range: Optional[str] = Query(None),
    interests: Optional[str] = Query(None),
    group_size: Optional[int] = Query(None),
    travel_pace: Optional[str] = Query(None),
    languages: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Match packages based on user preferences"""
    try:
        # Start with base query
        query = db.query(OperatorPackage, Operator).join(
            Operator, OperatorPackage.operator_id == Operator.id
        ).filter(Operator.is_active == True)
        
        # Apply filters based on preferences
        filters = []
        
        # Duration filter
        if duration:
            filters.append(and_(
                OperatorPackage.min_duration <= duration,
                OperatorPackage.max_duration >= duration
            ))
        
        # Group size filter  
        if group_size:
            filters.append(and_(
                OperatorPackage.min_group_size <= group_size,
                OperatorPackage.max_group_size >= group_size
            ))
        
        # Budget tier filter
        if budget_range:
            budget_mapping = {
                'budget': 'budget',
                'mid-range': 'mid-range', 
                'luxury': 'luxury'
            }
            if budget_range.lower() in budget_mapping:
                filters.append(OperatorPackage.budget_tier == budget_mapping[budget_range.lower()])
        
        # Apply all filters
        if filters:
            query = query.filter(and_(*filters))
        
        # Execute query
        results = query.all()
        
        # Score and sort results based on matching criteria
        scored_packages = []
        interests_list = interests.split(',') if interests else []
        
        for package, operator in results:
            score = 0
            
            # Score based on interests matching activities
            if interests_list and package.included_activities:
                for interest in interests_list:
                    for activity in package.included_activities:
                        if interest.lower().strip() in activity.lower():
                            score += 2
            
            # Score based on services offered
            if interests_list and operator.services_offered:
                for interest in interests_list:
                    for service in operator.services_offered:
                        if interest.lower().strip() in service.lower():
                            score += 1
            
            # Add base score for active packages
            score += 1
            
            scored_packages.append({
                'package': {
                    'id': str(package.id),
                    'package_name': package.package_name,
                    'description': package.description,
                    'min_duration': package.min_duration,
                    'max_duration': package.max_duration,
                    'min_group_size': package.min_group_size,
                    'max_group_size': package.max_group_size,
                    'budget_tier': package.budget_tier,
                    'estimated_cost_per_person_per_day': float(package.estimated_cost_per_person_per_day),
                    'included_locations': package.included_locations or [],
                    'included_activities': package.included_activities or []
                },
                'operator': {
                    'id': str(operator.id),
                    'name': operator.name,
                    'company': operator.company,
                    'services_offered': operator.services_offered or [],
                    'destinations_covered': operator.destinations_covered or []
                },
                'match_score': score
            })
        
        # Sort by score descending
        scored_packages.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Return top 10 matches
        return {
            'success': True,
            'data': scored_packages[:10],
            'total_matches': len(scored_packages)
        }
        
    except Exception as e:
        logger.error(f"Error matching packages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error matching packages: {str(e)}"
        )

@router.get("", response_model=List[Dict[str, Any]])
async def get_operator_packages(
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Get all packages for the current operator"""
    try:
        packages = get_operator_packages(db, current_operator.id)
        
        return [
            {
                'id': str(package.id),
                'package_name': package.package_name,
                'description': package.description,
                'min_duration': package.min_duration,
                'max_duration': package.max_duration,
                'min_group_size': package.min_group_size,
                'max_group_size': package.max_group_size,
                'budget_tier': package.budget_tier,
                'estimated_cost_per_person_per_day': float(package.estimated_cost_per_person_per_day),
                'included_locations': package.included_locations or [],
                'included_activities': package.included_activities or [],
                'created_at': package.created_at.isoformat(),
                'updated_at': package.updated_at.isoformat()
            }
            for package in packages
        ]
        
    except Exception as e:
        logger.error(f"Error fetching operator packages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching operator packages: {str(e)}"
        )

@router.post("", response_model=Dict[str, Any])
async def create_package(
    package_data: OperatorPackageCreate,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Create a new operator package"""
    try:
        package = create_operator_package(db, current_operator.id, package_data)
        
        return {
            'success': True,
            'data': {
                'id': str(package.id),
                'package_name': package.package_name,
                'created_at': package.created_at.isoformat()
            },
            'message': 'Package created successfully'
        }
        
    except Exception as e:
        logger.error(f"Error creating package: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating package: {str(e)}"
        )

@router.put("/{package_id}", response_model=Dict[str, Any])
async def update_package(
    package_id: str,
    package_data: OperatorPackageUpdate,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Update an operator package"""
    try:
        package = update_operator_package(db, package_id, current_operator.id, package_data)
        
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found"
            )
        
        return {
            'success': True,
            'data': {
                'id': str(package.id),
                'updated_at': package.updated_at.isoformat()
            },
            'message': 'Package updated successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating package: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating package: {str(e)}"
        )

@router.delete("/{package_id}")
async def delete_package(
    package_id: str,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Delete an operator package"""
    try:
        success = delete_operator_package(db, package_id, current_operator.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found"
            )
        
        return {
            'success': True,
            'message': 'Package deleted successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting package: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting package: {str(e)}"
        )
