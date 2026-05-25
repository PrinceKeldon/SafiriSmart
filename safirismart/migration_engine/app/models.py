"""
Pydantic models for the SafiriSmart Migration Engine.
These are the shared contracts between the scoring engine,
the API layer, and the frontend.
"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum


class CrossingPhase(str, Enum):
    PRE_SEASON   = "pre_season"      # herds not yet in Mara
    APPROACHING  = "approaching"     # herds crossing Mara/Serengeti border
    ACTIVE       = "active"          # peak crossing window
    LATE_SEASON  = "late_season"     # crossings tapering, some herds returning
    POST_SEASON  = "post_season"     # herds retreated to Serengeti


class RainfallSignal(BaseModel):
    """Current Serengeti/Mara rainfall vs historical average."""
    current_mm:         float
    historical_avg_mm:  float
    anomaly_pct:        float           # (current - avg) / avg * 100
    trend:              str             # "above_average" | "below_average" | "normal"
    source:             str = "kenya_met"
    fetched_at:         datetime


class HerdLocationReport(BaseModel):
    """Latest herd position report from available sources."""
    source:             str             # "mara_conservancy" | "kws" | "inaturalist" | "manual"
    location_name:      str             # e.g. "North Mara", "Keekorok area", "Sand River"
    latitude:           Optional[float]
    longitude:          Optional[float]
    herd_density:       str             # "scattered" | "concentrated" | "massive"
    report_date:        date
    notes:              str = ""
    credibility_weight: float = 1.0     # 0-1, higher = more trusted source


class WildlifeSignal(BaseModel):
    """Aggregated input signals for the scoring engine."""
    today_doy:              int             # day of year
    rainfall_signal:        Optional[RainfallSignal]
    herd_reports:           list[HerdLocationReport]
    recent_crossing_count:  int = 0        # crossings reported in last 7 days
    observer_reports_7d:    int = 0        # total observer reports last 7 days


class MigrationScore(BaseModel):
    """
    The core output of the SafiriSmart Migration Engine.
    One score computed daily, written to Supabase, served publicly.
    """
    score_date:             date
    probability_score:      float = Field(..., ge=0, le=100)
    confidence_band_low:    float = Field(..., ge=0, le=100)
    confidence_band_high:   float = Field(..., ge=0, le=100)
    phase:                  CrossingPhase
    phase_label:            str             # human-readable
    peak_window_start:      date            # predicted start of peak
    peak_window_end:        date            # predicted end of peak
    days_to_peak:           int             # negative = peak has started
    score_breakdown:        dict            # component scores for transparency
    signal_summary:         str             # 1-2 sentence plain English summary
    herd_location_summary:  str             # where herds are right now
    recommendation:         str             # what a traveler should do
    next_update:            datetime
    computed_at:            datetime


class DailyScorePublic(BaseModel):
    """Slimmed-down score for the public tracking page — no internal weights exposed."""
    score_date:         date
    probability_score:  float
    phase_label:        str
    peak_window_start:  date
    peak_window_end:    date
    days_to_peak:       int
    signal_summary:     str
    herd_location:      str
    recommendation:     str
    next_update:        datetime


class ScoreHistory(BaseModel):
    """30-day rolling score history for the chart on the public page."""
    dates:  list[str]
    scores: list[float]
    phases: list[str]


class OperatorLeadProfile(BaseModel):
    """
    When a traveler queries for migration trips,
    this is attached to the lead sent to matched operators.
    """
    travel_window_start:    date
    travel_window_end:      date
    migration_score_at_query: float
    predicted_peak_overlap: bool    # does travel window overlap predicted peak?
    overlap_days:           int
    recommendation_text:    str
