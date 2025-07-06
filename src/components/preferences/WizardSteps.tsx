
import React from 'react';
import InterestsStep from './steps/InterestsStep';
import DurationStep from './steps/DurationStep';
import GroupSizeStep from './steps/GroupSizeStep';
import BudgetStep from './steps/BudgetStep';
import TravelPaceStep from './steps/TravelPaceStep';
import LanguagesStep from './steps/LanguagesStep';
import TravelScheduleStep from './steps/TravelScheduleStep';
import TravelLogisticsStep from './steps/TravelLogisticsStep';
import DietaryStep from './steps/DietaryStep';
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
            selectedInterests={preferences.interests || []}
            onInterestsChange={(interests) => onPreferenceChange('interests', interests)}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 2:
        return (
          <DurationStep
            duration={preferences.duration || 7}
            onDurationChange={(duration) => onPreferenceChange('duration', duration)}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 3:
        return (
          <GroupSizeStep
            groupSize={preferences.groupSize || 2}
            onGroupSizeChange={(size) => onPreferenceChange('groupSize', size)}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 4:
        return (
          <BudgetStep
            budgetRange={preferences.budgetRange || 'mid-range'}
            onBudgetChange={(budget) => onPreferenceChange('budgetRange', budget)}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 5:
        return (
          <TravelPaceStep
            travelPace={preferences.travelPace || 'moderate'}
            onTravelPaceChange={(pace) => onPreferenceChange('travelPace', pace)}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 6:
        return (
          <LanguagesStep
            selectedLanguages={preferences.languages || ['English']}
            onLanguagesChange={(languages) => onPreferenceChange('languages', languages)}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 7:
        return (
          <TravelScheduleStep
            schedule={schedule}
            onScheduleChange={onScheduleChange}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 8:
        return (
          <TravelLogisticsStep
            travel={travel}
            onTravelChange={onTravelChange}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 9:
        return (
          <DietaryStep
            dietary={dietary}
            onDietaryChange={onDietaryChange}
            onNext={onNext}
            onBack={onBack}
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

  return <div>{renderStep()}</div>;
};

export default WizardSteps;
