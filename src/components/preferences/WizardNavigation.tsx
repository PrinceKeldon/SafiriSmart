
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
    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex items-center justify-center w-full sm:w-auto order-2 sm:order-1 min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      {currentStep === totalSteps ? (
        <Button 
          onClick={onComplete} 
          className="flex items-center justify-center w-full sm:w-auto order-1 sm:order-2 min-h-[44px]"
        >
          Generate My Safari
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button 
          onClick={onNext} 
          className="flex items-center justify-center w-full sm:w-auto order-1 sm:order-2 min-h-[44px]"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
