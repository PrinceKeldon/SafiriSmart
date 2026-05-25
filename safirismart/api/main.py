"""
SafiriSmart API Gateway
Sprint 1 — unified backend serving:

  Public (no auth):
    GET  /migration/score          → today's migration score
    GET  /migration/score/history  → 30-day chart
    GET  /migration/phase          → lightweight phase widget

  Traveler (no auth for MVP):
    POST /plan                     → run full agent pipeline
    GET  /plan/{session_id}        → retrieve cached plan

  Internal:
    POST /migration/score/refresh  → force signal refresh
    POST /migration/signals/manual → operator field report

  System:
    GET  /health
    GET  /                         → redirect to frontend
"""

import logging
import os
import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone, date
from typing import Optional

from fastapi import FastAPI, HTTPException, Header, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Migration engine
from safirismart.migration_engine.app.main import (
    get_or_compute_score, _score_cache, _history_cache, verify_service_key
)
from safirismart.migration_engine.app.models import (
    DailyScorePublic, ScoreHistory, HerdLocationReport
)

# Orchestrator
from safirismart.orchestrator.pipeline import run_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── In-memory plan cache (replace with Supabase in production) ───
_plan_cache: dict[str, dict] = {}


# ── Request/Response models ───────────────────────────────────────

class PlanRequest(BaseModel):
    message:    str
    session_id: Optional[str] = None


class PlanResponse(BaseModel):
    session_id:       str
    completed_agents: list[str]
    traveler_profile: Optional[dict]
    wildlife_context: Optional[dict]
    itinerary:        Optional[dict]
    errors:           list[str]
    processing_ms:    dict
    cached:           bool = False


# ── Lifespan ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SafiriSmart API starting — warming migration engine...")
    try:
        await get_or_compute_score()
        logger.info("Migration engine warmed.")
    except Exception as e:
        logger.warning(f"Migration engine warm-up failed (non-fatal): {e}")
    yield


app = FastAPI(
    title       = "SafiriSmart API",
    description = "Kenya's Agentic Tourism Intelligence Platform — Sprint 1",
    version     = "1.0.0",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ── Migration Engine endpoints (public) ───────────────────────────

@app.get("/migration/score", response_model=DailyScorePublic, tags=["Migration"])
async def migration_score():
    """Today's Great Migration crossing probability score."""
    score = await get_or_compute_score()
    return DailyScorePublic(
        score_date          = score.score_date,
        probability_score   = score.probability_score,
        phase_label         = score.phase_label,
        peak_window_start   = score.peak_window_start,
        peak_window_end     = score.peak_window_end,
        days_to_peak        = score.days_to_peak,
        signal_summary      = score.signal_summary,
        herd_location       = score.herd_location_summary,
        recommendation      = score.recommendation,
        next_update         = score.next_update,
    )


@app.get("/migration/score/history", response_model=ScoreHistory, tags=["Migration"])
async def migration_history():
    """30-day rolling score history."""
    if not _history_cache:
        score = await get_or_compute_score()
        return ScoreHistory(
            dates  = [score.score_date.isoformat()],
            scores = [score.probability_score],
            phases = [score.phase.value],
        )
    return ScoreHistory(
        dates  = [r["date"]  for r in _history_cache],
        scores = [r["score"] for r in _history_cache],
        phases = [r["phase"] for r in _history_cache],
    )


@app.get("/migration/phase", tags=["Migration"])
async def migration_phase():
    """Lightweight phase + recommendation for widgets."""
    score = await get_or_compute_score()
    return {
        "phase":          score.phase.value,
        "phase_label":    score.phase_label,
        "score":          score.probability_score,
        "recommendation": score.recommendation,
        "days_to_peak":   score.days_to_peak,
        "peak_start":     score.peak_window_start.isoformat(),
        "peak_end":       score.peak_window_end.isoformat(),
    }


@app.post("/migration/score/refresh", tags=["Migration — Internal"])
async def migration_refresh(_: str = Depends(verify_service_key)):
    """Force recompute today's score. Called by daily cron."""
    today_key = date.today().isoformat()
    if today_key in _score_cache:
        del _score_cache[today_key]
    score = await get_or_compute_score()
    return {"status": "refreshed", "score": score.probability_score, "phase": score.phase.value}


@app.post("/migration/signals/manual", tags=["Migration — Internal"])
async def manual_signal(
    report: HerdLocationReport,
    _: str = Depends(verify_service_key),
):
    """Submit operator field report. Triggers score refresh."""
    today_key = date.today().isoformat()
    if today_key in _score_cache:
        del _score_cache[today_key]
    score = await get_or_compute_score()
    return {"status": "received", "new_score": score.probability_score, "location": report.location_name}


# ── Planning pipeline endpoint ────────────────────────────────────

@app.post("/plan", response_model=PlanResponse, tags=["Planning"])
async def plan(request: PlanRequest, background_tasks: BackgroundTasks):
    """
    Main planning endpoint.
    Runs: Intent Agent → Wildlife Signal Agent → Itinerary Builder.
    Returns enriched itinerary with live migration signals woven in.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    # Check plan cache (session continuity)
    if request.session_id and request.session_id in _plan_cache:
        cached = _plan_cache[request.session_id]
        cached["cached"] = True
        return PlanResponse(**cached)

    # Run the pipeline (synchronous — FastAPI handles in thread pool)
    import asyncio
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: run_pipeline(request.message, request.session_id)
    )

    response_data = {
        "session_id":       result.get("session_id", ""),
        "completed_agents": result.get("completed_agents", []),
        "traveler_profile": result.get("traveler_profile"),
        "wildlife_context": result.get("wildlife_context"),
        "itinerary":        result.get("itinerary"),
        "errors":           result.get("errors", []),
        "processing_ms":    result.get("processing_ms", {}),
        "cached":           False,
    }

    # Cache the plan
    if response_data["session_id"]:
        _plan_cache[response_data["session_id"]] = response_data

    return PlanResponse(**response_data)


@app.get("/plan/{session_id}", tags=["Planning"])
async def get_plan(session_id: str):
    """Retrieve a previously generated plan by session ID."""
    if session_id not in _plan_cache:
        raise HTTPException(status_code=404, detail="Plan not found. Generate one via POST /plan")
    return _plan_cache[session_id]


# ── System ────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health():
    return {
        "status":       "ok",
        "service":      "safirismart-api",
        "version":      "1.0.0-sprint1",
        "time":         datetime.now(timezone.utc).isoformat(),
        "cached_plans": len(_plan_cache),
    }
