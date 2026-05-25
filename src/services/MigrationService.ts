import { supabase } from '@/integrations/supabase/client';

export interface MigrationScore {
  score: number;
  phase: string;
  updated_at?: string;
  details?: Record<string, unknown>;
}

export interface MigrationScoreHistoryEntry {
  score: number;
  phase?: string;
  recorded_at: string;
}

async function invoke<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('migration-score', {
    body: { path, ...(body ?? {}) },
  });
  if (error) throw error;
  return data as T;
}

export const MigrationService = {
  getScore: () => invoke<MigrationScore>('/migration/score'),
  getScoreHistory: () => invoke<MigrationScoreHistoryEntry[]>('/migration/score/history'),
  getPhase: () => invoke<{ phase: string }>('/migration/phase'),
};
