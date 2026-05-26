import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Loader2, MapPin, Calendar, Users, DollarSign,
  Leaf, ExternalLink, Music, Sparkles, ListChecks, Bug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageSEO } from '@/components/seo/PageSEO';
import { createServiceSchema, createBreadcrumbSchema } from '@/utils/structuredData';
import { trackPageView } from '@/utils/analytics';
import { MigrationService, type MigrationScore } from '@/services/MigrationService';
import { PlannerService, type PlanResponse, type ItineraryDay } from '@/services/PlannerService';
import { MigrationBanner } from '@/components/migration/MigrationBanner';
import PreferenceWizard from '@/components/preferences/PreferenceWizard';
import { OperatorSelectionDebugger } from '@/components/preferences/OperatorSelectionDebugger';

// ── Wildebeest SVG silhouette ─────────────────────────────────────
const WildebeestSilhouette = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden="true" fill="currentColor">
    <path d="M8 42 C8 42 6 38 7 35 C8 32 10 30 13 30 C13 30 12 26 14 24 C16 22 19 23 20 23 C20 23 21 20 24 19 C27 18 30 20 30 20 C30 20 32 17 36 17 C40 17 42 20 43 22 C46 21 50 22 52 24 C54 26 54 29 53 31 C56 30 60 31 62 34 C64 37 63 41 61 43 C63 43 65 45 65 47 C65 49 63 50 61 50 L57 50 L57 54 L54 54 L54 50 L50 50 L50 54 L47 54 L47 48 C45 49 42 49 40 48 L40 54 L37 54 L37 48 C35 48 33 47 32 46 L30 54 L27 54 L28 46 C26 47 23 47 21 46 L19 54 L16 54 L17 44 C14 44 10 43 8 42 Z M13 30 C13 30 11 32 12 35 C13 38 15 39 17 39 C15 37 14 34 13 30 Z M36 17 C34 15 31 14 28 15 C26 16 25 18 25 19 C27 18 30 18 33 18 C34 17 35 17 36 17 Z M50 22 C48 21 46 21 44 22 C43 23 43 25 44 26 C46 24 48 23 50 22 Z" />
    <circle cx="22" cy="22" r="2" />
    <path d="M18 19 C17 17 16 15 17 13 C18 12 20 13 20 13" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" />
    <path d="M24 18 C24 16 25 14 26 13 C27 12 28 13 28 13" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────
type PlannerMode = 'ai' | 'wizard';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

let _msgCount = 0;
function makeId() { return `msg-${++_msgCount}`; }

function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </>
  );
}

// ── Constants ─────────────────────────────────────────────────────
const EXAMPLES = [
  'Family migration trip, July, budget $4 000',
  'Solo birding Samburu, October, 8 days',
  'Luxury honeymoon — Mara + Diani beach, 10 days',
  'Budget Kenya safari, 7 days, under $1 500',
];

const AMBER_600 = '#854F0B';
const AMBER_400 = '#BA7517';
const AMBER_100 = '#FAC775';
const AMBER_50  = '#FAEEDA';
const GREEN_800 = '#27500A';
const GREEN_700 = '#3B6D11';
const GREEN_400 = '#639922';
const GREEN_50  = '#EAF3DE';
const TEAL_600  = '#0F6E56';
const TEAL_400  = '#1D9E75';
const TEAL_50   = '#E1F5EE';

// ── Shared sub-components ─────────────────────────────────────────

function LiveDot({ color = AMBER_400 }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

function MigrationScoreHero({ score }: { score: MigrationScore }) {
  const raw = Number(score?.probability_score);
  const pct = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 0;
  const isHot = pct >= 60;
  const barColor   = isHot ? AMBER_400 : TEAL_400;
  const scoreColor = isHot ? AMBER_400 : TEAL_400;
  const bgColor    = isHot ? AMBER_50  : TEAL_50;
  const borderColor = isHot ? '#EF9F27' : '#5DCAA5';
  return (
    <div className="rounded-xl border p-4 mb-5" style={{ background: bgColor, borderColor, borderWidth: '0.5px' }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <LiveDot color={barColor} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: isHot ? AMBER_600 : TEAL_600 }}>
              Great Migration · Live
            </span>
          </div>
          <p className="text-sm font-medium leading-snug" style={{ color: isHot ? AMBER_600 : TEAL_600 }}>
            {score.phase_label}
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: isHot ? '#633806' : '#085041' }}>
            {score.signal_summary}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-4xl font-semibold leading-none" style={{ color: scoreColor }}>{pct}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: isHot ? AMBER_600 : TEAL_600 }}>/100</div>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="flex gap-5 mt-3 flex-wrap">
        {[
          { val: score.days_to_peak > 0 ? `${score.days_to_peak}d` : 'Now', lbl: 'To peak' },
          { val: fmtDate(score.peak_window_start), lbl: 'Peak opens'  },
          { val: fmtDate(score.peak_window_end),   lbl: 'Peak closes' },
        ].map(({ val, lbl }) => (
          <div key={lbl}>
            <div className="font-mono text-sm font-medium" style={{ color: isHot ? AMBER_600 : TEAL_600 }}>{val}</div>
            <div className="text-xs" style={{ color: isHot ? '#633806' : '#085041' }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mode toggle ───────────────────────────────────────────────────

function ModePicker({ mode, onChange }: { mode: PlannerMode; onChange: (m: PlannerMode) => void }) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div
        className="inline-flex rounded-xl p-1 gap-1"
        style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}
      >
        <button
          onClick={() => onChange('ai')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={mode === 'ai'
            ? { background: GREEN_700, color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
            : { background: 'transparent', color: 'var(--color-text-secondary)' }
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Chat with AI</span>
          <span
            className="hidden sm:inline text-xs px-1.5 py-0.5 rounded-full font-mono"
            style={mode === 'ai'
              ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
              : { background: 'var(--color-background-tertiary)', color: 'var(--color-text-tertiary)' }
            }
          >
            new
          </span>
        </button>
        <button
          onClick={() => onChange('wizard')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={mode === 'wizard'
            ? { background: GREEN_700, color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
            : { background: 'transparent', color: 'var(--color-text-secondary)' }
          }
        >
          <ListChecks className="h-3.5 w-3.5" />
          <span>Step-by-step</span>
          <span
            className="hidden sm:inline text-xs px-1.5 py-0.5 rounded-full font-mono"
            style={mode === 'wizard'
              ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
              : { background: 'var(--color-background-tertiary)', color: 'var(--color-text-tertiary)' }
            }
          >
            11 steps
          </span>
        </button>
      </div>
    </div>
  );
}

// ── AI chat sub-components ────────────────────────────────────────

function AvatarAI() {
  return (
    <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GREEN_700, color: AMBER_100 }}>
      <WildebeestSilhouette className="w-4 h-4" />
    </div>
  );
}
function AvatarUser() {
  return (
    <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium" style={{ background: AMBER_400, color: '#412402' }}>
      ✦
    </div>
  );
}
function ThinkingBubble() {
  return (
    <div className="flex gap-2 items-start">
      <AvatarAI />
      <div className="rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-2" style={{ background: GREEN_50, border: `0.5px solid ${GREEN_400}` }}>
        <span className="flex gap-1">
          {[0, 0.18, 0.36].map((d, i) => (
            <span key={i} className="inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: GREEN_700, animationDelay: `${d}s` }} />
          ))}
        </span>
        <span className="text-xs font-mono" style={{ color: GREEN_800 }}>Reading migration signals...</span>
      </div>
    </div>
  );
}
function ChatMessage({ msg }: { msg: Message }) {
  const isAI = msg.role === 'ai';
  return (
    <div className={`flex gap-2 items-start ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI ? <AvatarAI /> : <AvatarUser />}
      <div
        className="rounded-xl text-sm leading-relaxed px-3 py-2.5 max-w-[80%]"
        style={isAI
          ? { background: GREEN_50, border: `0.5px solid ${GREEN_400}`, color: GREEN_800, borderRadius: '4px 12px 12px 12px' }
          : { background: AMBER_50, border: `0.5px solid ${AMBER_400}`, color: '#412402', borderRadius: '12px 4px 12px 12px' }
        }
      >
        <BoldText text={msg.content} />
      </div>
    </div>
  );
}

function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  const migPct = day.migration_score ? Math.round(day.migration_score) : 0;
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--color-background-primary)', borderColor: 'var(--color-border-tertiary)', borderWidth: '0.5px', animation: `slideIn 0.3s ease-out ${index * 60}ms both` }}
    >
      <div className="flex">
        <div className="w-14 flex flex-col items-center justify-center py-3 flex-shrink-0" style={{ background: GREEN_50, borderRight: `0.5px solid ${GREEN_400}` }}>
          <span className="text-xs font-mono uppercase" style={{ color: GREEN_700 }}>Day</span>
          <span className="font-mono text-2xl font-medium leading-none" style={{ color: GREEN_800 }}>{day.day}</span>
        </div>
        <div className="p-3 flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{day.location}</p>
              <p className="text-xs font-mono truncate" style={{ color: GREEN_700 }}>{day.park}</p>
            </div>
            <span className="font-mono text-xs flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
              ${Math.round(day.estimated_cost_usd).toLocaleString()}
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {day.activities.slice(0, 2).join(' · ')}
          </p>
          {day.wildlife_highlight && (
            <p className="text-xs italic leading-snug pl-2 mb-2" style={{ color: AMBER_600, borderLeft: `2px solid ${AMBER_400}` }}>
              {day.wildlife_highlight}
            </p>
          )}
          {migPct > 0 && (
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-background-secondary)' }}>
              <div className="h-full transition-all duration-700" style={{ width: `${migPct}%`, background: `linear-gradient(90deg, ${TEAL_400}, ${AMBER_400})` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItineraryPanel({ plan }: { plan: PlanResponse }) {
  const { itinerary, wildlife_context, traveler_profile } = plan;
  if (!itinerary) return null;
  const days = Array.isArray(itinerary.days) ? itinerary.days : [];
  const windowScore = Math.round(wildlife_context?.travel_window_score ?? 0);
  const windowLabel = wildlife_context?.travel_window_label ?? '';
  const isHot = windowScore >= 60;
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border p-4" style={{ background: 'var(--color-background-primary)', borderColor: 'var(--color-border-tertiary)', borderWidth: '0.5px' }}>
        <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>{days.length}-day Kenya safari</h3>
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>{itinerary.summary}</p>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3"
          style={isHot
            ? { background: AMBER_50, color: AMBER_600, border: `0.5px solid ${AMBER_400}` }
            : { background: TEAL_50,  color: TEAL_600,  border: `0.5px solid ${TEAL_400}` }
          }
        >
          <LiveDot color={isHot ? AMBER_400 : TEAL_400} />
          {windowLabel}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: DollarSign, val: `$${Math.round(itinerary.total_cost_usd).toLocaleString()}`, lbl: 'Total est.' },
            { icon: Calendar,   val: `${days.length} days`,                                        lbl: 'Duration'  },
            { icon: Users,      val: `${traveler_profile?.group_size ?? 1}`,                       lbl: 'Travellers' },
            { icon: MapPin,     val: `${windowScore}/100`,                                          lbl: 'Migration score' },
          ].map(({ icon: Icon, val, lbl }) => (
            <div key={lbl} className="rounded-lg p-2.5" style={{ background: 'var(--color-background-secondary)' }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className="h-3 w-3" style={{ color: 'var(--color-text-tertiary)' }} />
                <span className="font-mono text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{val}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {days.map((day, i) => <DayCard key={day.day} day={day} index={i} />)}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '0.5px solid var(--color-border-tertiary)' }}>
        <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--color-border-tertiary)' }}>
          {[
            { val: `${Math.round(itinerary.eco_impact_score)}%`,    lbl: 'Eco score'   },
            { val: `${Math.round(itinerary.community_spend_pct)}%`, lbl: 'Local spend' },
            { val: `${Math.round(itinerary.carbon_estimate_kg)}kg`, lbl: 'Est. CO₂'   },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="p-3 text-center" style={{ background: 'var(--color-background-primary)' }}>
              <div className="font-mono text-sm font-medium" style={{ color: TEAL_600 }}>{val}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-4" style={{ background: GREEN_700 }}>
        <div className="flex items-start gap-3">
          <Leaf className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: AMBER_100 }} />
          <div>
            <h4 className="font-medium text-sm mb-1" style={{ color: '#fff' }}>Connect with a matched operator</h4>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#C0DD97' }}>
              {itinerary.best_for || "Your itinerary is ready. We'll match you with operators who specialise in this exact route and travel window."}
            </p>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
              style={{ background: AMBER_100, color: '#412402' }}
              onClick={() => alert('Operator matching launching Sprint 2 — arriving before the August peak crossing window.')}
            >
              Find my operator →
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '0.5px solid var(--color-border-tertiary)' }}>
        <div className="grid sm:grid-cols-2">
          <div className="p-6 flex items-center justify-center" style={{ background: AMBER_50 }}>
            <div className="text-center">
              <WildebeestSilhouette className="w-16 h-8 mx-auto mb-2" style={{ color: AMBER_600 }} />
              <p className="text-xs italic" style={{ color: AMBER_600 }}>The crossing that started everything</p>
            </div>
          </div>
          <div className="p-4" style={{ background: 'var(--color-background-primary)' }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>The story behind the signal</p>
            <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>Crossing Ubuntu</h4>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              The children's novel set on this exact migration. Rails & Roots films at the Mara this August — during the crossing window this tracker counts down to.
            </p>
            <div className="flex flex-col gap-1.5">
              <a href="https://amzn.eu/d/00A3bGK4" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80" style={{ color: AMBER_600 }}>
                <ExternalLink className="h-3 w-3" /> Read on Amazon
              </a>
              <a href="https://www.tiktok.com/@keldon.music" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80" style={{ color: GREEN_700 }}>
                <Music className="h-3 w-3" /> @keldon.music — soundtrack
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI chat panel ─────────────────────────────────────────────────

function AIChatPanel({ migScore }: { migScore: MigrationScore | null }) {
  const [messages,     setMessages]     = useState<Message[]>([{
    id: makeId(),
    role: 'ai',
    content: "Habari! I'm SafiriSmart's AI guide. Tell me about your Kenya trip — where you want to go, when, how many people, your budget, and what you most want to experience. I'll read live migration signals and build your signal-enriched itinerary.",
    timestamp: new Date(),
  }]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [sessionId,    setSessionId]    = useState<string | null>(null);
  const [latestPlan,   setLatestPlan]   = useState<PlanResponse | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, latestPlan]);

  const addMsg = useCallback((role: 'ai' | 'user', content: string) => {
    setMessages(prev => [...prev, { id: makeId(), role, content, timestamp: new Date() }]);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);
    setShowExamples(false);
    addMsg('user', text);
    try {
      const result = await PlannerService.plan({ message: text, session_id: sessionId });
      setSessionId(result.session_id);
      const w  = result.wildlife_context;
      const it = result.itinerary;
      if (w && it) {
        const ws = Math.round(w.travel_window_score);
        addMsg('ai',
          `Built your **${it.days.length}-day itinerary**. ` +
          `Travel window **${ws}/100** — ${w.travel_window_label}. ` +
          (w.days_to_peak <= 0 ? 'Peak crossing window is open now. ' : `Peak opens in **${w.days_to_peak} days**. `) +
          w.signal_summary
        );
        setLatestPlan(result);
        if (result.processing_ms?.total)
          addMsg('ai', `✓ Built in ${(result.processing_ms.total / 1000).toFixed(1)}s using live signals.`);
      } else if (result.errors?.length) {
        addMsg('ai', `Something went wrong: ${result.errors[0]}. Try rephrasing your request.`);
      } else {
        addMsg('ai', "Here's your personalised Kenya itinerary:");
        if (it) setLatestPlan(result);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addMsg('ai', `Can't reach the planning service. Is the AI Core running (port 8000)? Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId, addMsg]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chat column */}
      <div className="flex flex-col gap-0">
        <div className="rounded-xl overflow-hidden flex flex-col" style={{ border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
          <div className="flex flex-col gap-3 p-4 overflow-y-auto scrollbar-thin" style={{ maxHeight: latestPlan ? '440px' : '320px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className="msg-enter">
                <ChatMessage msg={msg} />
              </div>
            ))}
            {loading && <ThinkingBubble />}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 p-3" style={{ borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Describe your dream Kenya safari..."
              rows={1}
              className="flex-1 resize-none text-sm rounded-lg px-3 py-2 outline-none transition-all"
              style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', minHeight: '40px', maxHeight: '120px' }}
              onFocus={e  => e.target.style.borderColor = AMBER_400}
              onBlur={e   => e.target.style.borderColor = 'var(--color-border-secondary)'}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 self-end transition-opacity disabled:opacity-40"
              style={{ background: GREEN_700 }}
              aria-label="Send message"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#fff' }} /> : <Send className="h-4 w-4" style={{ color: '#fff' }} />}
            </button>
          </div>
        </div>

        {/* Example chips */}
        {showExamples && (
          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLES.map(e => (
              <button
                key={e}
                onClick={() => setInput(e)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{ background: 'var(--color-background-primary)', border: `0.5px solid var(--color-border-secondary)`, color: 'var(--color-text-secondary)' }}
                onMouseEnter={ev => { (ev.target as HTMLButtonElement).style.background = AMBER_50;  (ev.target as HTMLButtonElement).style.color = AMBER_600; }}
                onMouseLeave={ev => { (ev.target as HTMLButtonElement).style.background = 'var(--color-background-primary)'; (ev.target as HTMLButtonElement).style.color = 'var(--color-text-secondary)'; }}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Crossing Ubuntu — when no plan */}
        {!latestPlan && (
          <div className="mt-4 rounded-xl overflow-hidden" style={{ border: '0.5px solid var(--color-border-tertiary)' }}>
            <div className="grid grid-cols-5">
              <div className="col-span-2 p-4 flex items-center justify-center" style={{ background: AMBER_50 }}>
                <div className="text-center">
                  <WildebeestSilhouette className="w-14 h-7 mx-auto mb-2" style={{ color: AMBER_600 }} />
                  <p className="text-xs italic" style={{ color: AMBER_600 }}>The crossing</p>
                </div>
              </div>
              <div className="col-span-3 p-4" style={{ background: 'var(--color-background-primary)' }}>
                <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>The story</p>
                <p className="font-medium text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>Crossing Ubuntu</p>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>The children's novel set on the real migration this engine tracks.</p>
                <a href="https://amzn.eu/d/00A3bGK4" target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: AMBER_600 }}>
                  <ExternalLink className="h-3 w-3" /> Amazon
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Itinerary column */}
      <div>
        {!latestPlan ? (
          <div className="rounded-xl border h-64 flex flex-col items-center justify-center gap-3 text-center p-6" style={{ background: GREEN_50, borderColor: GREEN_400, borderWidth: '0.5px' }}>
            <WildebeestSilhouette className="w-16 h-8" style={{ color: GREEN_700, opacity: 0.4 }} />
            <p className="text-sm" style={{ color: GREEN_800 }}>Your signal-enriched itinerary will appear here</p>
            <p className="text-xs font-mono" style={{ color: GREEN_700 }}>
              {migScore
                ? `Migration score: ${Math.round(migScore.probability_score)}/100 · ${migScore.days_to_peak}d to peak`
                : 'Loading migration signals...'}
            </p>
          </div>
        ) : (
          <ItineraryPanel plan={latestPlan} />
        )}
      </div>
    </div>
  );
}

// ── Wizard panel (original 11-step flow) ──────────────────────────

function WizardPanel({ onToggleDebug, showDebug }: { onToggleDebug: () => void; showDebug: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Plan your perfect safari adventure
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Answer 11 questions and let our AI create a personalised itinerary for you.
          </p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 text-xs flex-shrink-0" onClick={onToggleDebug}>
          <Bug className="h-3 w-3" />
          {showDebug ? 'Hide' : 'Debug'}
        </Button>
      </div>

      <MigrationBanner />

      {showDebug ? (
        <div className="mt-6">
          <OperatorSelectionDebugger />
        </div>
      ) : (
        <div className="mt-6">
          <PreferenceWizard onComplete={(data) => console.log('Wizard completed:', data)} />
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

const SafariGuide = () => {
  const [mode,       setMode]       = useState<PlannerMode>('ai');
  const [migScore,   setMigScore]   = useState<MigrationScore | null>(null);
  const [scoreLoad,  setScoreLoad]  = useState(true);
  const [showDebug,  setShowDebug]  = useState(false);

  useEffect(() => { trackPageView('SafariGuide'); }, []);

  useEffect(() => {
    MigrationService.getScore()
      .then(setMigScore)
      .catch(console.warn)
      .finally(() => setScoreLoad(false));
    const iv = setInterval(() => MigrationService.getScore().then(setMigScore).catch(() => {}), 60_000);
    return () => clearInterval(iv);
  }, []);

  const serviceSchema   = createServiceSchema();
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Safari Guide', url: '/safari-guide' },
  ]);

  return (
    <>
      <PageSEO
        title="SafariGuide AI — Plan your perfect Kenya safari"
        description="Create a personalised Kenya safari itinerary powered by live wildebeest migration signals. Plan for Masai Mara, Amboseli, Samburu and more. Connect with verified local operators."
        keywords="kenya safari planner, AI itinerary, wildebeest migration, masai mara, amboseli, safari AI, kenya wildlife tours"
        canonicalUrl="/safari-guide"
        structuredData={{ "@context": "https://schema.org", "@graph": [serviceSchema, breadcrumbSchema] }}
        ogType="website"
      />

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes wildebeestDrift { 0% { transform: translateX(-10%); opacity: 0.08; } 50% { opacity: 0.13; } 100% { transform: translateX(110%); opacity: 0.08; } }
        .msg-enter { animation: msgIn 0.25s ease-out both; }
        .wildebeest-drift { animation: wildebeestDrift 18s linear infinite; }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: ${AMBER_100}; border-radius: 2px; }
      `}</style>

      <div className="min-h-screen" style={{ background: 'var(--color-background-tertiary)' }}>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--color-background-primary)', borderColor: 'var(--color-border-tertiary)' }}>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0" style={{ color: GREEN_700 }}>
                <WildebeestSilhouette className="w-8 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-base leading-none truncate" style={{ color: 'var(--color-text-primary)' }}>SafariGuide AI</h1>
                <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>by SafiriSmart</p>
              </div>
            </div>
            {migScore && !scoreLoad && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: AMBER_50, border: `0.5px solid ${AMBER_400}` }}>
                <LiveDot color={AMBER_400} />
                <span className="font-mono text-sm font-medium" style={{ color: AMBER_600 }}>{Math.round(migScore.probability_score)}/100</span>
                <span className="text-xs" style={{ color: AMBER_600 }}>· {migScore.days_to_peak}d to peak</span>
              </div>
            )}
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs flex-shrink-0">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero band */}
        <div className="relative overflow-hidden py-10 px-4" style={{ background: '#412402' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="wildebeest-drift absolute bottom-4 left-0" style={{ color: AMBER_100 }}>
              <WildebeestSilhouette className="w-24 h-12" />
            </div>
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: AMBER_100, opacity: 0.7 }}>Kenya's agentic tourism guide</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-3" style={{ fontFamily: 'var(--font-serif)', color: AMBER_50 }}>
              Plan your Kenya safari
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: AMBER_100, opacity: 0.8 }}>
              Describe your trip in plain language — or let us walk you through it step by step.
            </p>
            {migScore && (
              <p className="font-mono text-xs mt-4" style={{ color: AMBER_100, opacity: 0.6 }}>
                Migration score today: {Math.round(migScore.probability_score)}/100 · {migScore.phase_label}
              </p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* Migration score card (AI mode only — wizard has MigrationBanner) */}
          {mode === 'ai' && scoreLoad && (
            <div className="rounded-xl border p-4 mb-5 animate-pulse" style={{ background: AMBER_50, borderColor: AMBER_100, borderWidth: '0.5px', height: 120 }} />
          )}
          {mode === 'ai' && migScore && !scoreLoad && <MigrationScoreHero score={migScore} />}

          {/* Mode picker */}
          <ModePicker mode={mode} onChange={setMode} />

          {/* Content area */}
          {mode === 'ai'
            ? <AIChatPanel migScore={migScore} />
            : <WizardPanel onToggleDebug={() => setShowDebug(v => !v)} showDebug={showDebug} />
          }
        </div>
      </div>
    </>
  );
};

export default SafariGuide;
