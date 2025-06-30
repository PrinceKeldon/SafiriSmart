from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime
import uuid

class Traveler(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    country: Optional[str] = None

class Budget(BaseModel):
    min: float
    max: float
    currency: str = "USD"

class TravelDates(BaseModel):
    startDate: datetime
    endDate: datetime
    flexible: bool = False

class Preferences(BaseModel):
    destination: str
    duration: int
    budget: Budget
    travelDates: TravelDates
    groupSize: int
    interests: List[str]
    accommodationType: str = "mid-range"

class CreateLeadRequest(BaseModel):
    traveler: Traveler
    preferences: Preferences
    itinerary: Optional[dict] = None

class AddLeadNoteRequest(BaseModel):
    note: str

class LeadStatus(str):
    NEW = "new"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    BOOKED = "booked"
    CANCELLED = "cancelled"

# Operator Profile Schemas
class OperatorProfileCreate(BaseModel):
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: str = "Kenya"
    contact_person_name: Optional[str] = None
    contact_person_phone: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    certificate_of_incorporation_url: Optional[str] = None
    business_permit_url: Optional[str] = None
    kato_membership_url: Optional[str] = None

class OperatorProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_phone: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    certificate_of_incorporation_url: Optional[str] = None
    business_permit_url: Optional[str] = None
    kato_membership_url: Optional[str] = None

class OperatorProfileResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    company: str
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_phone: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    certificate_of_incorporation_url: Optional[str] = None
    business_permit_url: Optional[str] = None
    kato_membership_url: Optional[str] = None
    specializations: Optional[List[str]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
