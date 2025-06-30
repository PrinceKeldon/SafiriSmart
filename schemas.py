
from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    BOOKED = "booked"
    CANCELLED = "cancelled"

# Authentication Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    data: Dict[str, Any]

class OperatorResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    company: str
    specializations: Optional[List[str]] = None
    is_active: bool

# Lead Schemas
class TravelerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    country: Optional[str] = None

class CreateLeadRequest(BaseModel):
    traveler: TravelerInfo
    preferences: Dict[str, Any]
    itinerary: Optional[Dict[str, Any]] = None

class CreateLeadResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str

class LeadResponse(BaseModel):
    id: uuid.UUID
    status: LeadStatus
    traveler: TravelerInfo
    preferences: Dict[str, Any]
    itinerary: Optional[Dict[str, Any]] = None
    quoted_price: Optional[float] = None
    quoted_currency: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    assigned_operator: Optional[OperatorResponse] = None

class LeadListResponse(BaseModel):
    success: bool
    data: List[LeadResponse]
    pagination: Dict[str, int]

class UpdateLeadStatusRequest(BaseModel):
    status: LeadStatus

class UpdateLeadStatusResponse(BaseModel):
    success: bool
    data: Dict[str, Any]

class AddLeadNoteRequest(BaseModel):
    note: str

class AddLeadQuoteRequest(BaseModel):
    quoted_price: float
    quoted_currency: str
    note: Optional[str] = None

class LeadNoteResponse(BaseModel):
    id: uuid.UUID
    note: str
    created_by: OperatorResponse
    created_at: datetime

class LeadDetailResponse(BaseModel):
    id: uuid.UUID
    status: LeadStatus
    traveler: TravelerInfo
    preferences: Dict[str, Any]
    itinerary: Optional[Dict[str, Any]] = None
    quoted_price: Optional[float] = None
    quoted_currency: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    assigned_operator: Optional[OperatorResponse] = None
    notes: List[LeadNoteResponse] = []

# AI Core Service Schemas
class AITravelPreferences(BaseModel):
    duration: int
    budgetRange: str
    interests: List[str]
    groupSize: int
    travelPace: str

# Standard Response Schemas
class StandardResponse(BaseModel):
    success: bool
    message: str
    errors: Optional[List[str]] = None
    error_code: Optional[str] = None
