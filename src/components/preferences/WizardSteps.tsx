
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
import { UserDetailsStep } from './steps/UserDetailsStep';
import { UserDetails } from './WizardTypes';

interface WizardStepsProps {
  currentStep: number;
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  userDetails: UserDetails;
  onPreferenceChange: (key: string, value: any) => void;
  onScheduleChange: (schedule: any) => void;
  onTravelChange: (travel: any) => void;
  onDietaryChange: (dietary: any) => void;
  onUserDetailsChange: (details: UserDetails) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const WizardSteps: React.FC<WizardStepsProps> = ({
  currentStep,
  preferences,
  schedule,
  travel,
  dietary,
  userDetails,
  onPreferenceChange,
  onScheduleChange,
  onTravelChange,
  onDietaryChange,
  onUserDetailsChange,
  onNext,
  onBack,
  onComplete
}) => {
  console.log('WizardSteps: Rendering step', currentStep);

  switch (currentStep) {
    case 1:
      return (
        <InterestsStep
          value={preferences.interests}
          onChange={(interests) => onPreferenceChange('interests', interests)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 2:
      return (
        <DurationStep
          value={preferences.duration}
          onChange={(duration) => onPreferenceChange('duration', duration)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 3:
      return (
        <GroupSizeStep
          value={preferences.groupSize}
          onChange={(groupSize) => onPreferenceChange('groupSize', groupSize)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 4:
      return (
        <BudgetStep
          value={preferences.budgetRange}
          onChange={(budgetRange) => onPreferenceChange('budgetRange', budgetRange)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 5:
      return (
        <TravelPaceStep
          value={preferences.travelPace}
          onChange={(travelPace) => onPreferenceChange('travelPace', travelPace)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 6:
      return (
        <LanguagesStep
          value={preferences.languages}
          onChange={(languages) => onPreferenceChange('languages', languages)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 7:
      return (
        <TravelScheduleStep
          value={schedule}
          onChange={onScheduleChange}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 8:
      return (
        <TravelLogisticsStep
          travel={travel}
          onChange={onTravelChange}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 9:
      return (
        <DietaryStep
          dietary={dietary}
          onChange={onDietaryChange}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 10:
      return (
        <UserDetailsStep
          value={userDetails}
          onChange={onUserDetailsChange}
          onNext={onComplete}
          onBack={onBack}
        />
      );
    default:
      return <div>Invalid step</div>;
  }
};

export default WizardSteps;
