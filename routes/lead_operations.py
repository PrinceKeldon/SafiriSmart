
from sqlalchemy.orm import Session
import logging
from typing import Optional

from models import Operator, Lead
from schemas import *
from crud import *
from email_service import email_service
from ai_service import ai_service

logger = logging.getLogger(__name__)

class LeadOperations:
    @staticmethod
    async def create_lead_with_itinerary(db: Session, request: CreateLeadRequest) -> Lead:
        """Create a new lead with optional AI-generated itinerary"""
        itinerary = request.itinerary
        
        # Generate itinerary if not provided
        if not itinerary:
            logger.info("Generating itinerary via AI Core Service")
            itinerary = await ai_service.generate_itinerary(request.preferences)
            
            if not itinerary:
                logger.warning("Failed to generate itinerary, proceeding without it")
        
        # Create the lead
        return create_lead(db, request, itinerary)
    
    @staticmethod
    def send_lead_notification(lead: Lead) -> bool:
        """Send email notification to assigned operator about new lead"""
        if not lead.assigned_operator:
            return True
            
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
        
        return email_sent
    
    @staticmethod
    def send_itinerary_to_traveler(lead: Lead, operator: Operator) -> bool:
        """Send itinerary email to traveler"""
        if not lead.itinerary:
            return False
            
        return email_service.send_itinerary_email(
            lead.traveler_email,
            lead.traveler_name,
            lead.itinerary,
            operator.name,
            operator.company
        )
