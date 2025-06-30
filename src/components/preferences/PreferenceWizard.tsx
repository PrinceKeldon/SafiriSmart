
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DurationStep } from './steps/DurationStep';
import { BudgetStep } from './steps/BudgetStep';
import { InterestsStep } from './steps/InterestsStep';
import { GroupSizeStep } from './steps/GroupSizeStep';
import { TravelPaceStep } from './steps/TravelPaceStep';

export interface TravelPreferences {
  duration: number;
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
  groupSize: number;
  travelPace: 'relaxed' | 'moderate' | 'active';
}

const initialPreferences: TravelPreferences = {
  duration: 7,
  budgetRange: 'mid-range',
  interests: [],
  groupSize: 2,
  travelPace: 'moderate',
};

const steps = [
  { id: 1, title: 'Duration', description: 'How long is your ideal safari?' },
  { id: 2, title: 'Budget', description: 'What\'s your budget preference?' },
  { id: 3, title: 'Interests', description: 'What interests you most?' },
  { id: 4, title: 'Group Size', description: 'How many travelers?' },
  { id: 5, title: 'Travel Pace', description: 'What\'s your preferred pace?' },
];

export const PreferenceWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<TravelPreferences>(initialPreferences);

  const updatePreferences = (updates: Partial<TravelPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log('Collected Travel Preferences:', preferences);
    // TODO: Integrate with AI Itinerary Generation
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DurationStep
            value={preferences.duration}
            onChange={(duration) => updatePreferences({ duration })}
          />
        );
      case 2:
        return (
          <BudgetStep
            value={preferences.budgetRange}
            onChange={(budgetRange) => updatePreferences({ budgetRange })}
          />
        );
      case 3:
        return (
          <InterestsStep
            value={preferences.interests}
            onChange={(interests) => updatePreferences({ interests })}
          />
        );
      case 4:
        return (
          <GroupSizeStep
            value={preferences.groupSize}
            onChange={(groupSize) => updatePreferences({ groupSize })}
          />
        );
      case 5:
        return (
          <TravelPaceStep
            value={preferences.travelPace}
            onChange={(travelPace) => updatePreferences({ travelPace })}
          />
        );
      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
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
                  className={`w-12 h-1 mx-2 ${
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

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">
            Step {currentStep} of {steps.length}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderCurrentStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep === steps.length ? (
          <Button onClick={handleComplete} className="flex items-center">
            Complete Planning
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={nextStep} className="flex items-center">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
