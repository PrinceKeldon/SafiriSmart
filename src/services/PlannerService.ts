import { supabase } from '@/integrations/supabase/client';

export interface PlanRequest {
  preferences?: Record<string, unknown>;
  prompt?: string;
  session_id?: string;
}

export interface PlanResponse {
  session_id: string;
  plan: Record<string, unknown>;
  messages?: Array<{ role: string; content: string }>;
}

export const PlannerService = {
  async createPlan(req: PlanRequest): Promise<PlanResponse> {
    const { data, error } = await supabase.functions.invoke('plan', {
      body: { action: 'create', ...req },
    });
    if (error) throw error;
    return data as PlanResponse;
  },
  async getPlan(sessionId: string): Promise<PlanResponse> {
    const { data, error } = await supabase.functions.invoke('plan', {
      body: { action: 'get', session_id: sessionId },
    });
    if (error) throw error;
    return data as PlanResponse;
  },
};
