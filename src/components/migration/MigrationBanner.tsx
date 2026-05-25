import { useEffect, useState } from 'react';
import { Activity, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { migrationService, type MigrationScore } from '@/services/MigrationService';

export function MigrationBanner() {
  const [score, setScore] = useState<MigrationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    migrationService
      .getScore()
      .then((data) => {
        if (mounted) setScore(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Migration score unavailable');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-28" />
        </CardContent>
      </Card>
    );
  }

  if (error || !score) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Activity />
              {score.probability_score}/100
            </Badge>
            <span className="font-medium text-foreground">{score.phase_label}</span>
          </div>
          <p className="text-sm text-muted-foreground">{score.signal_summary}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays />
          <span>
            Peak window: {score.peak_window_start} to {score.peak_window_end}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
