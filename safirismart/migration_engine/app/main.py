"""
SafiriSmart Migration Engine — FastAPI Application

Public endpoints (no auth):
  GET /migration/score          → today's score
  GET /migration/score/history  → 30-day chart data
  GET /migration/phase          → current phase + recommendation

Internal endpoints (service key):
  POST /migration/score/refresh → trigger score recompute
  POST /migration/signals/manual → submit operator field report
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone, timedelta

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from safirismart.migration_engine.app.models import (
    DailyScorePublic, ScoreHistory, MigrationScore,
    HerdLocationReport, WildlifeSignal
)
from safirismart.migration_engine.app.scoring import compute_migration_score
from safirismart.migration_engine.app.signal_fetchers import build_wildlife_signal

logger = logging.getLogger(__name__)

# ── In-memory cache (replace with Redis in production) ───────────
_score_cache: dict[str, MigrationScore] = {}
_history_cache: list[dict] = []


async def get_or_compute_score() -> MigrationScore:
    """Return cached score or compute fresh one."""
    today_key = date.today().isoformat()
    if today_key in _score_cache:
        return _score_cache[today_key]

    signal = await build_wildlife_signal(
        supabase_url = os.getenv("SUPABASE_URL", ""),
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
    )
    score = compute_migration_score(signal)
    _score_cache[today_key] = score

    # Append to history
    _history_cache.append({
        "date":  today_key,
        "score": score.probability_score,
        "phase": score.phase.value,
    })
    # Keep only last 30 days
    if len(_history_cache) > 30:
        _history_cache.pop(0)

    return score


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Compute score on startup."""
    logger.info("Migration engine starting — computing initial score...")
    try:
        await get_or_compute_score()
        logger.info("Initial score computed successfully.")
    except Exception as e:
        logger.error(f"Startup score failed: {e}")
    yield


app = FastAPI(
    title        = "SafiriSmart Migration Engine",
    description  = "Real-time Great Wildebeest Migration tracking API",
    version      = "1.0.0",
    lifespan     = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],   # tighten to safirismart.com in production
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ── Public endpoints ─────────────────────────────────────────────

@app.get("/migration/score", response_model=DailyScorePublic, tags=["Public"])
async def get_today_score():
    """
    Today's migration probability score.
    Updated daily at 06:00 EAT (03:00 UTC).
    No authentication required — this is a public data product.
    """
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


@app.get("/migration/score/history", response_model=ScoreHistory, tags=["Public"])
async def get_score_history():
    """30-day rolling score history for chart display."""
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


@app.get("/migration/phase", tags=["Public"])
async def get_current_phase():
    """Current phase and simple recommendation — lightweight endpoint for widgets."""
    score = await get_or_compute_score()
    return {
        "phase":          score.phase.value,
        "phase_label":    score.phase_label,
        "score":          score.probability_score,
        "recommendation": score.recommendation,
        "days_to_peak":   score.days_to_peak,
    }


# ── Internal endpoints ───────────────────────────────────────────

def verify_service_key(x_service_key: str = Header(...)):
    expected = os.getenv("MIGRATION_SERVICE_KEY", "dev-key-change-in-production")
    if x_service_key != expected:
        raise HTTPException(status_code=403, detail="Invalid service key")
    return x_service_key


@app.post("/migration/score/refresh", tags=["Internal"])
async def refresh_score(_: str = Depends(verify_service_key)):
    """
    Force recompute today's score.
    Called by the daily cron job at 06:00 EAT.
    Also callable manually after a major new signal arrives.
    """
    today_key = date.today().isoformat()
    if today_key in _score_cache:
        del _score_cache[today_key]

    score = await get_or_compute_score()
    return {
        "status":             "refreshed",
        "score":              score.probability_score,
        "phase":              score.phase.value,
        "computed_at":        score.computed_at.isoformat(),
        "signals_used":       {
            "herd_reports":   score.score_breakdown["component_scores"]["herd"],
            "prior":          score.score_breakdown["component_scores"]["prior"],
        }
    }


@app.post("/migration/signals/manual", tags=["Internal"])
async def submit_manual_signal(
    report: HerdLocationReport,
    _: str = Depends(verify_service_key),
):
    """
    Submit a field report from a SafiriSmart operator on the ground.
    Immediately triggers a score refresh.
    """
    logger.info(f"Manual signal received: {report.location_name} from {report.source}")

    # In production: write to Supabase wildlife_signals table here
    # For now: inject into next score computation by clearing cache
    today_key = date.today().isoformat()
    if today_key in _score_cache:
        del _score_cache[today_key]

    score = await get_or_compute_score()
    return {
        "status":  "received_and_refreshed",
        "new_score": score.probability_score,
        "location": report.location_name,
    }


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "migration-engine", "time": datetime.now(timezone.utc).isoformat()}
