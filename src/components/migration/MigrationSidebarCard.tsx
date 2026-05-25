import { Link } from 'react-router-dom';
import { Activity, CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { migrationService, type MigrationScore } from '@/services/MigrationService';

export function MigrationSidebarCard() {
  const [score, setScore] = useState<MigrationScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    migrationService
      .getScore()
      .then((data) => {
        if (mounted) setScore(data);
      })
      .catch(() => {
        if (mounted) setScore(null);
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
      <div className="rounded-md border bg-muted/30 p-3">
        <Skeleton className="mb-3 h-4 w-28" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  if (!score) {
    return null;
  }

  return (
    <Link
      to="/migration"
      className="block rounded-md border bg-gradient-to-br from-emerald-50 to-amber-50 p-3 text-left transition-colors hover:border-emerald-300"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="gap-1 text-xs">
          <Activity />
          Migration
        </Badge>
        <span className="font-mono text-sm font-semibold text-emerald-800">
          {Math.round(score.probability_score)}
        </span>
      </div>
      <Progress value={score.probability_score} className="mb-2 h-1.5" />
      <p className="truncate text-xs font-medium text-foreground">{score.phase_label}</p>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <CalendarDays />
        <span>{score.days_to_peak > 0 ? `${score.days_to_peak} days to peak` : 'Peak window open'}</span>
      </div>
    </Link>
  );
}
