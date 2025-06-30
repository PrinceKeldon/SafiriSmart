
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DurationStep } from './steps/DurationStep';
import { BudgetStep } from './steps/BudgetStep';
import { InterestsStep } from './steps/InterestsStep';
import { GroupSizeStep } from './steps/GroupSizeStep';
import { TravelPaceStep } from './steps/TravelPaceStep';
import { LanguagesStep } from './steps/LanguagesStep';
import { TravelScheduleForm } from './steps/TravelScheduleForm';
import { TravelLogisticsStep } from './steps/TravelLogisticsStep';
import { DietaryStep } from './steps/DietaryStep';
import { TravelPreferences } from './WizardTypes';

interface WizardStepsProps {
  currentStep: number;
  preferences: TravelPreferences;
  updatePreferences: (updates: Partial<TravelPreferences>) => void;
  form: UseFormReturn<any>;
}

export const WizardSteps: React.FC<WizardStepsProps> = ({
  currentStep,
  preferences,
  updatePreferences,
  form,
}) => {
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
    case 6:
      return (
        <LanguagesStep
          value={preferences.languages}
          onChange={(languages) => updatePreferences({ languages })}
        />
      );
    case 7:
      return <TravelScheduleForm form={form} />;
    case 8:
      return (
        <TravelLogisticsStep
          preferences={preferences}
          updatePreferences={updatePreferences}
        />
      );
    case 9:
      return (
        <DietaryStep
          preferences={preferences}
          updatePreferences={updatePreferences}
        />
      );
    default:
      return null;
  }
};
