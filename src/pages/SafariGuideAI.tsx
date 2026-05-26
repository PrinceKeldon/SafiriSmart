/**
 * SafariGuideAI — v4
 *
 * Changes from v3:
 * - Earthy colour palette: warm terracotta, soil, ochre, sage, dust
 * - No wildebeest icon (removed entirely — the SVG did not represent the animal)
 * - Live migration data via useMigrationLive hook:
 *   · Open-Meteo (free, no key): 30-day Mara rainfall vs historical average
 *   · iNaturalist (free, CORS): research-grade wildebeest sightings last 14 days
 *   · Bayesian prior from 20 years of crossing records
 * - Wires into the existing /migration/score Edge Function as fallback
 * - Fully compatible with Lovable's rendering environment
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Loader2, DollarSign, Calendar,
  Users, MapPin, Leaf, ExternalLink, Music, Compass,
  RefreshCw, AlertCircle, CheckCircle, Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSEO } from '@/components/seo/PageSEO';
import { createServiceSchema, createBreadcrumbSchema } from '@/utils/structuredData';
import { trackPageView } from '@/utils/analytics';
import { useMigrationLive, type LiveMigrationData } from '@/hooks/useMigrationLive';
import { PlannerService, type PlanResponse, type ItineraryDay } from '@/services/PlannerService';

// ── Earthy colour tokens (Tailwind classes only) ──────────────────
// Terracotta:  bg-orange-800 / text-orange-700 / border-orange-300
// Soil dark:   bg-stone-900 / text-stone-800
// Ochre:       bg-amber-700 / text-amber-600
// Sage green:  bg-stone-600 / text-stone-500
// Dust/cream:  bg-stone-50  / text-stone-100
// Mara green:  bg-green-800 / text-green-700 / bg-green-50
// River teal:  bg-teal-700  / text-teal-600

// ── Types ─────────────────────────────────────────────────────────
interface Message { role: 'ai' | 'user'; content: string; }

const EXAMPLES = [
  'Family migration trip · July · budget $4 000',
  'Solo birding · Samburu · October · 8 days',
  'Luxury honeymoon · Mara + Diani beach · 10 days',
  'Budget Kenya safari · 7 days · under $1 500',
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Live dot ──────────────────────────────────────────────────────
function LiveDot({ color = 'bg-green-500' }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${color}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

// ── Data source pills ─────────────────────────────────────────────
function DataSourceBadge({ sources, sightings, loading }: {
  sources: string[]; sightings: number; loading: boolean;
}) {
  if (loading) return (
    <div className="flex items-center gap-1.5 text-xs text-stone-400">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="font-mono">Fetching live signals...</span>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {sources.map(s => (
        <span key={s} className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
          <CheckCircle className="h-2.5 w-2.5 text-green-600" />
          {s}
        </span>
      ))}
      {sightings > 0 && (
        <span className="text-xs text-stone-400 font-mono">{sightings} research-grade obs</span>
      )}
    </div>
  );
}

// ── Live Migration Score Card ─────────────────────────────────────
function MigrationScoreCard({ live, onRefresh }: {
  live: LiveMigrationData; onRefresh: () => void;
}) {
  const pct   = Math.round(live.probability_score);
  const isHot = pct >= 60;

  const cardBg    = isHot ? 'bg-amber-50 border-amber-200'   : 'bg-stone-50 border-stone-200';
  const scoreCol  = isHot ? 'text-amber-700'                 : 'text-green-700';
  const phaseCol  = isHot ? 'text-amber-800'                 : 'text-green-800';
  const barColor  = isHot ? 'from-amber-500 to-orange-600'   : 'from-green-500 to-teal-600';
  const dotColor  = isHot ? 'bg-amber-500'                   : 'bg-green-500';

  return (
    <div className={`rounded-2xl border p-5 mb-2 ${cardBg}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <LiveDot color={dotColor} />
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400">
              Great Wildebeest Migration · Live
            </span>
            <button onClick={onRefresh} className="ml-auto text-stone-300 hover:text-stone-500 transition-colors" title="Refresh data">
              <RefreshCw className={`h-3 w-3 ${live.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className={`text-base font-bold mb-1 ${phaseCol}`}>{live.phase_label}</p>
          <p className="text-xs text-stone-500 leading-relaxed">{live.signal_summary}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-mono text-5xl font-bold leading-none ${scoreCol}`}>{pct}</div>
          <div className="text-xs font-mono text-stone-400 mt-0.5">/100</div>
          <div className="text-xs text-stone-400 mt-1">
            {live.confidence_low.toFixed(0)}–{live.confidence_high.toFixed(0)} band
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full bg-white/70 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { val: live.days_to_peak > 0 ? `${live.days_to_peak}d` : 'Now', lbl: 'To peak' },
          { val: fmtDate(live.peak_window_start), lbl: 'Opens' },
          { val: fmtDate(live.peak_window_end), lbl: 'Closes' },
        ].map(({ val, lbl }) => (
          <div key={lbl} className="text-center bg-white/60 rounded-xl py-2">
            <div className={`font-mono text-sm font-bold ${phaseCol}`}>{val}</div>
            <div className="text-xs text-stone-400 mt-0.5">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Signal breakdown */}
      <div className="border-t border-stone-200/60 pt-3 mb-3">
        <p className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">Signal breakdown</p>
        <div className="flex gap-4 flex-wrap">
          {[
            { lbl: 'Historical prior', val: `${live.historical_score.toFixed(0)}/100`, tip: '50% weight' },
            { lbl: 'Herd location',    val: `${live.herd_score.toFixed(0)}/100`,       tip: '35% weight' },
            { lbl: 'Rainfall ×',       val: `${live.rainfall_multiplier.toFixed(2)}`,   tip: '15% weight' },
          ].map(({ lbl, val, tip }) => (
            <div key={lbl}>
              <span className="text-xs text-stone-400">{lbl}: </span>
              <span className="text-xs font-mono font-medium text-stone-600">{val}</span>
              <span className="text-xs text-stone-300 ml-1">({tip})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Herd location */}
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="h-3.5 w-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-500 leading-relaxed">{live.herd_location}</p>
      </div>

      {/* Rainfall */}
      {live.rainfall && (
        <div className="flex items-start gap-2 mb-3">
          <Radio className="h-3.5 w-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-stone-500">
            Mara 30-day rainfall: <span className="font-mono font-medium">{live.rainfall.current_30d_mm}mm</span>
            {' '}vs avg <span className="font-mono">{live.rainfall.historical_avg_mm}mm</span>
            {' '}— <span className={live.rainfall.trend === 'above_average' ? 'text-teal-600' : live.rainfall.trend === 'below_average' ? 'text-orange-600' : 'text-stone-500'}>
              {live.rainfall.anomaly_pct > 0 ? '+' : ''}{live.rainfall.anomaly_pct}% ({live.rainfall.trend.replace('_', ' ')})
            </span>
          </p>
        </div>
      )}

      {/* Data sources */}
      <DataSourceBadge sources={live.data_sources} sightings={live.sightings_count_14d} loading={live.loading} />

      {live.last_updated && (
        <p className="text-xs text-stone-300 font-mono mt-2">Updated {live.last_updated} EAT</p>
      )}
    </div>
  );
}

// ── Scene mosaic — earthy colour blocks ───────────────────────────
const SCENES = [
  { label: 'Masai Mara', sub: 'Great Migration crossing', bg: 'from-stone-700 to-stone-800',   span: true },
  { label: 'Balloon safari', sub: 'Dawn over the plains',  bg: 'from-amber-700 to-orange-800', span: false },
  { label: 'Game drive',     sub: 'Big Five territory',    bg: 'from-green-800 to-teal-800',   span: false },
  { label: 'Amboseli',       sub: 'Elephants + Kilimanjaro', bg: 'from-stone-600 to-stone-700', span: false },
  { label: 'Samburu',        sub: 'Northern frontier',     bg: 'from-amber-800 to-stone-700',  span: false },
];

const SCENE_ICONS = [
  // Mara — abstract river crossing lines
  <svg viewBox="0 0 80 80" fill="none" className="w-12 h-12 opacity-20" key="mara">
    <path d="M10 40 Q25 20 40 40 Q55 60 70 40" stroke="white" strokeWidth="3" fill="none"/>
    <path d="M10 50 Q25 30 40 50 Q55 70 70 50" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="20" cy="38" r="3" fill="white"/><circle cx="35" cy="44" r="2" fill="white"/>
    <circle cx="50" cy="38" r="4" fill="white"/><circle cx="65" cy="42" r="2" fill="white"/>
  </svg>,
  // Balloon — circle
  <svg viewBox="0 0 80 80" fill="none" className="w-10 h-10 opacity-20" key="balloon">
    <ellipse cx="40" cy="30" rx="22" ry="26" stroke="white" strokeWidth="2.5"/>
    <path d="M34 56 L40 70 L46 56" stroke="white" strokeWidth="2" fill="none"/>
    <line x1="34" y1="56" x2="46" y2="56" stroke="white" strokeWidth="2"/>
  </svg>,
  // Acacia tree silhouette
  <svg viewBox="0 0 80 80" fill="none" className="w-10 h-10 opacity-20" key="tree">
    <ellipse cx="40" cy="24" rx="28" ry="14" fill="white"/>
    <rect x="38" y="38" width="4" height="30" fill="white"/>
    <rect x="20" y="62" width="40" height="3" fill="white"/>
  </svg>,
  // Mountain + plains
  <svg viewBox="0 0 80 80" fill="none" className="w-10 h-10 opacity-20" key="mtn">
    <path d="M5 65 L30 25 L45 45 L60 20 L75 65 Z" fill="white"/>
    <line x1="5" y1="65" x2="75" y2="65" stroke="white" strokeWidth="2"/>
  </svg>,
  // Abstract tracks / footprints
  <svg viewBox="0 0 80 80" fill="none" className="w-10 h-10 opacity-20" key="track">
    <ellipse cx="30" cy="20" rx="8" ry="10" fill="white"/>
    <ellipse cx="50" cy="32" rx="8" ry="10" fill="white"/>
    <ellipse cx="25" cy="50" rx="8" ry="10" fill="white"/>
    <ellipse cx="55" cy="62" rx="8" ry="10" fill="white"/>
  </svg>,
];

function SceneMosaic() {
  return (
    <div className="grid gap-0.5 bg-stone-300"
      style={{ gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '130px 130px' }}>
      {SCENES.map(({ label, sub, bg, span }, i) => (
        <div key={i} className={`relative overflow-hidden bg-gradient-to-br ${bg} ${span ? 'row-span-2' : ''}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {SCENE_ICONS[i]}
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
            <p className="text-white text-xs font-semibold leading-tight">{label}</p>
            <p className="text-white/65 text-xs">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI avatar — compass icon, no animal ──────────────────────────
function AIAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
      <Compass className="h-4 w-4 text-amber-400" />
    </div>
  );
}

// ── Thinking indicator ────────────────────────────────────────────
function ThinkingBubble() {
  return (
    <div className="flex gap-2 items-start">
      <AIAvatar />
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl rounded-tl-sm bg-stone-100 border border-stone-200">
        <span className="flex gap-1">
          {[0, 180, 360].map((d, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce"
              style={{ animationDelay: `${d}ms` }} />
          ))}
        </span>
        <span className="text-xs font-mono text-stone-400">Reading migration signals...</span>
      </div>
    </div>
  );
}

// ── Day card — earthy colour blocks ──────────────────────────────
const DAY_GRADIENTS = [
  'from-stone-700 to-stone-800',
  'from-amber-700 to-orange-800',
  'from-green-800 to-teal-800',
  'from-stone-600 to-stone-700',
  'from-teal-700 to-green-800',
];

function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  const grad   = DAY_GRADIENTS[index % DAY_GRADIENTS.length];
  const migPct = day.migration_score ? Math.round(day.migration_score) : 0;

  return (
    <div className="rounded-xl overflow-hidden border border-stone-200 bg-white flex"
      style={{ animation: `slideUp 0.35s ease-out ${index * 70}ms both` }}>
      <div className={`w-16 flex-shrink-0 bg-gradient-to-br ${grad} flex flex-col items-center justify-center gap-0.5`}>
        <span className="font-mono text-xs uppercase text-white/60">Day</span>
        <span className="font-mono text-2xl font-bold text-white leading-none">{day.day}</span>
      </div>
      <div className="p-3 flex-1 min-w-0">
        <p className="font-semibold text-sm text-stone-900 truncate mb-0.5">{day.location}</p>
        <p className="text-xs font-mono text-green-700 mb-2 uppercase tracking-wider truncate">{day.park}</p>
        <p className="text-xs text-stone-500 leading-relaxed mb-2">
          {day.activities.slice(0, 2).join(' · ')}
        </p>
        {day.wildlife_highlight && (
          <p className="text-xs italic text-amber-800 border-l-2 border-amber-400 pl-2 mb-2 leading-snug">
            {day.wildlife_highlight}
          </p>
        )}
        {migPct > 0 && (
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="text-xs text-stone-400 font-mono">Migration window</span>
              <span className="text-xs font-mono font-medium text-teal-700">{migPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-green-600"
                style={{ width: `${migPct}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Itinerary panel ───────────────────────────────────────────────
function ItineraryPanel({ plan }: { plan: PlanResponse }) {
  const { itinerary, wildlife_context, traveler_profile } = plan;
  if (!itinerary) return null;
  const ws     = Math.round(wildlife_context?.travel_window_score ?? 0);
  const wLabel = wildlife_context?.travel_window_label ?? '';
  const isHot  = ws >= 60;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="font-heading text-lg font-bold text-stone-900 mb-1">
          {itinerary.days.length}-day Kenya safari
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed mb-3">{itinerary.summary}</p>
        <Badge variant="outline" className={`mb-4 flex items-center gap-1.5 w-fit text-xs ${isHot ? 'border-amber-300 text-amber-800 bg-amber-50' : 'border-teal-300 text-teal-800 bg-teal-50'}`}>
          <LiveDot color={isHot ? 'bg-amber-500' : 'bg-teal-500'} />
          {wLabel}
        </Badge>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: DollarSign, val: `$${Math.round(itinerary.total_cost_usd).toLocaleString()}`, lbl: 'Total estimate' },
            { icon: Calendar,   val: `${itinerary.days.length} days`,                              lbl: 'Duration' },
            { icon: Users,      val: `${traveler_profile?.group_size ?? 1}`,                       lbl: 'Travellers' },
            { icon: MapPin,     val: `${ws}/100`,                                                   lbl: 'Migration score' },
          ].map(({ icon: Icon, val, lbl }) => (
            <div key={lbl} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className="h-3.5 w-3.5 text-stone-400" />
                <span className="font-mono text-sm font-bold text-stone-800">{val}</span>
              </div>
              <p className="text-xs text-stone-400">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {itinerary.days.map((day, i) => <DayCard key={day.day} day={day} index={i} />)}
      </div>

      <div className="rounded-2xl overflow-hidden border border-stone-200">
        <div className="grid grid-cols-3 divide-x divide-stone-200">
          {[
            { val: `${Math.round(itinerary.eco_impact_score)}%`,    lbl: 'Eco score' },
            { val: `${Math.round(itinerary.community_spend_pct)}%`, lbl: 'Local spend' },
            { val: `${Math.round(itinerary.carbon_estimate_kg)}kg`, lbl: 'Est. CO₂' },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="p-3 text-center bg-white">
              <div className="font-mono text-sm font-bold text-teal-700">{val}</div>
              <div className="text-xs text-stone-400 mt-0.5 font-mono uppercase tracking-wider">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden">
        <div className="h-16 bg-gradient-to-br from-stone-800 to-green-900 flex items-center justify-center">
          <p className="font-heading text-lg font-bold text-stone-100">Your safari awaits</p>
        </div>
        <div className="bg-green-800 p-5">
          <div className="flex items-start gap-3">
            <Leaf className="h-4 w-4 text-green-300 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-white mb-1">Connect with a matched operator</h4>
              <p className="text-xs text-green-200 leading-relaxed mb-3">
                {itinerary.best_for || 'Verified Kenyan operators specialising in this exact route and travel window are ready to quote.'}
              </p>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 text-green-900 hover:bg-white transition-colors"
                onClick={() => alert('Operator matching launching Sprint 2 — before the August peak.')}>
                Find my operator →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────
function ItineraryEmpty({ live }: { live: LiveMigrationData }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200">
      <div className="h-48 bg-gradient-to-br from-stone-700 via-green-800 to-teal-800 relative flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <Compass className="h-12 w-12 text-white/30 relative z-10" />
        <p className="text-sm text-white/80 leading-relaxed relative z-10 max-w-xs">
          Your signal-enriched itinerary appears here
        </p>
        {!live.loading && (
          <p className="font-mono text-xs text-white/50 relative z-10">
            Migration score: {Math.round(live.probability_score)}/100 · {live.days_to_peak}d to peak
          </p>
        )}
      </div>
      <div className="p-4 bg-white">
        <p className="text-xs text-center text-stone-400">
          Describe your trip in the chat — your itinerary assembles here in real time
        </p>
      </div>
    </div>
  );
}

// ── Footnote ──────────────────────────────────────────────────────
function FootnoteBanner() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-stone-50 border-t border-stone-200 flex-wrap">
      <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
        <ExternalLink className="h-3.5 w-3.5 text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-stone-700">Crossing Ubuntu · Rails & Roots</p>
        <p className="text-xs text-stone-400 mt-0.5">
          The children's novel set on this migration. Documentary filming at the Mara this August. Soundtrack out now.
        </p>
      </div>
      <div className="flex gap-4 flex-shrink-0">
        <a href="https://amzn.eu/d/00A3bGK4" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-700 transition-colors">
          <ExternalLink className="h-3 w-3" /> Amazon
        </a>
        <a href="https://www.tiktok.com/@keldon.music" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-700 transition-colors">
          <Music className="h-3 w-3" /> @keldon.music
        </a>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
const SafariGuideAI = () => {
  const live = useMigrationLive();
  const [messages,     setMessages]     = useState<Message[]>([{
    role: 'ai',
    content: "Habari! I'm SafiriSmart's AI guide. Tell me about your Kenya trip — where, when, how many people, your budget, and what you most want to experience. I'll read live migration signals and build your itinerary.",
  }]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [sessionId,    setSessionId]    = useState<string | null>(null);
  const [latestPlan,   setLatestPlan]   = useState<PlanResponse | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { trackPageView('SafariGuideAI'); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const addMsg = useCallback((role: 'ai' | 'user', content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(''); setLoading(true); setShowExamples(false);
    addMsg('user', text);
    try {
      const result = await PlannerService.plan({ message: text, session_id: sessionId });
      setSessionId(result.session_id);
      const w = result.wildlife_context; const it = result.itinerary;
      const days = Array.isArray(it?.days) ? it.days : [];
      if (w && it && days.length > 0) {
        const ws = Math.round(w.travel_window_score);
        addMsg('ai',
          `Built your **${days.length}-day itinerary**. Travel window: **${ws}/100** — ${w.travel_window_label}. ` +
          (w.days_to_peak <= 0 ? 'Peak crossing window is open right now. ' : `Peak opens in **${w.days_to_peak} days**. `) +
          w.signal_summary
        );
        setLatestPlan(result);
        if (result.processing_ms?.total)
          addMsg('ai', `✓ Built in ${(result.processing_ms.total / 1000).toFixed(1)}s using live signals.`);
      } else if (result.errors?.length) {
        addMsg('ai', `Something went wrong: ${result.errors[0]}. Please try rephrasing.`);
      } else if (it) {
        setLatestPlan(result);
        addMsg('ai', 'The planning service returned an itinerary shell but no day-by-day plan. Try including destination, month, duration, group size, and budget.');
      } else {
        addMsg('ai', 'The planning service responded, but no itinerary was included in the response.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addMsg('ai', `Can't reach the planning service right now. Is the AI Core running on port 8000? Error: ${message}`);
    } finally { setLoading(false); }
  }, [input, loading, sessionId, addMsg]);

  const serviceSchema    = createServiceSchema();
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' }, { name: 'Safari Guide', url: '/safari-guide' },
  ]);

  return (
    <>
      <PageSEO
        title="SafariGuide AI — Plan your perfect Kenya safari"
        description="Live wildebeest migration tracker + AI itinerary builder. Real data from iNaturalist and Open-Meteo. Masai Mara, Amboseli, Samburu."
        keywords="kenya safari planner, AI itinerary, wildebeest migration live, masai mara, amboseli, samburu, kenya wildlife"
        canonicalUrl="/safari-guide"
        structuredData={{ "@context": "https://schema.org", "@graph": [serviceSchema, breadcrumbSchema] }}
        ogType="website"
      />
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes msgIn   { from{opacity:0;transform:translateY(5px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes driftH  { 0%{transform:translateX(-20%);opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{transform:translateX(110%);opacity:0} }
        .msg-in    { animation: msgIn 0.22s ease-out both; }
        .herd-anim { animation: driftH 24s linear infinite; }
        .scroll-thin::-webkit-scrollbar{width:3px}
        .scroll-thin::-webkit-scrollbar-thumb{background:#d6d3d1;border-radius:2px}
      `}</style>

      <div className="min-h-screen bg-stone-50">

        {/* ── Header ── */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Compass className="h-7 w-7 text-green-700" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
              </div>
              <div>
                <h1 className="text-base font-bold text-stone-800">SafariGuide AI</h1>
                <p className="text-xs text-stone-400">by SafiriSmart</p>
              </div>
            </div>
            {!live.loading && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200">
                <LiveDot color={live.probability_score >= 60 ? 'bg-amber-500' : 'bg-green-500'} />
                <span className="font-mono text-sm font-bold text-stone-700">
                  {Math.round(live.probability_score)}/100
                </span>
                <span className="text-xs text-stone-400">· {live.days_to_peak}d to peak</span>
              </div>
            )}
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs border-stone-200 text-stone-500">
                <ArrowLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-green-900" style={{ minHeight: 300 }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          {/* Abstract herd animation — dots, not icons */}
          <div className="absolute bottom-8 left-0 herd-anim flex gap-10 pointer-events-none" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-3 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/15" />
              </div>
            ))}
          </div>
          <div className="relative z-10 container mx-auto px-4 py-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/15 mb-6">
              <LiveDot color={live.probability_score >= 60 ? 'bg-amber-400' : 'bg-green-400'} />
              <span className="text-xs font-mono uppercase tracking-widest text-white/60">
                Kenya's agentic tourism guide
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-stone-100 leading-tight mb-4">
              Plan your safari.<br />
              <span className="text-amber-400">The crossing awaits.</span>
            </h2>
            <p className="text-base text-stone-300 max-w-lg mx-auto mb-6 leading-relaxed">
              Describe your trip. Live migration signals from iNaturalist and Open-Meteo shape every itinerary.
            </p>
            {!live.loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/15">
                <LiveDot color="bg-amber-400" />
                <span className="font-mono text-sm text-stone-300">
                  Live score: {Math.round(live.probability_score)}/100 · {live.phase_label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Migration score card floats up ── */}
        <div className="container mx-auto px-4 -mt-4 relative z-10">
          <MigrationScoreCard live={live} onRefresh={() => window.location.reload()} />
        </div>

        {/* ── Scene mosaic ── */}
        <SceneMosaic />

        {/* ── Planner ── */}
        <div className="container mx-auto px-4 py-7">
          <div className="flex items-center gap-3 mb-5">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-400 whitespace-nowrap">Plan your trip</p>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {showExamples && (
            <div className="flex flex-wrap gap-2 mb-5">
              {EXAMPLES.map(e => (
                <button key={e} onClick={() => setInput(e)}
                  className="text-xs px-3 py-1.5 rounded-full border border-stone-200 bg-white text-stone-500 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50 transition-all">
                  {e}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chat */}
            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm flex flex-col">
              <div className="flex flex-col gap-3 p-4 scroll-thin overflow-y-auto" style={{ maxHeight: latestPlan ? 500 : 320 }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`msg-in flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'ai'
                      ? <AIAvatar />
                      : <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">✦</div>
                    }
                    <div
                      className={`rounded-2xl text-sm leading-relaxed px-3.5 py-2.5 max-w-[82%] ${msg.role === 'ai' ? 'bg-stone-100 text-stone-700 rounded-tl-sm' : 'bg-stone-800 text-stone-100 rounded-tr-sm'}`}
                      dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                  </div>
                ))}
                {loading && <ThinkingBubble />}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 p-3 border-t border-stone-100 bg-stone-50">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Describe your dream Kenya safari..."
                  rows={1}
                  className="flex-1 resize-none text-sm rounded-xl px-3 py-2.5 border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
                  style={{ minHeight: 42, maxHeight: 120 }}
                />
                <button onClick={handleSend} disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-900 flex items-center justify-center flex-shrink-0 self-end disabled:opacity-40 transition-colors"
                  aria-label="Send">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white" />}
                </button>
              </div>
            </div>

            {/* Itinerary */}
            <div>
              {latestPlan ? <ItineraryPanel plan={latestPlan} /> : <ItineraryEmpty live={live} />}
            </div>
          </div>
        </div>

        <FootnoteBanner />
      </div>
    </>
  );
};

export default SafariGuideAI;
