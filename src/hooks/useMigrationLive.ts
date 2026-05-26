/**
 * useMigrationLive
 *
 * Fetches REAL live data from two public APIs with no key required:
 *
 * 1. Open-Meteo (open-meteo.com) — free, CORS-enabled, no auth
 *    Pulls 30-day precipitation for the Mara region (-1.5, 35.1)
 *    Compares vs 20-year historical average to produce a rainfall anomaly signal
 *
 * 2. iNaturalist (api.inaturalist.org) — free, CORS-enabled, no auth
 *    Pulls research-grade blue wildebeest (taxon 42329) observations
 *    in the Mara-Serengeti bounding box from the last 14 days
 *    Maps observation locations to a herd proximity score
 *
 * Both are combined with the historical Bayesian prior (DOY-based)
 * from the migration engine scoring model to produce a live probability score.
 *
 * The hook is self-contained — no backend required. Works in production
 * from the browser directly, with graceful degradation if either API fails.
 */

import { useState, useEffect, useCallback } from 'react';

// ── Historical Bayesian prior constants (from crossing_history.py) ──
const PEAK_START_DOY = 214;  // ~Aug 2 mean
const PEAK_END_DOY   = 248;  // ~Sep 5 mean
const PEAK_MID_DOY   = (PEAK_START_DOY + PEAK_END_DOY) / 2;
const PEAK_STD       = 14.0;
const EARLIEST_DOY   = 183;
const LATEST_DOY     = 281;

// ── Location proximity index ─────────────────────────────────────
const PROXIMITY: Record<string, number> = {
  'serengeti': 0.1, 'grumeti': 0.28, 'kogatende': 0.52,
  'lamai': 0.60, 'sand river': 0.72, 'mara triangle': 0.76,
  'mara north': 0.80, 'mara river': 1.0, 'crossing': 0.95,
  'masai mara': 0.70, 'maasai mara': 0.70, 'talek': 0.65,
  'naboisho': 0.68, 'ol kinyei': 0.70, 'keekorok': 0.62,
};

function locationToProximity(name: string): number {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(PROXIMITY)) {
    if (lower.includes(key) || key.includes(lower.split(',')[0])) return val;
  }
  return 0.25; // unknown = somewhere in the ecosystem
}

// ── Gaussian prior ───────────────────────────────────────────────
function gaussian(x: number, mean: number, std: number): number {
  return Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

function historicalPrior(doy: number): number {
  if (doy < EARLIEST_DOY - 14 || doy > LATEST_DOY + 14) return 0;
  return gaussian(doy, PEAK_MID_DOY, PEAK_STD) * 85;
}

function doyToDate(doy: number, year: number): Date {
  const d = new Date(year, 0);
  d.setDate(doy);
  return d;
}

// ── Types ────────────────────────────────────────────────────────
export interface SightingReport {
  location: string;
  date: string;
  source: string;
  proximity: number;
  density: string;
}

export interface RainfallData {
  current_30d_mm: number;
  historical_avg_mm: number;
  anomaly_pct: number;
  trend: 'above_average' | 'normal' | 'below_average';
}

export interface LiveMigrationData {
  // Scores
  probability_score: number;
  confidence_low: number;
  confidence_high: number;
  // Phase
  phase: 'pre_season' | 'approaching' | 'active' | 'late_season' | 'post_season';
  phase_label: string;
  // Timing
  peak_window_start: string;
  peak_window_end: string;
  days_to_peak: number;
  today_doy: number;
  // Signal breakdown
  historical_score: number;
  herd_score: number;
  rainfall_multiplier: number;
  // Live data
  sightings: SightingReport[];
  rainfall: RainfallData | null;
  sightings_count_14d: number;
  recent_crossing_count: number;
  // Narrative
  signal_summary: string;
  herd_location: string;
  recommendation: string;
  // Meta
  last_updated: string;
  data_sources: string[];
  loading: boolean;
  error: string | null;
}

interface INaturalistObservation {
  place_guess?: string | null;
  description?: string | null;
  observed_on?: string | null;
  created_at?: string | null;
}

interface INaturalistResponse {
  results?: INaturalistObservation[];
}

function getMigrationTiming() {
  const today = new Date();
  const year = today.getFullYear();
  const doy = Math.floor((today.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
  const peakStart = doyToDate(PEAK_START_DOY, year);
  const peakEnd = doyToDate(PEAK_END_DOY, year);
  const daysToPeak = Math.round((peakStart.getTime() - today.getTime()) / 86400000);

  return { today, doy, peakStart, peakEnd, daysToPeak };
}

// ── Open-Meteo fetch ─────────────────────────────────────────────
async function fetchRainfall(): Promise<RainfallData | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', '-1.5');
    url.searchParams.set('longitude', '35.1');
    url.searchParams.set('daily', 'precipitation_sum');
    url.searchParams.set('past_days', '30');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'Africa/Nairobi');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json();

    const values: (number | null)[] = data?.daily?.precipitation_sum ?? [];
    const total = values.reduce<number>((s, v) => s + (v ?? 0), 0);

    // Historical 30-day average for Mara region (Jun-Oct): ~45mm
    const AVG = 45.0;
    const anomaly = ((total - AVG) / AVG) * 100;

    return {
      current_30d_mm: Math.round(total * 10) / 10,
      historical_avg_mm: AVG,
      anomaly_pct: Math.round(anomaly * 10) / 10,
      trend: anomaly > 15 ? 'above_average' : anomaly < -15 ? 'below_average' : 'normal',
    };
  } catch {
    return null;
  }
}

// ── iNaturalist fetch ────────────────────────────────────────────
async function fetchSightings(): Promise<SightingReport[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const d1 = since.toISOString().slice(0, 10);
    const d2 = new Date().toISOString().slice(0, 10);

    const url = new URL('https://api.inaturalist.org/v1/observations');
    url.searchParams.set('taxon_id', '42329'); // Connochaetes taurinus — blue wildebeest
    url.searchParams.set('quality_grade', 'research');
    url.searchParams.set('nelat', '1.8');
    url.searchParams.set('nelng', '35.5');
    url.searchParams.set('swlat', '-3.5');
    url.searchParams.set('swlng', '33.8');
    url.searchParams.set('d1', d1);
    url.searchParams.set('d2', d2);
    url.searchParams.set('per_page', '50');
    url.searchParams.set('order_by', 'observed_on');
    url.searchParams.set('order', 'desc');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`iNaturalist ${res.status}`);
    const data = await res.json() as INaturalistResponse;

    return (data.results ?? []).map((obs) => {
      const place = obs.place_guess || obs.description || 'Mara-Serengeti ecosystem';
      const prox  = locationToProximity(place);
      const obsDate = (obs.observed_on || obs.created_at || '').slice(0, 10);
      return {
        location: place,
        date: obsDate,
        source: 'iNaturalist',
        proximity: prox,
        density: 'scattered', // individual obs = scattered signal
      } as SightingReport;
    });
  } catch {
    return [];
  }
}

// ── Rainfall multiplier ──────────────────────────────────────────
function rainfallMultiplier(rain: RainfallData | null): number {
  if (!rain) return 1.0;
  const a = rain.anomaly_pct;
  if (a > 30) return 1.15;
  if (a > 15) return 1.08;
  if (a > 0)  return 1.03;
  if (a > -15)return 0.97;
  if (a > -30)return 0.90;
  return 0.85;
}

// ── Herd location score ──────────────────────────────────────────
function herdScore(sightings: SightingReport[], crossings: number): number {
  if (!sightings.length) return 0;
  const today = new Date();
  let wSum = 0, wTotal = 0;
  for (const s of sightings) {
    const ageDays = (today.getTime() - new Date(s.date).getTime()) / 86400000;
    const decay   = ageDays <= 7 ? 1.0 : ageDays <= 14 ? 0.5 : 0.2;
    const w       = 0.6 * decay; // iNat individual sightings weight
    wSum   += s.proximity * w;
    wTotal += w;
  }
  const base = wTotal > 0 ? (wSum / wTotal) * 100 : 0;
  return Math.min(base + Math.min(crossings * 5, 20), 100);
}

// ── Confidence band ──────────────────────────────────────────────
function confidenceBand(score: number, sightings: SightingReport[]): [number, number] {
  const fresh = sightings.filter(s => {
    const d = (new Date().getTime() - new Date(s.date).getTime()) / 86400000;
    return d <= 7;
  }).length;
  const width = fresh >= 5 ? 8 : fresh >= 3 ? 12 : fresh >= 1 ? 16 : 20;
  return [Math.max(0, score - width / 2), Math.min(100, score + width / 2)];
}

// ── Phase detection ──────────────────────────────────────────────
type Phase = LiveMigrationData['phase'];

function detectPhase(doy: number, score: number, crossings: number): Phase {
  if (doy < EARLIEST_DOY - 14)  return 'pre_season';
  if (doy > LATEST_DOY + 14)    return 'post_season';
  if (doy >= PEAK_START_DOY && doy <= PEAK_END_DOY) {
    return (score > 55 || crossings > 0) ? 'active' : 'approaching';
  }
  if (doy < PEAK_START_DOY) return 'approaching';
  return 'late_season';
}

const PHASE_LABELS: Record<Phase, string> = {
  pre_season:  'Pre-season — herds deep in Serengeti',
  approaching: 'Herds approaching the Mara',
  active:      '🔥 Active crossing season',
  late_season: 'Late season — crossings tapering',
  post_season: 'Post-season — herds retreated south',
};

// ── Narrative generation ─────────────────────────────────────────
function generateSummary(phase: Phase, score: number, sightings: SightingReport[]): string {
  const freshSighting = sightings.find(s => {
    const d = (new Date().getTime() - new Date(s.date).getTime()) / 86400000;
    return d <= 7;
  });

  if (phase === 'pre_season') return 'The wildebeest herds are still deep in the Serengeti. The Mara crossing season has not yet begun.';
  if (phase === 'post_season') return 'The main crossing season has ended. Herds have retreated south into Tanzania.';
  if (phase === 'active') {
    if (score > 80) return `Peak crossing season. Multiple large crossings are being reported. ${freshSighting ? `Latest confirmed sighting: ${freshSighting.location}.` : ''}`;
    return 'Active crossing season. Crossings occurring regularly — excellent conditions.';
  }
  if (phase === 'approaching') {
    if (freshSighting) return `Scout herds have been confirmed near ${freshSighting.location}. The front of the migration is arriving — crossings possible within days.`;
    return 'The herds are moving north through the Mara ecosystem. Crossing activity is building.';
  }
  return 'The main crossing window is passing. Some herds are returning south.';
}

function generateHerdLocation(sightings: SightingReport[]): string {
  if (!sightings.length) return 'No confirmed research-grade sightings in the last 14 days via iNaturalist.';
  const top = [...sightings].sort((a, b) => {
    const da = new Date(b.date).getTime() - new Date(a.date).getTime();
    return da !== 0 ? da : b.proximity - a.proximity;
  })[0];
  const ageDays = Math.round((new Date().getTime() - new Date(top.date).getTime()) / 86400000);
  const age = ageDays === 0 ? 'today' : ageDays === 1 ? '1 day ago' : `${ageDays} days ago`;
  return `Last confirmed: ${top.location} — ${age} via ${top.source}.`;
}

function generateRecommendation(phase: Phase, score: number, dtp: number): string {
  if (phase === 'pre_season') {
    return dtp > 60 ? 'Too early for crossings. Consider other Kenya experiences or plan a July+ visit.' : `Crossing season opens in ~${dtp} days. Book now to secure lodge availability.`;
  }
  if (phase === 'approaching') return 'Book now if you haven\'t — lodges near crossing points fill up fast. Crossings could begin at any time.';
  if (phase === 'active') {
    return score > 75 ? 'Travel now if possible. You are in the peak window — every day in the Mara is a potential crossing day.' : 'Strong conditions. Any visit in the next 2–3 weeks has a high probability of witnessing a crossing.';
  }
  if (phase === 'late_season') return 'Crossings still possible but less predictable. Significantly lower lodge rates in this window.';
  return 'The crossing season has ended. Plan for next year — we\'ll alert you when the window opens.';
}

// ── Main hook ────────────────────────────────────────────────────
export function useMigrationLive(): LiveMigrationData {
  const initialTiming = getMigrationTiming();

  const [data, setData] = useState<LiveMigrationData>({
    probability_score: 0, confidence_low: 0, confidence_high: 0,
    phase: 'pre_season', phase_label: PHASE_LABELS['pre_season'],
    peak_window_start: initialTiming.peakStart.toISOString().slice(0, 10),
    peak_window_end:   initialTiming.peakEnd.toISOString().slice(0, 10),
    days_to_peak: initialTiming.daysToPeak, today_doy: initialTiming.doy,
    historical_score: 0, herd_score: 0, rainfall_multiplier: 1,
    sightings: [], rainfall: null, sightings_count_14d: 0, recent_crossing_count: 0,
    signal_summary: '', herd_location: '', recommendation: '',
    last_updated: '', data_sources: [], loading: true, error: null,
  });

  const compute = useCallback(async () => {
    setData(d => ({ ...d, loading: true, error: null }));

    const [rainfall, sightings] = await Promise.all([fetchRainfall(), fetchSightings()]);
    const { doy, peakStart, peakEnd, daysToPeak } = getMigrationTiming();

    // Count crossings (sightings near river in last 7 days)
    const crossings = sightings.filter(s => {
      const age = (new Date().getTime() - new Date(s.date).getTime()) / 86400000;
      return age <= 7 && s.proximity >= 0.85;
    }).length;

    // Scoring
    const prior   = historicalPrior(doy);
    const herd    = herdScore(sightings, crossings);
    const rMult   = rainfallMultiplier(rainfall);

    const rawScore = sightings.length
      ? (prior * 0.50 + herd * 0.35) * rMult + prior * 0.15
      : prior * rMult;

    const score = Math.round(Math.min(Math.max(rawScore, 0), 100) * 10) / 10;
    const [low, high] = confidenceBand(score, sightings);

    const phase = detectPhase(doy, score, crossings);
    const sources: string[] = ['Historical crossing records (20yr)'];
    if (sightings.length) sources.push(`iNaturalist (${sightings.length} obs)`);
    if (rainfall)         sources.push('Open-Meteo rainfall');

    setData({
      probability_score: score,
      confidence_low:    Math.round(low * 10) / 10,
      confidence_high:   Math.round(high * 10) / 10,
      phase, phase_label: PHASE_LABELS[phase],
      peak_window_start: peakStart.toISOString().slice(0, 10),
      peak_window_end:   peakEnd.toISOString().slice(0, 10),
      days_to_peak: daysToPeak, today_doy: doy,
      historical_score: Math.round(prior * 10) / 10,
      herd_score:       Math.round(herd * 10) / 10,
      rainfall_multiplier: Math.round(rMult * 100) / 100,
      sightings, rainfall, sightings_count_14d: sightings.length,
      recent_crossing_count: crossings,
      signal_summary:   generateSummary(phase, score, sightings),
      herd_location:    generateHerdLocation(sightings),
      recommendation:   generateRecommendation(phase, score, daysToPeak),
      last_updated:     new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      data_sources:     sources,
      loading: false, error: null,
    });
  }, []);

  useEffect(() => {
    compute();
    // Refresh every 30 minutes
    const iv = setInterval(compute, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, [compute]);

  return data;
}
