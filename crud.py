from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Operator, Lead, LeadNote, OperatorPackage
from schemas import CreateLeadRequest, AddLeadNoteRequest, LeadStatus, OperatorProfileUpdate, OperatorPackageCreate, OperatorPackageUpdate
from typing import List, Optional, Dict, Any
import uuid

# Operator CRUD
def get_operator_by_email(db: Session, email: str) -> Optional[Operator]:
    return db.query(Operator).filter(Operator.email == email).first()

def get_operator_by_id(db: Session, operator_id: uuid.UUID) -> Optional[Operator]:
    return db.query(Operator).filter(Operator.id == operator_id).first()

# Lead CRUD
def create_lead(db: Session, lead_data: CreateLeadRequest, itinerary: Optional[Dict[str, Any]] = None) -> Lead:
    """Create lead and assign to selected operators directly"""
    
    lead = Lead(
        traveler_name=lead_data.traveler.name,
        traveler_email=lead_data.traveler.email,
        traveler_phone=lead_data.traveler.phone,
        traveler_country=lead_data.traveler.country,
        preferences=lead_data.preferences,
        itinerary=itinerary or lead_data.itinerary,
        assigned_operator_id=None,  # No single assignment anymore
        status=LeadStatus.NEW
    )
    
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    # Create lead_visibility entries for selected operators
    from models import LeadVisibility
    for operator_id in lead_data.selected_operator_ids:
        visibility_entry = LeadVisibility(
            lead_id=lead.id,
            operator_id=operator_id
        )
        db.add(visibility_entry)
    
    db.commit()
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

def get_next_operator_for_assignment(db: Session, lead_preferences: Optional[Dict[str, Any]] = None) -> Optional[Operator]:
    """Intelligent lead assignment based on operator services and destinations"""
    operators = db.query(Operator).filter(Operator.is_active == True).all()
    
    if not operators:
        return None
    
    if not lead_preferences:
        # Fallback to round-robin if no preferences
        return operators[0]
    
    # Extract interests and destinations from lead preferences
    interests = lead_preferences.get('interests', [])
    itinerary = lead_preferences.get('itinerary', {})
    destinations = []
    
    # Extract destinations from itinerary
    if isinstance(itinerary, dict):
        days = itinerary.get('days', [])
        for day in days:
            if isinstance(day, dict):
                activities = day.get('activities', [])
                for activity in activities:
                    if isinstance(activity, dict):
                        location = activity.get('location', '')
                        if location:
                            destinations.append(location)
    
    best_operators = []
    max_score = 0
    
    for operator in operators:
        score = 0
        services = operator.services_offered or []
        covered_destinations = operator.destinations_covered or []
        
        # Score based on matching interests with services
        for interest in interests:
            for service in services:
                if interest.lower() in service.lower() or service.lower() in interest.lower():
                    score += 2
        
        # Score based on matching destinations
        for destination in destinations:
            for covered in covered_destinations:
                if destination.lower() in covered.lower() or covered.lower() in destination.lower():
                    score += 3
        
        if score > max_score:
            max_score = score
            best_operators = [operator]
        elif score == max_score:
            best_operators.append(operator)
    
    # If we have matches, return one randomly (round-robin can be implemented later)
    if best_operators:
        return best_operators[0]
    
    # Fallback to first available operator
    return operators[0]

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

# Operator Package CRUD
def create_operator_package(db: Session, operator_id: uuid.UUID, package_data: OperatorPackageCreate) -> OperatorPackage:
    """Create a new operator package"""
    package = OperatorPackage(
        operator_id=operator_id,
        **package_data.dict()
    )
    
    db.add(package)
    db.commit()
    db.refresh(package)
    return package

def get_operator_packages(db: Session, operator_id: uuid.UUID) -> List[OperatorPackage]:
    """Get all packages for an operator"""
    return db.query(OperatorPackage).filter(OperatorPackage.operator_id == operator_id).all()

def get_operator_package_by_id(db: Session, package_id: uuid.UUID, operator_id: uuid.UUID) -> Optional[OperatorPackage]:
    """Get a specific operator package"""
    return db.query(OperatorPackage).filter(
        OperatorPackage.id == package_id,
        OperatorPackage.operator_id == operator_id
    ).first()

def update_operator_package(db: Session, package_id: uuid.UUID, operator_id: uuid.UUID, package_data: OperatorPackageUpdate) -> Optional[OperatorPackage]:
    """Update an operator package"""
    package = get_operator_package_by_id(db, package_id, operator_id)
    if not package:
        return None
    
    # Update only the fields that are provided
    update_data = package_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(package, field, value)
    
    db.commit()
    db.refresh(package)
    return package

def delete_operator_package(db: Session, package_id: uuid.UUID, operator_id: uuid.UUID) -> bool:
    """Delete an operator package"""
    package = get_operator_package_by_id(db, package_id, operator_id)
    if not package:
        return False
    
    db.delete(package)
    db.commit()
    return True

def calculate_package_quote(package: OperatorPackage, lead_preferences: dict) -> Dict[str, Any]:
    """Calculate a preliminary quote based on package and lead preferences"""
    duration = lead_preferences.get('duration', 7)
    group_size = lead_preferences.get('groupSize', 2)
    
    # Basic calculation: cost per person per day * duration * group size
    total_cost = float(package.estimated_cost_per_person_per_day) * duration * group_size
    
    return {
        'package_id': str(package.id),
        'package_name': package.package_name,
        'estimated_total_cost': total_cost,
        'cost_per_person': float(package.estimated_cost_per_person_per_day) * duration,
        'duration': duration,
        'group_size': group_size,
        'budget_tier': package.budget_tier,
        'currency': 'USD'
    }
