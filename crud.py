from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Operator, Lead, LeadNote
from schemas import CreateLeadRequest, AddLeadNoteRequest, LeadStatus, OperatorProfileUpdate
from typing import List, Optional, Dict, Any
import uuid

# Operator CRUD
def get_operator_by_email(db: Session, email: str) -> Optional[Operator]:
    return db.query(Operator).filter(Operator.email == email).first()

def get_operator_by_id(db: Session, operator_id: uuid.UUID) -> Optional[Operator]:
    return db.query(Operator).filter(Operator.id == operator_id).first()

# Lead CRUD
def create_lead(db: Session, lead_data: CreateLeadRequest, itinerary: Optional[Dict[str, Any]] = None) -> Lead:
    # Simple round-robin assignment logic
    assigned_operator = get_next_operator_for_assignment(db)
    
    lead = Lead(
        traveler_name=lead_data.traveler.name,
        traveler_email=lead_data.traveler.email,
        traveler_phone=lead_data.traveler.phone,
        traveler_country=lead_data.traveler.country,
        preferences=lead_data.preferences,
        itinerary=itinerary or lead_data.itinerary,
        assigned_operator_id=assigned_operator.id if assigned_operator else None,
        status=LeadStatus.NEW
    )
    
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

def get_leads_for_operator(
    db: Session, 
    operator_id: uuid.UUID, 
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> tuple[List[Lead], int]:
    query = db.query(Lead).filter(Lead.assigned_operator_id == operator_id)
    
    if status:
        query = query.filter(Lead.status == status)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Lead.traveler_name.ilike(search_filter)) |
            (Lead.traveler_email.ilike(search_filter))
        )
    
    total = query.count()
    
    leads = query.offset((page - 1) * limit).limit(limit).all()
    
    return leads, total

def get_lead_by_id(db: Session, lead_id: uuid.UUID, operator_id: uuid.UUID) -> Optional[Lead]:
    return db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.assigned_operator_id == operator_id
    ).first()

def update_lead_status(db: Session, lead_id: uuid.UUID, new_status: LeadStatus, operator_id: uuid.UUID) -> Optional[Lead]:
    lead = get_lead_by_id(db, lead_id, operator_id)
    if lead:
        lead.status = new_status
        db.commit()
        db.refresh(lead)
    return lead

def add_lead_note(db: Session, lead_id: uuid.UUID, note_data: AddLeadNoteRequest, operator_id: uuid.UUID) -> Optional[LeadNote]:
    # Verify the lead belongs to the operator
    lead = get_lead_by_id(db, lead_id, operator_id)
    if not lead:
        return None
    
    note = LeadNote(
        lead_id=lead_id,
        note=note_data.note,
        created_by=operator_id
    )
    
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def update_lead_quote(db: Session, lead_id: uuid.UUID, price: float, currency: str, operator_id: uuid.UUID) -> Optional[Lead]:
    lead = get_lead_by_id(db, lead_id, operator_id)
    if lead:
        lead.quoted_price = price
        lead.quoted_currency = currency
        db.commit()
        db.refresh(lead)
    return lead

def get_next_operator_for_assignment(db: Session) -> Optional[Operator]:
    """Simple round-robin assignment - get operator with fewest active leads"""
    operator = db.query(Operator).filter(Operator.is_active == True).first()
    return operator

def get_lead_notes(db: Session, lead_id: uuid.UUID, operator_id: uuid.UUID) -> List[LeadNote]:
    # Verify the lead belongs to the operator
    lead = get_lead_by_id(db, lead_id, operator_id)
    if not lead:
        return []
    
    return db.query(LeadNote).filter(LeadNote.lead_id == lead_id).order_by(LeadNote.created_at.desc()).all()

# Operator Profile CRUD
def get_operator_profile(db: Session, operator_id: uuid.UUID) -> Optional[Operator]:
    """Get operator profile by ID"""
    return db.query(Operator).filter(Operator.id == operator_id).first()

def update_operator_profile(db: Session, operator_id: uuid.UUID, profile_data: OperatorProfileUpdate) -> Optional[Operator]:
    """Update operator profile"""
    operator = db.query(Operator).filter(Operator.id == operator_id).first()
    if not operator:
        return None
    
    # Update only the fields that are provided
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(operator, field, value)
    
    db.commit()
    db.refresh(operator)
    return operator
