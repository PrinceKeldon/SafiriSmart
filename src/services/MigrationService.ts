import { supabase } from '@/integrations/supabase/client';

export interface MigrationScore {
  score_date: string;
  probability_score: number;
  phase_label: string;
  peak_window_start: string;
  peak_window_end: string;
  days_to_peak: number;
  signal_summary: string;
  herd_location: string;
  recommendation: string;
  next_update: string;
}

export interface MigrationHistory {
  dates: string[];
  scores: number[];
  phases: string[];
}

export interface MigrationPhase {
  phase: string;
  phase_label: string;
  score: number;
  recommendation: string;
  days_to_peak: number;
  peak_start?: string;
  peak_end?: string;
}

class MigrationServiceClass {
  async getScore(): Promise<MigrationScore> {
    const { data, error } = await supabase.functions.invoke('migration-score', {
      method: 'GET',
      body: null,
    });

    if (error) throw error;
    return data as MigrationScore;
  }

  async getPhase(): Promise<MigrationPhase> {
    const score = await this.getScore();
    return {
      phase: score.phase_label,
      phase_label: score.phase_label,
      score: score.probability_score,
      recommendation: score.recommendation,
      days_to_peak: score.days_to_peak,
      peak_start: score.peak_window_start,
      peak_end: score.peak_window_end,
    };
  }

  async getHistory(): Promise<MigrationHistory> {
    const { data, error } = await supabase.functions.invoke('migration-score', {
      method: 'GET',
      body: null,
      headers: {
        'x-migration-path': 'score/history',
      },
    });

    if (error) throw error;
    return data as MigrationHistory;
  }
}

export const migrationService = new MigrationServiceClass();
export const MigrationService = migrationService;
