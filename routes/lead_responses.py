
from models import Lead, Operator
from schemas import *
import math

class LeadResponseBuilder:
    @staticmethod
    def build_lead_response(lead: Lead) -> LeadResponse:
        """Build a LeadResponse from a Lead model"""
        return LeadResponse(
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
            assigned_operator=LeadResponseBuilder.build_operator_response(lead.assigned_operator) if lead.assigned_operator else None
        )
    
    @staticmethod
    def build_operator_response(operator: Operator) -> OperatorResponse:
        """Build an OperatorResponse from an Operator model"""
        return OperatorResponse(
            id=operator.id,
            name=operator.name,
            email=operator.email,
            company=operator.company,
            specializations=operator.specializations or [],
            is_active=operator.is_active
        )
    
    @staticmethod
    def build_lead_detail_response(lead: Lead, notes: list) -> LeadDetailResponse:
        """Build a detailed lead response with notes"""
        note_responses = []
        for note in notes:
            note_responses.append(LeadNoteResponse(
                id=note.id,
                note=note.note,
                created_by=LeadResponseBuilder.build_operator_response(note.created_by_operator),
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
            assigned_operator=LeadResponseBuilder.build_operator_response(lead.assigned_operator) if lead.assigned_operator else None,
            notes=note_responses
        )
    
    @staticmethod
    def build_lead_list_response(leads: list, total: int, page: int, limit: int) -> LeadListResponse:
        """Build a paginated lead list response"""
        lead_responses = [LeadResponseBuilder.build_lead_response(lead) for lead in leads]
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
