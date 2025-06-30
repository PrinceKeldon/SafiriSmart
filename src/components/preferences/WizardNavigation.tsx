
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
}) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      {currentStep === totalSteps ? (
        <Button onClick={onComplete} className="flex items-center">
          Generate My Safari
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={onNext} className="flex items-center">
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
