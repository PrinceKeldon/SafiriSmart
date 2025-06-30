
import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  steps: Array<{ id: number; title: string; description: string }>;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, steps }) => {
  const currentStepData = steps[currentStep - 1];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.id <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.id}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-1 mx-1 ${
                  step.id < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {currentStepData.title}
        </h2>
        <p className="text-gray-600">{currentStepData.description}</p>
      </div>
    </div>
  );
};
