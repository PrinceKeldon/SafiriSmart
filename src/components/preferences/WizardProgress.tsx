
import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  steps: Array<{ id: number; title: string; description: string }>;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, steps }) => {
  const currentStepData = steps[currentStep - 1];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                  step.id <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-4 sm:w-8 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-colors ${
                    step.id < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
          {currentStepData.title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 break-words">
          {currentStepData.description}
        </p>
      </div>
    </div>
  );
};
