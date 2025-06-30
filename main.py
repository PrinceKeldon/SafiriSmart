
from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
import math
import logging

# Local imports
from database import get_db, create_tables
from models import Operator, Lead, LeadNote
from schemas import *
from auth import authenticate_operator, create_access_token, get_current_operator, get_password_hash
from crud import *
from email_service import email_service
from ai_service import ai_service
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TourMaster AI - B2B Backend",
    description="Backend API for tour operators to manage safari leads and bookings",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    logger.info("Database tables created successfully")

# Authentication Endpoints
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate tour operator and return JWT token"""
    try:
        operator = authenticate_operator(db, request.email, request.password)
        if not operator:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not operator.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": operator.email}, expires_delta=access_token_expires
        )
        
        return LoginResponse(
            success=True,
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "operator": {
                    "id": str(operator.id),
                    "name": operator.name,
                    "email": operator.email,
                    "company": operator.company,
                    "specializations": operator.specializations or []
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@app.get("/api/auth/me", response_model=OperatorResponse)
async def get_current_user(current_operator: Operator = Depends(get_current_operator)):
    """Get current authenticated operator details"""
    return OperatorResponse(
        id=current_operator.id,
        name=current_operator.name,
        email=current_operator.email,
        company=current_operator.company,
        specializations=current_operator.specializations or [],
        is_active=current_operator.is_active
    )

# Lead Management Endpoints
@app.post("/api/leads", response_model=CreateLeadResponse)
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

@app.get("/api/leads", response_model=LeadListResponse)
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

@app.get("/api/leads/{lead_id}", response_model=LeadDetailResponse)
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

@app.put("/api/leads/{lead_id}/status", response_model=UpdateLeadStatusResponse)
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

@app.post("/api/leads/{lead_id}/notes")
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

@app.put("/api/leads/{lead_id}/quote")
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

# Health Check Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TourMaster AI - B2B Backend",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "TourMaster AI B2B Backend",
        "endpoints": {
            "auth": {
                "login": "POST /api/auth/login",
                "me": "GET /api/auth/me"
            },
            "leads": {
                "create": "POST /api/leads",
                "list": "GET /api/leads",
                "detail": "GET /api/leads/{id}",
                "update_status": "PUT /api/leads/{id}/status",
                "add_note": "POST /api/leads/{id}/notes",
                "add_quote": "PUT /api/leads/{id}/quote"
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
