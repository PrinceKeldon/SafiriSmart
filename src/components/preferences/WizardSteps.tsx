import React from 'react';
import { InterestsStep } from './steps/InterestsStep';
import { DestinationSelectionStep } from './steps/DestinationSelectionStep';
import { DurationStep } from './steps/DurationStep';
import { GroupSizeStep } from './steps/GroupSizeStep';
import { BudgetStep } from './steps/BudgetStep';
import { TravelPaceStep } from './steps/TravelPaceStep';
import { LanguagesStep } from './steps/LanguagesStep';
import { TravelScheduleStep } from './steps/TravelScheduleStep';
import { TravelLogisticsStep } from './steps/TravelLogisticsStep';
import { DietaryStep } from './steps/DietaryStep';
import { UserDetailsStep } from './steps/UserDetailsStep';
import { UserDetails, DestinationItem } from './WizardTypes';

interface WizardStepsProps {
  currentStep: number;
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  userDetails: UserDetails;
  aiSuggestedDestinations: DestinationItem[];
  selectedDestinations: DestinationItem[];
  customDestinations: string[];
  onPreferenceChange: (key: string, value: any) => void;
  onScheduleChange: (schedule: any) => void;
  onTravelChange: (travel: any) => void;
  onDietaryChange: (dietary: any) => void;
  onUserDetailsChange: (details: UserDetails) => void;
  onDestinationChange: (destinations: DestinationItem[], customDestinations: string[]) => void;
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
  aiSuggestedDestinations,
  selectedDestinations,
  customDestinations,
  onPreferenceChange,
  onScheduleChange,
  onTravelChange,
  onDietaryChange,
  onUserDetailsChange,
  onDestinationChange,
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
        <DestinationSelectionStep
          aiSuggestedDestinations={aiSuggestedDestinations}
          selectedDestinations={selectedDestinations}
          customDestinations={customDestinations}
          onChange={onDestinationChange}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 3:
      return (
        <DurationStep
          value={preferences.duration}
          onChange={(duration) => onPreferenceChange('duration', duration)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 4:
      return (
        <GroupSizeStep
          value={preferences.groupSize}
          onChange={(groupSize) => onPreferenceChange('groupSize', groupSize)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 5:
      return (
        <BudgetStep
          value={preferences.budgetRange}
          onChange={(budgetRange) => onPreferenceChange('budgetRange', budgetRange)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 6:
      return (
        <TravelPaceStep
          value={preferences.travelPace}
          onChange={(travelPace) => onPreferenceChange('travelPace', travelPace)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 7:
      return (
        <LanguagesStep
          value={preferences.languages}
          onChange={(languages) => onPreferenceChange('languages', languages)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 8:
      return (
        <TravelScheduleStep
          value={schedule}
          onChange={onScheduleChange}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 9:
      return (
        <TravelLogisticsStep
          travel={travel}
          onChange={onTravelChange}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 10:
      return (
        <DietaryStep
          dietary={dietary}
          onChange={onDietaryChange}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case 11:
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
