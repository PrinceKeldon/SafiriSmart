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

class PlannerServiceClass {
  async plan(request: PlanRequest): Promise<PlanResponse> {
    const { data, error } = await supabase.functions.invoke('plan', {
      body: request,
    });

    if (error) throw error;
    return data as PlanResponse;
  }

  async getPlan(sessionId: string): Promise<PlanResponse> {
    const { data, error } = await supabase.functions.invoke(`plan/${sessionId}`, {
      method: 'GET',
      body: null,
    });

    if (error) throw error;
    return data as PlanResponse;
  }
}

export const plannerService = new PlannerServiceClass();
export const PlannerService = plannerService;
