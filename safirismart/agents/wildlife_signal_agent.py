"""
SafiriSmart — Wildlife Signal Agent (Agent 2)

Responsibility: Score wildlife viewing conditions for the traveler's
specific travel window using the migration engine.

This agent wraps the migration engine built in the foundation sprint
and adds travel-window-specific scoring on top of the daily score.

Input:  state["traveler_profile"]
Output: state["wildlife_context"]
"""

import asyncio
import time
import logging
import os
from datetime import date, timedelta

from safirismart.orchestrator.state import OrchestratorState, WildlifeContext, TravelerProfile
from safirismart.migration_engine.app.scoring import compute_migration_score, _historical_prior_score
from safirismart.migration_engine.app.signal_fetchers import build_wildlife_signal
from safirismart.migration_engine.data.crossing_history import (
    PEAK_START_MEAN_DOY, PEAK_END_MEAN_DOY
)

logger = logging.getLogger(__name__)

# Park-level wildlife quality scores (non-migration baseline)
# These represent year-round wildlife density and diversity
PARK_BASELINE_SCORES: dict[str, float] = {
    "masai mara":           88,
    "maasai mara":          88,
    "amboseli":             82,
    "tsavo east":           74,
    "tsavo west":           71,
    "samburu":              79,
    "lake nakuru":          76,
    "aberdare":             68,
    "mount kenya":          65,
    "meru":                 72,
    "hell's gate":          60,
    "lake naivasha":        66,
    "ol pejeta":            84,    # rhino sanctuary
    "lewa":                 81,
    "laikipia":             78,
    "diani beach":          55,    # beach — low wildlife
    "watamu":               57,
    "malindi":              54,
}


def _park_baseline(destinations: list[str]) -> float:
    """Return average baseline wildlife score for requested destinations."""
    scores = []
    for dest in destinations:
        d = dest.lower().strip()
        for park, score in PARK_BASELINE_SCORES.items():
            if park in d or d in park:
                scores.append(score)
                break
        else:
            scores.append(65.0)  # unknown park — conservative default
    return sum(scores) / len(scores) if scores else 65.0


def _score_travel_window(travel_start: date, travel_end: date) -> tuple[float, str]:
    """
    Score a specific travel window against the migration season.
    Returns (score_0_to_100, label).

    Method: average the historical prior score across every day
    in the travel window, then boost if window overlaps peak.
    """
    current_year = date.today().year
    days = []
    d = travel_start
    while d <= travel_end:
        doy = d.timetuple().tm_yday
        days.append(doy)
        d += timedelta(days=1)

    if not days:
        return 0.0, "No dates provided"

    # Average prior score across all days in window
    avg_prior = sum(_historical_prior_score(doy) for doy in days) / len(days)

    # Check overlap with peak window
    peak_start_doy = int(PEAK_START_MEAN_DOY)
    peak_end_doy   = int(PEAK_END_MEAN_DOY)
    overlap_days = sum(1 for doy in days if peak_start_doy <= doy <= peak_end_doy)

    # Boost for overlap
    if overlap_days > 7:
        label = "🔥 Prime crossing window"
        boost = 15
    elif overlap_days > 0:
        label = "✅ Good crossing window"
        boost = 8
    elif avg_prior > 40:
        label = "🟡 Active migration season"
        boost = 0
    elif avg_prior > 15:
        label = "🟠 Migration approaching"
        boost = 0
    else:
        label = "⚪ Outside migration season"
        boost = 0

    travel_score = min(avg_prior + boost, 100.0)
    return round(travel_score, 1), label


def _overlap_days(travel_start: date, travel_end: date) -> int:
    """Count days where travel window overlaps predicted peak."""
    current_year = travel_start.year
    peak_start = date.fromordinal(date(current_year, 1, 1).toordinal() + int(PEAK_START_MEAN_DOY) - 1)
    peak_end   = date.fromordinal(date(current_year, 1, 1).toordinal() + int(PEAK_END_MEAN_DOY) - 1)
    overlap_start = max(travel_start, peak_start)
    overlap_end   = min(travel_end, peak_end)
    return max(0, (overlap_end - overlap_start).days + 1)


def run_wildlife_signal_agent(state: OrchestratorState) -> OrchestratorState:
    """
    LangGraph node: Wildlife Signal Agent.
    Wraps migration engine and scores traveler's travel window.
    """
    t_start = time.time()

    try:
        profile_data = state.get("traveler_profile", {})
        profile = TravelerProfile(**profile_data)

        # Get today's global migration score
        signal = asyncio.run(build_wildlife_signal(
            supabase_url=os.getenv("SUPABASE_URL", ""),
            supabase_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        ))
        today_score = compute_migration_score(signal)

        # Score the traveler's specific window
        if profile.travel_dates:
            travel_window_score, travel_window_label = _score_travel_window(
                profile.travel_dates.start,
                profile.travel_dates.end,
            )
            days_overlap = _overlap_days(
                profile.travel_dates.start,
                profile.travel_dates.end,
            )
            peak_overlap = days_overlap > 0
        else:
            # No dates — use today's score as proxy
            travel_window_score  = today_score.probability_score
            travel_window_label  = today_score.phase_label
            days_overlap         = 0
            peak_overlap         = False

        context = WildlifeContext(
            score                = today_score.probability_score,
            phase_label          = today_score.phase_label,
            peak_window_start    = today_score.peak_window_start.isoformat(),
            peak_window_end      = today_score.peak_window_end.isoformat(),
            days_to_peak         = today_score.days_to_peak,
            signal_summary       = today_score.signal_summary,
            herd_location        = today_score.herd_location_summary,
            recommendation       = today_score.recommendation,
            travel_window_score  = travel_window_score,
            travel_window_label  = travel_window_label,
        )

        ms = int((time.time() - t_start) * 1000)
        logger.info(f"Wildlife Signal Agent: score={today_score.probability_score} travel_window={travel_window_score} in {ms}ms")

        return {
            **state,
            "wildlife_context":  context.model_dump(mode="json"),
            "completed_agents":  state.get("completed_agents", []) + ["wildlife_signal"],
            "processing_ms":     {**state.get("processing_ms", {}), "wildlife_signal": ms},
        }

    except Exception as e:
        logger.error(f"Wildlife Signal Agent failed: {e}")
        # Graceful fallback
        fallback = WildlifeContext(
            score=0, phase_label="Signal unavailable",
            peak_window_start="2026-08-01", peak_window_end="2026-09-04",
            days_to_peak=68, signal_summary="Live signal data temporarily unavailable.",
            herd_location="Check Mara Conservancy for latest reports.",
            recommendation="Contact a SafiriSmart operator for current conditions.",
            travel_window_score=0, travel_window_label="Dates not scored",
        )
        ms = int((time.time() - t_start) * 1000)
        return {
            **state,
            "wildlife_context":  fallback.model_dump(mode="json"),
            "completed_agents":  state.get("completed_agents", []) + ["wildlife_signal"],
            "processing_ms":     {**state.get("processing_ms", {}), "wildlife_signal": ms},
            "errors":            state.get("errors", []) + [f"Wildlife Signal degraded: {str(e)}"],
        }
