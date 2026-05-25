"""Shared state and contracts for the SafiriSmart agent graph."""

from datetime import date
from typing import Optional, TypedDict

from pydantic import BaseModel, Field


class DateRange(BaseModel):
    start: date
    end: date


class BudgetRange(BaseModel):
    min_usd: float = Field(ge=0)
    max_usd: float = Field(ge=0)


class TravelerProfile(BaseModel):
    session_id: str
    destinations: list[str] = Field(default_factory=lambda: ["Masai Mara"])
    travel_dates: Optional[DateRange] = None
    budget: Optional[BudgetRange] = None
    group_size: int = Field(default=1, ge=1)
    experience_types: list[str] = Field(default_factory=lambda: ["wildlife"])
    accommodation_tier: str = "mid"
    language: str = "en"
    accessibility: list[str] = Field(default_factory=list)
    special_requests: str = ""
    migration_interest: bool = False
    raw_input: str


class WildlifeContext(BaseModel):
    score: float = Field(ge=0, le=100)
    phase_label: str
    peak_window_start: str
    peak_window_end: str
    days_to_peak: int
    signal_summary: str
    herd_location: str
    recommendation: str
    travel_window_score: float = Field(ge=0, le=100)
    travel_window_label: str


class ItineraryDay(BaseModel):
    day: int
    date: Optional[str] = None
    location: str
    park: str
    activities: list[str] = Field(default_factory=list)
    accommodation: str
    accommodation_tier: str
    drive_hours: float = Field(ge=0)
    estimated_cost_usd: float = Field(ge=0)
    wildlife_highlight: str
    migration_score: Optional[float] = None


class Itinerary(BaseModel):
    days: list[ItineraryDay]
    total_cost_usd: float = Field(ge=0)
    migration_window_score: float = Field(ge=0, le=100)
    migration_window_label: str
    peak_crossing_overlap: bool
    days_overlap_with_peak: int = Field(ge=0)
    eco_impact_score: float = Field(ge=0, le=100)
    community_spend_pct: float = Field(ge=0, le=100)
    carbon_estimate_kg: float = Field(ge=0)
    summary: str
    best_for: str
    operator_brief: str


class OrchestratorState(TypedDict, total=False):
    raw_input: str
    session_id: str
    traveler_profile: Optional[dict]
    wildlife_context: Optional[dict]
    itinerary: Optional[dict]
    errors: list[str]
    completed_agents: list[str]
    processing_ms: dict[str, int]
