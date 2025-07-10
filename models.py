from sqlalchemy import Column, String, Boolean, DateTime, Text, DECIMAL, ForeignKey, UUID, ARRAY, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Operator(Base):
    __tablename__ = "operators"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default='operator')
    specializations = Column(ARRAY(Text), nullable=True)
    services_offered = Column(JSONB, nullable=True, default='[]')
    destinations_covered = Column(JSONB, nullable=True, default='[]')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    leads = relationship("Lead", back_populates="assigned_operator")
    notes = relationship("LeadNote", back_populates="created_by_operator")
    packages = relationship("OperatorPackage", back_populates="operator", cascade="all, delete-orphan")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(String(20), nullable=False, default='new')
    assigned_operator_id = Column(PG_UUID(as_uuid=True), ForeignKey('operators.id'), nullable=True)
    
    # Traveler Information
    traveler_name = Column(String(255), nullable=False)
    traveler_email = Column(String(255), nullable=False)
    traveler_phone = Column(String(50), nullable=True)
    traveler_country = Column(String(100), nullable=True)
    
    # Trip Preferences and Itinerary (JSON)
    preferences = Column(JSONB, nullable=False)
    itinerary = Column(JSONB, nullable=True)
    
    # Quote Information
    quoted_price = Column(DECIMAL(10, 2), nullable=True)
    quoted_currency = Column(String(3), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    assigned_operator = relationship("Operator", back_populates="leads")
    notes = relationship("LeadNote", back_populates="lead", cascade="all, delete-orphan")

class LeadNote(Base):
    __tablename__ = "lead_notes"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(PG_UUID(as_uuid=True), ForeignKey('leads.id', ondelete='CASCADE'), nullable=False)
    note = Column(Text, nullable=False)
    created_by = Column(PG_UUID(as_uuid=True), ForeignKey('operators.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    lead = relationship("Lead", back_populates="notes")
    created_by_operator = relationship("Operator", back_populates="notes")

class OperatorPackage(Base):
    __tablename__ = "operator_packages"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operator_id = Column(PG_UUID(as_uuid=True), ForeignKey('operators.id', ondelete='CASCADE'), nullable=False)
    package_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    min_duration = Column(Integer, nullable=False)
    max_duration = Column(Integer, nullable=False)
    min_group_size = Column(Integer, nullable=False)
    max_group_size = Column(Integer, nullable=False)
    budget_tier = Column(String(20), nullable=False)
    estimated_cost_per_person_per_day = Column(DECIMAL(10, 2), nullable=False)
    included_locations = Column(JSONB, nullable=True, default='[]')
    included_activities = Column(JSONB, nullable=True, default='[]')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    operator = relationship("Operator", back_populates="packages")

class LeadVisibility(Base):
    __tablename__ = "lead_visibility"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(PG_UUID(as_uuid=True), ForeignKey('leads.id', ondelete='CASCADE'), nullable=False)
    operator_id = Column(PG_UUID(as_uuid=True), ForeignKey('operators.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    lead = relationship("Lead", backref="visibility_entries")
    operator = relationship("Operator", backref="visible_leads")
