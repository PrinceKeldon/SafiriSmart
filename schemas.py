from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import uuid

class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Authentication Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class OperatorResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    company: str
    role: str = Field(default='operator')
    specializations: List[str]
    is_active: bool

# Lead Schemas
class TravelerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    country: Optional[str] = None

class Preferences(BaseModel):
    destination: str
    duration: int
    travel_dates: Optional[str] = None
    interests: List[str]
    budget: str
    group_size: int

class CreateLeadRequest(BaseModel):
    traveler: TravelerInfo
    preferences: Dict[str, Any]
    itinerary: Optional[Dict[str, Any]] = None
    selected_operator_ids: List[uuid.UUID]  # New required field

class LeadResponse(BaseModel):
    id: uuid.UUID
    status: LeadStatus
    assigned_operator_id: Optional[uuid.UUID] = None
    traveler_name: str
    traveler_email: str
    traveler_phone: Optional[str] = None
    traveler_country: Optional[str] = None
    preferences: Dict[str, Any]
    itinerary: Optional[Dict[str, Any]] = None
    quoted_price: Optional[float] = None
    quoted_currency: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Lead Note Schemas
class AddLeadNoteRequest(BaseModel):
    note: str

class LeadNoteResponse(BaseModel):
    id: uuid.UUID
    lead_id: uuid.UUID
    note: str
    created_by: uuid.UUID
    created_at: datetime

# Operator Profile Schemas
class OperatorProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
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
    services_offered: Optional[List[str]] = None
    destinations_covered: Optional[List[str]] = None
    is_active: Optional[bool] = None

class OperatorProfileResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    company: str
    role: str
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
    specializations: List[str]
    services_offered: List[str]
    destinations_covered: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

# Operator Package Schemas
class OperatorPackageCreate(BaseModel):
    package_name: str
    description: Optional[str] = None
    min_duration: int
    max_duration: int
    min_group_size: int
    max_group_size: int
    budget_tier: str
    estimated_cost_per_person_per_day: float
    included_locations: Optional[Dict[str, Any]] = None
    included_activities: Optional[Dict[str, Any]] = None

class OperatorPackageUpdate(BaseModel):
    package_name: Optional[str] = None
    description: Optional[str] = None
    min_duration: Optional[int] = None
    max_duration: Optional[int] = None
    min_group_size: Optional[int] = None
    max_group_size: Optional[int] = None
    budget_tier: Optional[str] = None
    estimated_cost_per_person_per_day: Optional[float] = None
    included_locations: Optional[Dict[str, Any]] = None
    included_activities: Optional[Dict[str, Any]] = None

class OperatorPackageResponse(BaseModel):
    id: uuid.UUID
    operator_id: uuid.UUID
    package_name: str
    description: Optional[str] = None
    min_duration: int
    max_duration: int
    min_group_size: int
    max_group_size: int
    budget_tier: str
    estimated_cost_per_person_per_day: float
    included_locations: Optional[Dict[str, Any]] = None
    included_activities: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

# Public Operator Schema for frontend selection
class PublicOperatorPackage(BaseModel):
    id: str
    package_name: str
    description: Optional[str] = None
    budget_tier: str
    min_duration: int
    max_duration: int
    estimated_cost_per_person_per_day: float

class PublicOperatorResponse(BaseModel):
    id: uuid.UUID
    company_name: str
    description: str
    specializations: List[str]
    top_packages: List[PublicOperatorPackage]
