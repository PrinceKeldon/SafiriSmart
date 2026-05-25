"""
SafiriSmart — Intent Agent (Agent 1)

Responsibility: parse raw traveler input into a structured TravelerProfile.
Uses Claude with structured output (JSON mode).
Handles English, Swahili, and mixed input.

Input:  state["raw_input"], state["session_id"]
Output: state["traveler_profile"]
"""

import json
import calendar
import re
import time
import logging
import os
import uuid
from datetime import date

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from safirismart.orchestrator.state import OrchestratorState, TravelerProfile, DateRange, BudgetRange

logger = logging.getLogger(__name__)

INTENT_SYSTEM_PROMPT = """You are the SafiriSmart Intent Agent. Your job is to extract structured travel intent from a traveler's natural language message.

Extract the following information and return ONLY valid JSON — no preamble, no markdown, no explanation:

{
  "destinations": ["list of Kenya destinations/parks mentioned or implied"],
  "travel_start": "YYYY-MM-DD or null",
  "travel_end": "YYYY-MM-DD or null",
  "budget_min_usd": number or null,
  "budget_max_usd": number or null,
  "group_size": number (default 1),
  "experience_types": ["wildlife", "culture", "adventure", "beach", "birding", "photography", "family"],
  "accommodation_tier": "budget" | "mid" | "luxury",
  "language": "en" | "sw" | "de" | "fr" | "other",
  "special_requests": "any specific asks, accessibility needs, dietary, etc.",
  "migration_interest": true | false,
  "confidence": 0.0-1.0
}

Rules:
- If the traveler mentions "wildebeest", "migration", "crossing", "great migration" → migration_interest: true
- If destinations are vague ("Kenya safari") → include ["Masai Mara"] as default
- Budget: if single number given (e.g. "$3000"), set min = budget * 0.8, max = budget
- Dates: if month only given ("July"), use current year, first day of month as start, last day as end
- Group: "family of 4" = 4, "couple" = 2, "solo" = 1
- Accommodation: budget < $150/night, mid $150-$450/night, luxury > $450/night. Infer from total budget / days / group size if not stated.
- Always return valid JSON. Never add commentary.

Current date: """ + date.today().isoformat()


def _fallback_profile(raw_input: str, session_id: str) -> TravelerProfile:
    """Extract a basic profile without an LLM for local and degraded runs."""
    text = raw_input.lower()

    destinations = ["Masai Mara"]
    known_destinations = {
        "amboseli": "Amboseli",
        "tsavo": "Tsavo",
        "samburu": "Samburu",
        "lake nakuru": "Lake Nakuru",
        "diani": "Diani Beach",
        "watamu": "Watamu",
        "masai mara": "Masai Mara",
        "maasai mara": "Masai Mara",
    }
    matched = [label for key, label in known_destinations.items() if key in text]
    if matched:
        destinations = list(dict.fromkeys(matched))

    travel_dates = None
    months = {name.lower(): idx for idx, name in enumerate(calendar.month_name) if name}
    months.update({name.lower(): idx for idx, name in enumerate(calendar.month_abbr) if name})
    for month_name, month_num in months.items():
        if re.search(rf"\b{re.escape(month_name)}\b", text):
            year_match = re.search(r"\b(20\d{2})\b", text)
            year = int(year_match.group(1)) if year_match else date.today().year
            last_day = calendar.monthrange(year, month_num)[1]
            travel_dates = DateRange(start=date(year, month_num, 1), end=date(year, month_num, last_day))
            break

    budget = None
    budget_match = re.search(r"(?:\$|usd\s*)\s*([0-9][0-9,]*)|([0-9][0-9,]*)\s*(?:usd|dollars)", text)
    if budget_match:
        amount = float((budget_match.group(1) or budget_match.group(2)).replace(",", ""))
        budget = BudgetRange(min_usd=amount * 0.8, max_usd=amount)

    group_size = 1
    family_match = re.search(r"family(?:\s+of)?\s+(\d+)", text)
    group_match = re.search(r"(?:group|party)\s+of\s+(\d+)", text)
    if family_match or group_match:
        group_size = int((family_match or group_match).group(1))
    elif "couple" in text:
        group_size = 2
    elif "family" in text:
        group_size = 4

    experiences = ["wildlife"]
    if "family" in text:
        experiences.append("family")
    if "beach" in text:
        experiences.append("beach")
    if "culture" in text or "maasai" in text:
        experiences.append("culture")
    if "photo" in text:
        experiences.append("photography")

    accommodation_tier = "mid"
    if "luxury" in text:
        accommodation_tier = "luxury"
    elif "budget" in text or "cheap" in text:
        accommodation_tier = "budget"

    return TravelerProfile(
        session_id=session_id,
        raw_input=raw_input,
        destinations=destinations,
        travel_dates=travel_dates,
        budget=budget,
        group_size=group_size,
        experience_types=list(dict.fromkeys(experiences)),
        accommodation_tier=accommodation_tier,
        migration_interest="migrat" in text or "crossing" in text or "wildebeest" in text,
    )


def run_intent_agent(state: OrchestratorState) -> OrchestratorState:
    """
    LangGraph node: Intent Agent.
    Extracts TravelerProfile from raw input.
    """
    t_start = time.time()
    session_id = state.get("session_id") or str(uuid.uuid4())

    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not configured")

        llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",
            api_key=api_key,
            max_tokens=800,
            temperature=0,
        )

        messages = [
            SystemMessage(content=INTENT_SYSTEM_PROMPT),
            HumanMessage(content=state["raw_input"]),
        ]

        response = llm.invoke(messages)
        raw_json = response.content.strip()

        # Strip markdown fences if model adds them
        if raw_json.startswith("```"):
            raw_json = raw_json.split("```")[1]
            if raw_json.startswith("json"):
                raw_json = raw_json[4:]
        raw_json = raw_json.strip()

        extracted = json.loads(raw_json)

        # Build DateRange
        travel_dates = None
        if extracted.get("travel_start") and extracted.get("travel_end"):
            try:
                travel_dates = DateRange(
                    start=date.fromisoformat(extracted["travel_start"]),
                    end=date.fromisoformat(extracted["travel_end"]),
                )
            except Exception:
                travel_dates = None

        # Build BudgetRange
        budget = None
        if extracted.get("budget_max_usd"):
            budget = BudgetRange(
                min_usd=extracted.get("budget_min_usd") or extracted["budget_max_usd"] * 0.8,
                max_usd=extracted["budget_max_usd"],
            )

        # Ensure destinations
        destinations = extracted.get("destinations") or ["Masai Mara"]
        if not destinations:
            destinations = ["Masai Mara"]

        profile = TravelerProfile(
            session_id=session_id,
            raw_input=state["raw_input"],
            destinations=destinations,
            travel_dates=travel_dates,
            budget=budget,
            group_size=extracted.get("group_size", 1),
            experience_types=extracted.get("experience_types", ["wildlife"]),
            accommodation_tier=extracted.get("accommodation_tier", "mid"),
            language=extracted.get("language", "en"),
            special_requests=extracted.get("special_requests", ""),
            migration_interest=extracted.get("migration_interest", False),
        )

        ms = int((time.time() - t_start) * 1000)
        logger.info(f"Intent Agent: profile extracted in {ms}ms — migration_interest={profile.migration_interest}")

        return {
            **state,
            "session_id":       session_id,
            "traveler_profile": profile.model_dump(mode="json"),
            "completed_agents": state.get("completed_agents", []) + ["intent"],
            "processing_ms":    {**state.get("processing_ms", {}), "intent": ms},
        }

    except Exception as e:
        logger.error(f"Intent Agent failed: {e}")
        fallback = _fallback_profile(state["raw_input"], session_id)
        ms = int((time.time() - t_start) * 1000)
        return {
            **state,
            "session_id":       session_id,
            "traveler_profile": fallback.model_dump(mode="json"),
            "completed_agents": state.get("completed_agents", []) + ["intent"],
            "processing_ms":    {**state.get("processing_ms", {}), "intent": ms},
            "errors":           state.get("errors", []) + [f"Intent Agent degraded: {str(e)}"],
        }
