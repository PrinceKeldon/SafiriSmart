import { supabase } from '@/integrations/supabase/client';

export interface PlanRequest {
  message: string;
  session_id?: string | null;
}

export interface TravelerProfile {
  session_id: string;
  raw_input: string;
  destinations: string[];
  travel_dates: { start: string; end: string } | null;
  budget: { min_usd: number; max_usd: number } | null;
  group_size: number;
  experience_types: string[];
  accommodation_tier: string;
  language: string;
  special_requests: string;
  migration_interest: boolean;
}

export interface WildlifeContext {
  score: number;
  phase_label: string;
  peak_window_start: string;
  peak_window_end: string;
  days_to_peak: number;
  signal_summary: string;
  herd_location: string;
  recommendation: string;
  travel_window_score: number;
  travel_window_label: string;
}

export interface ItineraryDay {
  day: number;
  date: string | null;
  location: string;
  park: string;
  activities: string[];
  accommodation: string;
  accommodation_tier: string;
  drive_hours: number;
  estimated_cost_usd: number;
  wildlife_highlight: string;
  migration_score: number | null;
}

export interface Itinerary {
  days: ItineraryDay[];
  total_cost_usd: number;
  migration_window_score: number;
  migration_window_label: string;
  peak_crossing_overlap: boolean;
  days_overlap_with_peak: number;
  eco_impact_score: number;
  community_spend_pct: number;
  carbon_estimate_kg: number;
  summary: string;
  best_for: string;
  operator_brief: string;
}

export interface PlanResponse {
  session_id: string;
  completed_agents: string[];
  traveler_profile: TravelerProfile | null;
  wildlife_context: WildlifeContext | null;
  itinerary: Itinerary | null;
  errors: string[];
  processing_ms: Record<string, number>;
  cached: boolean;
}

type RawPlanResponse = Partial<PlanResponse> & {
  plan?: Partial<PlanResponse>;
  error?: string;
  detail?: string;
};

function normalizePlanResponse(data: RawPlanResponse | null): PlanResponse {
  if (!data) {
    throw new Error('Planning service returned an empty response');
  }

  if (data.error && !data.itinerary && !data.plan) {
    throw new Error(data.detail ? `${data.error}: ${data.detail}` : data.error);
  }

  const source = data.plan || data;

  return {
    session_id: source.session_id || data.session_id || '',
    completed_agents: Array.isArray(source.completed_agents) ? source.completed_agents : [],
    traveler_profile: source.traveler_profile || null,
    wildlife_context: source.wildlife_context || null,
    itinerary: source.itinerary || null,
    errors: Array.isArray(source.errors) ? source.errors : [],
    processing_ms: source.processing_ms || {},
    cached: Boolean(source.cached ?? data.cached),
  };
}

class PlannerServiceClass {
  async plan(request: PlanRequest): Promise<PlanResponse> {
    const { data, error } = await supabase.functions.invoke('plan', {
      body: request,
    });

    if (error) throw error;
    return normalizePlanResponse(data as RawPlanResponse | null);
  }

  async getPlan(sessionId: string): Promise<PlanResponse> {
    const { data, error } = await supabase.functions.invoke(`plan/${sessionId}`, {
      method: 'GET',
      body: null,
    });

    if (error) throw error;
    return normalizePlanResponse(data as RawPlanResponse | null);
  }
}

export const plannerService = new PlannerServiceClass();
export const PlannerService = plannerService;
