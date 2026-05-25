import { useEffect, useState } from 'react';
import { MigrationService, type MigrationScore } from '@/services/MigrationService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Rocket, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MigrationBanner = () => {
  const [score, setScore] = useState<MigrationScore | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    MigrationService.getScore()
      .then(setScore)
      .catch(() => setError(true));
  }, []);

  if (dismissed || error || !score) return null;

  return (
    <Alert className="mb-4 border-primary/30 bg-primary/5">
      <Rocket className="h-4 w-4" />
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex-1">
          <AlertTitle>SafiriSmart Migration — {score.phase}</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <Progress value={Math.round(score.score)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Migration progress: {Math.round(score.score)}%
            </p>
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

export default MigrationBanner;
