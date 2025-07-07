
import React from 'react';
import { InterestsStep } from './steps/InterestsStep';
import { DurationStep } from './steps/DurationStep';
import { GroupSizeStep } from './steps/GroupSizeStep';
import { BudgetStep } from './steps/BudgetStep';
import { TravelPaceStep } from './steps/TravelPaceStep';
import { LanguagesStep } from './steps/LanguagesStep';
import { TravelScheduleStep } from './steps/TravelScheduleStep';
import { TravelLogisticsStep } from './steps/TravelLogisticsStep';
import { DietaryStep } from './steps/DietaryStep';
import OperatorSelectionStep from './steps/OperatorSelectionStep';

export interface WizardStepsProps {
  currentStep: number;
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  selectedPackages: string[];
  onPreferenceChange: (key: string, value: any) => void;
  onScheduleChange: (schedule: any) => void;
  onTravelChange: (travel: any) => void;
  onDietaryChange: (dietary: any) => void;
  onPackageSelectionChange: (packageIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const WizardSteps: React.FC<WizardStepsProps> = ({
  currentStep,
  preferences,
  schedule,
  travel,
  dietary,
  selectedPackages,
  onPreferenceChange,
  onScheduleChange,
  onTravelChange,
  onDietaryChange,
  onPackageSelectionChange,
  onNext,
  onBack,
}) => {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InterestsStep
            value={preferences.interests || []}
            onChange={(interests) => onPreferenceChange('interests', interests)}
          />
        );
      case 2:
        return (
          <DurationStep
            value={preferences.duration || 7}
            onChange={(duration) => onPreferenceChange('duration', duration)}
          />
        );
      case 3:
        return (
          <GroupSizeStep
            value={preferences.groupSize || 2}
            onChange={(size) => onPreferenceChange('groupSize', size)}
          />
        );
      case 4:
        return (
          <BudgetStep
            value={preferences.budgetRange || 'mid-range'}
            onChange={(budget) => onPreferenceChange('budgetRange', budget)}
          />
        );
      case 5:
        return (
          <TravelPaceStep
            value={preferences.travelPace || 'moderate'}
            onChange={(pace) => onPreferenceChange('travelPace', pace)}
          />
        );
      case 6:
        return (
          <LanguagesStep
            value={preferences.languages || ['English']}
            onChange={(languages) => onPreferenceChange('languages', languages)}
          />
        );
      case 7:
        return (
          <TravelScheduleStep
            value={schedule}
            onChange={onScheduleChange}
          />
        );
      case 8:
        return (
          <TravelLogisticsStep
            travel={travel}
            onTravelChange={onTravelChange}
          />
        );
      case 9:
        return (
          <DietaryStep
            dietary={dietary}
            onDietaryChange={onDietaryChange}
          />
        );
      case 10:
        return (
          <OperatorSelectionStep
            preferences={preferences}
            selectedPackages={selectedPackages}
            onPackageSelectionChange={onPackageSelectionChange}
            onNext={onNext}
            onBack={onBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
      {currentStep < 10 && (
        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default WizardSteps;
