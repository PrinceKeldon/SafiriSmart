import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MapPin, Calendar, DollarSign, Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlannerService, type PlanResponse, type ItineraryDay } from "@/services/PlannerService";
import { MigrationService, type MigrationScore } from "@/services/MigrationService";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

const EXAMPLE_PROMPTS = [
  "I want to see the wildebeest crossing with my family in July, budget $4000",
  "Solo birding trip to Samburu in October, mid-range, 8 days",
  "Honeymoon safari — luxury, Masai Mara + beach, 10 days",
  "Budget Kenya safari 7 days under $1500, couple",
];

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

function MigrationScoreCard({ score }: { score: MigrationScore }) {
  const isHot = score.probability_score >= 60;
  return (
    <div className={`rounded-xl border p-4 mb-4 ${isHot ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
            Live Migration Score
          </p>
          <p className={`font-semibold ${isHot ? "text-amber-800" : "text-emerald-800"}`}>
            {score.phase_label}
          </p>
        </div>
        <div className="text-right">
          <span className={`font-mono text-3xl font-bold ${isHot ? "text-amber-600" : "text-emerald-600"}`}>
            {Math.round(score.probability_score)}
          </span>
          <span className="text-muted-foreground text-sm">/100</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isHot ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${score.probability_score}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-mono font-semibold text-sm">{score.days_to_peak}</p>
          <p className="text-xs text-muted-foreground">Days to peak</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-sm">
            {new Date(score.peak_window_start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </p>
          <p className="text-xs text-muted-foreground">Peak opens</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-sm">
            {new Date(score.peak_window_end).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </p>
          <p className="text-xs text-muted-foreground">Peak closes</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{score.signal_summary}</p>
    </div>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  const migScore = day.migration_score ?? 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          <div className="w-16 bg-muted flex flex-col items-center justify-center p-3 flex-shrink-0">
            <span className="text-xs text-muted-foreground font-mono">DAY</span>
            <span className="text-2xl font-bold text-foreground leading-none">{day.day}</span>
          </div>
          <div className="p-4 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="font-semibold text-sm">{day.location}</p>
                <p className="text-xs text-emerald-600 font-mono">{day.park}</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                ${Math.round(day.estimated_cost_usd).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {day.activities.join(" · ")}
            </p>
            {day.wildlife_highlight && (
              <p className="text-xs italic text-amber-700 border-l-2 border-amber-400 pl-2">
                {day.wildlife_highlight}
              </p>
            )}
            {migScore > 0 && (
              <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                  style={{ width: `${migScore}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ItineraryResult({ plan }: { plan: PlanResponse }) {
  const { itinerary, wildlife_context, traveler_profile } = plan;
  if (!itinerary) return null;

  const days = Array.isArray(itinerary.days) ? itinerary.days : [];
  const windowScore = wildlife_context?.travel_window_score ?? 0;
  const windowLabel = wildlife_context?.travel_window_label ?? "";
  const isHot = windowScore >= 60;

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-lg mb-1">
          {days.length}-Day Kenya Safari
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{itinerary.summary}</p>

        <Badge
          variant="outline"
          className={isHot ? "border-amber-400 text-amber-700 bg-amber-50" : "border-emerald-400 text-emerald-700 bg-emerald-50"}
        >
          {windowLabel}
        </Badge>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { icon: DollarSign, val: `$${Math.round(itinerary.total_cost_usd).toLocaleString()}`, lbl: "Total est." },
            { icon: Calendar, val: `${days.length} days`, lbl: "Duration" },
            { icon: Users, val: `${traveler_profile?.group_size ?? 1}`, lbl: "Travellers" },
            { icon: MapPin, val: `${Math.round(windowScore)}/100`, lbl: "Migration score" },
          ].map(({ icon: Icon, val, lbl }) => (
            <div key={lbl} className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono font-semibold text-sm">{val}</span>
              </div>
              <p className="text-xs text-muted-foreground">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Day-by-Day Itinerary
        </p>
        {days.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </div>

      <div className="grid grid-cols-3 divide-x rounded-xl border overflow-hidden">
        {[
          { val: `${Math.round(itinerary.eco_impact_score)}%`, lbl: "Eco score", color: "text-emerald-600" },
          { val: `${Math.round(itinerary.community_spend_pct)}%`, lbl: "Local spend", color: "text-emerald-600" },
          { val: `${Math.round(itinerary.carbon_estimate_kg)}kg`, lbl: "Est. CO₂", color: "text-muted-foreground" },
        ].map(({ val, lbl, color }) => (
          <div key={lbl} className="p-3 text-center">
            <p className={`font-mono font-semibold ${color}`}>{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{lbl}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-emerald-700 text-white p-5">
        <div className="flex items-start gap-3">
          <Leaf className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Connect with a matched operator</h4>
            <p className="text-sm text-emerald-100 mb-3">{itinerary.best_for}</p>
            <Button
              variant="secondary"
              size="sm"
              className="bg-amber-400 text-emerald-900 hover:bg-amber-300 font-semibold"
              onClick={() => alert("Operator matching launching Sprint 2 — arriving before the August peak.")}
            >
              Find my operator →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

let msgCounter = 0;
function makeId() { return `msg-${++msgCounter}`; }

export function AgenticPlanner() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: makeId(),
      role: "ai",
      content:
        "Habari! I'm SafiriSmart's AI planner. Tell me about your Kenya trip — where you want to go, when, how many people, your budget, and what you most want to experience. I'll read live migration signals and build you a signal-enriched itinerary.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [latestPlan, setLatestPlan] = useState<PlanResponse | null>(null);
  const [migrationScore, setMigrationScore] = useState<MigrationScore | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    MigrationService.getScore()
      .then(setMigrationScore)
      .catch(console.warn);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, latestPlan]);

  function addMessage(role: "ai" | "user", content: string) {
    setMessages((prev) => [...prev, { id: makeId(), role, content, timestamp: new Date() }]);
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setShowExamples(false);
    addMessage("user", text);

    try {
      const result = await PlannerService.plan({ message: text, session_id: sessionId });
      setSessionId(result.session_id);
      const wildlife = result.wildlife_context;
      const itin = result.itinerary;
      const days = Array.isArray(itin?.days) ? itin.days : [];
      const errors = Array.isArray(result.errors) ? result.errors : [];
      let reply = "";
      if (wildlife && itin && days.length > 0) {
        reply = `Built your ${days.length}-day itinerary. Travel window: **${Math.round(wildlife.travel_window_score)}/100** — ${wildlife.travel_window_label}. `;
        reply += wildlife.days_to_peak <= 0
          ? "Peak crossing window is open now. "
          : `${wildlife.days_to_peak} days to peak. `;
        reply += wildlife.signal_summary;
      } else if (errors.length > 0) {
        reply = `Error: ${errors[0]}`;
      } else {
        reply = "Here's your personalised Kenya itinerary:";
      }
      addMessage("ai", reply);
      if (itin) setLatestPlan(result);
      const ms = result.processing_ms?.total;
      if (ms) addMessage("ai", `✓ Built in ${(ms / 1000).toFixed(1)}s with live signals.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("ai", `Planning service unreachable. Is the AI Core running? Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
          AI Safari Planner
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Plan your Kenya safari</h1>
        <p className="text-muted-foreground text-sm">
          Describe your trip in plain language. Live migration signals + 20 years of crossing data shape every itinerary.
        </p>
      </div>

      {migrationScore && <MigrationScoreCard score={migrationScore} />}

      {showExamples && (
        <div className="flex flex-wrap gap-2 mb-4">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              className="text-xs px-3 py-1.5 rounded-full border bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors text-left"
              onClick={() => setInput(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="border rounded-xl overflow-hidden bg-background mb-4">
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  msg.role === "ai" ? "bg-emerald-700 text-white" : "bg-amber-500 text-white"
                }`}
              >
                {msg.role === "ai" ? "S" : "✦"}
              </div>
              <div
                className={`rounded-xl px-4 py-2.5 text-sm max-w-[80%] leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-muted text-foreground rounded-tl-sm"
                    : "bg-emerald-700 text-white rounded-tr-sm"
                }`}
              >
                <BoldText text={msg.content} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">S</div>
              <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">Reading migration signals...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-3 flex gap-2 bg-muted/30">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Describe your dream Kenya safari..."
            className="resize-none min-h-[44px] max-h-32 text-sm bg-background"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-emerald-700 hover:bg-emerald-600 flex-shrink-0 self-end"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {latestPlan && <ItineraryResult plan={latestPlan} />}
    </div>
  );
}
