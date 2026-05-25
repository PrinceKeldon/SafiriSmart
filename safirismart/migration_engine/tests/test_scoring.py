"""
Tests for the SafiriSmart Migration Scoring Engine.
Run: pytest tests/test_scoring.py -v
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, timedelta
from safirismart.migration_engine.app.scoring import (
    compute_migration_score, _historical_prior_score
)
from safirismart.migration_engine.app.models import (
    WildlifeSignal, HerdLocationReport, RainfallSignal,
    CrossingPhase
)
from datetime import datetime, timezone


def make_signal(doy: int, location: str = "", density: str = "concentrated",
                rain_anomaly: float = 0.0, crossings: int = 0) -> WildlifeSignal:
    reports = []
    if location:
        reports.append(HerdLocationReport(
            source="test", location_name=location,
            latitude=None, longitude=None,
            herd_density=density,
            report_date=date.today(),
            credibility_weight=1.0,
        ))
    rain = None
    if rain_anomaly != 0.0:
        avg = 45.0
        current = avg * (1 + rain_anomaly / 100)
        rain = RainfallSignal(
            current_mm=current, historical_avg_mm=avg,
            anomaly_pct=rain_anomaly,
            trend="above_average" if rain_anomaly > 0 else "below_average",
            source="test", fetched_at=datetime.now(timezone.utc),
        )
    return WildlifeSignal(
        today_doy=doy,
        rainfall_signal=rain,
        herd_reports=reports,
        recent_crossing_count=crossings,
        observer_reports_7d=len(reports),
    )


def test_prior_off_season():
    """Score should be ~0 in January (DOY 15)."""
    score = _historical_prior_score(15)
    assert score < 5.0, f"Expected near-0 in January, got {score}"


def test_prior_peak_season():
    """Score should be high in mid-August (DOY ~228)."""
    score = _historical_prior_score(228)
    assert score >= 70.0, f"Expected high score in peak, got {score}"


def test_full_score_pre_season():
    """Full score in January with no signals = very low."""
    signal = make_signal(doy=15)
    result = compute_migration_score(signal)
    assert result.probability_score < 10
    assert result.phase == CrossingPhase.PRE_SEASON


def test_full_score_peak_with_river_location():
    """Peak season + herds at Mara River = very high score."""
    signal = make_signal(doy=228, location="mara river", density="massive", crossings=5)
    result = compute_migration_score(signal)
    assert result.probability_score >= 75, f"Expected high score, got {result.probability_score}"
    assert result.phase == CrossingPhase.ACTIVE


def test_full_score_approaching():
    """Early July (DOY 190) + herds in Mara Triangle = approaching."""
    signal = make_signal(doy=190, location="mara triangle", density="concentrated")
    result = compute_migration_score(signal)
    assert result.probability_score >= 30
    assert result.phase in (CrossingPhase.APPROACHING, CrossingPhase.ACTIVE)


def test_rainfall_boost():
    """Above-average rain should boost score slightly."""
    base_signal  = make_signal(doy=210)
    rain_signal  = make_signal(doy=210, rain_anomaly=35.0)
    base_result  = compute_migration_score(base_signal)
    rain_result  = compute_migration_score(rain_signal)
    assert rain_result.probability_score >= base_result.probability_score


def test_rainfall_penalty():
    """Severe drought should reduce score."""
    base_signal  = make_signal(doy=225)
    drought_sig  = make_signal(doy=225, rain_anomaly=-40.0)
    base_result  = compute_migration_score(base_signal)
    drought_result = compute_migration_score(drought_sig)
    assert drought_result.probability_score <= base_result.probability_score


def test_confidence_band_widens_without_signals():
    """No live signals = wide confidence band."""
    signal = make_signal(doy=220)  # no location reports
    result = compute_migration_score(signal)
    band_width = result.confidence_band_high - result.confidence_band_low
    assert band_width >= 15, f"Expected wide band, got {band_width}"


def test_confidence_band_narrows_with_signals():
    """Multiple fresh high-cred signals = narrow confidence band."""
    from safirismart.migration_engine.app.models import HerdLocationReport
    reports = [
        HerdLocationReport(source="mara_conservancy", location_name="mara river",
                           latitude=-1.3, longitude=35.0, herd_density="massive",
                           report_date=date.today(), credibility_weight=1.0),
        HerdLocationReport(source="kws", location_name="crossing point lookout",
                           latitude=-1.2, longitude=35.0, herd_density="massive",
                           report_date=date.today(), credibility_weight=0.95),
        HerdLocationReport(source="operator_field_report", location_name="mara river",
                           latitude=-1.3, longitude=35.0, herd_density="massive",
                           report_date=date.today(), credibility_weight=1.0),
    ]
    signal = WildlifeSignal(today_doy=225, rainfall_signal=None,
                             herd_reports=reports, recent_crossing_count=8,
                             observer_reports_7d=3)
    result = compute_migration_score(signal)
    band_width = result.confidence_band_high - result.confidence_band_low
    assert band_width <= 15, f"Expected narrow band, got {band_width}"


def test_score_clamped():
    """Score never exceeds 100 or goes below 0."""
    for doy in [1, 50, 150, 200, 228, 280, 365]:
        signal = make_signal(doy=doy, location="mara river", crossings=10)
        result = compute_migration_score(signal)
        assert 0 <= result.probability_score <= 100


def test_recommendation_not_empty():
    """Recommendation text always generated."""
    for doy in [15, 190, 228, 300]:
        signal = make_signal(doy=doy)
        result = compute_migration_score(signal)
        assert len(result.recommendation) > 10


def test_days_to_peak_computed():
    """days_to_peak is an integer."""
    signal = make_signal(doy=196)
    result = compute_migration_score(signal)
    assert isinstance(result.days_to_peak, int)


if __name__ == "__main__":
    # Quick smoke test without pytest
    print("Running smoke tests...")
    test_prior_off_season();     print("✓ prior off season")
    test_prior_peak_season();    print("✓ prior peak season")
    test_full_score_pre_season();print("✓ pre-season full score")
    test_full_score_peak_with_river_location(); print("✓ peak + river = high score")
    test_score_clamped();        print("✓ scores clamped 0-100")
    test_recommendation_not_empty(); print("✓ recommendations generated")
    print("\nAll smoke tests passed ✓")
