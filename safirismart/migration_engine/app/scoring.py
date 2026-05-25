"""
SafiriSmart Great Migration Window Engine — Scoring Core

Methodology:
  Three independent signal layers combined via weighted sum.
  Each layer produces a component score 0–100.
  Final score = weighted average, clamped to 0–100.

Layer 1 — Historical Bayesian Prior (weight: 0.50)
  Uses 20 years of crossing date records.
  Models crossing probability as a Gaussian over day-of-year.
  Peak DOY mean ≈ day 230 (mid-August); std ≈ 14 days.
  Gives a smooth season curve regardless of live signal quality.

Layer 2 — Herd Location Proximity (weight: 0.35)
  Where the herds are right now relative to the Mara River.
  Sourced from Mara Conservancy weekly reports, KWS bulletins,
  iNaturalist sightings, and operator field reports.
  Location names are mapped to a proximity index (0–1).

Layer 3 — Rainfall Anomaly (weight: 0.15)
  Serengeti short rains push herds north early.
  Mara long rains can delay crossings.
  Rainfall anomaly vs 20-year mean adjusts the prior.

Confidence band:
  Widens when live signals are sparse (early season, limited reports).
  Narrows when multiple high-credibility reports agree.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from datetime import date, datetime, timezone
from typing import Optional
import math

from safirismart.migration_engine.app.models import (
    MigrationScore, CrossingPhase, WildlifeSignal
)
from safirismart.migration_engine.data.crossing_history import (
    PEAK_START_MEAN_DOY, PEAK_END_MEAN_DOY,
    PEAK_START_STD, PEAK_END_STD,
    EARLIEST_FIRST_CROSSING, LATEST_LAST_CROSSING
)


# ── Location proximity index ─────────────────────────────────────
# Maps known location names to a 0–1 proximity score.
# 0 = far south in Serengeti, 1 = at/crossing the Mara River.
LOCATION_PROXIMITY: dict[str, float] = {
    # Pre-arrival — herds in Serengeti
    "serengeti central":        0.05,
    "serengeti north":          0.15,
    "grumeti":                  0.25,
    "ikorongo":                 0.30,
    # Approaching
    "loliondo":                 0.40,
    "kogatende":                0.50,
    "lamai":                    0.60,
    "sand river":               0.70,
    # In Mara — pre-crossing
    "mara triangle":            0.75,
    "mara north conservancy":   0.78,
    "ol kinyei":                0.72,
    "naboisho":                 0.70,
    "keekorok area":            0.65,
    # Active crossing zones
    "mara river crossing 1":    0.90,
    "mara river crossing 2":    0.90,
    "crossing point lookout":   0.95,
    "north mara":               0.85,
    "paradise plains":          0.80,
    # Peak / on the river
    "mara river":               1.00,
    "mara crossing":            1.00,
    "crossing":                 1.00,
    # Returning south
    "masai mara reserve":       0.70,
    "south mara":               0.60,
    "mara serengeti border":    0.45,
}


def _location_to_proximity(location_name: str) -> float:
    """Fuzzy match location name to proximity index."""
    name_lower = location_name.lower().strip()
    # Exact match
    if name_lower in LOCATION_PROXIMITY:
        return LOCATION_PROXIMITY[name_lower]
    # Partial match — take highest matching key
    best = 0.0
    for key, val in LOCATION_PROXIMITY.items():
        if key in name_lower or name_lower in key:
            best = max(best, val)
    return best if best > 0 else 0.30  # default: unknown location = low confidence


# ── Layer 1: Historical Bayesian Prior ───────────────────────────

def _gaussian(x: float, mean: float, std: float) -> float:
    """Standard Gaussian, normalised to peak at 1.0."""
    return math.exp(-0.5 * ((x - mean) / std) ** 2)


def _historical_prior_score(doy: int) -> float:
    """
    Returns 0–100 score based purely on historical timing.
    Uses a blended Gaussian over the peak crossing window.
    Peak mean = midpoint of peak_start and peak_end means.
    """
    peak_mid = (PEAK_START_MEAN_DOY + PEAK_END_MEAN_DOY) / 2
    peak_width_std = (PEAK_END_MEAN_DOY - PEAK_START_MEAN_DOY) / 2 + PEAK_START_STD

    # Season gate — outside the entire documented season, score → 0
    if doy < EARLIEST_FIRST_CROSSING - 14 or doy > LATEST_LAST_CROSSING + 14:
        return 0.0

    raw = _gaussian(doy, peak_mid, peak_width_std)
    # Scale: peak gets 85 (not 100) — live signals push it higher
    return round(raw * 85, 2)


# ── Layer 2: Herd Location Score ─────────────────────────────────

def _herd_location_score(signal: WildlifeSignal) -> float:
    """
    Weighted average of herd location proximity scores.
    Higher credibility_weight = more influence on result.
    Recent crossings in last 7 days boost score significantly.
    """
    if not signal.herd_reports:
        return 0.0  # no data — contributes nothing

    weighted_sum = 0.0
    total_weight = 0.0
    for report in signal.herd_reports:
        # Decay older reports (reports > 7 days old get half weight)
        age_days = (date.today() - report.report_date).days
        age_decay = 1.0 if age_days <= 7 else 0.5 if age_days <= 14 else 0.2
        prox = _location_to_proximity(report.location_name)
        w = report.credibility_weight * age_decay
        weighted_sum += prox * w
        total_weight += w

    proximity_score = (weighted_sum / total_weight) if total_weight > 0 else 0.0

    # Boost if active crossings reported recently
    crossing_boost = min(signal.recent_crossing_count * 5, 20)  # max +20

    return round(min((proximity_score * 100) + crossing_boost, 100), 2)


# ── Layer 3: Rainfall Anomaly Adjustment ─────────────────────────

def _rainfall_adjustment(signal: WildlifeSignal) -> float:
    """
    Returns an adjustment multiplier (0.8 – 1.2) based on rainfall anomaly.
    Above-average Serengeti rain → herds pushed north earlier → mild boost.
    Extreme Mara rain → crossing delays → mild penalty.
    """
    if not signal.rainfall_signal:
        return 1.0  # neutral if no data

    anomaly = signal.rainfall_signal.anomaly_pct
    if anomaly > 30:    return 1.15   # well above average → herds moving
    if anomaly > 15:    return 1.08
    if anomaly > 0:     return 1.03
    if anomaly > -15:   return 0.97
    if anomaly > -30:   return 0.90   # drought → delayed movement
    return 0.85


# ── Phase detection ───────────────────────────────────────────────

def _detect_phase(doy: int, score: float, signal: WildlifeSignal) -> CrossingPhase:
    season_start = EARLIEST_FIRST_CROSSING - 14
    season_end   = LATEST_LAST_CROSSING + 14
    peak_start   = int(PEAK_START_MEAN_DOY - PEAK_START_STD)
    peak_end     = int(PEAK_END_MEAN_DOY + PEAK_END_STD)

    if doy < season_start:              return CrossingPhase.PRE_SEASON
    if doy > season_end:                return CrossingPhase.POST_SEASON
    if peak_start <= doy <= peak_end:
        if score > 55 or signal.recent_crossing_count > 0:
            return CrossingPhase.ACTIVE
        return CrossingPhase.APPROACHING
    if doy < peak_start:                return CrossingPhase.APPROACHING
    return CrossingPhase.LATE_SEASON


PHASE_LABELS = {
    CrossingPhase.PRE_SEASON:   "Pre-season — herds in Serengeti",
    CrossingPhase.APPROACHING:  "Herds approaching the Mara",
    CrossingPhase.ACTIVE:       "🔥 Active crossing season",
    CrossingPhase.LATE_SEASON:  "Late season — crossings tapering",
    CrossingPhase.POST_SEASON:  "Post-season — herds retreated south",
}


# ── Confidence band ───────────────────────────────────────────────

def _confidence_band(base_score: float, signal: WildlifeSignal) -> tuple[float, float]:
    """
    Confidence widens when live signals are sparse.
    Narrows when multiple fresh, high-credibility reports agree.
    """
    fresh_reports = sum(
        1 for r in signal.herd_reports
        if (date.today() - r.report_date).days <= 7
    )
    high_cred = sum(r.credibility_weight for r in signal.herd_reports if r.credibility_weight >= 0.8)

    base_width = 20.0
    if fresh_reports >= 3 and high_cred >= 2:
        width = 8.0
    elif fresh_reports >= 2:
        width = 12.0
    elif fresh_reports == 1:
        width = 16.0
    else:
        width = base_width  # wide — low signal data

    low  = max(0.0,   round(base_score - width / 2, 1))
    high = min(100.0, round(base_score + width / 2, 1))
    return low, high


# ── Natural language generation ───────────────────────────────────

def _generate_summary(score: float, phase: CrossingPhase, signal: WildlifeSignal, doy: int) -> str:
    if phase == CrossingPhase.PRE_SEASON:
        return "The wildebeest herds are still deep in the Serengeti. The Mara River crossing season has not yet begun."
    if phase == CrossingPhase.POST_SEASON:
        return "The main crossing season has ended. Herds have retreated south into Tanzania for the dry season grazing."
    if phase == CrossingPhase.APPROACHING:
        if score > 40:
            return "Herd scouts have been reported near the Mara. The front of the migration is arriving — early crossings possible within days."
        return "The herds are moving north through the Mara ecosystem. Crossing activity is building but has not yet peaked."
    if phase == CrossingPhase.ACTIVE:
        if score > 80:
            return "Peak crossing season. Multiple large crossings are being reported daily. This is the optimal window to witness the Mara River crossings."
        return "Active crossing season. Crossings are occurring regularly — excellent conditions for witnessing the migration."
    if phase == CrossingPhase.LATE_SEASON:
        return "The main crossing window is passing. Some herds are beginning the return journey south. Late-season crossings are still possible."
    return "Migration status updating."


def _generate_recommendation(score: float, phase: CrossingPhase, days_to_peak: int) -> str:
    if phase == CrossingPhase.PRE_SEASON:
        if days_to_peak > 60:
            return "Too early to plan for crossings. Consider the Mara for other wildlife experiences or plan a July+ visit."
        return f"Crossing season is approximately {days_to_peak} days away. Start planning your visit now to secure lodge availability."
    if phase == CrossingPhase.APPROACHING:
        return "Book now if you haven't — lodges near the crossing points fill up fast. Crossings could begin at any time."
    if phase == CrossingPhase.ACTIVE:
        if score > 75:
            return "Travel now if possible. You are in the peak window. Every day in the Mara this week is a potential crossing day."
        return "Strong conditions. Any visit in the next 2–3 weeks has a high probability of witnessing a crossing."
    if phase == CrossingPhase.LATE_SEASON:
        return "Crossings are still possible but less predictable. A visit now offers good odds and significantly lower lodge rates."
    return "The crossing season has ended. Plan for next year — we'll alert you when booking opens for the next season."


def _herd_location_text(signal: WildlifeSignal) -> str:
    if not signal.herd_reports:
        return "No confirmed herd location reports in the last 14 days."
    # Take the most recent high-credibility report
    sorted_reports = sorted(
        signal.herd_reports,
        key=lambda r: (r.credibility_weight, r.report_date),
        reverse=True
    )
    top = sorted_reports[0]
    age = (date.today() - top.report_date).days
    age_str = "today" if age == 0 else f"{age} day{'s' if age > 1 else ''} ago"
    return f"Last confirmed: {top.location_name} ({top.herd_density} concentration) — reported {age_str} via {top.source}."


# ── Master scoring function ───────────────────────────────────────

def compute_migration_score(signal: WildlifeSignal) -> MigrationScore:
    """
    Main entry point. Takes a WildlifeSignal and returns a full MigrationScore.
    Called daily by the background scheduler.
    """
    doy = signal.today_doy

    # Component scores
    prior      = _historical_prior_score(doy)
    herd       = _herd_location_score(signal)
    rain_mult  = _rainfall_adjustment(signal)

    # Weighted combination
    # If no live herd data, fall back to prior-only (re-weight)
    if not signal.herd_reports:
        raw_score = prior * rain_mult
        weights_used = {"historical_prior": 1.0, "herd_location": 0.0, "rainfall": rain_mult}
    else:
        raw_score = (prior * 0.50 + herd * 0.35) * rain_mult + (prior * 0.15)
        weights_used = {"historical_prior": 0.50, "herd_location": 0.35, "rainfall": rain_mult}

    final_score = round(min(max(raw_score, 0.0), 100.0), 1)

    # Phase & timing
    phase = _detect_phase(doy, final_score, signal)
    peak_mid_doy  = int((PEAK_START_MEAN_DOY + PEAK_END_MEAN_DOY) / 2)
    current_year  = date.today().year
    peak_start_dt = date(current_year, 1, 1).replace(month=1, day=1)
    # Convert DOY to date
    peak_start_dt = date.fromordinal(date(current_year, 1, 1).toordinal() + int(PEAK_START_MEAN_DOY) - 1)
    peak_end_dt   = date.fromordinal(date(current_year, 1, 1).toordinal() + int(PEAK_END_MEAN_DOY) - 1)
    days_to_peak  = (peak_start_dt - date.today()).days

    conf_low, conf_high = _confidence_band(final_score, signal)

    return MigrationScore(
        score_date          = date.today(),
        probability_score   = final_score,
        confidence_band_low = conf_low,
        confidence_band_high= conf_high,
        phase               = phase,
        phase_label         = PHASE_LABELS[phase],
        peak_window_start   = peak_start_dt,
        peak_window_end     = peak_end_dt,
        days_to_peak        = days_to_peak,
        score_breakdown     = {
            "historical_prior_score": prior,
            "herd_location_score":    herd,
            "rainfall_multiplier":    rain_mult,
            "weights":                weights_used,
            "component_scores":       {"prior": prior, "herd": herd},
        },
        signal_summary      = _generate_summary(final_score, phase, signal, doy),
        herd_location_summary = _herd_location_text(signal),
        recommendation      = _generate_recommendation(final_score, phase, days_to_peak),
        next_update         = datetime.now(timezone.utc).replace(hour=6, minute=0, second=0, microsecond=0),
        computed_at         = datetime.now(timezone.utc),
    )
