import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CalendarDays, Compass, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { migrationService, type MigrationScore } from '@/services/MigrationService';

const Migration = () => {
  const [score, setScore] = useState<MigrationScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await migrationService.getScore();
      setScore(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration score unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScore();
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">SafiriSmart Intelligence</p>
            <h1 className="text-3xl font-bold tracking-tight">Great Migration Tracker</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link to="/plan">Plan around migration</Link>
            </Button>
            <Button variant="outline" onClick={loadScore} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Migration score unavailable</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : score ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity />
                  {score.phase_label}
                </CardTitle>
                <CardDescription>{score.signal_summary}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div>
                  <div className="mb-2 flex items-end justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Crossing probability</span>
                    <span className="font-mono text-4xl font-bold">{Math.round(score.probability_score)}/100</span>
                  </div>
                  <Progress value={score.probability_score} className="h-3" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-md border p-4">
                    <CalendarDays className="mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Peak opens</p>
                    <p className="font-semibold">{score.peak_window_start}</p>
                  </div>
                  <div className="rounded-md border p-4">
                    <CalendarDays className="mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Peak closes</p>
                    <p className="font-semibold">{score.peak_window_end}</p>
                  </div>
                  <div className="rounded-md border p-4">
                    <Compass className="mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Days to peak</p>
                    <p className="font-semibold">{score.days_to_peak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Herd Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{score.herd_location}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Traveler Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{score.recommendation}</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
};

export default Migration;
