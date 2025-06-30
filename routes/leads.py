
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
import math
import logging
from typing import Optional

from database import get_db
from models import Operator, Lead, LeadNote
from schemas import *
from auth import get_current_operator
from crud import *
from email_service import email_service
from ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/leads", tags=["leads"])

@router.post("", response_model=CreateLeadResponse)
async def create_new_lead(request: CreateLeadRequest, db: Session = Depends(get_db)):
    """Create new lead from B2C SafariGuide AI or direct operator entry"""
    try:
        itinerary = request.itinerary
        
        # Generate itinerary if not provided
        if not itinerary:
            logger.info("Generating itinerary via AI Core Service")
            itinerary = await ai_service.generate_itinerary(request.preferences)
            
            if not itinerary:
                logger.warning("Failed to generate itinerary, proceeding without it")
        
        # Create the lead
        lead = create_lead(db, request, itinerary)
        
        # Send email notification to assigned operator
        if lead.assigned_operator:
            lead_data = {
                "traveler_name": lead.traveler_name,
                "traveler_email": lead.traveler_email,
                "traveler_phone": lead.traveler_phone,
                "traveler_country": lead.traveler_country,
                "preferences": lead.preferences
            }
            
            email_sent = email_service.send_new_lead_notification(
                lead.assigned_operator.email,
                lead.assigned_operator.name,
                lead_data
            )
            
            if not email_sent:
                logger.warning(f"Failed to send email notification for lead {lead.id}")
        
        return CreateLeadResponse(
            success=True,
            data={
                "lead_id": str(lead.id),
                "status": lead.status,
                "assigned_operator": {
                    "id": str(lead.assigned_operator.id),
                    "name": lead.assigned_operator.name,
                    "email": lead.assigned_operator.email
                } if lead.assigned_operator else None
            },
            message="Lead created and assigned successfully"
        )
        
    except Exception as e:
        logger.error(f"Error creating lead: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating lead: {str(e)}"
        )

@router.get("", response_model=LeadListResponse)
async def get_leads(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Get paginated leads for authenticated operator"""
    try:
        leads, total = get_leads_for_operator(
            db, current_operator.id, status, search, page, limit
        )
        
        lead_responses = []
        for lead in leads:
            lead_responses.append(LeadResponse(
                id=lead.id,
                status=LeadStatus(lead.status),
                traveler=TravelerInfo(
                    name=lead.traveler_name,
                    email=lead.traveler_email,
                    phone=lead.traveler_phone,
                    country=lead.traveler_country
                ),
                preferences=lead.preferences,
                itinerary=lead.itinerary,
                quoted_price=float(lead.quoted_price) if lead.quoted_price else None,
                quoted_currency=lead.quoted_currency,
                created_at=lead.created_at,
                updated_at=lead.updated_at,
                assigned_operator=OperatorResponse(
                    id=lead.assigned_operator.id,
                    name=lead.assigned_operator.name,
                    email=lead.assigned_operator.email,
                    company=lead.assigned_operator.company,
                    specializations=lead.assigned_operator.specializations or [],
                    is_active=lead.assigned_operator.is_active
                ) if lead.assigned_operator else None
            ))
        
        total_pages = math.ceil(total / limit)
        
        return LeadListResponse(
            success=True,
            data=lead_responses,
            pagination={
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": total_pages
            }
        )
        
    except Exception as e:
        logger.error(f"Error fetching leads: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching leads: {str(e)}"
        )

@router.get("/{lead_id}", response_model=LeadDetailResponse)
async def get_lead_detail(
    lead_id: str,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Get specific lead details with notes"""
    try:
        lead = get_lead_by_id(db, lead_id, current_operator.id)
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        # Get lead notes
        notes = get_lead_notes(db, lead_id, current_operator.id)
        note_responses = []
        for note in notes:
            note_responses.append(LeadNoteResponse(
                id=note.id,
                note=note.note,
                created_by=OperatorResponse(
                    id=note.created_by_operator.id,
                    name=note.created_by_operator.name,
                    email=note.created_by_operator.email,
                    company=note.created_by_operator.company,
                    specializations=note.created_by_operator.specializations or [],
                    is_active=note.created_by_operator.is_active
                ),
                created_at=note.created_at
            ))
        
        return LeadDetailResponse(
            id=lead.id,
            status=LeadStatus(lead.status),
            traveler=TravelerInfo(
                name=lead.traveler_name,
                email=lead.traveler_email,
                phone=lead.traveler_phone,
                country=lead.traveler_country
            ),
            preferences=lead.preferences,
            itinerary=lead.itinerary,
            quoted_price=float(lead.quoted_price) if lead.quoted_price else None,
            quoted_currency=lead.quoted_currency,
            created_at=lead.created_at,
            updated_at=lead.updated_at,
            assigned_operator=OperatorResponse(
                id=lead.assigned_operator.id,
                name=lead.assigned_operator.name,
                email=lead.assigned_operator.email,
                company=lead.assigned_operator.company,
                specializations=lead.assigned_operator.specializations or [],
                is_active=lead.assigned_operator.is_active
            ) if lead.assigned_operator else None,
            notes=note_responses
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching lead detail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching lead detail: {str(e)}"
        )

@router.put("/{lead_id}")
async def update_lead(
    lead_id: str,
    request: dict,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Update lead data including itinerary"""
    try:
        lead = get_lead_by_id(db, lead_id, current_operator.id)
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        # Update itinerary if provided
        if 'itinerary' in request:
            lead.itinerary = request['itinerary']
        
        # Update other fields if provided
        if 'preferences' in request:
            lead.preferences = request['preferences']
        
        db.commit()
        db.refresh(lead)
        
        return {
            "success": True,
            "data": {
                "lead_id": str(lead.id),
                "updated_at": lead.updated_at.isoformat()
            },
            "message": "Lead updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lead: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating lead: {str(e)}"
        )

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Delete a lead"""
    try:
        lead = get_lead_by_id(db, lead_id, current_operator.id)
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        db.delete(lead)
        db.commit()
        
        return {
            "success": True,
            "message": "Lead deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting lead: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting lead: {str(e)}"
        )

@router.post("/{lead_id}/send-itinerary")
async def send_itinerary(
    lead_id: str,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Send itinerary to traveler via email"""
    try:
        lead = get_lead_by_id(db, lead_id, current_operator.id)
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        if not lead.itinerary:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lead has no itinerary to send"
            )
        
        # Send itinerary email
        email_sent = email_service.send_itinerary_email(
            lead.traveler_email,
            lead.traveler_name,
            lead.itinerary,
            current_operator.name,
            current_operator.company
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send itinerary email"
            )
        
        return {
            "success": True,
            "message": "Itinerary sent successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending itinerary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending itinerary: {str(e)}"
        )

@router.put("/{lead_id}/status", response_model=UpdateLeadStatusResponse)
async def update_lead_status_endpoint(
    lead_id: str,
    request: UpdateLeadStatusRequest,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Update lead status"""
    try:
        old_lead = get_lead_by_id(db, lead_id, current_operator.id)
        if not old_lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        old_status = old_lead.status
        updated_lead = update_lead_status(db, lead_id, request.status, current_operator.id)
        
        if not updated_lead:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update lead status"
            )
        
        return UpdateLeadStatusResponse(
            success=True,
            data={
                "lead_id": str(updated_lead.id),
                "old_status": old_status,
                "new_status": updated_lead.status,
                "updated_at": updated_lead.updated_at.isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lead status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating lead status: {str(e)}"
        )

@router.post("/{lead_id}/notes")
async def add_lead_note_endpoint(
    lead_id: str,
    request: AddLeadNoteRequest,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Add note to lead"""
    try:
        note = add_lead_note(db, lead_id, request, current_operator.id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        return {
            "success": True,
            "data": {
                "note_id": str(note.id),
                "note": note.note,
                "created_at": note.created_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding lead note: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding lead note: {str(e)}"
        )

@router.put("/{lead_id}/quote")
async def update_lead_quote_endpoint(
    lead_id: str,
    request: AddLeadQuoteRequest,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Add quote to lead"""
    try:
        updated_lead = update_lead_quote(
            db, lead_id, request.quoted_price, request.quoted_currency, current_operator.id
        )
        
        if not updated_lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        # Add a note if provided
        if request.note:
            note_request = AddLeadNoteRequest(note=request.note)
            add_lead_note(db, lead_id, note_request, current_operator.id)
        
        return {
            "success": True,
            "data": {
                "lead_id": str(updated_lead.id),
                "quoted_price": float(updated_lead.quoted_price),
                "quoted_currency": updated_lead.quoted_currency,
                "updated_at": updated_lead.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lead quote: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating lead quote: {str(e)}"
        )
