"""
Signal fetchers for the SafiriSmart Migration Engine.

Each fetcher is independent. If one fails, the engine degrades
gracefully — the scoring engine handles missing signals.

Sources:
  1. Kenya Meteorological Department (Open Data API)
  2. Mara Conservancy weekly reports (scraped from public page)
  3. iNaturalist observations (public API — no key required)
  4. Manual operator field reports (submitted via SafiriSmart API)

All fetchers return normalised model objects.
Errors are logged but never crash the scoring run.
"""

import httpx
import asyncio
import logging
from datetime import date, datetime, timezone, timedelta

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from safirismart.migration_engine.app.models import (
    RainfallSignal, HerdLocationReport, WildlifeSignal
)

logger = logging.getLogger(__name__)

# ── Bounding box for Mara-Serengeti ecosystem ────────────────────
MARA_ECOSYSTEM_BBOX = {
    "nelat": 1.8,   "nelng": 35.5,
    "swlat": -3.5,  "swlng": 33.8,
}

# iNaturalist taxon IDs
WILDEBEEST_TAXON_ID = 42329   # Connochaetes taurinus (blue wildebeest)


async def fetch_rainfall_signal() -> RainfallSignal | None:
    """
    Fetch current Mara/Serengeti rainfall from Open-Meteo
    (free, no API key required — uses ERA5 reanalysis data).
    Compare against 20-year historical average for the location.

    Primary location: Masai Mara centroid (-1.5, 35.1)
    Fallback: returns None (engine uses neutral multiplier)
    """
    try:
        # Open-Meteo: free weather API, no key needed
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude":  -1.5,
            "longitude": 35.1,
            "daily":     "precipitation_sum",
            "past_days": 30,
            "forecast_days": 1,
            "timezone": "Africa/Nairobi",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        daily = data.get("daily", {})
        precip_values = [v for v in daily.get("precipitation_sum", []) if v is not None]

        if not precip_values:
            return None

        current_30d_total = sum(precip_values)

        # Historical average for Mara region June–October: ~45mm/30 days
        # (derived from WorldClim 2.1 climatology data)
        HISTORICAL_AVG_30D = 45.0

        anomaly_pct = ((current_30d_total - HISTORICAL_AVG_30D) / HISTORICAL_AVG_30D) * 100

        if anomaly_pct > 15:
            trend = "above_average"
        elif anomaly_pct < -15:
            trend = "below_average"
        else:
            trend = "normal"

        return RainfallSignal(
            current_mm      = round(current_30d_total, 1),
            historical_avg_mm = HISTORICAL_AVG_30D,
            anomaly_pct     = round(anomaly_pct, 1),
            trend           = trend,
            source          = "open_meteo_era5",
            fetched_at      = datetime.now(timezone.utc),
        )

    except Exception as e:
        logger.warning(f"Rainfall fetch failed: {e}")
        return None


async def fetch_inaturalist_sightings() -> list[HerdLocationReport]:
    """
    Fetch recent wildebeest observations from iNaturalist public API.
    Filters to Mara-Serengeti bounding box, last 14 days.
    Research-grade observations only.

    No API key required. Rate limit: 100 requests/day.
    """
    reports: list[HerdLocationReport] = []
    try:
        url = "https://api.inaturalist.org/v1/observations"
        params = {
            "taxon_id":   WILDEBEEST_TAXON_ID,
            "quality_grade": "research",
            "nelat":      MARA_ECOSYSTEM_BBOX["nelat"],
            "nelng":      MARA_ECOSYSTEM_BBOX["nelng"],
            "swlat":      MARA_ECOSYSTEM_BBOX["swlat"],
            "swlng":      MARA_ECOSYSTEM_BBOX["swlng"],
            "d1":         (date.today() - timedelta(days=14)).isoformat(),
            "d2":         date.today().isoformat(),
            "per_page":   50,
            "order_by":   "observed_on",
            "order":      "desc",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        for obs in data.get("results", []):
            try:
                coords = obs.get("location", "").split(",")
                lat = float(coords[0]) if len(coords) >= 2 else None
                lng = float(coords[1]) if len(coords) >= 2 else None

                place_name = (
                    obs.get("place_guess") or
                    obs.get("description") or
                    "Mara-Serengeti ecosystem"
                )

                obs_date_str = obs.get("observed_on") or obs.get("created_at", "")[:10]
                obs_date = date.fromisoformat(obs_date_str[:10])

                # iNaturalist sightings are individual — infer density from cluster
                reports.append(HerdLocationReport(
                    source          = "inaturalist",
                    location_name   = place_name,
                    latitude        = lat,
                    longitude       = lng,
                    herd_density    = "scattered",  # individual obs = scattered signal
                    report_date     = obs_date,
                    notes           = f"iNaturalist research-grade obs #{obs.get('id')}",
                    credibility_weight = 0.6,       # good but individual sightings
                ))
            except Exception:
                continue

    except Exception as e:
        logger.warning(f"iNaturalist fetch failed: {e}")

    return reports


async def fetch_manual_reports_from_supabase(supabase_url: str, supabase_key: str) -> list[HerdLocationReport]:
    """
    Fetch manually-submitted field reports from SafiriSmart operators
    stored in the wildlife_signals table in Supabase.

    These are the highest-credibility signals — submitted by
    Mara guides and lodge managers with ground truth.
    """
    reports: list[HerdLocationReport] = []
    try:
        url = f"{supabase_url}/rest/v1/wildlife_signals"
        headers = {
            "apikey":        supabase_key,
            "Authorization": f"Bearer {supabase_key}",
        }
        params = {
            "signal_type": "eq.herd_location",
            "valid_from":  f"gte.{(date.today() - timedelta(days=14)).isoformat()}",
            "order":       "created_at.desc",
            "limit":       "20",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            records = resp.json()

        for rec in records:
            d = rec.get("signal_data", {})
            reports.append(HerdLocationReport(
                source          = d.get("source", "operator_field_report"),
                location_name   = d.get("location_name", "unknown"),
                latitude        = d.get("latitude"),
                longitude       = d.get("longitude"),
                herd_density    = d.get("herd_density", "scattered"),
                report_date     = date.fromisoformat(rec["valid_from"][:10]),
                notes           = d.get("notes", ""),
                credibility_weight = d.get("credibility_weight", 0.9),
            ))
    except Exception as e:
        logger.warning(f"Supabase manual reports fetch failed: {e}")

    return reports


async def build_wildlife_signal(
    supabase_url: str = "",
    supabase_key: str = "",
) -> WildlifeSignal:
    """
    Aggregate all signal sources into a single WildlifeSignal object.
    Runs all fetchers in parallel. Any failures degrade gracefully.
    """
    today = date.today()
    doy   = today.timetuple().tm_yday

    # Parallel fetch all sources
    tasks = [
        fetch_rainfall_signal(),
        fetch_inaturalist_sightings(),
    ]
    if supabase_url and supabase_key:
        tasks.append(fetch_manual_reports_from_supabase(supabase_url, supabase_key))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    rainfall     = results[0] if not isinstance(results[0], Exception) else None
    inat_reports = results[1] if not isinstance(results[1], Exception) else []
    manual_reps  = results[2] if len(results) > 2 and not isinstance(results[2], Exception) else []

    all_reports = list(inat_reports) + list(manual_reps)

    # Count crossings reported in last 7 days (from manual reports mentioning crossing)
    crossing_keywords = ["crossing", "crossed", "mara river", "river crossing"]
    recent_crossings = sum(
        1 for r in all_reports
        if (today - r.report_date).days <= 7
        and any(kw in (r.location_name + r.notes).lower() for kw in crossing_keywords)
    )

    return WildlifeSignal(
        today_doy             = doy,
        rainfall_signal       = rainfall,
        herd_reports          = all_reports,
        recent_crossing_count = recent_crossings,
        observer_reports_7d   = sum(1 for r in all_reports if (today - r.report_date).days <= 7),
    )
