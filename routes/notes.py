
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
import logging
from typing import List
import uuid

from database import get_db
from models import Operator, Lead, LeadNote
from schemas import AddLeadNoteRequest, LeadNoteResponse
from auth import get_current_operator
from crud import get_lead_by_id, add_lead_note, get_lead_notes

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/leads", tags=["notes"])

@router.post("/{lead_id}/notes", response_model=dict)
async def create_lead_note(
    lead_id: str,
    request: AddLeadNoteRequest,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Create a new note for a specific lead"""
    try:
        # Convert string lead_id to UUID
        lead_uuid = uuid.UUID(lead_id)
        
        # Verify the lead exists and belongs to the operator
        lead = get_lead_by_id(db, lead_uuid, current_operator.id)
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found or not assigned to current operator"
            )
        
        # Create the note
        note = add_lead_note(db, lead_uuid, request, current_operator.id)
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create note"
            )
        
        return {
            "success": True,
            "data": {
                "id": str(note.id),
                "lead_id": str(note.lead_id),
                "note": note.note,
                "created_by": str(note.created_by),
                "created_at": note.created_at.isoformat()
            },
            "message": "Note created successfully"
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating lead note: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating note: {str(e)}"
        )

@router.get("/{lead_id}/notes", response_model=dict)
async def get_lead_notes_endpoint(
    lead_id: str,
    current_operator: Operator = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Get all notes for a specific lead"""
    try:
        # Convert string lead_id to UUID
        lead_uuid = uuid.UUID(lead_id)
        
        # Verify the lead exists and belongs to the operator
        lead = get_lead_by_id(db, lead_uuid, current_operator.id)
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found or not assigned to current operator"
            )
        
        # Get all notes for this lead
        notes = get_lead_notes(db, lead_uuid, current_operator.id)
        
        notes_data = []
        for note in notes:
            notes_data.append({
                "id": str(note.id),
                "lead_id": str(note.lead_id),
                "note": note.note,
                "created_by": str(note.created_by),
                "created_at": note.created_at.isoformat(),
                "operator_name": note.created_by_operator.name if note.created_by_operator else "Unknown"
            })
        
        return {
            "success": True,
            "data": notes_data,
            "message": f"Retrieved {len(notes_data)} notes"
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching lead notes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching notes: {str(e)}"
        )
