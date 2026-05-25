"""
SafiriSmart — Itinerary Builder Agent (Agent 3, MVP version)

Responsibility: Generate a day-by-day itinerary that weaves together
the TravelerProfile and WildlifeContext into a coherent, signal-enriched
travel plan. Uses Claude for natural language richness.

Input:  state["traveler_profile"], state["wildlife_context"]
Output: state["itinerary"]
"""

import json
import time
import logging
from datetime import date, timedelta
from safirismart.agents.llm_factory import get_llm
from langchain_core.messages import HumanMessage, SystemMessage

from safirismart.migration_engine.app.scoring import _historical_prior_score
from safirismart.orchestrator.state import (
    OrchestratorState, TravelerProfile, WildlifeContext, Itinerary, ItineraryDay
)

logger = logging.getLogger(__name__)

# ── Cost reference data ───────────────────────────────────────────
PARK_FEES_USD: dict[str, dict] = {
    "masai mara":   {"citizen": 35,  "resident": 60,  "non_resident": 100},
    "maasai mara":  {"citizen": 35,  "resident": 60,  "non_resident": 100},
    "amboseli":     {"citizen": 35,  "resident": 52,  "non_resident": 90},
    "tsavo east":   {"citizen": 26,  "resident": 35,  "non_resident": 52},
    "tsavo west":   {"citizen": 26,  "resident": 35,  "non_resident": 52},
    "samburu":      {"citizen": 26,  "resident": 40,  "non_resident": 65},
    "lake nakuru":  {"citizen": 35,  "resident": 40,  "non_resident": 60},
    "ol pejeta":    {"citizen": 30,  "resident": 55,  "non_resident": 100},
    "default":      {"citizen": 26,  "resident": 40,  "non_resident": 60},
}

LODGE_COST_PER_NIGHT: dict[str, dict] = {
    "budget":  {"min": 40,  "max": 120, "label": "Tented camp / guesthouse"},
    "mid":     {"min": 150, "max": 350, "label": "Mid-range safari lodge"},
    "luxury":  {"min": 400, "max": 1200,"label": "Luxury tented camp / lodge"},
}

GAME_DRIVE_COST = {"budget": 60, "mid": 120, "luxury": 200}


def _fallback_itinerary(profile: TravelerProfile, wildlife: WildlifeContext) -> Itinerary:
    """Build a deterministic itinerary when the LLM is unavailable."""
    if profile.travel_dates:
        duration = min(max((profile.travel_dates.end - profile.travel_dates.start).days + 1, 3), 7)
        start_date = profile.travel_dates.start
    else:
        duration = 5
        start_date = date.today()

    primary_park = profile.destinations[0] if profile.destinations else "Masai Mara"
    tier = profile.accommodation_tier or "mid"
    days_out: list[ItineraryDay] = []
    total_cost = 0.0

    for index in range(duration):
        day_date = start_date + timedelta(days=index)
        day_cost = _estimate_day_cost(tier, profile.group_size, primary_park)
        total_cost += day_cost
        migration_score = _historical_prior_score(day_date.timetuple().tm_yday)

        days_out.append(ItineraryDay(
            day=index + 1,
            date=day_date.isoformat(),
            location=primary_park,
            park=primary_park,
            activities=[
                "Morning game drive",
                "Guided wildlife tracking",
                "Evening sundowner drive",
            ],
            accommodation=f"{tier.title()} safari camp",
            accommodation_tier=tier,
            drive_hours=0.0 if index > 0 else 5.5,
            estimated_cost_usd=day_cost,
            wildlife_highlight=wildlife.signal_summary,
            migration_score=migration_score,
        ))

    total_budget = profile.budget.max_usd if profile.budget else total_cost
    return Itinerary(
        days=days_out,
        total_cost_usd=min(total_cost, total_budget),
        migration_window_score=wildlife.travel_window_score,
        migration_window_label=wildlife.travel_window_label,
        peak_crossing_overlap=wildlife.travel_window_score > 40,
        days_overlap_with_peak=0,
        eco_impact_score=72.0,
        community_spend_pct=68.0,
        carbon_estimate_kg=profile.group_size * duration * 12.0,
        summary=f"{duration}-day {primary_park} safari shaped by current migration signals.",
        best_for="Travelers who want a fast, operator-ready safari outline while live planning services are unavailable.",
        operator_brief=(
            f"Quote a {duration}-day {tier} safari for {profile.group_size} traveler(s), "
            f"prioritising {primary_park} and migration-aware game drives."
        ),
    )


def _estimate_day_cost(tier: str, group_size: int, park: str) -> float:
    lodge = LODGE_COST_PER_NIGHT.get(tier, LODGE_COST_PER_NIGHT["mid"])
    lodge_pp = (lodge["min"] + lodge["max"]) / 2
    fees = PARK_FEES_USD.get(park.lower(), PARK_FEES_USD["default"])["non_resident"]
    drive = GAME_DRIVE_COST.get(tier, 120)
    # Per person costs × group, shared vehicle assumed for group >= 4
    vehicle_factor = 1 if group_size < 4 else 1.5
    return round((lodge_pp + fees + drive * vehicle_factor / max(group_size, 1)) * max(group_size, 1), 0)


ITINERARY_SYSTEM = """You are SafiriSmart's Itinerary Builder. Generate a detailed, inspiring day-by-day Kenya safari itinerary.

Return ONLY valid JSON — no markdown, no explanation. Structure:

{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD or null",
      "location": "place name",
      "park": "park name",
      "activities": ["activity 1", "activity 2", "activity 3"],
      "accommodation": "lodge/camp name (realistic Kenyan property)",
      "accommodation_tier": "budget|mid|luxury",
      "drive_hours": 0.0,
      "wildlife_highlight": "what to look for today — 1 vivid sentence",
      "migration_score": null
    }
  ],
  "summary": "2-sentence trip summary",
  "best_for": "who this trip is ideal for",
  "operator_brief": "concise brief for the operator quoting this trip"
}

Rules:
- Use real Kenyan park names and realistic lodge/camp names
- Activities must be specific and evocative (not generic "game drive")
- Drive hours must be realistic Kenya road times
- If migration_interest is true and travel window overlaps Aug-Sep, include Mara River crossing activities
- Weight itinerary toward highest-scoring parks for the travel window
- Keep family groups in mind — include child-friendly activities if group_size > 2 and experience includes "family"
- Budget tier: include budget-friendly camps, shared vehicles
- Luxury tier: include fly-in options, private vehicles, butler service
- operator_brief: written for a Kenyan tour operator who will quote the trip
"""


def run_itinerary_builder(state: OrchestratorState) -> OrchestratorState:
    """
    LangGraph node: Itinerary Builder Agent.
    Generates signal-enriched day-by-day itinerary.
    """
    t_start = time.time()

    try:
        profile   = TravelerProfile(**state["traveler_profile"])
        wildlife  = WildlifeContext(**state["wildlife_context"])

        # Calculate trip duration
        if profile.travel_dates:
            duration = (profile.travel_dates.end - profile.travel_dates.start).days + 1
            start_date = profile.travel_dates.start
        else:
            duration   = 7
            start_date = None

        # Cap at 14 days for MVP
        duration = min(max(duration, 3), 14)

        # Budget per person per day
        budget_per_day_per_person = 0
        if profile.budget:
            budget_per_day_per_person = profile.budget.max_usd / max(duration, 1) / max(profile.group_size, 1)

        user_prompt = f"""
Plan a {duration}-day Kenya safari itinerary.

TRAVELER PROFILE:
- Group: {profile.group_size} people
- Destinations requested: {', '.join(profile.destinations)}
- Experience types: {', '.join(profile.experience_types) or 'wildlife'}
- Budget: {'$' + str(int(profile.budget.max_usd)) + ' total' if profile.budget else 'flexible'}
- Accommodation tier: {profile.accommodation_tier}
- Migration interest: {profile.migration_interest}
- Special requests: {profile.special_requests or 'none'}
- Travel dates: {profile.travel_dates.start if profile.travel_dates else 'flexible'} to {profile.travel_dates.end if profile.travel_dates else 'flexible'}

WILDLIFE INTELLIGENCE:
- Today's migration score: {wildlife.score}/100
- Travel window score: {wildlife.travel_window_score}/100 ({wildlife.travel_window_label})
- Migration peak window: {wildlife.peak_window_start} to {wildlife.peak_window_end}
- Days to peak: {wildlife.days_to_peak}
- Current conditions: {wildlife.signal_summary}
- Herd location: {wildlife.herd_location}

Build the itinerary to maximise wildlife quality given these signals.
Start date for day 1: {start_date.isoformat() if start_date else 'not specified'}
"""

        llm = get_llm(
            max_tokens = 4000,
            temperature = 0.3,
        )

        response = llm.invoke([
            SystemMessage(content=ITINERARY_SYSTEM),
            HumanMessage(content=user_prompt),
        ])

        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        data = json.loads(raw)

        # Enrich each day with computed costs and migration scores
        days_out = []
        total_cost = 0.0
        for i, d in enumerate(data.get("days", [])):
            park = d.get("park", "Masai Mara")
            tier = d.get("accommodation_tier", profile.accommodation_tier)
            day_cost = _estimate_day_cost(tier, profile.group_size, park)
            total_cost += day_cost

            # Compute migration score for this specific day
            if start_date and profile.travel_dates:
                day_date = start_date + timedelta(days=i)
                day_doy  = day_date.timetuple().tm_yday
                from safirismart.migration_engine.app.scoring import _historical_prior_score
                migration_score = _historical_prior_score(day_doy)
            else:
                migration_score = None

            days_out.append(ItineraryDay(
                day                = d.get("day", i + 1),
                date               = d.get("date"),
                location           = d.get("location", park),
                park               = park,
                activities         = d.get("activities", []),
                accommodation      = d.get("accommodation", "Safari Lodge"),
                accommodation_tier = tier,
                drive_hours        = d.get("drive_hours", 0.0),
                estimated_cost_usd = day_cost,
                wildlife_highlight = d.get("wildlife_highlight", ""),
                migration_score    = migration_score,
            ))

        # Eco scoring (simplified — refine with operator data later)
        eco_score  = 72.0 + (5.0 if "eco" in " ".join(profile.experience_types).lower() else 0)
        comm_spend = 68.0  # % of spend to local Kenyan businesses (platform target)
        carbon_kg  = profile.group_size * duration * 12.0  # rough kg CO2 per person per day

        itinerary = Itinerary(
            days                  = days_out,
            total_cost_usd        = min(total_cost, profile.budget.max_usd if profile.budget else total_cost),
            migration_window_score= wildlife.travel_window_score,
            migration_window_label= wildlife.travel_window_label,
            peak_crossing_overlap = wildlife.travel_window_score > 40,
            days_overlap_with_peak= 0,
            eco_impact_score      = eco_score,
            community_spend_pct   = comm_spend,
            carbon_estimate_kg    = carbon_kg,
            summary               = data.get("summary", ""),
            best_for              = data.get("best_for", ""),
            operator_brief        = data.get("operator_brief", ""),
        )

        ms = int((time.time() - t_start) * 1000)
        logger.info(f"Itinerary Builder: {len(days_out)} days, ${total_cost:.0f} in {ms}ms")

        return {
            **state,
            "itinerary":        itinerary.model_dump(mode="json"),
            "completed_agents": state.get("completed_agents", []) + ["itinerary_builder"],
            "processing_ms":    {**state.get("processing_ms", {}), "itinerary_builder": ms},
        }

    except Exception as e:
        logger.error(f"Itinerary Builder failed: {e}")
        ms = int((time.time() - t_start) * 1000)
        try:
            fallback_profile = TravelerProfile(**state["traveler_profile"])
            fallback_wildlife = WildlifeContext(**state["wildlife_context"])
            fallback = _fallback_itinerary(fallback_profile, fallback_wildlife)
            return {
                **state,
                "itinerary":        fallback.model_dump(mode="json"),
                "errors":           state.get("errors", []) + [f"Itinerary Builder degraded: {str(e)}"],
                "completed_agents": state.get("completed_agents", []) + ["itinerary_builder"],
                "processing_ms":    {**state.get("processing_ms", {}), "itinerary_builder": ms},
            }
        except Exception:
            pass

        return {
            **state,
            "errors":           state.get("errors", []) + [f"Itinerary Builder failed: {str(e)}"],
            "completed_agents": state.get("completed_agents", []) + ["itinerary_builder"],
            "processing_ms":    {**state.get("processing_ms", {}), "itinerary_builder": ms},
        }
